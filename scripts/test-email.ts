import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Manually load .env.local to ensure it's available before ANY validation
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

async function run() {
  try {
    // Import using our validated env
    const { sendJobDigest } = await import("../lib/email.js");

    const toArgIndex = process.argv.indexOf("--to");
    let toEmail = process.env.SENDGRID_FROM_EMAIL;

    if (toArgIndex !== -1 && process.argv[toArgIndex + 1]) {
      toEmail = process.argv[toArgIndex + 1];
    }

    if (!toEmail) {
      console.error("❌ Recipient email missing. Use --to your@email.com");
      process.exit(1);
    }

    const fromEmail = process.env.SENDGRID_FROM_EMAIL;

    // Mock jobs for testing the template
    const mockJobs = [
      {
        job: {
          title: "Senior Frontend Engineer",
          company: "Dream Tech",
          description:
            "Building the future of web applications with React and Next.js.",
          apply_url: "https://example.com/apply-1",
          location: "Remote",
        },
        score: 95,
        reasoning: "Matches your expertise in Next.js and React.",
      },
    ];

    console.log(`🚀 Sending test email from ${fromEmail} to ${toEmail}...`);

    const result = await sendJobDigest(
      toEmail,
      "BestMatch User",
      mockJobs as any
    );

    if (result.success) {
      console.log("✅ Email sent successfully!");
      console.log(
        `Check your inbox (${toEmail}) for "Your BestMatch digest — 1 new matches".`
      );
    }
  } catch (error: any) {
    console.error("❌ Error sending email:", error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

run();
