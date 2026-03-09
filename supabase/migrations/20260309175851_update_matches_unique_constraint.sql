-- Migration to update the unique constraint on the matches table
-- We are moving from implicitly relying on (user_id, job_title, company)
-- to explicitly using (user_id, apply_url) to allow same title/company in different locations.

-- 1. Remove the old constraint if it exists (it might have been added via Supabase UI or another migration not tracked in init)
-- Note: In PostgreSQL, if you don't know the exact name of the constraint, you can drop it if you know it was created.
-- However, taking a look at the init schema, there was NO explicit UNIQUE constraint on (user_id, job_title, company).
-- The upsert was relying on `onConflict: "user_id, job_title, company"` from the JS client which REQUIRES a unique index or constraint.
-- Let's drop any index or constraint matching that pattern just in case it was created automatically or out of band.

DO $$
DECLARE
    con_name text;
BEGIN
    SELECT constraint_name INTO con_name
    FROM information_schema.table_constraints
    WHERE table_name = 'matches'
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%user_id_job_title_company%';

    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.matches DROP CONSTRAINT ' || quote_ident(con_name);
    END IF;
END $$;

-- 2. Add the new unique constraint on user_id and apply_url
-- We use a partial index or simply make the combination UNIQUE.
ALTER TABLE public.matches ADD CONSTRAINT matches_user_id_apply_url_key UNIQUE (user_id, apply_url);
