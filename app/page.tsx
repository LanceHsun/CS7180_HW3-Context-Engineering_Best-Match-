"use client";

import { useState } from "react";
import { HeroSection } from "@/components/features/onboarding/hero-section";
import { ResumeDropzone } from "@/components/features/onboarding/resume-dropzone";
import { ExtractionResults } from "@/components/features/onboarding/extraction-results";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isParsed, setIsParsed] = useState(false);
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] font-sans text-[#0f172a]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-white/80 px-8 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#0ea5e9] to-[#10b981] text-sm font-extrabold text-white">
            B
          </div>
          <span className="font-mono text-lg font-bold tracking-tight">
            BestMatch
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/signin"
            className="text-sm font-medium text-[#475569] hover:text-[#0ea5e9]"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-6 pt-12 pb-24">
        <div className="mx-auto max-w-[640px]">
          <HeroSection />

          <ResumeDropzone onSuccess={() => setIsParsed(true)} />

          {isParsed && (
            <ExtractionResults onComplete={() => router.push("/dashboard")} />
          )}

          <p className="text-muted-foreground mt-8 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-sky-500 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </main>

      <footer className="mt-auto border-t border-[#e2e8f0] bg-white py-12 text-center text-sm text-[#94a3b8]">
        <p>© 2026 BestMatch AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
