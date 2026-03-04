import { z } from "zod";

export const ResumeParseSchema = z.object({
  targetRole: z
    .string()
    .describe(
      "The primary job title the user is targeting based on their experience."
    ),
  skills: z
    .array(z.string())
    .describe("A list of hard and soft skills extracted from the resume."),
  yearsOfExperience: z
    .number()
    .optional()
    .describe(
      "Total years of professional experience calculated from the resume."
    ),
});

export type ResumeParseResult = z.infer<typeof ResumeParseSchema>;

// Pending Profile Payload Validation
export const PendingProfileSchema = ResumeParseSchema.extend({
  email: z.email({ message: "A valid email is required to save progress." }),
});

export type PendingProfilePayload = z.infer<typeof PendingProfileSchema>;
