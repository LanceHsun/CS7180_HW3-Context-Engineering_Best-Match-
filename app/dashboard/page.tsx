"use client";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] p-8">
      <div className="mx-auto w-full max-w-5xl">
        <DashboardHeader />
        <div className="mt-6">
          <Button>Refresh Matches</Button>
        </div>
      </div>
    </div>
  );
}
