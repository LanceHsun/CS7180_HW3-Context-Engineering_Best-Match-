import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "../../../lib/api/response";
import { createClient } from "../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Simple health check query against Supabase
    // Just selecting the session/authenticating implicitly checks connectivity.
    // We'll use a basic select to verify the DB works if the profiles table exists.
    const { error, status } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    // Since we may not have rows, we don't care about no rows, just if there's a fatal DB error
    // e.g. code "42P01" is undefined table which means connectivity works but schema is bare.
    // Any real connection timeout is a completely different error.
    const isDbHealthy = !error || error.code === "42P01";
    const isGeminiHealthy = !!process.env.GEMINI_API_KEY;

    if (!isDbHealthy || !isGeminiHealthy) {
      return errorResponse(
        {
          code: "SERVICE_UNAVAILABLE",
          message: "One or more crucial services are currently unavailable.",
          details: {
            database: isDbHealthy ? "ok" : "error",
            gemini: isGeminiHealthy ? "ok" : "missing config",
            dbErrorArgs: error || null,
          },
        },
        503
      );
    }

    return successResponse({
      database: "ok",
      gemini: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return errorResponse(
      {
        code: "INTERNAL_SERVER_ERROR",
        message: "Health check failed unexpectedly.",
        details: err.message,
      },
      500
    );
  }
}
