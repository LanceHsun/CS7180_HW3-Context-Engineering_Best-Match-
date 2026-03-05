import { ResumeParseResult } from "./validations/resume";
import { JobDescription } from "./validations/schemas";

export const MATCH_THRESHOLD = 0.7;

/**
 * Calculates a match score between a resume and a job description.
 * Score is based on:
 * 1. Target Role vs Job Title similarity (40%)
 * 2. Skills overlap (60%)
 * @issue 23
 */
export function calculateMatchScore(
  resume: ResumeParseResult,
  job: JobDescription
): number {
  let roleScore = 0;
  let skillsScore = 0;

  // 1. Role similarity (simplified string inclusion for now)
  const resumeRole = resume.targetRole.toLowerCase();
  const jobTitle = job.title.toLowerCase();

  if (resumeRole === jobTitle) {
    roleScore = 1;
  } else if (jobTitle.includes(resumeRole) || resumeRole.includes(jobTitle)) {
    roleScore = 0.8;
  } else {
    // Check for common keywords
    const roleWords = resumeRole.split(/\s+/);
    const jobWords = jobTitle.split(/\s+/);
    const intersection = roleWords.filter((w) => jobWords.includes(w));
    if (intersection.length > 0) {
      roleScore = 0.5;
    }
  }

  // 2. Skills overlap
  if (job.requirements && job.requirements.length > 0) {
    const jobSkills = job.requirements.map((s) => s.toLowerCase());
    const resumeSkills = resume.skills.map((s) => s.toLowerCase());

    const matchedSkills = jobSkills.filter((js) =>
      resumeSkills.some((rs) => rs.includes(js) || js.includes(rs))
    );

    skillsScore = matchedSkills.length / jobSkills.length;
  } else {
    // If no requirements listed, assume skills match (or penalize? for now assume match if we reach this)
    skillsScore = 0.5;
  }

  const finalScore = roleScore * 0.4 + skillsScore * 0.6;
  return Math.min(1, Math.max(0, finalScore));
}
