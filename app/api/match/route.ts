import { NextRequest } from "next/server";
import { validateRequest } from "../../../lib/validations/middleware";
import { JobDescriptionSchema } from "../../../lib/validations/schemas";
import { successResponse, errorResponse } from "../../../lib/api/response";

export async function POST(req: NextRequest) {
  try {
    const { data: jobDesc, error } = await validateRequest(
      req,
      JobDescriptionSchema
    );

    // Middle intercepts validation failures seamlessly using our standardized ZodError wrapper
    if (error) {
      return error;
    }

    // Boilerplate for Gemini 1.5 Pro integration
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return errorResponse(
        {
          code: "INTERNAL_ERROR",
          message: "Gemini API key is not configured.",
        },
        500
      );
    }

    // TODO: Initialize Gemini SDK when moving to Phase 3 (Parsing Backend Integration)
    // const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    // const result = await model.generateContent(`Analyze this job: ${jobDesc.title}`);

    return successResponse({
      status: "success",
      message: "Gemini integration stub reached successfully.",
      receivedJob: jobDesc,
    });
  } catch (err: any) {
    return errorResponse(
      {
        code: "INTERNAL_ERROR",
        message: "Failed to process match via Gemini.",
      },
      500
    );
  }
}
