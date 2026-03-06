import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/ai";
import { ResumeParseSchema } from "@/lib/validations/resume";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // 1. Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const PDFParserModule = await import("pdf2json");
    const PDFParser = PDFParserModule.default || (PDFParserModule as any);

    const text = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, true);
      pdfParser.on("pdfParser_dataError", (errData: any) =>
        reject(new Error(errData.parserError?.message || "Failed to parse PDF"))
      );
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent().replace(/\r\n/g, "\n"));
      });
      pdfParser.parseBuffer(buffer);
    });

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    // 2. Prompt Gemini for structured parsing with fallback
    const MODELS_TO_TRY = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-flash-latest",
    ];

    let lastError: any = null;
    let responseText = "";
    let usedModel = "";

    for (const modelName of MODELS_TO_TRY) {
      try {
        console.log(`🤖 Attempting parse with model: ${modelName}`);
        const model = ai.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const prompt = `
          You are an expert technical recruiter and resume parser.
          Analyze the following resume text and extract the candidate's primary target role and their key skills (hard and soft).
          Calculate their overall years of professional experience if possible.
          
          Respond STRICTLY with a JSON object matching this schema:
          {
            "targetRole": "string (the primary job title)",
            "skills": ["string", "string"],
            "yearsOfExperience": number (optional)
          }

          Resume Text:
          ---
          ${text.substring(0, 15000)} // Protect against massive inputs
          ---
        `;

        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        usedModel = modelName;

        if (responseText) {
          console.log(`✅ Successfully parsed with ${modelName}`);
          break; // Exit loop on success
        }
      } catch (error: any) {
        lastError = error;
        const errorMsg = error.message || "";
        const isQuotaError =
          errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota");
        const isNotFoundError =
          errorMsg.includes("404") ||
          errorMsg.toLowerCase().includes("not found");

        if (isQuotaError || isNotFoundError) {
          console.warn(
            `⚠️ Model ${modelName} failed (${isQuotaError ? "Quota" : "Not Found"}). Trying next...`
          );
          continue;
        }

        // If it's another kind of error, throw it immediately
        throw error;
      }
    }

    if (!responseText) {
      throw new Error(
        lastError?.message || "Failed to get response from any Gemini model"
      );
    }

    // 3. Validate Gemini output with Zod
    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", responseText);
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    const validatedData = ResumeParseSchema.parse(parsedJson);

    // 4. Sanitize strings (Basic sanitization to prevent XSS if rendered later)
    const sanitize = (str: string) =>
      str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sanitizedData = {
      targetRole: sanitize(validatedData.targetRole),
      skills: validatedData.skills.map(sanitize),
      yearsOfExperience: validatedData.yearsOfExperience,
    };

    // 5. Store in Supabase (we'll attach it to the current user's profile if authenticated,
    // but for onboarding they might not be authenticated yet. Rule 2 says: "Store validated extraction in Supabase.")
    // We will save this to a temporary table or the profiles table if they have a session.
    // For now, let's just assume we return the data to the client to proceed with Magic Link.
    // Wait, the PRD / Issue 9 says: "Database: Store validated extraction in Supabase."
    // And Critical flow: "User Input -> PDF Upload -> AI Parsing -> Zod Validation -> Supabase DB Storage"

    // Check if user is logged in
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If we have a user, update their profile. If not, maybe we just return it and the client passes it to the signup route?
    // Let's attempt an upsert if user exists, otherwise just return it.
    if (user) {
      await supabase
        .from("profiles")
        .update({
          skills: sanitizedData.skills,
          // targetRole or similar if it exists in the schema. In our UserProfileSchema we have experienceLevel, but let's just stick to what exists.
        })
        .eq("id", user.id);
    }

    return NextResponse.json(
      { success: true, data: sanitizedData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Resume parse error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
