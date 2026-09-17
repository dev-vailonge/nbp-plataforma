-- NBP schema v2. Drops v1 nbp_* objects, then creates users-with-roles model.
-- Action-plan month is calendar 1–12. Prototype planKey used 0-based JS months:
--   "2026-7" = August = year 2026, month 8.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.nbp_handle_new_user() cascade;
drop function if exists public.nbp_is_staff() cascade;
drop function if exists public.nbp_current_member_id() cascade;
drop function if exists public.nbp_set_updated_at() cascade;

drop table if exists public.nbp_action_plan_objectives cascade;
drop table if exists public.nbp_action_plan_stages cascade;
drop table if exists public.nbp_action_plan_months cascade;
drop table if exists public.nbp_calendar_events cascade;
drop table if exists public.nbp_calendar_rules cascade;
drop table if exists public.nbp_talks cascade;
drop table if exists public.nbp_documents cascade;
drop table if exists public.nbp_document_folders cascade;
drop table if exists public.nbp_lessons cascade;
drop table if exists public.nbp_content_modules cascade;
drop table if exists public.nbp_profiles cascade;
drop table if exists public.nbp_members cascade;

create or replace function public.nbp_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.nbp_users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users (id) on delete set null,
  code text unique,
  role text not null default 'membro' check (role in ('admin', 'consultor', 'membro')),
  full_name text not null,
  email text not null unique,
  company text,
  city text,
  sector text check (sector is null or sector in ('mkt', 'marca', 'com', 'dados', 'saude', 'foto', 'va', 'desp')),
  phone text,
  instagram text,
  bio text,
  gender text check (gender is null or gender in ('m', 'f')),
  avatar_url text,
  membership_status text not null default 'ativo' check (membership_status in ('ativo', 'inativo')),
  consultant_id uuid references public.nbp_users (id) on delete set null,
  login_streak int not null default 0,
  last_login_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_users_consultant_id_idx on public.nbp_users (consultant_id);
create index nbp_users_role_idx on public.nbp_users (role);

create table public.nbp_login_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.nbp_users (id) on delete cascade,
  on_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, on_date)
);

create or replace function public.nbp_touch_login_streak()
returns trigger
language plpgsql
as $$
declare
  last_day date;
  streak int;
begin
  select last_login_on into last_day from public.nbp_users where id = new.user_id;
  if last_day is null or new.on_date = last_day + 1 then
    streak := coalesce((select login_streak from public.nbp_users where id = new.user_id), 0) + 1;
  elsif new.on_date = last_day then
    streak := (select login_streak from public.nbp_users where id = new.user_id);
  else
    streak := 1;
  end if;
  if last_day is null or new.on_date >= last_day then
    update public.nbp_users
    set login_streak = streak, last_login_on = new.on_date
    where id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger nbp_login_days_streak
  after insert on public.nbp_login_days
  for each row execute function public.nbp_touch_login_streak();

create table public.nbp_courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  subtitle text,
  kind text not null check (kind in ('formacao', 'tutoria', 'accountability')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nbp_modules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  course_id uuid not null references public.nbp_courses (id) on delete cascade,
  title text not null,
  subtitle text,
  module_number int check (module_number is null or module_number between 1 and 4),
  color text,
  color_light text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_modules_course_id_idx on public.nbp_modules (course_id);

create table public.nbp_lessons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  module_id uuid not null references public.nbp_modules (id) on delete cascade,
  title text not null,
  duration_label text,
  session_label text,
  status text not null default 'rascunho' check (status in ('rascunho', 'publicado')),
  video_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_lessons_module_id_idx on public.nbp_lessons (module_id);

create table public.nbp_talks (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  published_on date,
  duration_label text,
  summary text,
  status text not null default 'publicado' check (status in ('publicado', 'arquivo')),
  featured boolean not null default false,
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nbp_folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.nbp_users (id) on delete cascade,
  parent_id uuid references public.nbp_folders (id) on delete restrict,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_folders_user_id_idx on public.nbp_folders (user_id);
create index nbp_folders_parent_id_idx on public.nbp_folders (parent_id);

create table public.nbp_documents (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.nbp_folders (id) on delete cascade,
  name text not null,
  file_kind text not null check (file_kind in ('doc', 'gdoc', 'xls', 'gsheet', 'pdf', 'link')),
  url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_documents_folder_id_idx on public.nbp_documents (folder_id);

create table public.nbp_live_rules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  weekday int not null check (weekday between 0 and 6),
  hour text not null default '18h00',
  kind text not null check (kind in ('tutoria', 'accountability')),
  rotation text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nbp_live_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('oneoff', 'override', 'cancel')),
  rule_id uuid references public.nbp_live_rules (id) on delete cascade,
  on_date date not null,
  title text,
  hour text,
  kind text check (kind is null or kind in ('tutoria', 'growth', 'scale', 'presencial')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nbp_live_events_rule_ck check (
    (event_type = 'oneoff' and rule_id is null)
    or (event_type in ('override', 'cancel') and rule_id is not null)
  )
);

create index nbp_live_events_on_date_idx on public.nbp_live_events (on_date);
create index nbp_live_events_rule_id_idx on public.nbp_live_events (rule_id);

create table public.nbp_calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.nbp_users (id) on delete cascade,
  starts_at timestamptz not null,
  title text not null,
  kind text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_calendar_events_user_id_idx on public.nbp_calendar_events (user_id);
create index nbp_calendar_events_starts_at_idx on public.nbp_calendar_events (starts_at);

create table public.nbp_action_plan_months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.nbp_users (id) on delete cascade,
  year int not null check (year between 2000 and 2100),
  month int not null check (month between 1 and 12),
  mrr numeric,
  rec numeric,
  nov numeric,
  act numeric,
  chu numeric,
  lea numeric,
  title text,
  subtitle text,
  flag_main text,
  flag_prefix text,
  flag_target text,
  fill_pct numeric,
  tela jsonb not null default '[]'::jsonb,
  viewport jsonb not null default '{"ox":0,"oy":0,"z":1}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year, month)
);

create index nbp_action_plan_months_user_id_idx on public.nbp_action_plan_months (user_id);

create table public.nbp_action_plan_stages (
  id uuid primary key default gen_random_uuid(),
  month_id uuid not null references public.nbp_action_plan_months (id) on delete cascade,
  position int not null default 0,
  name text not null,
  status text not null default 'locked' check (status in ('done', 'current', 'locked')),
  subtitle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_action_plan_stages_month_id_idx on public.nbp_action_plan_stages (month_id);

create table public.nbp_action_plan_objectives (
  id uuid primary key default gen_random_uuid(),
  month_id uuid not null references public.nbp_action_plan_months (id) on delete cascade,
  title text not null,
  "column" text not null default 'none' check ("column" in ('none', 'todo', 'done')),
  lesson_id uuid references public.nbp_lessons (id) on delete set null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_action_plan_objectives_month_id_idx on public.nbp_action_plan_objectives (month_id);
create index nbp_action_plan_objectives_lesson_id_idx on public.nbp_action_plan_objectives (lesson_id);

create table public.nbp_sessions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.nbp_users (id) on delete cascade,
  consultant_id uuid not null references public.nbp_users (id) on delete restrict,
  session_number int not null,
  starts_at timestamptz not null,
  duration_min int,
  status text not null default 'scheduled' check (status in ('scheduled', 'done', 'cancelled')),
  summary text,
  recording_url text,
  tasks_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_sessions_member_id_idx on public.nbp_sessions (member_id);
create index nbp_sessions_consultant_id_idx on public.nbp_sessions (consultant_id);
create index nbp_sessions_starts_at_idx on public.nbp_sessions (starts_at);

create table public.nbp_communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nbp_community_members (
  community_id uuid not null references public.nbp_communities (id) on delete cascade,
  user_id uuid not null references public.nbp_users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table public.nbp_community_messages (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.nbp_communities (id) on delete cascade,
  author_id uuid not null references public.nbp_users (id) on delete cascade,
  parent_id uuid references public.nbp_community_messages (id) on delete cascade,
  title text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_community_messages_community_id_idx on public.nbp_community_messages (community_id);
create index nbp_community_messages_parent_id_idx on public.nbp_community_messages (parent_id);

create table public.nbp_community_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.nbp_community_messages (id) on delete cascade,
  user_id uuid not null references public.nbp_users (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (message_id, user_id, emoji)
);

create index nbp_community_reactions_message_id_idx on public.nbp_community_reactions (message_id);

create or replace view public.nbp_member_stats
with (security_invoker = false)
as
with tasks as (
  select m.user_id, count(*)::int as tasks_completed
  from public.nbp_action_plan_objectives o
  join public.nbp_action_plan_months m on m.id = o.month_id
  where o."column" = 'done'
  group by m.user_id
),
challenge as (
  select distinct on (m.user_id)
    m.user_id, m.fill_pct as challenge_pct
  from public.nbp_action_plan_months m
  order by m.user_id, m.year desc, m.month desc
),
ranked as (
  select
    u.id as user_id,
    u.full_name,
    u.avatar_url,
    u.login_streak,
    coalesce(t.tasks_completed, 0) as tasks_completed,
    c.challenge_pct,
    row_number() over (
      order by coalesce(t.tasks_completed, 0) desc, u.login_streak desc, u.full_name
    )::int as rank
  from public.nbp_users u
  left join tasks t on t.user_id = u.id
  left join challenge c on c.user_id = u.id
  where u.role = 'membro' and u.membership_status = 'ativo'
)
select * from ranked;

do $$
declare
  t text;
begin
  foreach t in array array[
    'nbp_users',
    'nbp_courses',
    'nbp_modules',
    'nbp_lessons',
    'nbp_talks',
    'nbp_folders',
    'nbp_documents',
    'nbp_live_rules',
    'nbp_live_events',
    'nbp_calendar_events',
    'nbp_action_plan_months',
    'nbp_action_plan_stages',
    'nbp_action_plan_objectives',
    'nbp_sessions',
    'nbp_communities',
    'nbp_community_messages'
  ]
  loop
    execute format(
      'create trigger nbp_set_updated_at before update on public.%I
       for each row execute function public.nbp_set_updated_at()',
      t
    );
  end loop;
end $$;

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on
  public.nbp_users,
  public.nbp_login_days,
  public.nbp_courses,
  public.nbp_modules,
  public.nbp_lessons,
  public.nbp_talks,
  public.nbp_folders,
  public.nbp_documents,
  public.nbp_live_rules,
  public.nbp_live_events,
  public.nbp_calendar_events,
  public.nbp_action_plan_months,
  public.nbp_action_plan_stages,
  public.nbp_action_plan_objectives,
  public.nbp_sessions,
  public.nbp_communities,
  public.nbp_community_members,
  public.nbp_community_messages,
  public.nbp_community_reactions
to authenticated, service_role;

grant select on public.nbp_member_stats to authenticated, service_role;
