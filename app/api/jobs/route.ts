import { NextRequest } from "next/server";
import { JobFetchParamsSchema } from "@/lib/validations/jobListing";
import { fetchJobs } from "@/lib/jobFetcher";
import { successResponse, errorResponse } from "@/lib/api/response";
import { handleError } from "@/lib/api/errorHandler";

/**
 * GET /api/jobs?role=...&location=...
 * Fetches job listings from Adzuna, filtered by role and optional location.
 * Returns a normalized list: { title, company, description, apply_url, location }
 * @issue 15
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const rawParams = {
            role: searchParams.get("role") || "",
            location: searchParams.get("location") || undefined,
        };

        // Validate query params
        const parseResult = JobFetchParamsSchema.safeParse(rawParams);
        if (!parseResult.success) {
            return errorResponse(
                {
                    code: "VALIDATION_ERROR",
                    message: "Invalid query parameters",
                    details: parseResult.error.flatten(),
                },
                400
            );
        }

        const jobs = await fetchJobs(parseResult.data);

        return successResponse({ jobs, count: jobs.length });
    } catch (error) {
        return handleError(error);
    }
}
