-- Adds two columns used by the /host-a-show form (venues, promoters, schools).
-- Both are nullable so existing fan-form rows from /request-a-show stay valid.
--
-- Run once in the Supabase SQL editor of the project that already holds the
-- concerts.concert_requests table from migration 0001.

alter table concerts.concert_requests
  add column if not exists org_name text,
  add column if not exists website text;
