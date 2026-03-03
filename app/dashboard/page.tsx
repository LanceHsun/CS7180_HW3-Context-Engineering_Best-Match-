import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Manage your job matches here.
      </p>
      <div className="mt-6">
        <Button>Refresh Matches</Button>
      </div>
    </div>
  );
}
