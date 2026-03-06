import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ResumeParseSchema } from "@/lib/validations/resume";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = ResumeParseSchema.parse(body);

    let experienceLevel = "entry";
    if (parsedData.yearsOfExperience !== undefined) {
      if (parsedData.yearsOfExperience >= 8) {
        experienceLevel = "senior";
      } else if (parsedData.yearsOfExperience >= 3) {
        experienceLevel = "mid";
      }
    }

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        target_role: parsedData.targetRole,
        skills: parsedData.skills,
        experience_level: experienceLevel,
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      console.error("Profile upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save profile", details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Profile saved." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      );
    }
    console.error("Profile route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // PGRES116: The result contains 0 rows
        return NextResponse.json({ data: null }, { status: 200 });
      }
      console.error("Profile fetch error:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch profile", details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Profile GET route error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching profile" },
      { status: 500 }
    );
  }
}
