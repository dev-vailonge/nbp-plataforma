-- Promote an admin with:
--   update public.nbp_users set role = 'admin' where email = '…';

create or replace function public.nbp_current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.nbp_users where auth_id = auth.uid();
$$;

create or replace function public.nbp_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.nbp_users
    where auth_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.nbp_is_consultor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.nbp_users
    where auth_id = auth.uid() and role = 'consultor'
  );
$$;

create or replace function public.nbp_sees_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.nbp_is_admin()
    or p_user_id = public.nbp_current_user_id()
    or exists (
      select 1 from public.nbp_users u
      where u.id = p_user_id
        and u.consultant_id = public.nbp_current_user_id()
    );
$$;

grant execute on function public.nbp_current_user_id() to authenticated, service_role;
grant execute on function public.nbp_is_admin() to authenticated, service_role;
grant execute on function public.nbp_is_consultor() to authenticated, service_role;
grant execute on function public.nbp_sees_user(uuid) to authenticated, service_role;

create or replace function public.nbp_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.nbp_users
  set auth_id = new.id,
      full_name = case
        when full_name is null or full_name = '' then coalesce(new.raw_user_meta_data->>'full_name', full_name)
        else full_name
      end
  where email = new.email and auth_id is null;

  if not found then
    insert into public.nbp_users (auth_id, full_name, email, role)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      new.email,
      'membro'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.nbp_handle_new_user();

alter table public.nbp_users enable row level security;
alter table public.nbp_login_days enable row level security;
alter table public.nbp_courses enable row level security;
alter table public.nbp_modules enable row level security;
alter table public.nbp_lessons enable row level security;
alter table public.nbp_talks enable row level security;
alter table public.nbp_folders enable row level security;
alter table public.nbp_documents enable row level security;
alter table public.nbp_live_rules enable row level security;
alter table public.nbp_live_events enable row level security;
alter table public.nbp_calendar_events enable row level security;
alter table public.nbp_action_plan_months enable row level security;
alter table public.nbp_action_plan_stages enable row level security;
alter table public.nbp_action_plan_objectives enable row level security;
alter table public.nbp_sessions enable row level security;
alter table public.nbp_communities enable row level security;
alter table public.nbp_community_members enable row level security;
alter table public.nbp_community_messages enable row level security;
alter table public.nbp_community_reactions enable row level security;

-- users
create policy nbp_users_select on public.nbp_users
  for select to authenticated
  using (nbp_sees_user(id));

create policy nbp_users_insert on public.nbp_users
  for insert to authenticated
  with check (
    nbp_is_admin()
    or (nbp_is_consultor() and role = 'membro' and consultant_id = nbp_current_user_id())
  );

create policy nbp_users_update on public.nbp_users
  for update to authenticated
  using (nbp_is_admin() or nbp_sees_user(id))
  with check (
    nbp_is_admin()
    or (
      id = nbp_current_user_id()
      and role = (select u.role from public.nbp_users u where u.auth_id = auth.uid())
    )
    or (
      nbp_is_consultor()
      and role = 'membro'
      and consultant_id = nbp_current_user_id()
    )
  );

create policy nbp_users_delete on public.nbp_users
  for delete to authenticated
  using (nbp_is_admin());

-- login days
create policy nbp_login_days_select on public.nbp_login_days
  for select to authenticated
  using (nbp_sees_user(user_id));

create policy nbp_login_days_insert on public.nbp_login_days
  for insert to authenticated
  with check (user_id = nbp_current_user_id() or nbp_is_admin());

create policy nbp_login_days_admin on public.nbp_login_days
  for all to authenticated
  using (nbp_is_admin())
  with check (nbp_is_admin());

-- catalog
create policy nbp_courses_select on public.nbp_courses
  for select to authenticated using (true);
create policy nbp_courses_write on public.nbp_courses
  for all to authenticated using (nbp_is_admin()) with check (nbp_is_admin());

create policy nbp_modules_select on public.nbp_modules
  for select to authenticated using (true);
create policy nbp_modules_write on public.nbp_modules
  for all to authenticated using (nbp_is_admin()) with check (nbp_is_admin());

create policy nbp_lessons_select on public.nbp_lessons
  for select to authenticated
  using (nbp_is_admin() or nbp_is_consultor() or status = 'publicado');
create policy nbp_lessons_write on public.nbp_lessons
  for all to authenticated using (nbp_is_admin()) with check (nbp_is_admin());

create policy nbp_talks_select on public.nbp_talks
  for select to authenticated
  using (nbp_is_admin() or nbp_is_consultor() or status = 'publicado');
create policy nbp_talks_write on public.nbp_talks
  for all to authenticated using (nbp_is_admin()) with check (nbp_is_admin());

create policy nbp_live_rules_select on public.nbp_live_rules
  for select to authenticated using (true);
create policy nbp_live_rules_write on public.nbp_live_rules
  for all to authenticated using (nbp_is_admin()) with check (nbp_is_admin());

create policy nbp_live_events_select on public.nbp_live_events
  for select to authenticated using (true);
create policy nbp_live_events_write on public.nbp_live_events
  for all to authenticated using (nbp_is_admin()) with check (nbp_is_admin());

-- folders / documents
create policy nbp_folders_select on public.nbp_folders
  for select to authenticated using (nbp_sees_user(user_id));
create policy nbp_folders_write on public.nbp_folders
  for all to authenticated
  using (nbp_sees_user(user_id))
  with check (nbp_sees_user(user_id));

create policy nbp_documents_select on public.nbp_documents
  for select to authenticated
  using (exists (
    select 1 from public.nbp_folders f
    where f.id = folder_id and nbp_sees_user(f.user_id)
  ));
create policy nbp_documents_write on public.nbp_documents
  for all to authenticated
  using (exists (
    select 1 from public.nbp_folders f
    where f.id = folder_id and nbp_sees_user(f.user_id)
  ))
  with check (exists (
    select 1 from public.nbp_folders f
    where f.id = folder_id and nbp_sees_user(f.user_id)
  ));

-- personal calendar
create policy nbp_cal_select on public.nbp_calendar_events
  for select to authenticated using (nbp_sees_user(user_id));
create policy nbp_cal_write on public.nbp_calendar_events
  for all to authenticated
  using (nbp_sees_user(user_id))
  with check (nbp_sees_user(user_id));

-- action plans
create policy nbp_plan_months_select on public.nbp_action_plan_months
  for select to authenticated using (nbp_sees_user(user_id));
create policy nbp_plan_months_write on public.nbp_action_plan_months
  for all to authenticated
  using (nbp_is_admin() or (nbp_is_consultor() and nbp_sees_user(user_id)))
  with check (nbp_is_admin() or (nbp_is_consultor() and nbp_sees_user(user_id)));

create policy nbp_plan_stages_select on public.nbp_action_plan_stages
  for select to authenticated
  using (exists (
    select 1 from public.nbp_action_plan_months m
    where m.id = month_id and nbp_sees_user(m.user_id)
  ));
create policy nbp_plan_stages_write on public.nbp_action_plan_stages
  for all to authenticated
  using (exists (
    select 1 from public.nbp_action_plan_months m
    where m.id = month_id and (nbp_is_admin() or (nbp_is_consultor() and nbp_sees_user(m.user_id)))
  ))
  with check (exists (
    select 1 from public.nbp_action_plan_months m
    where m.id = month_id and (nbp_is_admin() or (nbp_is_consultor() and nbp_sees_user(m.user_id)))
  ));

create policy nbp_plan_obj_select on public.nbp_action_plan_objectives
  for select to authenticated
  using (exists (
    select 1 from public.nbp_action_plan_months m
    where m.id = month_id and nbp_sees_user(m.user_id)
  ));
create policy nbp_plan_obj_insert on public.nbp_action_plan_objectives
  for insert to authenticated
  with check (exists (
    select 1 from public.nbp_action_plan_months m
    where m.id = month_id and (nbp_is_admin() or (nbp_is_consultor() and nbp_sees_user(m.user_id)))
  ));
create policy nbp_plan_obj_update on public.nbp_action_plan_objectives
  for update to authenticated
  using (exists (
    select 1 from public.nbp_action_plan_months m
    where m.id = month_id and nbp_sees_user(m.user_id)
  ))
  with check (exists (
    select 1 from public.nbp_action_plan_months m
    where m.id = month_id and nbp_sees_user(m.user_id)
  ));
create policy nbp_plan_obj_delete on public.nbp_action_plan_objectives
  for delete to authenticated
  using (exists (
    select 1 from public.nbp_action_plan_months m
    where m.id = month_id and (nbp_is_admin() or (nbp_is_consultor() and nbp_sees_user(m.user_id)))
  ));

-- sessions
create policy nbp_sessions_select on public.nbp_sessions
  for select to authenticated
  using (nbp_sees_user(member_id) or consultant_id = nbp_current_user_id() or nbp_is_admin());
create policy nbp_sessions_write on public.nbp_sessions
  for all to authenticated
  using (nbp_is_admin() or consultant_id = nbp_current_user_id())
  with check (nbp_is_admin() or consultant_id = nbp_current_user_id());

-- community
create policy nbp_communities_select on public.nbp_communities
  for select to authenticated using (true);
create policy nbp_communities_write on public.nbp_communities
  for all to authenticated using (nbp_is_admin()) with check (nbp_is_admin());

create policy nbp_comm_members_select on public.nbp_community_members
  for select to authenticated
  using (user_id = nbp_current_user_id() or nbp_is_admin() or nbp_is_consultor());
create policy nbp_comm_members_insert on public.nbp_community_members
  for insert to authenticated
  with check (user_id = nbp_current_user_id() or nbp_is_admin());
create policy nbp_comm_members_delete on public.nbp_community_members
  for delete to authenticated
  using (user_id = nbp_current_user_id() or nbp_is_admin());

create policy nbp_comm_msg_select on public.nbp_community_messages
  for select to authenticated
  using (
    nbp_is_admin() or nbp_is_consultor()
    or exists (
      select 1 from public.nbp_community_members cm
      where cm.community_id = nbp_community_messages.community_id
        and cm.user_id = nbp_current_user_id()
    )
  );
create policy nbp_comm_msg_insert on public.nbp_community_messages
  for insert to authenticated
  with check (
    author_id = nbp_current_user_id()
    and exists (
      select 1 from public.nbp_community_members cm
      where cm.community_id = nbp_community_messages.community_id
        and cm.user_id = nbp_current_user_id()
    )
  );
create policy nbp_comm_msg_update on public.nbp_community_messages
  for update to authenticated
  using (author_id = nbp_current_user_id() or nbp_is_admin())
  with check (author_id = nbp_current_user_id() or nbp_is_admin());
create policy nbp_comm_msg_delete on public.nbp_community_messages
  for delete to authenticated
  using (author_id = nbp_current_user_id() or nbp_is_admin());

create policy nbp_comm_react_select on public.nbp_community_reactions
  for select to authenticated
  using (exists (
    select 1
    from public.nbp_community_messages msg
    join public.nbp_community_members cm on cm.community_id = msg.community_id
    where msg.id = message_id and (cm.user_id = nbp_current_user_id() or nbp_is_admin() or nbp_is_consultor())
  ));
create policy nbp_comm_react_insert on public.nbp_community_reactions
  for insert to authenticated
  with check (
    user_id = nbp_current_user_id()
    and exists (
      select 1
      from public.nbp_community_messages msg
      join public.nbp_community_members cm on cm.community_id = msg.community_id
      where msg.id = message_id and cm.user_id = nbp_current_user_id()
    )
  );
create policy nbp_comm_react_delete on public.nbp_community_reactions
  for delete to authenticated
  using (user_id = nbp_current_user_id() or nbp_is_admin());
