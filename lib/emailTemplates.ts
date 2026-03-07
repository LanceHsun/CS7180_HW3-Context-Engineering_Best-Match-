import { ScoredMatch } from "./validations/match";

export function renderJobDigestHtml(
  jobs: ScoredMatch[],
  userName: string
): string {
  const jobItems = jobs
    .map((job) => {
      const score = Math.round(job.score);
      let badgeColor = "#f97316"; // Orange < 80
      if (score >= 90)
        badgeColor = "#22c55e"; // Green >= 90
      else if (score >= 80) badgeColor = "#3b82f6"; // Blue 80-90

      return `
      <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 18px; color: #111827; font-family: sans-serif;">${job.job.title}</h3>
          <span style="display: inline-block; padding: 4px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: ${badgeColor}; color: #ffffff; font-family: sans-serif;">
            ${score}% Match
          </span>
        </div>
        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 500; color: #4b5563; font-family: sans-serif;">${job.job.company} • ${job.job.location}</p>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280; line-height: 1.5; font-family: sans-serif;">
          ${job.job.description.length > 200 ? job.job.description.substring(0, 200) + "..." : job.job.description}
        </p>
        <a href="${job.job.apply_url}" style="display: inline-block; padding: 8px 16px; background-color: #1d2c7e; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; font-family: sans-serif;">
          Apply Now
        </a>
      </div>
    `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your BestMatch Digest</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: sans-serif; background-color: #f3f4f6; color: #1f2937;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
              <!-- Header -->
              <tr>
                <td style="padding: 32px; background-color: #1d2c7e; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">BestMatch</h1>
                  <p style="margin: 8px 0 0 0; color: #d1d5db; font-size: 16px;">Your personalized job digest</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 32px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #111827;">Hi ${userName},</h2>
                  <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.6;">
                    We found <strong>${jobs.length}</strong> new job matches that align with your profile and preferences.
                  </p>
                  
                  ${jobItems}
                  
                  <p style="margin: 32px 0 0 0; font-size: 14px; color: #6b7280; text-align: center;">
                    You're receiving this because you signed up for BestMatch job alerts.
                    <br>
                    <a href="#" style="color: #1d2c7e; text-decoration: underline;">Update notification preferences</a>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 24px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
                  &copy; 2024 BestMatch. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function renderJobDigestText(
  jobs: ScoredMatch[],
  userName: string
): string {
  const jobItems = jobs
    .map((job) => {
      const score = Math.round(job.score);
      return `
${job.job.title} - ${score}% Match
${job.job.company} • ${job.job.location}
Link: ${job.job.apply_url}
----------------------------------------`;
    })
    .join("");

  return `
Hi ${userName},

We found ${jobs.length} new job matches for you on BestMatch:

${jobItems}

View all matches on your dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || "https://bestmatch.vercel.app"}/dashboard

Best,
The BestMatch Team
  `;
}
