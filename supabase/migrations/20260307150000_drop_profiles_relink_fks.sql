-- drop_profiles_relink_fks.sql
-- purpose: remove the profiles indirection layer and point all user_id FKs
--          directly at auth.users(id)

-- 1. drop FK constraints that reference profiles
alter table public.nutrition_targets
    drop constraint if exists nutrition_targets_user_id_fkey;

alter table public.meal_entries
    drop constraint if exists meal_entries_user_id_fkey;

-- 2. drop RLS policies that live on the profiles table
drop policy if exists "Users can view own profile"   on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

-- 3. drop the profiles table itself
drop table if exists public.profiles;

-- 4. re-add FK constraints pointing directly to auth.users
alter table public.nutrition_targets
    add constraint nutrition_targets_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

alter table public.meal_entries
    add constraint meal_entries_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

