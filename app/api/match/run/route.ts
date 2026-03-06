import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateRequest } from "@/lib/validations/middleware";
import {
  MatchRunRequestSchema,
  MatchRunResponse,
} from "@/lib/validations/match";
import { runMatchBatch } from "@/lib/aiMatcher";
import { successResponse, errorResponse } from "@/lib/api/response";
import { UserProfile } from "@/lib/validations/schemas";

/**
 * POST /api/match/run
 * Runs the AI matching logic for a set of jobs against a user profile.
 * Persists qualifying matches (>70%) to Supabase.
 * @issue 16
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

    // 2. Validate request body
    const { data: validatedBody, error: validationError } =
      await validateRequest(req, MatchRunRequestSchema);
    if (validationError) return validationError;

    const { profileId, jobs } = validatedBody!;

    // 3. Fetch profile and verify ownership
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .eq("user_id", user.id)
      .single();

    if (profileError || !profileData) {
      return errorResponse(
        { code: "NOT_FOUND", message: "Profile not found or access denied" },
        404
      );
    }

    // Map DB profile to UserProfile schema
    const profile: UserProfile = {
      name: profileData.name || user.email?.split("@")[0] || "User",
      email: user.email || "",
      skills: profileData.skills || [],
      experienceLevel: profileData.experience_level,
      targetRole: profileData.target_role,
      targetLocations: [], // Default as it's not in DB yet
      notificationFrequency: "Weekly", // Default
    };

    // 4. Run AI matching
    const matchResults: MatchRunResponse = await runMatchBatch(profile, jobs);

    // 5. Save qualifying matches to Supabase
    if (matchResults.matches.length > 0) {
      const matchesToInsert = matchResults.matches.map((m) => ({
        user_id: user.id,
        profile_id: profileId,
        job_title: m.job.title,
        company: m.job.company,
        score: Math.round(m.score),
        apply_url: m.job.apply_url,
        description: m.job.description,
        location: m.job.location,
        reasoning: m.reasoning,
      }));

      const { error: insertError } = await supabase
        .from("matches")
        .insert(matchesToInsert);

      if (insertError) {
        console.error("Match persistence error:", insertError);
        // We still return results even if saving failed, but log it
      }
    }

    return successResponse(matchResults);
  } catch (error: any) {
    console.error("Match API Error:", error);
    return errorResponse(
      {
        code: "INTERNAL_ERROR",
        message:
          error.message || "An unexpected error occurred during matching",
      },
      500
    );
  }
}
