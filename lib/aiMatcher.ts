import { GEMINI_MODELS, generateWithFallback } from "./ai";
import { UserProfile, JobDescription } from "./validations/schemas";
import { NormalizedJob } from "./validations/jobListing";
import {
  MatchResult,
  MatchResultSchema,
  ScoredMatch,
  MatchRunResponse,
} from "./validations/match";

export const MATCH_THRESHOLD = 70; // Issue #16: Match Score > 70%

/**
 * Uses Gemini to score a single job match against a user profile.
 * Employs an expert recruiter persona for high-fidelity evaluation.
 * Implements model fallback for reliability.
 * @issue 16
 */
export async function scoreJobMatch(
  profile: UserProfile,
  job: NormalizedJob
): Promise<MatchResult> {
  const prompt = `
You are a world-class talent matching specialist and expert recruiter. 
Your task is to evaluate the alignment between a candidate's profile and a job listing.

CANDIDATE PROFILE:
- Target Role: ${profile.targetRole || "Not specified"}
- Skills: ${profile.skills.join(", ")}
- Experience Level: ${profile.experienceLevel || "Not specified"}

JOB LISTING:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.description}

EVALUATION CRITERIA:
1. TARGET ROLE VS JOB TITLE SIMILARITY: How well does the candidate's target role align with the job title?
2. SKILLS OVERLAP: How many of the required and preferred skills for the job does the candidate possess?

Provide your evaluation in strict JSON format with the following fields:
- "score": A number between 0 and 100 representing the overall match percentage.
- "reasoning": A concise (1-2 sentences) explanation of why this score was given, highlighting key alignments or gaps.

Only return the JSON object. Do not include markdown formatting or extra text.
`;

  try {
    const { text } = await generateWithFallback(prompt);

    // Attempt to parse JSON. Gemini sometimes adds markdown blocks even if told not to.
    const jsonStr = text
      .trim()
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", text);
      throw new Error("AI returned invalid JSON response");
    }

    return MatchResultSchema.parse(parsed);
  } catch (error: any) {
    console.error("Error in scoreJobMatch:", error);
    throw error;
  }
}

/**
 * Processes a batch of jobs for a profile, filtering those below the threshold.
 * @issue 16
 */
export async function runMatchBatch(
  profile: UserProfile,
  jobs: NormalizedJob[]
): Promise<MatchRunResponse> {
  const scoredMatches: ScoredMatch[] = [];
  let filteredCount = 0;

  const results = [];
  for (const job of jobs) {
    try {
      const matchResult = await scoreJobMatch(profile, job);
      results.push({ job, ...matchResult });
    } catch (error) {
      console.error(`Failed to score job: ${job.title}`, error);
      results.push(null);
    }
  }

  for (const result of results) {
    if (result) {
      if (result.score >= MATCH_THRESHOLD) {
        scoredMatches.push(result);
      } else {
        filteredCount++;
      }
    }
  }

  return {
    matches: scoredMatches.sort((a, b) => b.score - a.score),
    filtered_count: filteredCount,
  };
}
