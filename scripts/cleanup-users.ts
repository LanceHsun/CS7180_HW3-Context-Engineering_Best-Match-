import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function cleanup() {
  console.log("🧹 Starting database cleanup...");

  // 1. List all users
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("❌ Failed to list users:", listError.message);
    return;
  }

  console.log(`👤 Found ${users.length} users.`);

  if (users.length === 0) {
    console.log("✅ No users to delete.");
    return;
  }

  // 2. Delete each user
  // This will trigger CASCADE delete on profiles, matches, etc. if the schema is correct.
  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      user.id
    );
    if (deleteError) {
      console.error(
        `❌ Failed to delete user ${user.email} (${user.id}):`,
        deleteError.message
      );
      failureCount++;
    } else {
      console.log(`✅ Deleted user: ${user.email}`);
      successCount++;
    }
  }

  console.log("\n--- Cleanup Summary ---");
  console.log(`Total: ${users.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failure: ${failureCount}`);
  console.log("------------------------");
}

cleanup();
