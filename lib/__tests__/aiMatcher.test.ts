import { describe, it, expect, vi, beforeEach } from "vitest";
import { scoreJobMatch, runMatchBatch } from "@/lib/aiMatcher";
import { generateWithFallback } from "../ai";
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
  GEMINI_MODELS: ["mock-model-1", "mock-model-2"],
  generateWithFallback: vi.fn(),
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

      vi.mocked(generateWithFallback).mockResolvedValue({
        text: mockResponseText,
        modelName: "mock-model-1",
      });

      const result = await scoreJobMatch(mockProfile, mockJob);

      expect(result.score).toBe(95);
      expect(result.reasoning).toContain("Excellent alignment");
      expect(generateWithFallback).toHaveBeenCalled();
    });

    it("handles missing targetRole in prompt correctly", async () => {
      vi.mocked(generateWithFallback).mockResolvedValue({
        text: JSON.stringify({ score: 70, reasoning: "Ok" }),
        modelName: "mock-model-1",
      });

      const profileWithoutRole = { ...mockProfile, targetRole: undefined };
      await scoreJobMatch(profileWithoutRole as any, mockJob);

      const prompt = vi.mocked(generateWithFallback).mock.calls[0][0] as string;
      expect(prompt).toContain("Target Role: Not specified");
    });

    it("handles non-JSON response from AI gracefully", async () => {
      const mockResponseText = "This is not JSON";

      vi.mocked(generateWithFallback).mockResolvedValue({
        text: mockResponseText,
        modelName: "mock-model-1",
      });

      await expect(scoreJobMatch(mockProfile, mockJob)).rejects.toThrow(
        "AI returned invalid JSON response"
      );
    });

    it("handles AI API errors gracefully", async () => {
      vi.mocked(generateWithFallback).mockRejectedValue(new Error("AI error"));

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
      vi.mocked(generateWithFallback)
        .mockResolvedValueOnce({
          text: JSON.stringify({ score: 90, reasoning: "Good" }),
          modelName: "mock-model-1",
        })
        // Second call (non-matching)
        .mockResolvedValueOnce({
          text: JSON.stringify({ score: 50, reasoning: "Bad" }),
          modelName: "mock-model-1",
        });

      const result = await runMatchBatch(mockProfile, jobs);

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].score).toBe(90);
      expect(result.filtered_count).toBe(1);
    });

    it("returns empty matches if no jobs pass threshold", async () => {
      const jobs: NormalizedJob[] = [mockJob];

      vi.mocked(generateWithFallback).mockResolvedValue({
        text: JSON.stringify({ score: 60, reasoning: "Too low" }),
        modelName: "mock-model-1",
      });

      const result = await runMatchBatch(mockProfile, jobs);

      expect(result.matches).toHaveLength(0);
      expect(result.filtered_count).toBe(1);
    });

    it("sorts matches by score descending", async () => {
      const jobs: NormalizedJob[] = [
        { ...mockJob, title: "Lower Score" },
        { ...mockJob, title: "Higher Score" },
      ];

      vi.mocked(generateWithFallback)
        .mockResolvedValueOnce({
          text: JSON.stringify({ score: 80, reasoning: "Ok" }),
          modelName: "mock-model-1",
        })
        .mockResolvedValueOnce({
          text: JSON.stringify({ score: 95, reasoning: "Great" }),
          modelName: "mock-model-1",
        });

      const result = await runMatchBatch(mockProfile, jobs);

      expect(result.matches).toHaveLength(2);
      expect(result.matches[0].score).toBe(95);
      expect(result.matches[1].score).toBe(80);
    });

    it("handles errors in batch and continues processing", async () => {
      const jobs: NormalizedJob[] = [
        { ...mockJob, title: "Errored Job" },
        { ...mockJob, title: "Successful Job" },
      ];

      vi.mocked(generateWithFallback)
        .mockRejectedValueOnce(new Error("AI Failure"))
        .mockResolvedValueOnce({
          text: JSON.stringify({ score: 90, reasoning: "Good" }),
          modelName: "mock-model-1",
        });

      const result = await runMatchBatch(mockProfile, jobs);

      expect(result.matches).toHaveLength(1);
      expect(result.matches[0].score).toBe(90);
    });
  });
});
