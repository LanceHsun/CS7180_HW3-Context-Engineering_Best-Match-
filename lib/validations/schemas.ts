import { z } from "zod";

export const UserProfileSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  skills: z.array(z.string()).default([]),
  experienceLevel: z.enum(["Entry", "Mid", "Senior", "Executive"]).optional(),
  targetRole: z.string().optional(),
  targetLocations: z.array(z.string()).default([]),
  notificationFrequency: z.enum(["Daily", "Weekly"]).default("Weekly"),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const JobDescriptionSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().optional(),
  description: z.string().min(10, "Job description is too short"),
  requirements: z.array(z.string()).default([]),
});

export type JobDescription = z.infer<typeof JobDescriptionSchema>;
