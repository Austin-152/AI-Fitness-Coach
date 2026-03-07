-- create_rls_policies.sql
-- purpose: ensure users only access their own data


-- profiles

create policy "users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);



-- nutrition_targets

create policy "users manage own targets"
on public.nutrition_targets
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());



-- meal_entries

create policy "users manage own meals"
on public.meal_entries
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());