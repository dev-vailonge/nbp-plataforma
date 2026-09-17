-- NBP CMS + member plans. Prefix nbp_ keeps this isolated from other public tables.
-- Action-plan month is calendar 1–12. Prototype planKey used 0-based JS months:
--   "2026-7" = August = year 2026, month 8.

create or replace function public.nbp_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.nbp_members (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  full_name text not null,
  email text not null unique,
  company text,
  city text,
  sector text check (sector is null or sector in ('mkt', 'marca', 'com', 'dados', 'saude', 'foto', 'va', 'desp')),
  phone text,
  instagram text,
  bio text,
  membership_status text not null default 'ativo' check (membership_status in ('ativo', 'inativo')),
  papel text not null default 'cliente' check (papel in ('cliente', 'mentor', 'consultora')),
  gender text check (gender is null or gender in ('m', 'f')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nbp_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('staff', 'member')),
  full_name text not null default '',
  member_id uuid references public.nbp_members (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index nbp_profiles_member_id_uidx
  on public.nbp_profiles (member_id)
  where member_id is not null;

create table public.nbp_content_modules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  subtitle text,
  kind text not null check (kind in ('tutoria', 'accountability', 'curso')),
  module_number int check (module_number is null or module_number between 1 and 4),
  color text,
  color_light text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nbp_lessons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  module_id uuid not null references public.nbp_content_modules (id) on delete cascade,
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

create table public.nbp_document_folders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  parent_id uuid references public.nbp_document_folders (id) on delete restrict,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_document_folders_parent_id_idx on public.nbp_document_folders (parent_id);

create table public.nbp_documents (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.nbp_document_folders (id) on delete cascade,
  name text not null,
  file_kind text not null check (file_kind in ('doc', 'gdoc', 'xls', 'gsheet', 'pdf')),
  url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nbp_documents_folder_id_idx on public.nbp_documents (folder_id);

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

create table public.nbp_calendar_rules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  weekday int not null check (weekday between 0 and 6),
  hour text not null default '18h00',
  kind text not null check (kind in ('tutoria', 'accountability')),
  rotation text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nbp_calendar_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('oneoff', 'override', 'cancel')),
  rule_id uuid references public.nbp_calendar_rules (id) on delete cascade,
  on_date date not null,
  title text,
  hour text,
  kind text check (kind is null or kind in ('tutoria', 'growth', 'scale', 'presencial')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nbp_calendar_events_rule_ck check (
    (event_type = 'oneoff' and rule_id is null)
    or (event_type in ('override', 'cancel') and rule_id is not null)
  )
);

create index nbp_calendar_events_on_date_idx on public.nbp_calendar_events (on_date);
create index nbp_calendar_events_rule_id_idx on public.nbp_calendar_events (rule_id);

create table public.nbp_action_plan_months (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.nbp_members (id) on delete cascade,
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
  unique (member_id, year, month)
);

create index nbp_action_plan_months_member_id_idx on public.nbp_action_plan_months (member_id);

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

do $$
declare
  t text;
begin
  foreach t in array array[
    'nbp_members',
    'nbp_profiles',
    'nbp_content_modules',
    'nbp_lessons',
    'nbp_document_folders',
    'nbp_documents',
    'nbp_talks',
    'nbp_calendar_rules',
    'nbp_calendar_events',
    'nbp_action_plan_months',
    'nbp_action_plan_stages',
    'nbp_action_plan_objectives'
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
  public.nbp_members,
  public.nbp_profiles,
  public.nbp_content_modules,
  public.nbp_lessons,
  public.nbp_document_folders,
  public.nbp_documents,
  public.nbp_talks,
  public.nbp_calendar_rules,
  public.nbp_calendar_events,
  public.nbp_action_plan_months,
  public.nbp_action_plan_stages,
  public.nbp_action_plan_objectives
to authenticated, service_role;
