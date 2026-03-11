"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    const supabase = createClient();

    // 1. Immediate check for an existing session (Supabase might have already processed the code/hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = next;
      }
    });

    // 2. Listen for auth state change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        window.location.href = next;
      } else if (event === "SIGNED_OUT") {
        window.location.href = "/auth/auth-code-error";
      }
    });

    // 3. Fallback timeout: if no session after 3 seconds, assume fail
    const timeout = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          window.location.href = "/auth/auth-code-error";
        }
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, next]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc] p-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-[#0ea5e9] to-[#10b981] shadow-lg shadow-sky-500/20">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
      <h2 className="text-xl font-bold text-[#0f172a]">
        Verifying your login...
      </h2>
      <p className="mt-2 text-[#475569]">
        Please wait while we secure your session.
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
