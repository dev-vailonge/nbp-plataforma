-- Staff vs member RLS. Promote staff with:
--   update public.nbp_profiles set role = 'staff' where id = '<auth user uuid>';

create or replace function public.nbp_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.nbp_profiles
    where id = auth.uid()
      and role = 'staff'
  );
$$;

create or replace function public.nbp_current_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select member_id
  from public.nbp_profiles
  where id = auth.uid();
$$;

grant execute on function public.nbp_is_staff() to authenticated, service_role;
grant execute on function public.nbp_current_member_id() to authenticated, service_role;

create or replace function public.nbp_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.nbp_profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'member'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.nbp_handle_new_user();

alter table public.nbp_members enable row level security;
alter table public.nbp_profiles enable row level security;
alter table public.nbp_content_modules enable row level security;
alter table public.nbp_lessons enable row level security;
alter table public.nbp_document_folders enable row level security;
alter table public.nbp_documents enable row level security;
alter table public.nbp_talks enable row level security;
alter table public.nbp_calendar_rules enable row level security;
alter table public.nbp_calendar_events enable row level security;
alter table public.nbp_action_plan_months enable row level security;
alter table public.nbp_action_plan_stages enable row level security;
alter table public.nbp_action_plan_objectives enable row level security;

-- profiles
create policy nbp_profiles_select on public.nbp_profiles
  for select to authenticated
  using (nbp_is_staff() or id = auth.uid());

create policy nbp_profiles_insert_staff on public.nbp_profiles
  for insert to authenticated
  with check (nbp_is_staff());

create policy nbp_profiles_update on public.nbp_profiles
  for update to authenticated
  using (nbp_is_staff() or id = auth.uid())
  with check (nbp_is_staff() or (id = auth.uid() and role = 'member'));

create policy nbp_profiles_delete_staff on public.nbp_profiles
  for delete to authenticated
  using (nbp_is_staff());

-- members
create policy nbp_members_select on public.nbp_members
  for select to authenticated
  using (nbp_is_staff() or id = nbp_current_member_id());

create policy nbp_members_write_staff on public.nbp_members
  for all to authenticated
  using (nbp_is_staff())
  with check (nbp_is_staff());

-- modules: catalogue is visible; staff writes
create policy nbp_modules_select on public.nbp_content_modules
  for select to authenticated
  using (true);

create policy nbp_modules_write_staff on public.nbp_content_modules
  for all to authenticated
  using (nbp_is_staff())
  with check (nbp_is_staff());

-- lessons: members only see published
create policy nbp_lessons_select on public.nbp_lessons
  for select to authenticated
  using (nbp_is_staff() or status = 'publicado');

create policy nbp_lessons_write_staff on public.nbp_lessons
  for all to authenticated
  using (nbp_is_staff())
  with check (nbp_is_staff());

-- documents (shared library)
create policy nbp_folders_select on public.nbp_document_folders
  for select to authenticated
  using (true);

create policy nbp_folders_write_staff on public.nbp_document_folders
  for all to authenticated
  using (nbp_is_staff())
  with check (nbp_is_staff());

create policy nbp_documents_select on public.nbp_documents
  for select to authenticated
  using (true);

create policy nbp_documents_write_staff on public.nbp_documents
  for all to authenticated
  using (nbp_is_staff())
  with check (nbp_is_staff());

-- talks
create policy nbp_talks_select on public.nbp_talks
  for select to authenticated
  using (nbp_is_staff() or status = 'publicado');

create policy nbp_talks_write_staff on public.nbp_talks
  for all to authenticated
  using (nbp_is_staff())
  with check (nbp_is_staff());

-- calendar
create policy nbp_calendar_rules_select on public.nbp_calendar_rules
  for select to authenticated
  using (true);

create policy nbp_calendar_rules_write_staff on public.nbp_calendar_rules
  for all to authenticated
  using (nbp_is_staff())
  with check (nbp_is_staff());

create policy nbp_calendar_events_select on public.nbp_calendar_events
  for select to authenticated
  using (true);

create policy nbp_calendar_events_write_staff on public.nbp_calendar_events
  for all to authenticated
  using (nbp_is_staff())
  with check (nbp_is_staff());

-- action plans
create policy nbp_plan_months_select on public.nbp_action_plan_months
  for select to authenticated
  using (nbp_is_staff() or member_id = nbp_current_member_id());

create policy nbp_plan_months_write_staff on public.nbp_action_plan_months
  for all to authenticated
  using (nbp_is_staff())
  with check (nbp_is_staff());

create policy nbp_plan_stages_select on public.nbp_action_plan_stages
  for select to authenticated
  using (
    nbp_is_staff()
    or exists (
      select 1
      from public.nbp_action_plan_months m
      where m.id = month_id
        and m.member_id = nbp_current_member_id()
    )
  );

create policy nbp_plan_stages_write_staff on public.nbp_action_plan_stages
  for all to authenticated
  using (nbp_is_staff())
  with check (nbp_is_staff());

create policy nbp_plan_objectives_select on public.nbp_action_plan_objectives
  for select to authenticated
  using (
    nbp_is_staff()
    or exists (
      select 1
      from public.nbp_action_plan_months m
      where m.id = month_id
        and m.member_id = nbp_current_member_id()
    )
  );

create policy nbp_plan_objectives_insert_staff on public.nbp_action_plan_objectives
  for insert to authenticated
  with check (nbp_is_staff());

create policy nbp_plan_objectives_update on public.nbp_action_plan_objectives
  for update to authenticated
  using (
    nbp_is_staff()
    or exists (
      select 1
      from public.nbp_action_plan_months m
      where m.id = month_id
        and m.member_id = nbp_current_member_id()
    )
  )
  with check (
    nbp_is_staff()
    or exists (
      select 1
      from public.nbp_action_plan_months m
      where m.id = month_id
        and m.member_id = nbp_current_member_id()
    )
  );

create policy nbp_plan_objectives_delete_staff on public.nbp_action_plan_objectives
  for delete to authenticated
  using (nbp_is_staff());
