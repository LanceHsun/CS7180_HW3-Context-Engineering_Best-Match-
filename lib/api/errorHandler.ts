import { NextResponse } from "next/server";
import { errorResponse } from "./response";
import { z, ZodError } from "zod";

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function handleError(error: unknown): NextResponse {
  // In a real production setup, consider plugging in Sentry/Datadog here for 500s
  console.error("[API Error]:", error);

  if (error instanceof ApiError) {
    return errorResponse(
      {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      error.statusCode
    );
  }

  if (error instanceof ZodError) {
    return errorResponse(
      {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: z.flattenError ? z.flattenError(error) : error.issues,
      },
      400
    );
  }

  // Fallback for unhandled/unexpected errors
  return errorResponse(
    {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
    500
  );
}
