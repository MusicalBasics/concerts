-- Without these GRANTs, the supabase service_role gets a 42501
-- "permission denied for schema concerts" error on insert, even though the
-- schema is exposed in the API settings. Exposing a schema makes PostgREST
-- recognize it; it does not give the underlying Postgres role access.
--
-- Run once in the Supabase SQL editor of the project that holds the
-- concerts.concert_requests table from migration 0001.

grant usage on schema concerts to service_role;
grant all on all tables in schema concerts to service_role;
grant all on all sequences in schema concerts to service_role;
alter default privileges in schema concerts
  grant all on tables to service_role;
alter default privileges in schema concerts
  grant all on sequences to service_role;
