import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PendingProfileSchema } from "@/lib/validations/resume";
import { z } from "zod";
import { runMatchBatch } from "@/lib/aiMatcher";
import { fetchJobs } from "@/lib/jobFetcher";
import { UserProfile } from "@/lib/validations/schemas";
import { isEnvValid, env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const { valid, errors } = isEnvValid();
    const supaUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!valid || !supaKey) {
      console.error(
        "Environment validation failed:",
        errors || "Missing SUPABASE_SERVICE_ROLE_KEY"
      );
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: errors || {
            SUPABASE_SERVICE_ROLE_KEY: ["Missing server-side key"],
          },
          message:
            "Please ensure all required environment variables are set in the Vercel dashboard.",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supaUrl, supaKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const body = await req.json();

    // 1. Zod Validation
    const parsedData = PendingProfileSchema.parse(body);

    // Check if user already exists in auth.users
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userFound = existingUser?.users.find(
      (u) => u.email === parsedData.email
    );

    if (userFound) {
      return NextResponse.json(
        {
          error: "Account already exists",
          exists: true,
          message:
            "This email is already registered. Please sign in via the login page to update your profile.",
        },
        { status: 400 }
      );
    }

    // 2. Create the user silently
    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: parsedData.email,
        email_confirm: true,
      });

    if (createError) {
      console.error("Supabase user creation error:", createError);
      return NextResponse.json(
        { error: "Failed to create account", details: createError.message },
        { status: 500 }
      );
    }

    const userId = newUser.user.id;

    // Map experience level from yearsOfExperience (if provided)
    let experienceLevel = "entry";
    if (parsedData.yearsOfExperience !== undefined) {
      if (parsedData.yearsOfExperience >= 8) {
        experienceLevel = "senior";
      } else if (parsedData.yearsOfExperience >= 3) {
        experienceLevel = "mid";
      }
    }

    // 3. Insert into profiles table directly
    // Using upsert with onConflict: 'user_id' is safer than insert
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        user_id: userId,
        target_role: parsedData.targetRole,
        skills: parsedData.skills,
        experience_level: experienceLevel,
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      console.error("Supabase profile sync error:", {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      });
      // We created the user but failed to create the profile.
      return NextResponse.json(
        {
          error: "Account created but profile sync failed",
          details: profileError.message,
          code: profileError.code,
        },
        { status: 500 }
      );
    }

    // 4. Trigger Initial Matching
    // We do this immediately so the user lands on a populated dashboard.
    try {
      // Map back to Zod schema expected casing
      let uiExperienceLevel: "Entry" | "Mid" | "Senior" | "Executive" = "Entry";
      if (experienceLevel === "senior") uiExperienceLevel = "Senior";
      else if (experienceLevel === "mid") uiExperienceLevel = "Mid";

      const userProfile: UserProfile = {
        name: parsedData.email.split("@")[0],
        email: parsedData.email,
        skills: parsedData.skills,
        experienceLevel: uiExperienceLevel,
        targetRole: parsedData.targetRole,
        targetLocations: [],
        notificationFrequency: "Weekly",
      };

      const allJobs = await fetchJobs({
        role: parsedData.targetRole,
      });

      const topJobs = allJobs.slice(0, 10);
      const matchResults = await runMatchBatch(userProfile, topJobs);
      const qualifyingMatches = matchResults.matches;

      if (qualifyingMatches.length > 0) {
        const matchesToInsert = qualifyingMatches.map((m) => ({
          user_id: userId,
          job_title: m.job.title,
          company: m.job.company,
          score: Math.round(m.score),
          apply_url: m.job.apply_url,
          description: m.job.description,
          location: m.job.location,
        }));

        await supabaseAdmin.from("matches").upsert(matchesToInsert, {
          onConflict: "user_id, apply_url",
        });
      }
    } catch (matchErr) {
      console.error("Initial matching error during signup:", matchErr);
      // We don't fail the whole signup if matching fails, but we log it.
    }

    // 5. Generate a real magic link for silent login
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const origin = `${protocol}://${host}`;

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: parsedData.email,
        options: {
          redirectTo: `${origin}/auth/callback?next=/dashboard`,
        },
      });

    if (linkError) {
      console.error("Failed to generate silent login link:", linkError);
      return NextResponse.json(
        {
          error: "Account created but login redirection failed",
          details: linkError.message,
        },
        { status: 500 }
      );
    }

    // 6. Success - Return the loginUrl for the frontend to redirect
    return NextResponse.json(
      {
        success: true,
        message: "Account created and profile synced.",
        userId,
        loginUrl: linkData.properties.action_link,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      );
    }
    console.error("Pending profile route error:", error);
    return NextResponse.json(
      { error: "Internal server error saving pending profile" },
      { status: 500 }
    );
  }
}
