"use client";

import { useUser } from "@/lib/hooks/use-user";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/**
 * Dashboard header component.
 * Displays user email and provides a sign-out button.
 * @issue 13
 */
export function DashboardHeader() {
  const { user } = useUser();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch("/auth/signout", { method: "POST" });
      // Force a hard reload to clear all client-side state and navigate
      window.location.href = "/";
    } catch {
      // Fallback: redirect manually
      window.location.href = "/";
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#0f172a]">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your job matches here.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {user?.email && (
          <div className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#475569]">
            <UserIcon className="h-4 w-4 text-[#94a3b8]" aria-hidden="true" />
            <span>{user.email}</span>
          </div>
        )}

        <Button
          onClick={handleSignOut}
          disabled={isSigningOut}
          variant="outline"
          size="sm"
          className="gap-2 text-[#475569] hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {isSigningOut ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </motion.header>
  );
}
