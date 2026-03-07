"use client";

import { useUser } from "@/lib/hooks/use-user";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";

/**
 * Dashboard layout with auth loading state.
 * Shows a skeleton while auth initializes to prevent UI flickering (AC4).
 * Route protection is handled server-side by middleware.
 * @issue 13
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useUser();

  // Loading state: show skeleton while auth initializes (AC4)
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc] p-8">
        <div className="mx-auto w-full max-w-5xl">
          {/* Header skeleton */}
          <div className="mb-8 flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-[#e2e8f0]" />
            <div className="flex items-center gap-3">
              <div className="h-4 w-32 animate-pulse rounded bg-[#e2e8f0]" />
              <div className="h-9 w-24 animate-pulse rounded-lg bg-[#e2e8f0]" />
            </div>
          </div>
          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-32 w-full animate-pulse rounded-xl bg-[#e2e8f0]" />
            <div className="h-32 w-full animate-pulse rounded-xl bg-[#e2e8f0]" />
            <div className="h-32 w-full animate-pulse rounded-xl bg-[#e2e8f0]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] p-8">
      <div className="mx-auto w-full max-w-5xl">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}
