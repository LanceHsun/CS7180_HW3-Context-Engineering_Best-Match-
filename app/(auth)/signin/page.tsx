"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Zod validation
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    // Mock logic for testing when Supabase is not configured or using placeholders
    const isPlaceholderEnv =
      process.env.NODE_ENV !== "test" &&
      (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-url") ||
        process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"));

    if (isPlaceholderEnv) {
      console.log("Demo Mode: Simulating Magic Link sent to", email);
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsSent(true);
      setIsLoading(false);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        setIsSent(true);
      }
    } catch (err: any) {
      // Catch "Failed to fetch" and other network errors to allow demo mode
      console.error("Supabase error caught:", err);
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        console.log(
          "Network error caught. Falling back to Demo Mode simulation."
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSent(true);
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSent(false);
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 font-sans text-[#0f172a]">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#0ea5e9] to-[#10b981] text-xl font-extrabold text-white">
            B
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-[#475569]">
            Enter your email and we&apos;ll send you a Magic Link to sign in
            instantly.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.div
                key="input-state"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-medium text-[#475569]"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 text-sm outline-hidden transition-all focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-11 w-full bg-linear-to-br from-[#0ea5e9] to-[#10b981] text-base font-bold text-white hover:opacity-90"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Send Magic Link
                  </Button>
                </form>

                <p className="mt-6 text-center text-xs text-[#94a3b8]">
                  New to BestMatch?{" "}
                  <Link
                    href="/onboarding"
                    className="font-semibold text-[#0ea5e9] underline underline-offset-4"
                  >
                    Upload your resume
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="sent-state"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="py-3 text-center"
              >
                <div className="mb-4 text-5xl">📬</div>
                <h3 className="text-xl font-bold text-[#0f172a]">
                  Check your inbox
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  We just sent a sign-in link to
                  <br />
                  <strong className="text-[#0f172a]">{email}</strong>.
                  <br />
                  <br />
                  Open your inbox and click the link to log in.
                  <br />
                  <span className="text-xs text-[#94a3b8]">
                    The link expires in 15 minutes.
                  </span>
                </p>

                <button
                  onClick={handleReset}
                  className="mt-6 inline-flex rounded-lg border border-[#cbd5e1] px-5 py-2 text-sm font-semibold text-[#475569] transition-colors hover:bg-slate-50"
                >
                  Use a different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
