import { z } from 'zod';

const envSchema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('Must be a valid URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Anon key is required'),
});

const validateEnv = () => {
    try {
        const env = envSchema.parse({
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        });
        return env;
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:', z.flattenError ? z.flattenError(error).fieldErrors : error.issues);
            throw new Error('Environment variables validation failed');
        }
        throw error;
    }
};

export const env = validateEnv();
