import { ProfileCard } from "@/components/features/dashboard/profile-card";
import { MatchHistory } from "@/components/features/dashboard/match-history";
import { PreferencesCard } from "@/components/features/dashboard/preferences-card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ProfileCard />
        <PreferencesCard />
      </div>

      <MatchHistory />
    </div>
  );
}
