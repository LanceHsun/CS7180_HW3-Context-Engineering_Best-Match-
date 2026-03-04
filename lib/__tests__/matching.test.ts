import { describe, it, expect } from "vitest";
import { calculateMatchScore, MATCH_THRESHOLD } from "../matching";
import { ResumeParseResult } from "../validations/resume";
import { JobDescription } from "../validations/schemas";

describe("calculateMatchScore", () => {
  const mockResume: ResumeParseResult = {
    targetRole: "Software Engineer",
    skills: ["React", "TypeScript", "Node.js", "SQL"],
    yearsOfExperience: 5,
  };

  it("returns 1.0 for perfect match", () => {
    const perfectJob: JobDescription = {
      title: "Software Engineer",
      company: "Tech Corp",
      description: "Looking for a software engineer with React and TypeScript.",
      requirements: ["React", "TypeScript", "Node.js", "SQL"],
    };
    const score = calculateMatchScore(mockResume, perfectJob);
    expect(score).toBe(1.0);
    expect(score).toBeGreaterThanOrEqual(MATCH_THRESHOLD);
  });

  it("returns a score above threshold for good match", () => {
    const goodJob: JobDescription = {
      title: "Senior Software Engineer",
      company: "A-Tech",
      description: "Need React and Node developer.",
      requirements: ["React", "Node.js"],
    };
    const score = calculateMatchScore(mockResume, goodJob);
    // Role: 0.8 (Senior Software Engineer contains Software Engineer) * 0.4 = 0.32
    // Skills: 1.0 (both React and Node.js are in resume) * 0.6 = 0.6
    // Final: 0.92
    expect(score).toBeCloseTo(0.92);
    expect(score).toBeGreaterThanOrEqual(MATCH_THRESHOLD);
  });

  it("returns a score below threshold for poor match", () => {
    const poorJob: JobDescription = {
      title: "Data Scientist",
      company: "Data Inc",
      description: "Python and ML expert.",
      requirements: ["Python", "TensorFlow", "Scikit-Learn"],
    };
    const score = calculateMatchScore(mockResume, poorJob);
    // Role: 0 (No common keywords) * 0.4 = 0
    // Skills: 0 (No match) * 0.6 = 0
    // Final: 0
    expect(score).toBe(0);
    expect(score).toBeLessThan(MATCH_THRESHOLD);
  });

  it("handles partial role matches", () => {
    const partialRoleJob: JobDescription = {
      title: "Engineer",
      company: "Big Corp",
      description: "Seeking engineers.",
      requirements: ["React"],
    };
    const score = calculateMatchScore(mockResume, partialRoleJob);
    // Role: 0.8 (Software Engineer contains Engineer) * 0.4 = 0.32
    // Skills: 1.0 (React match) * 0.6 = 0.6
    // Final: 0.92
    expect(score).toBeGreaterThanOrEqual(MATCH_THRESHOLD);
  });

  it("handles empty requirements gracefully", () => {
    const jobWithNoReqs: JobDescription = {
      title: "Software Engineer",
      company: "Generic Corp",
      description: "Just a job.",
      requirements: [],
    };
    const score = calculateMatchScore(mockResume, jobWithNoReqs);
    // Role: 1.0 * 0.4 = 0.4
    // Skills: 0.5 (default) * 0.6 = 0.3
    // Final: 0.7
    expect(score).toBe(0.7);
  });
});
