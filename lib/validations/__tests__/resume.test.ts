import { describe, it, expect } from "vitest";
import { ResumeParseSchema } from "../resume";

describe("ResumeParseSchema Validation", () => {
  it("should validate a correct resume payload", () => {
    const validPayload = {
      targetRole: "Senior Software Engineer",
      skills: ["React", "TypeScript", "Node.js"],
      yearsOfExperience: 8,
    };

    const result = ResumeParseSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should validate without yearsOfExperience (optional)", () => {
    const validPayload = {
      targetRole: "Product Manager",
      skills: ["Agile", "Jira"],
    };

    const result = ResumeParseSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should fail if targetRole is missing", () => {
    const invalidPayload = {
      skills: ["React"],
    };

    const result = ResumeParseSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it("should fail if skills is not an array", () => {
    const invalidPayload = {
      targetRole: "Designer",
      skills: "Figma", // Should be an array
    };

    const result = ResumeParseSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
