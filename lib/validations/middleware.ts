import { z, ZodError } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "../api/response";

export async function validateRequest<T>(
  req: NextRequest,
  schema: z.Schema<T>
): Promise<{ data: T | null; error: NextResponse | null }> {
  try {
    const body = await req.json();
    const validatedData = schema.parse(body);
    return { data: validatedData, error: null };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: errorResponse(
          {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: z.flattenError ? z.flattenError(error) : error.issues,
          },
          400
        ),
      };
    }

    return {
      data: null,
      error: errorResponse(
        {
          code: "BAD_REQUEST",
          message: "Malformed JSON or invalid request payload",
        },
        400
      ),
    };
  }
}
