-- Create pending_profiles table
CREATE TABLE public.pending_profiles (
  email text PRIMARY KEY,
  target_role text NOT NULL,
  skills text[] DEFAULT '{}',
  experience_level text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.pending_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into pending_profiles (Anonymous Drop-box)
-- No trigger/policy for SELECT, UPDATE, or DELETE, meaning all clients are strictly blocked from reading or modifying.
CREATE POLICY "Enable insert for anonymous users" ON public.pending_profiles
  FOR INSERT WITH CHECK (true);

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Schedule a cleanup job to delete stale pending profiles older than 24 hours
-- This runs every hour at minute 0
SELECT cron.schedule(
  'cleanup_stale_pending_profiles',
  '0 * * * *',
  $$ DELETE FROM public.pending_profiles WHERE created_at < NOW() - INTERVAL '24 hours' $$
);
