import { HeroSection } from "@/components/features/onboarding/hero-section";
import { ResumeDropzone } from "@/components/features/onboarding/resume-dropzone";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Resume | BestMatch",
  description: "Upload your resume to start receiving AI-powered job matches.",
};

export default function OnboardingPage() {
  return (
    <div className="bg-background min-h-[calc(100vh-58px)] px-6 py-18">
      <div className="mx-auto max-w-[640px]">
        <HeroSection />
        <div className="mt-13">
          <ResumeDropzone />
        </div>
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
