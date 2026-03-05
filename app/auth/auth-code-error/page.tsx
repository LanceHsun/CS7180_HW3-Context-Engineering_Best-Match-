"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 font-sans text-[#0f172a]">
            <div className="w-full max-w-md text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
                    <AlertCircle className="h-8 w-8" />
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">
                    Link Expired
                </h1>

                <p className="mt-4 text-[#475569] leading-relaxed">
                    The Magic Link you clicked is either invalid or has already expired.
                    <br /><br />
                    For security reasons, Magic Links can only be clicked once and expire after 15 minutes. Also, sometimes your email provider might pre-fetch the link and accidentally consume it before you open it.
                </p>

                <div className="mt-8 space-y-4">
                    <Link href="/signin" passHref>
                        <Button className="w-full h-12 bg-gradient-to-r from-[#0ea5e9] to-[#10b981] text-white font-bold text-base hover:opacity-90 transition-opacity">
                            Request a new Magic Link
                        </Button>
                    </Link>

                    <Link href="/" className="block text-sm font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors mt-4">
                        Return to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}
