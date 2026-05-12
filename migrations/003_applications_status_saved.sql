-- Migration 003: Allow "Saved" as a valid status value
--
-- The applications table had a CHECK constraint on `status` restricting
-- values to the original 5-stage funnel. Phase 4.5 adds "Saved" as a
-- pre-applied bucket for jobs queued via /browse. We DROP the old
-- constraint and add a new one with the expanded enum.

ALTER TABLE applications
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications
ADD CONSTRAINT applications_status_check
CHECK (status IN ('Saved', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected'));