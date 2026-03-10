import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getURL } from "@/lib/utils";

/**
 * POST /auth/signout
 * Server-side logout handler. Clears Supabase session and mock cookie.
 * Redirects to /signin after sign-out.
 * @issue 13
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  await supabase.auth.signOut();

  // Build redirect URL from the request origin
  const redirectUrl = `${getURL()}/`;

  const response = NextResponse.redirect(redirectUrl, { status: 302 });

  // Clear mock user cookie (AC5)
  response.cookies.delete("sb-mock-user");

  return response;
}
