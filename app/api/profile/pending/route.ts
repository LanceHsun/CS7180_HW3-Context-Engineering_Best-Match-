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
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL environment variables.");
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

    // Map experience level from yearsOfExperience (if provided)
    // Or if the frontend provides it directly, we can use it. But our schema has yearsOfExperience.
    // Let's implement a simple mapping logic.
    let experienceLevel = "entry";
    if (parsedData.yearsOfExperience !== undefined) {
      if (parsedData.yearsOfExperience >= 8) {
        experienceLevel = "senior";
      } else if (parsedData.yearsOfExperience >= 3) {
        experienceLevel = "mid";
      }
    }

    // 2. Insert into anonymous drop-box table
    const { error } = await supabaseAdmin.from("pending_profiles").upsert({
      email: parsedData.email,
      target_role: parsedData.targetRole,
      skills: parsedData.skills,
      experience_level: experienceLevel,
    });

    if (error) {
      console.error("Supabase pending_profile insert error:", error);
      return NextResponse.json(
        {
          error: "Failed to securely save pending profile",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // 3. Success
    return NextResponse.json(
      { success: true, message: "Profile saved securely." },
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
