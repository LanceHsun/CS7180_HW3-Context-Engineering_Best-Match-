import { vi, describe, it, expect, beforeEach } from "vitest";
import sgMail from "@sendgrid/mail";
import { sendJobDigest } from "../email";
import { ScoredMatch } from "../validations/match";

// Mock Environment
vi.mock("../env", () => ({
  env: {
    SENDGRID_API_KEY: "test-key",
    SENDGRID_FROM_EMAIL: "test@example.com",
  },
}));

// Mock SendGrid
vi.mock("@sendgrid/mail", () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{}]),
  },
}));

describe("Email Service", () => {
  const mockJobs: ScoredMatch[] = [
    {
      job: {
        title: "Software Engineer",
        company: "Tech Corp",
        description: "Great job",
        apply_url: "https://example.com/apply",
        location: "Remote",
      },
      score: 95,
      reasoning: "Perfect match",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send an email with correct parameters", async () => {
    const result = await sendJobDigest("test@example.com", "John", mockJobs);

    expect(result.success).toBe(true);
    expect(sgMail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: expect.stringContaining("1 new matches"),
        html: expect.stringContaining("Software Engineer"),
        text: expect.stringContaining("Software Engineer"),
      })
    );
  });

  it("should handle empty job list", async () => {
    const result = await sendJobDigest("test@example.com", "John", []);
    expect(result.success).toBe(true);
    expect(sgMail.send).not.toHaveBeenCalled();
  });

  it("should throw error if SendGrid fails", async () => {
    vi.mocked(sgMail.send).mockRejectedValueOnce(new Error("SendGrid Error"));
    await expect(
      sendJobDigest("test@example.com", "John", mockJobs)
    ).rejects.toThrow("Failed to send email digest");
  });

  it("should use correct badge colors in HTML template", async () => {
    const jobsWithDifferentScores: ScoredMatch[] = [
      { job: { ...mockJobs[0].job, title: "Job 1" }, score: 95, reasoning: "" }, // Green
      { job: { ...mockJobs[0].job, title: "Job 2" }, score: 85, reasoning: "" }, // Blue
      { job: { ...mockJobs[0].job, title: "Job 3" }, score: 75, reasoning: "" }, // Orange
    ];

    await sendJobDigest("test@example.com", "John", jobsWithDifferentScores);

    const sentHtml = vi.mocked(sgMail.send).mock.calls[0][0].html as string;

    expect(sentHtml).toContain("#22c55e"); // Green
    expect(sentHtml).toContain("#3b82f6"); // Blue
    expect(sentHtml).toContain("#f97316"); // Orange
  });
});
