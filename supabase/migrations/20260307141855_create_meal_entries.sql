-- create_meal_entries.sql
-- purpose: store AI analyzed meal results

create table if not exists public.meal_entries (

    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
    references public.profiles(id)
    on delete cascade,

    meal_name text,

    image_url text,

    calories integer not null,

    carbs_g integer not null,
    protein_g integer not null,
    fat_g integer not null,

    created_at timestamptz default now()
    );

-- indexes for query performance
create index if not exists idx_meals_user
    on public.meal_entries(user_id);

create index if not exists idx_meals_created
    on public.meal_entries(created_at);

alter table public.meal_entries enable row level security;