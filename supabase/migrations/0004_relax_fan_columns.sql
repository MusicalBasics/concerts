-- The /request-a-show form pivoted from "tell me about yourself" to a
-- lightweight mailing-list signup (email + country, city optional). Drop the
-- NOT NULL on name and city so fan rows can omit them. Host-a-show rows still
-- supply both via the API.
--
-- Run once in the Supabase SQL editor of the project that holds the
-- concerts.concert_requests table from migration 0001.

alter table concerts.concert_requests
  alter column name drop not null,
  alter column city drop not null;
