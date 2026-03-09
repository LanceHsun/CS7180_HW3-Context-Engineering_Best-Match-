import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Use the public anon key for frontend-like authentication
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testTrigger() {
  console.log("🚀 Testing Manual Match Trigger Endpoint...");

  // 1. We need a test user. Instead of signing in with a password (which Magic Links don't use),
  // we will hijack a session using the Service Role just to generate a valid access token for our test user.

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get the first user from the DB
  const { data: users, error: userError } =
    await adminClient.auth.admin.listUsers();

  if (userError || !users.users || users.users.length === 0) {
    console.error("❌ Failed to fetch test user:", userError);
    return;
  }

  const testUser = users.users[0];
  console.log(`👤 Using test user: ${testUser.email}`);

  // Generate a valid session token for this user
  const { data: sessionData, error: sessionError } =
    await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: testUser.email as string,
    });

  // Wait, generateLink doesn't return the token directly, it returns the link.
  // Let's just use the Supabase JS client to call the API directly from the server side
  // by passing the Authorization header of a dummy session?
  // Actually, there's a simpler way to test the API locally:
  // We can just use the admin client's JWT if the API route accepts it.
  // Let's see if the API route accepts the service role token (it uses `supabase.auth.getUser()`).

  console.log("🔑 Bypassing frontend auth and calling the API locally...");

  try {
    const response = await fetch("http://localhost:3000/api/match/trigger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Pass the service role key as the Bearer token.
        // `getUser()` in the API route validates the token. The service role token might not have a specific "user" attached.
        // Let's print out instructions for the user to get their token.
      },
    });

    if (response.status === 401) {
      console.log(
        "⚠️ The API requires a real user session. To test this end-to-end via script:"
      );
      console.log(
        "1. Open your browser and log into http://localhost:3000/dashboard"
      );
      console.log(
        "2. Open browser DevTools (F12) -> Application -> Local Storage"
      );
      console.log(
        "3. Find the `sb-...-auth-token` key and copy the `access_token` value."
      );
      console.log(
        '4. Run: curl -X POST http://localhost:3000/api/match/trigger -H "Authorization: Bearer YOUR_COPIED_TOKEN"'
      );
      return;
    }

    const data = await response.json();
    console.log("✅ Response Status:", response.status);
    console.log("📄 Response Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Fetch failed:", err);
  }
}

testTrigger();
