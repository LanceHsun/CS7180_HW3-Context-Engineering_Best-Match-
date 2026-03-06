import { describe, it, expect, vi, beforeEach } from "vitest";
import { scoreJobMatch, runMatchBatch } from "@/lib/aiMatcher";
import { ai } from "../ai";
import { UserProfile } from "../validations/schemas";
import { NormalizedJob } from "../validations/jobListing";

const mockModel = {
  generateContent: vi.fn(),
};

// Mock the AI client
vi.mock("../ai", () => ({
  ai: {
    getGenerativeModel: vi.fn(() => mockModel),
  },
}));

describe("aiMatcher", () => {
  const mockProfile: UserProfile = {
    name: "John Doe",
    email: "john@example.com",
    skills: ["React", "TypeScript", "Node.js"],
    targetLocations: ["Remote", "NYC"],
    notificationFrequency: "Weekly",
    targetRole: "Software Engineer",
  };

  const mockJob: NormalizedJob = {
    title: "Senior Frontend Engineer",
    company: "Tech Solutions",
    description:
      "We are looking for a React expert with TypeScript experience.",
    apply_url: "https://techsolutions.com/jobs/1",
    location: "Remote",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scoreJobMatch", () => {
    it("successfully scores a match and returns valid result", async () => {
      const mockResponseText = JSON.stringify({
        score: 95,
        reasoning: "Excellent alignment with React and TypeScript skills.",
      });

      const mockResult = {
        response: {
          text: () => mockResponseText,
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResult as any);

      const result = await scoreJobMatch(mockProfile, mockJob);

      expect(result.score).toBe(95);
      expect(result.reasoning).toContain("Excellent alignment");
      expect(mockModel.generateContent).toHaveBeenCalled();
    });

    it("handles non-JSON response from AI gracefully", async () => {
      const mockResponseText = "This is not JSON";

      mockModel.generateContent.mockResolvedValue({
        response: { text: () => mockResponseText },
      } as any);

      await expect(scoreJobMatch(mockProfile, mockJob)).rejects.toThrow(
        "AI returned invalid JSON response"
      );
    });

    it("handles AI API errors gracefully", async () => {
      mockModel.generateContent.mockRejectedValue(new Error("AI error"));

      await expect(scoreJobMatch(mockProfile, mockJob)).rejects.toThrow(
        "AI error"
      );
    });
  });

  describe("runMatchBatch", () => {
    it("filters out jobs below the threshold", async () => {
      const jobs: NormalizedJob[] = [
        { ...mockJob, title: "Matching Job" },
        { ...mockJob, title: "Non-matching Job" },
      ];

      // First call (matching)
      mockModel.generateContent
        .mockResolvedValueOnce({
          response: {
            text: () => JSON.stringify({ score: 90, reasoning: "Good" }),
          },
        } as any)
        // Second call (non-matching)
        .mockResolvedValueOnce({
          response: {
            text: () => JSON.stringify({ score: 50, reasoning: "Bad" }),
          },
        } as any);

      const result = await runMatchBatch(mockProfile, jobs);

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].score).toBe(90);
      expect(result.filtered_count).toBe(1);
    });

    it("returns empty matches if no jobs pass threshold", async () => {
      const jobs: NormalizedJob[] = [mockJob];

      mockModel.generateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({ score: 60, reasoning: "Too low" }),
        },
      } as any);

      const result = await runMatchBatch(mockProfile, jobs);

      expect(result.matches).toHaveLength(0);
      expect(result.filtered_count).toBe(1);
    });
  });
});
