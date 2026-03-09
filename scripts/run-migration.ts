import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runMigration() {
  console.log("🚀 Running manual database migration...");

  const sql = `
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

    -- It's safe to run this multiple times if we add IF NOT EXISTS equivalent logic,
    -- but Postgres doesn't have ADD CONSTRAINT IF NOT EXISTS, so we catch errors.
    DO $$
    BEGIN
        ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
        ALTER TABLE public.matches ADD CONSTRAINT matches_user_id_apply_url_key UNIQUE (user_id, apply_url);
    EXCEPTION
        WHEN duplicate_table THEN
            NULL; -- constraint already exists
        WHEN duplicate_column THEN
            NULL; -- column already exists
    END $$;
  `;

  // Unfortunately, Supabase JS Client does not support raw DDL schema execution (ALTER TABLE etc.)
  // directly for security reasons unless you are using the Postgres connection string
  // with a PostgreSQL client like `pg`, or running it via the Supabase Dashboard SQL Editor.

  console.log(
    "\n⚠️ IMPORTANT: You must run the following SQL manually in your Supabase SQL Editor:"
  );
  console.log(
    "--------------------------------------------------------------------------------"
  );
  console.log(sql);
  console.log(
    "--------------------------------------------------------------------------------\n"
  );
}

runMigration();
