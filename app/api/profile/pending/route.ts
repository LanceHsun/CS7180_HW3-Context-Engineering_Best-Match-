import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PendingProfileSchema } from "@/lib/validations/resume";
import { z } from "zod";

// Create a Supabase client with the SERVICE ROLE KEY
// This is required because the pending_profiles table has RLS enabled with only an INSERT policy.
// While the client *could* insert if we used the public anon key, using the service role key
// in the API route ensures we never leak the ability to manipulate data beyond the validated schema.
export async function POST(req: Request) {
  try {
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supaUrl || !supaKey) {
      console.error(
        "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL environment variables."
      );
      return NextResponse.json(
        { error: "Server configuration error. Missing database keys." },
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
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        user_id: userId,
        target_role: parsedData.targetRole,
        skills: parsedData.skills,
        experience_level: experienceLevel,
      });

    if (profileError) {
      console.error("Supabase profile insert error:", profileError);
      // We created the user but failed to create the profile.
      // We'll let them sign in and fix it, but ideally we'd cleanup.
      // For now, return error so the frontend knows something went wrong.
      return NextResponse.json(
        {
          error: "Account created but profile sync failed",
          details: profileError.message,
        },
        { status: 500 }
      );
    }

    // 4. Success - Return the userId so the frontend can set the mock cookie
    return NextResponse.json(
      { success: true, message: "Account created and profile synced.", userId },
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
