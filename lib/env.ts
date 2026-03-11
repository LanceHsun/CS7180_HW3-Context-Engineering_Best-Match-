import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({ message: "Must be a valid URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Anon key is required"),
  GEMINI_API_KEY: z.string().min(1, "Gemini API key is required"),
  ADZUNA_APP_ID: z.string().min(1, "Adzuna App ID is required"),
  ADZUNA_APP_KEY: z.string().min(1, "Adzuna App Key is required"),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.email().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Service role key is required")
    .optional(),
});

const validateEnv = () => {
  const envData = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    ADZUNA_APP_ID: process.env.ADZUNA_APP_ID,
    ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  try {
    return envSchema.parse(envData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingKeys = error.issues
        .map((issue) => issue.path.join("."))
        .join(", ");
      console.error(
        `❌ Invalid or missing environment variables: ${missingKeys}`
      );

      // In production, we don't want to crash the entire app on import
      // but we do want to log the error clearly.
      // We return the raw data cast to the schema type to avoid breakages,
      // but individual routes should check for validity.
      return envData as unknown as z.infer<typeof envSchema>;
    }
    throw error;
  }
};

export const env = validateEnv();

/**
 * Checks if all required environment variables are present.
 * Use this in API routes to return a clean JSON error instead of crashing.
 */
export const isEnvValid = () => {
  try {
    envSchema.parse(process.env);
    return { valid: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.flatten().fieldErrors };
    }
    return {
      valid: false,
      errors: { unknown: ["An unknown error occurred during env validation"] },
    };
  }
};
