import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getURL } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 1. Sync pending profile if it exists
      const { data: userAuthData } = await supabase.auth.getUser();
      const user = userAuthData?.user;

      if (user && user.email) {
        // We use the service role key here because the client has no RLS read access to pending_profiles
        const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supaUrl && supaKey) {
          try {
            // The server createClient expects 0 args, we need to import the pure supabase-js client for admin tasks.
            const { createClient: createAdminClient } =
              await import("@supabase/supabase-js");
            const supabaseAdmin = createAdminClient(supaUrl, supaKey, {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
              },
            });

            // Find pending profile securely
            const { data: pendingProfile, error: pendingError } =
              await supabaseAdmin
                .from("pending_profiles")
                .select("*")
                .eq("email", user.email)
                .maybeSingle();

            if (pendingError) {
              console.error("Failed to query pending profile:", pendingError);
            }

            if (pendingProfile) {
              // Sync to main profiles table
              const { error: upsertError } = await supabase
                .from("profiles")
                .upsert(
                  {
                    user_id: user.id,
                    target_role: pendingProfile.target_role,
                    skills: pendingProfile.skills,
                    experience_level: pendingProfile.experience_level,
                  },
                  { onConflict: "user_id" }
                );

              if (!upsertError) {
                // Delete the pending record to keep it clean
                await supabaseAdmin
                  .from("pending_profiles")
                  .delete()
                  .eq("email", user.email);
              } else {
                console.error(
                  "Failed to sync pending profile to main table:",
                  upsertError
                );
                // We log the error but allow the login to proceed. They can retry setting their profile.
              }
            }
          } catch (error) {
            console.error("Error syncing pending profile:", error);
          }
        } else {
          console.warn(
            "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL. Skipping pending profile sync."
          );
        }
      }

      // 2. Redirect
      const forwardedHost = request.headers.get("x-forwarded-host"); // Beetroot: usually set by reverse proxies
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no proxy in between
        return NextResponse.redirect(
          `${getURL()}/${next.startsWith("/") ? next.slice(1) : next}`
        );
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(
          `${getURL()}/${next.startsWith("/") ? next.slice(1) : next}`
        );
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${getURL()}/auth/auth-code-error`);
}
