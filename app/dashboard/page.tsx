import { ProfileCard } from "@/components/features/dashboard/profile-card";
import { MatchHistory } from "@/components/features/dashboard/match-history";

export default function DashboardPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1020px] flex-col gap-8 p-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Manage your job matches and profile information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ProfileCard />
        {/* Placeholder for Preferences Card */}
        <div className="bg-card rounded-[16px] border border-slate-200 p-6 shadow-sm">
          <div className="text-muted-foreground mb-4 font-mono text-[11px] font-bold tracking-[1.5px] uppercase">
            PREFERENCES
          </div>
          <p className="text-muted-foreground text-sm italic">
            Coming soon: Notification and location settings.
          </p>
        </div>
      </div>

      <MatchHistory />
    </div>
  );
}
