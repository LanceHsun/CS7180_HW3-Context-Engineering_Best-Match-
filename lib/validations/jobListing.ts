import { z } from "zod";

/**
 * Schema for raw Adzuna API job listing response items.
 * Maps Adzuna's field names to our validation layer.
 */
export const AdzunaJobSchema = z.object({
    title: z.string(),
    company: z.object({
        display_name: z.string(),
    }),
    description: z.string(),
    redirect_url: z.string().url(),
    location: z.object({
        display_name: z.string(),
    }),
});

export type AdzunaJob = z.infer<typeof AdzunaJobSchema>;

/**
 * Schema for the normalized job listing returned by our API.
 * AC: Returns normalized list: { title, company, description, apply_url, location }
 */
export const NormalizedJobSchema = z.object({
    title: z.string().min(1),
    company: z.string().min(1),
    description: z.string(),
    apply_url: z.string().url(),
    location: z.string(),
});

export type NormalizedJob = z.infer<typeof NormalizedJobSchema>;

/**
 * Schema for job fetch request parameters.
 * Validates the role (required) and optional location filter.
 */
export const JobFetchParamsSchema = z.object({
    role: z.string().min(1, "Role keyword is required"),
    location: z.string().optional(),
});

export type JobFetchParams = z.infer<typeof JobFetchParamsSchema>;
