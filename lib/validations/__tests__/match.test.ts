import { describe, it, expect } from "vitest";
import {
  MatchRunRequestSchema,
  MatchResultSchema,
  MatchRunResponseSchema,
} from "@/lib/validations/match";

describe("MatchRunRequestSchema", () => {
  it("validates a correct request with profileId and jobs", () => {
    const input = {
      profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      jobs: [
        {
          title: "Software Engineer",
          company: "Acme Corp",
          description: "Build web apps",
          apply_url: "https://example.com/apply",
          location: "Remote",
        },
      ],
    };
    const result = MatchRunRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects when profileId is missing", () => {
    const input = {
      jobs: [
        {
          title: "Software Engineer",
          company: "Acme Corp",
          description: "Build web apps",
          apply_url: "https://example.com/apply",
          location: "Remote",
        },
      ],
    };
    const result = MatchRunRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects when profileId is not a valid UUID", () => {
    const input = {
      profileId: "not-a-uuid",
      jobs: [
        {
          title: "Software Engineer",
          company: "Acme Corp",
          description: "Build web apps",
          apply_url: "https://example.com/apply",
          location: "Remote",
        },
      ],
    };
    const result = MatchRunRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects when jobs array is empty", () => {
    const input = {
      profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      jobs: [],
    };
    const result = MatchRunRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects when jobs is missing", () => {
    const input = {
      profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };
    const result = MatchRunRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("MatchResultSchema", () => {
  it("validates a correct match result", () => {
    const input = {
      score: 85,
      reasoning: "Strong match due to overlapping React and TypeScript skills.",
    };
    const result = MatchResultSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects score above 100", () => {
    const input = {
      score: 101,
      reasoning: "Out of range.",
    };
    const result = MatchResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects score below 0", () => {
    const input = {
      score: -5,
      reasoning: "Negative score.",
    };
    const result = MatchResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects when reasoning is missing", () => {
    const input = {
      score: 80,
    };
    const result = MatchResultSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("MatchRunResponseSchema", () => {
  it("validates a correct response", () => {
    const input = {
      matches: [
        {
          job: {
            title: "Frontend Dev",
            company: "StartupX",
            description: "Build UIs",
            apply_url: "https://example.com/apply",
            location: "NYC",
          },
          score: 92,
          reasoning: "Excellent skill match.",
        },
      ],
      filtered_count: 3,
    };
    const result = MatchRunResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("validates a response with zero matches", () => {
    const input = {
      matches: [],
      filtered_count: 5,
    };
    const result = MatchRunResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});
