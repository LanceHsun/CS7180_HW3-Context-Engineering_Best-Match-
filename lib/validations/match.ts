import { z } from "zod";
import { NormalizedJobSchema } from "./jobListing";

/**
 * Schema for the POST /api/match/run request body.
 * Requires a profile ID and at least one job to score.
 * @issue 16
 */
export const MatchRunRequestSchema = z.object({
  profileId: z.uuid("Profile ID must be a valid UUID"),
  jobs: z
    .array(NormalizedJobSchema)
    .min(1, "At least one job is required for matching"),
});

export type MatchRunRequest = z.infer<typeof MatchRunRequestSchema>;

/**
 * Schema for a single AI match result from Gemini.
 * Score is 0-100 (percentage), reasoning is the AI explanation.
 * @issue 16
 */
export const MatchResultSchema = z.object({
  score: z
    .number()
    .min(0, "Score must be at least 0")
    .max(100, "Score must be at most 100"),
  reasoning: z.string().min(1, "Reasoning is required"),
});

export type MatchResult = z.infer<typeof MatchResultSchema>;

/**
 * Schema for a single scored match (job + AI score).
 * Combines job data with the matching result.
 * @issue 16
 */
export const ScoredMatchSchema = z.object({
  job: NormalizedJobSchema,
  score: z.number().min(0).max(100),
  reasoning: z.string(),
});

export type ScoredMatch = z.infer<typeof ScoredMatchSchema>;

/**
 * Schema for the POST /api/match/run response.
 * @issue 16
 */
export const MatchRunResponseSchema = z.object({
  matches: z.array(ScoredMatchSchema),
  filtered_count: z.number().min(0),
});

export type MatchRunResponse = z.infer<typeof MatchRunResponseSchema>;
