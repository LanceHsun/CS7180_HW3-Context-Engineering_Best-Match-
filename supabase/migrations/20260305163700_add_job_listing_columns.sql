-- Add description and location columns to matches table
-- Required for the normalized job schema: { title, company, description, apply_url, location }
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS location text;
