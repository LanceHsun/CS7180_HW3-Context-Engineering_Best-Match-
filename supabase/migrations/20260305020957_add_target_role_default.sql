-- Alter profiles table to allow empty target_role to prevent premature auth triggers from failing on null constraint
ALTER TABLE public.profiles
ALTER COLUMN target_role SET DEFAULT '';