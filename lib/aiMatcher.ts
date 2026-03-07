import { ai } from "./ai";
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
 * Service for matching user profiles with job listings using Gemini 1.5 Pro.
 * @issue 16
 */

/**
 * Uses Gemini 1.5 Pro to score a single job match against a user profile.
 * Employs an expert recruiter persona for high-fidelity evaluation.
 * @issue 16
 */
export async function scoreJobMatch(
  profile: UserProfile,
  job: NormalizedJob
): Promise<MatchResult> {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });

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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Attempt to parse JSON. Gemini sometimes adds markdown blocks even if told not to.
    const jsonStr = text
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();
    const parsed = JSON.parse(jsonStr);

    return MatchResultSchema.parse(parsed);
  } catch (error) {
    console.error("AI Matching Error:", error);
    if (error instanceof SyntaxError) {
      throw new Error("AI returned invalid JSON response");
    }
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

  // Process in parallel with some concurrency control if needed,
  // but for small batches simple Promise.all is fine.
  const results = await Promise.all(
    jobs.map(async (job) => {
      try {
        const matchResult = await scoreJobMatch(profile, job);
        return { job, ...matchResult };
      } catch (error) {
        console.error(`Failed to score job: ${job.title}`, error);
        return null;
      }
    })
  );

  for (const result of results) {
    if (result) {
      if (result.score > MATCH_THRESHOLD) {
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
