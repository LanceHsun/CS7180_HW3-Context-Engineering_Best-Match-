-- Add email tracking columns to match_runs table
ALTER TABLE public.match_runs 
ADD COLUMN email_status text DEFAULT 'skipped' CHECK (email_status IN ('success', 'failed', 'skipped')),
ADD COLUMN email_error text,
ADD COLUMN email_sent_at timestamptz;

-- Update index to include email_status for better idempotency queries
DROP INDEX IF EXISTS idx_match_runs_user_date;
CREATE INDEX idx_match_runs_user_email_date ON public.match_runs (user_id, email_status, ((started_at AT TIME ZONE 'UTC')::date));

-- Comment on columns for clarity
COMMENT ON COLUMN public.match_runs.email_status IS 'Status of the email notification for this match run';
COMMENT ON COLUMN public.match_runs.email_error IS 'Error message if the email send failed';
COMMENT ON COLUMN public.match_runs.email_sent_at IS 'Timestamp when the email was actually sent';
