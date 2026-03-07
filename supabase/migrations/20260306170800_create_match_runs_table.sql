-- Create match_runs table to track automated matching runs
CREATE TABLE public.match_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    started_at timestamptz DEFAULT now() NOT NULL,
    completed_at timestamptz,
    matches_found integer DEFAULT 0,
    status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    error text,
    triggered_by text DEFAULT 'cron' CHECK (triggered_by IN ('cron', 'manual')),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.match_runs ENABLE ROW LEVEL SECURITY;

-- Match Runs Policies
CREATE POLICY "Users can view own match runs" ON public.match_runs
    FOR SELECT USING (auth.uid() = user_id);

-- System/Service Role can manage all (implicit via service role key, but keeping it clean)
CREATE POLICY "Service role can do everything on match_runs" ON public.match_runs
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Create index for idempotency checks (user + date in UTC)
CREATE INDEX idx_match_runs_user_date ON public.match_runs (user_id, ((started_at AT TIME ZONE 'UTC')::date));
