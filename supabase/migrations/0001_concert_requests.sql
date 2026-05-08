-- Run this once in the Supabase SQL editor for the project that holds concert
-- request submissions. The /api/request-a-show route inserts into this table
-- using the service-role key.

create table public.concert_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  city text not null,
  country text not null,
  requester_type text not null,
  audience_size text,
  target_date text,
  notes text,
  ip_address text,
  user_agent text,
  status text default 'new',
  created_at timestamptz default now()
);

create index on public.concert_requests (created_at desc);
create index on public.concert_requests (status);
