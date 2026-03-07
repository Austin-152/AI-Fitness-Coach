-- create_profiles.sql
-- purpose: store public user profile information

create table if not exists public.profiles (

   id uuid primary key
    references auth.users(id)
    on delete cascade,

    username text,

    created_at timestamptz default now()
    );

-- enable row level security
alter table public.profiles enable row level security;