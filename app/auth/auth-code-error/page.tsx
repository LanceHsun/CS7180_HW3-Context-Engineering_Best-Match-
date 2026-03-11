"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCodeErrorPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Check session immediately - if the URL has a hash token, Supabase will process it here
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        window.location.href = "/dashboard";
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        window.location.href = "/dashboard";
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 font-sans text-[#0f172a]">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
          Link Expired
        </h1>

        <p className="mt-4 leading-relaxed text-[#475569]">
          The Magic Link you clicked is either invalid or has already expired.
          <br />
          <br />
          For security reasons, Magic Links can only be clicked once and expire
          after 15 minutes. Also, sometimes your email provider might pre-fetch
          the link and accidentally consume it before you open it.
        </p>

        <div className="mt-8 space-y-4">
          <Link href="/signin" passHref>
            <Button className="h-12 w-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-base font-bold text-white transition-opacity hover:opacity-90">
              Request a new Magic Link
            </Button>
          </Link>

          <Link
            href="/"
            className="mt-4 block text-sm font-semibold text-[#64748b] transition-colors hover:text-[#0f172a]"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
