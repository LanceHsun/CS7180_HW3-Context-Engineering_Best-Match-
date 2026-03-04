"use client";

import { useState } from "react";
import { HeroSection } from "@/components/features/onboarding/hero-section";
import { ResumeDropzone } from "@/components/features/onboarding/resume-dropzone";
import { ExtractionResults } from "@/components/features/onboarding/extraction-results";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [isParsed, setIsParsed] = useState(false);
  const router = useRouter();

  return (
    <div className="bg-background min-h-[calc(100vh-58px)] px-6 pt-12 pb-24">
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
    </div>
  );
}
