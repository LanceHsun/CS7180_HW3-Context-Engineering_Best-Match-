import "./load-env.ts";
import { createClient } from "@supabase/supabase-js";
import { runMatchBatch } from "../lib/aiMatcher";
import { fetchJobs } from "../lib/jobFetcher";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testPipeline() {
  console.log("🧪 Testing Match Pipeline...");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", "745bff03-10c7-4b94-add8-bcd956f064b4")
    .single();
  if (!profile) return console.error("No profile found for seeded user.");

  console.log(`User: ${profile.full_name} (${profile.target_role})`);

  console.log(
    `📡 Fetching jobs for role: "Software Engineer" in location: "Remote"...`
  );
  const jobs = await fetchJobs({
    role: "Software Engineer",
    location: "Remote",
  });
  console.log(`Fetched ${jobs.length} jobs.`);

  if (jobs.length === 0) {
    console.error("❌ No jobs found for this role!");
    return;
  }

  console.log("🤖 Running AI Matcher on first 5 jobs...");
  try {
    const matchResult = await runMatchBatch(profile as any, jobs.slice(0, 5));
    console.log("✅ Match batch complete.");

    console.log("\n--- Passed Matches (Score > 70%) ---");
    matchResult.matches.forEach((r: any, i: number) => {
      console.log(
        `[${i + 1}] Score: ${r.score}% - ${r.job.title} @ ${r.job.company}`
      );
      console.log(`    Reason: ${r.reasoning}`);
    });

    if (matchResult.matches.length === 0) {
      console.log("\n⚠️ All jobs were filtered out.");
    }
  } catch (err: any) {
    console.error("❌ Error in runMatchBatch:", err.message);
    if (err.stack) console.error(err.stack);
  }
}

testPipeline();
