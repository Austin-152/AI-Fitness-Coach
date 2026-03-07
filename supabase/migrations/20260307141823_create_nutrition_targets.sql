-- create_nutrition_targets.sql
-- purpose: store daily nutrition goals per user

create table if not exists public.nutrition_targets (

    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
    references public.profiles(id)
    on delete cascade,

    daily_calories integer not null,

    carbs_target_g integer not null,
    protein_target_g integer not null,
    fat_target_g integer not null,

    created_at timestamptz default now(),

    constraint unique_user_target unique (user_id)
    );

-- index for rls and lookup
create index if not exists idx_targets_user
    on public.nutrition_targets(user_id);

alter table public.nutrition_targets enable row level security;