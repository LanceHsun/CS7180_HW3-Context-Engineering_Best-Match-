import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runMatchBatch } from "@/lib/aiMatcher";
import { fetchJobs } from "@/lib/jobFetcher";
import { sendJobDigest } from "@/lib/email";

// Initialize Supabase with Service Role Key for administrative access
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/cron/match
 * Scheduled cron job to run AI matching for active users.
 * Security: Requires CRON_SECRET in Authorization header.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  // 1. Security Check
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const isMonday = today.getUTCDay() === 1;
  const todayIso = today.toISOString().split("T")[0];

  try {
    // 2. Identify users to process based on frequency
    // Logic: All 'daily' users + 'weekly' users if today is Monday
    const { data: preferences, error: prefError } = await supabaseAdmin
      .from("preferences")
      .select("user_id, frequency, locations");

    if (prefError) throw prefError;

    const usersToProcess = (preferences || []).filter((p) => {
      if (p.frequency === "daily") return true;
      if (p.frequency === "weekly" && isMonday) return true;
      return false;
    });

    const results = [];

    // 3. Process each user with error isolation
    for (const pref of usersToProcess) {
      const { user_id, locations } = pref;

      const runId = crypto.randomUUID();

      try {
        // A. Idempotency Check: Don't run twice if already succeeded today
        const { data: existingRun } = await supabaseAdmin
          .from("match_runs")
          .select("id")
          .eq("user_id", user_id)
          .eq("status", "completed")
          .filter("started_at", "gte", todayIso)
          .limit(1);

        if (existingRun && existingRun.length > 0) {
          results.push({
            user_id,
            status: "skipped",
            reason: "already_run_today",
          });
          continue;
        }

        // B. Log start of run
        await supabaseAdmin.from("match_runs").insert({
          id: runId,
          user_id,
          status: "running",
          triggered_by: "cron",
        });

        // C. Fetch Profile
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("user_id", user_id)
          .single();

        if (profileError || !profile) throw new Error("Profile not found");
        console.log(
          `[Cron Debug] Captured Profile - Email: "${profile.email}", Name: "${profile.full_name}"`
        );

        // D. Fetch and Match Jobs
        const allJobs = await fetchJobs({
          role: profile.target_role,
          location:
            locations && locations.length > 0 ? locations[0] : undefined,
        });

        console.log(
          `[Cron Debug] User ${user_id}: Found ${allJobs.length} jobs for role "${profile.target_role}" in location "${locations?.[0] || "Any"}"`
        );

        const matchResponse = await runMatchBatch(profile, allJobs);
        console.log(
          `[Cron Debug] User ${user_id}: Match Results - Matches: ${matchResponse.matches.length}, Filtered: ${matchResponse.filtered_count}`
        );

        const topMatches = matchResponse.matches;

        // E. Persist Matches
        if (topMatches.length > 0) {
          const matchEntries = topMatches.map((m: any) => ({
            user_id,
            job_title: m.job.title,
            company: m.job.company,
            score: m.score,
            apply_url: m.job.apply_url,
          }));

          await supabaseAdmin.from("matches").upsert(matchEntries, {
            onConflict: "user_id, job_title, company",
          });
        }

        // F. Notification Logic (Issue #19)
        const qualifyingMatches = topMatches.filter((m: any) => m.score >= 70);
        let emailStatus = "skipped";
        let emailError = null;
        let emailSentAt = null;

        if (qualifyingMatches.length > 0) {
          // i. Email Idempotency Check
          const { data: existingEmail } = await supabaseAdmin
            .from("match_runs")
            .select("id")
            .eq("user_id", user_id)
            .eq("email_status", "success")
            .filter("started_at", "gte", todayIso)
            .limit(1);

          if (existingEmail && existingEmail.length > 0) {
            emailStatus = "skipped";
            emailError = "email_already_sent_today";
          } else {
            // ii. Send Email
            try {
              const recipientEmail = profile.email;

              if (!recipientEmail) {
                console.error(
                  `[Cron Debug] User ${user_id}: No email found in profile. Profile data:`,
                  JSON.stringify(profile)
                );
                emailStatus = "failed";
                emailError = "missing_recipient_email";
              } else {
                console.log(
                  `[Cron Debug] Sending email to ${recipientEmail} for user ${user_id}`
                );
                const emailResult = await sendJobDigest(
                  recipientEmail,
                  profile.full_name || "there",
                  qualifyingMatches
                );
                if (emailResult.success) {
                  emailStatus = "success";
                  emailSentAt = new Date().toISOString();
                } else {
                  emailStatus = "failed";
                  emailError = emailResult.message;
                }
              }
            } catch (err: any) {
              emailStatus = "failed";
              emailError = err.message;
            }
          }
        }

        // G. Update Log
        await supabaseAdmin
          .from("match_runs")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            matches_found: topMatches.length,
            email_status: emailStatus,
            email_error: emailError,
            email_sent_at: emailSentAt,
          })
          .eq("id", runId);

        results.push({
          user_id,
          status: "success",
          matches: topMatches.length,
          email: emailStatus,
        });
      } catch (err) {
        console.error(`Error processing user ${user_id}:`, err);

        // H. Log Failure
        await supabaseAdmin
          .from("match_runs")
          .update({
            status: "failed",
            error: err instanceof Error ? err.message : String(err),
            completed_at: new Date().toISOString(),
          })
          .eq("id", runId);

        results.push({
          user_id,
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return NextResponse.json({
      processed: usersToProcess.length,
      results,
    });
  } catch (error) {
    console.error("Cron failed:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : JSON.stringify(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
