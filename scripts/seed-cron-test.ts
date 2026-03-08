import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log("🚀 Seeding a PERFECT test user for cron verification...");

  // 1. Get the first user from the database to avoid auth errors
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id")
    .limit(1);
  if (!profiles || profiles.length === 0) {
    console.error("❌ No profiles found in DB. Please sign up first.");
    return;
  }
  const userId = profiles[0].user_id;

  // 2. Clear today's runs for this user to bypass idempotency
  const today = new Date().toISOString().split("T")[0];
  await supabase
    .from("match_runs")
    .delete()
    .eq("user_id", userId)
    .filter("started_at", "gte", today);

  // 3. Update Profile to be a PERFECT match for "Developer"
  await supabase
    .from("profiles")
    .update({
      full_name: "Expert Tester",
      target_role: "Software Engineer",
      email: "alifeng0706@gmail.com",
      resume_text:
        "Senior Software Developer with 15 years of experience in Web Development. Expert in React, Node.js, TypeScript, JavaScript, HTML, CSS, SQL, and Cloud Computing. I have built many high-scale applications.",
    })
    .eq("user_id", userId);

  // 4. Update Preferences
  await supabase.from("preferences").upsert({
    user_id: userId,
    frequency: "daily",
    locations: ["Remote"],
  });

  console.log(`✅ Updated user ${userId} to be a PERFECT match.`);
  console.log("\n🚀 All set! Now trigger the cron job.");
  console.log("Command:");
  console.log(
    `curl.exe -X GET http://localhost:3000/api/cron/match -H "Authorization: Bearer ${process.env.CRON_SECRET}"`
  );
}

seed();
