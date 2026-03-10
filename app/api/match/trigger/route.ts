import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runMatchBatch } from "@/lib/aiMatcher";
import { fetchJobs } from "@/lib/jobFetcher";
import { sendJobDigest } from "@/lib/email";
import { successResponse, errorResponse } from "@/lib/api/response";
import { UserProfile } from "@/lib/validations/schemas";
import { MatchRunResponse } from "@/lib/validations/match";

/**
 * POST /api/match/trigger
 * Manually triggered by the user from the Dashboard to find new job matches.
 * Fetches top 5 jobs, runs AI matching, saves matches >= 70, and sends an email.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse(
        { code: "UNAUTHORIZED", message: "Authentication required" },
        401
      );
    }

    const runId = crypto.randomUUID();

    // 2. Log Start
    await supabase.from("match_runs").insert({
      id: runId,
      user_id: user.id,
      status: "running",
      triggered_by: "manual",
    });

    try {
      // 3. Fetch User Profile and Preferences
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error("Profile not found");
      }

      const { data: prefData } = await supabase
        .from("preferences")
        .select("locations")
        .eq("user_id", user.id)
        .single();

      const locations = prefData?.locations || [];

      // Map DB profile to UserProfile schema
      const profile: UserProfile = {
        name: profileData.full_name || user.email?.split("@")[0] || "User",
        email: profileData.email || user.email || "",
        skills: profileData.skills || [],
        experienceLevel: profileData.experience_level,
        targetRole: profileData.target_role,
        targetLocations: locations,
        notificationFrequency: "Weekly",
      };

      // 4. Fetch Jobs
      const allJobs = await fetchJobs({
        role: profile.targetRole || "Software Engineer",
        location: locations.length > 0 ? locations[0] : undefined,
      });

      // 5. AI Matching (Increase to 10 jobs for better coverage while balancing latency)
      const topJobs = allJobs.slice(0, 10);
      const matchResults: MatchRunResponse = await runMatchBatch(
        profile,
        topJobs
      );
      const qualifyingMatches = matchResults.matches;

      // 6. Persist Matches
      if (qualifyingMatches.length > 0) {
        const matchesToInsert = qualifyingMatches.map((m) => ({
          user_id: user.id,
          profile_id: profileData.id,
          job_title: m.job.title,
          company: m.job.company,
          score: Math.round(m.score),
          apply_url: m.job.apply_url,
          description: m.job.description,
          location: m.job.location,
        }));

        const { error: insertError } = await supabase
          .from("matches")
          .upsert(matchesToInsert, {
            onConflict: "user_id, apply_url",
          });

        if (insertError) {
          console.error("Match persistence error:", insertError);
        }
      }

      // 7. Send Email & 8. Log Result (Granular)
      let emailStatus = "skipped";
      let emailError = null;

      if (qualifyingMatches.length > 0) {
        if (!profile.email) {
          emailStatus = "failed";
          emailError = "missing_recipient_email";
        } else {
          try {
            const emailResult = await sendJobDigest(
              profile.email,
              profile.name,
              qualifyingMatches as any
            );
            if (emailResult.success) {
              emailStatus = "success";
            } else {
              emailStatus = "failed";
              emailError = emailResult.message;
            }
          } catch (err: any) {
            emailStatus = "failed";
            emailError = err.message;
          }
        }
      }

      // Complete Run
      await supabase
        .from("match_runs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          matches_found: qualifyingMatches.length,
          email_status: emailStatus,
          email_error: emailError,
        })
        .eq("id", runId);

      // 9. Return Data
      return successResponse(matchResults);
    } catch (processError: any) {
      console.error("Trigger Match Process Error:", processError);

      // Update run to failed
      await supabase
        .from("match_runs")
        .update({
          status: "failed",
          error: processError.message || "An unexpected error occurred",
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId);

      return errorResponse(
        {
          code: "INTERNAL_ERROR",
          message:
            processError.message ||
            "An unexpected error occurred during matching",
        },
        500
      );
    }
  } catch (authErr: any) {
    console.error("Trigger Match Auth Error:", authErr);
    return errorResponse(
      { code: "INTERNAL_ERROR", message: "Failed to initialize request" },
      500
    );
  }
}
