import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({ message: "Must be a valid URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Anon key is required"),
  GEMINI_API_KEY: z.string().min(1, "Gemini API key is required"),
});

const validateEnv = () => {
  try {
    const env = envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    });
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "❌ Invalid environment variables:",
        z.flattenError ? z.flattenError(error).fieldErrors : error.issues
      );
      throw new Error("Environment variables validation failed");
    }
    throw error;
  }
};

export const env = validateEnv();
