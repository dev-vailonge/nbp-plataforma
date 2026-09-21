export type NbpRole = "admin" | "consultor" | "membro";
export type MembershipStatus = "ativo" | "inativo";
export type Sector = "mkt" | "marca" | "com" | "dados" | "saude" | "foto" | "va" | "desp";
export type Gender = "m" | "f";
export type CourseKind = "formacao" | "tutoria" | "accountability";
export type PublishStatus = "rascunho" | "publicado";
export type TalkStatus = "publicado" | "arquivo";
export type FileKind = "doc" | "gdoc" | "xls" | "gsheet" | "pdf" | "link";
export type LiveKind = "tutoria" | "accountability";
export type LiveEventType = "oneoff" | "override" | "cancel";
export type LiveEventKind = "tutoria" | "growth" | "scale" | "presencial";
export type StageStatus = "done" | "current" | "locked";
export type ObjectiveColumn = "none" | "todo" | "done";
export type SessionStatus = "scheduled" | "done" | "cancelled";

export type TelaShape = {
  t: "ret" | "eli" | "set" | "lap" | "txt";
  x: number;
  y: number;
  w?: number;
  h?: number;
  c?: number;
  s?: number;
  txt?: string;
  pts?: number[];
};

export type Viewport = { ox: number; oy: number; z: number };

export type NbpUser = {
  id: string;
  auth_id: string | null;
  code: string;
  role: NbpRole;
  full_name: string;
  email: string;
  company: string | null;
  city: string | null;
  sector: Sector | null;
  phone: string | null;
  instagram: string | null;
  bio: string | null;
  gender: Gender | null;
  avatar_url: string | null;
  membership_status: MembershipStatus;
  consultant_id: string | null;
  login_streak: number;
  last_login_on: string | null;
  created_at: string;
  updated_at: string;
};

export type NbpCourse = {
  id: string;
  code: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  kind: CourseKind;
  sort_order: number;
};

export type NbpModule = {
  id: string;
  code: string;
  course_id: string;
  title: string;
  subtitle: string | null;
  cover_url: string | null;
  module_number: number | null;
  color: string | null;
  color_light: string | null;
  sort_order: number;
};

export type NbpLesson = {
  id: string;
  code: string;
  module_id: string;
  title: string;
  description: string | null;
  duration_label: string | null;
  session_label: string | null;
  status: PublishStatus;
  video_url: string | null;
  sort_order: number;
};

export type NbpTalk = {
  id: string;
  code: string;
  title: string;
  published_on: string | null;
  duration_label: string | null;
  summary: string | null;
  status: TalkStatus;
  featured: boolean;
  video_url: string | null;
};

export type NbpFolder = {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
};

export type NbpDocument = {
  id: string;
  folder_id: string;
  name: string;
  file_kind: FileKind;
  url: string | null;
  sort_order: number;
};

export type NbpLiveRule = {
  id: string;
  code: string;
  weekday: number;
  hour: string;
  kind: LiveKind;
  rotation: string[];
};

export type NbpLiveEvent = {
  id: string;
  event_type: LiveEventType;
  rule_id: string | null;
  on_date: string;
  title: string | null;
  hour: string | null;
  kind: LiveEventKind | null;
};

export type NbpCalendarEvent = {
  id: string;
  user_id: string;
  starts_at: string;
  title: string;
  kind: string | null;
};

export type NbpActionPlanMonth = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  mrr: number | null;
  rec: number | null;
  nov: number | null;
  act: number | null;
  chu: number | null;
  lea: number | null;
  title: string | null;
  subtitle: string | null;
  flag_main: string | null;
  flag_prefix: string | null;
  flag_target: string | null;
  fill_pct: number | null;
  tela: TelaShape[];
  viewport: Viewport;
};

export type NbpActionPlanStage = {
  id: string;
  month_id: string;
  position: number;
  name: string;
  status: StageStatus;
  subtitle: string | null;
};

export type NbpActionPlanObjective = {
  id: string;
  month_id: string;
  title: string;
  column: ObjectiveColumn;
  lesson_id: string | null;
  position: number;
};

export type NbpSession = {
  id: string;
  member_id: string;
  consultant_id: string;
  session_number: number;
  starts_at: string;
  duration_min: number;
  status: SessionStatus;
  summary: string | null;
  recording_url: string | null;
  tasks_count: number;
};

export type NbpCommunity = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type NbpCommunityMessage = {
  id: string;
  community_id: string;
  author_id: string;
  parent_id: string | null;
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

export type NbpCommunityMember = {
  community_id: string;
  user_id: string;
  joined_at: string;
};

export type NbpCommunityReaction = {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
};

export type NbpLoginDay = {
  id: string;
  user_id: string;
  on_date: string;
  created_at: string;
};

export type NbpMemberStats = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  login_streak: number;
  tasks_completed: number;
  challenge_pct: number;
  rank: number;
};

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      nbp_users: TableDef<NbpUser>;
      nbp_login_days: TableDef<NbpLoginDay>;
      nbp_courses: TableDef<NbpCourse>;
      nbp_modules: TableDef<NbpModule>;
      nbp_lessons: TableDef<NbpLesson>;
      nbp_talks: TableDef<NbpTalk>;
      nbp_folders: TableDef<NbpFolder>;
      nbp_documents: TableDef<NbpDocument>;
      nbp_live_rules: TableDef<NbpLiveRule>;
      nbp_live_events: TableDef<NbpLiveEvent>;
      nbp_calendar_events: TableDef<NbpCalendarEvent>;
      nbp_action_plan_months: TableDef<NbpActionPlanMonth>;
      nbp_action_plan_stages: TableDef<NbpActionPlanStage>;
      nbp_action_plan_objectives: TableDef<NbpActionPlanObjective>;
      nbp_sessions: TableDef<NbpSession>;
      nbp_communities: TableDef<NbpCommunity>;
      nbp_community_members: TableDef<NbpCommunityMember>;
      nbp_community_messages: TableDef<NbpCommunityMessage>;
      nbp_community_reactions: TableDef<NbpCommunityReaction>;
    };
    Views: {
      nbp_member_stats: {
        Row: NbpMemberStats;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
