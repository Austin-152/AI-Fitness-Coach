-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  height numeric,
  weight numeric,
  goal text,
  daily_calorie_target integer default 2200,
  daily_carbs_target integer default 250,
  daily_protein_target integer default 120,
  daily_fats_target integer default 70,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Create meals table
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text,
  meal_time timestamp with time zone default now(),
  total_calories integer default 0,
  total_carbs numeric default 0,
  total_protein numeric default 0,
  total_fats numeric default 0,
  created_at timestamp with time zone default now()
);

alter table public.meals enable row level security;

create policy "meals_select_own" on public.meals for select using (auth.uid() = user_id);
create policy "meals_insert_own" on public.meals for insert with check (auth.uid() = user_id);
create policy "meals_update_own" on public.meals for update using (auth.uid() = user_id);
create policy "meals_delete_own" on public.meals for delete using (auth.uid() = user_id);

-- Create foods table
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.meals(id) on delete cascade,
  food_name text not null,
  calories integer default 0,
  carbs numeric default 0,
  protein numeric default 0,
  fats numeric default 0,
  created_at timestamp with time zone default now()
);

alter table public.foods enable row level security;

create policy "foods_select_own" on public.foods for select 
  using (exists (
    select 1 from public.meals where meals.id = foods.meal_id and meals.user_id = auth.uid()
  ));
create policy "foods_insert_own" on public.foods for insert 
  with check (exists (
    select 1 from public.meals where meals.id = foods.meal_id and meals.user_id = auth.uid()
  ));
create policy "foods_update_own" on public.foods for update 
  using (exists (
    select 1 from public.meals where meals.id = foods.meal_id and meals.user_id = auth.uid()
  ));
create policy "foods_delete_own" on public.foods for delete 
  using (exists (
    select 1 from public.meals where meals.id = foods.meal_id and meals.user_id = auth.uid()
  ));

-- Create trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Create storage bucket for meal images
insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', true)
on conflict (id) do nothing;

-- Storage policies for meal images
create policy "meal_images_select" on storage.objects for select
  using (bucket_id = 'meal-images');

create policy "meal_images_insert" on storage.objects for insert
  with check (bucket_id = 'meal-images' and auth.role() = 'authenticated');

create policy "meal_images_update" on storage.objects for update
  using (bucket_id = 'meal-images' and auth.role() = 'authenticated');

create policy "meal_images_delete" on storage.objects for delete
  using (bucket_id = 'meal-images' and auth.role() = 'authenticated');
