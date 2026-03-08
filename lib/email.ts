import sgMail from "@sendgrid/mail";
import { env } from "./env";
import { ScoredMatch } from "./validations/match";
import { renderJobDigestHtml, renderJobDigestText } from "./emailTemplates";

if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

/**
 * Sends a job digest email to a user.
 * @issue 18
 */
export async function sendJobDigest(
  to: string,
  userName: string,
  jobs: ScoredMatch[]
) {
  if (jobs.length === 0) return { success: true, message: "No jobs to send" };

  if (!env.SENDGRID_API_KEY || !env.SENDGRID_FROM_EMAIL) {
    console.warn("SendGrid credentials missing. Skipping email send.");
    return {
      success: false,
      message: "SendGrid credentials missing",
    };
  }

  const html = renderJobDigestHtml(jobs, userName);
  const text = renderJobDigestText(jobs, userName);

  const msg = {
    to,
    from: env.SENDGRID_FROM_EMAIL,
    subject: `Your BestMatch digest — ${jobs.length} new matches`,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email via SendGrid:", error);
    if (error.response) {
      console.error(JSON.stringify(error.response.body, null, 2));
    }
    throw new Error("Failed to send email digest");
  }
}
