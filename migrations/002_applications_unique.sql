-- Migration 002: Add unique constraint to prevent duplicate applications
-- Same (user_id, role, company) tuple should not appear twice.
-- This supports the /browse "save to pipeline" feature — clicking save twice
-- on the same job is now rejected at the DB level instead of relying on UI state.

-- Run this AFTER verifying no existing duplicates with:
-- SELECT user_id, role, company, COUNT(*) FROM applications
--   GROUP BY user_id, role, company HAVING COUNT(*) > 1;

ALTER TABLE applications
ADD CONSTRAINT applications_user_role_company_unique
UNIQUE (user_id, role, company);

-- Also add "Saved" to the valid status set (TypeScript type union enforces this
-- at compile time; no DB-level CHECK constraint exists or is added here).
-- The `status` column remains free-form TEXT — the constraint is in the codebase.