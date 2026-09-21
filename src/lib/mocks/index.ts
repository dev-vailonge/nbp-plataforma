import type {
  FileKind,
  NbpActionPlanMonth,
  NbpActionPlanObjective,
  NbpActionPlanStage,
  NbpCommunityMessage,
  NbpCourse,
  NbpDocument,
  NbpFolder,
  NbpLesson,
  NbpLiveRule,
  NbpModule,
  NbpSession,
  NbpTalk,
  NbpUser,
  Sector,
} from "@/types/database";

export const SECTORS: Record<Sector, string> = {
  mkt: "Marketing",
  marca: "Marca pessoal",
  com: "Comunicação",
  dados: "Dados",
  saude: "Saúde",
  foto: "Fotografia",
  va: "Virtual assistant",
  desp: "Desporto",
};

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

const now = "2026-09-17T10:00:00+01:00";

function user(
  partial: Omit<NbpUser, "auth_id" | "avatar_url" | "login_streak" | "last_login_on" | "created_at" | "updated_at"> &
    Partial<Pick<NbpUser, "login_streak" | "last_login_on">>,
): NbpUser {
  return {
    auth_id: null,
    avatar_url: null,
    login_streak: 0,
    last_login_on: null,
    created_at: now,
    updated_at: now,
    ...partial,
  };
}

export const users: NbpUser[] = [
  user({
    id: "u-marta",
    code: "u-marta",
    role: "consultor",
    full_name: "Marta Nunes",
    email: "marta@nbp.pt",
    company: "NBP",
    city: "Lisboa",
    sector: null,
    phone: null,
    instagram: null,
    bio: "Consultora NBP.",
    gender: "f",
    membership_status: "ativo",
    consultant_id: null,
  }),
  user({
    id: "u-joao",
    code: "u-joao",
    role: "admin",
    full_name: "João Mafra",
    email: "joao@nbp.pt",
    company: "NBP",
    city: "Lisboa",
    sector: null,
    phone: null,
    instagram: null,
    bio: "Equipa NBP.",
    gender: "m",
    membership_status: "ativo",
    consultant_id: null,
  }),
  user({
    id: "m-roque",
    code: "m-roque",
    role: "membro",
    full_name: "Roque Buarque",
    email: "roque@nbp.pt",
    company: "Escola Nova Era Tech",
    city: "Remoto",
    sector: "mkt",
    phone: "+351 910 000 001",
    instagram: "instagram.com/roquebuarque",
    bio: "Escola de programação que leva iniciantes do zero ao primeiro emprego. A escalar as turmas com o desafio da No Blank Page — foco atual em aquisição previsível.",
    gender: "m",
    membership_status: "ativo",
    consultant_id: "u-joao",
    login_streak: 17,
    last_login_on: "2026-08-17",
  }),
  user({
    id: "m-ric",
    code: "m-ric",
    role: "membro",
    full_name: "Ricardo Almeida",
    email: "r.almeida7@hotmail.com",
    company: "Performance Aveiro",
    city: "Aveiro",
    sector: "mkt",
    phone: "+351 916 076 970",
    instagram: "instagram.com/ricardoalmeida",
    bio: "Gestor de tráfego pago. A construir a própria agência.",
    gender: "m",
    membership_status: "ativo",
    consultant_id: "u-marta",
  }),
  user({
    id: "m-alda",
    code: "m-alda",
    role: "membro",
    full_name: "Alda Vieira",
    email: "alda@aldavieira.pt",
    company: "Alda Vieira",
    city: "Aveiro",
    sector: "marca",
    phone: "+351 912 445 118",
    instagram: "instagram.com/aldavieira",
    bio: "Marca pessoal com fundadores que odeiam vender.",
    gender: "f",
    membership_status: "ativo",
    consultant_id: "u-marta",
  }),
  user({
    id: "m-carla",
    code: "m-carla",
    role: "membro",
    full_name: "Carla Moreira",
    email: "carla.moreira@gmail.com",
    company: "Yoga nas Escolas",
    city: "Aveiro",
    sector: "saude",
    phone: "+351 933 210 654",
    instagram: "instagram.com/carlamoreira",
    bio: "Yoga para crianças. Aulas em escolas e formação de educadores.",
    gender: "f",
    membership_status: "ativo",
    consultant_id: "u-marta",
  }),
  user({
    id: "m-tiago",
    code: "m-tiago",
    role: "membro",
    full_name: "Tiago Ramos",
    email: "tiago@macromakers.pt",
    company: "MacroMakers",
    city: "Aveiro",
    sector: "com",
    phone: "+351 927 883 401",
    instagram: "instagram.com/macromakers",
    bio: "Comunicação para indústria e B2B.",
    gender: "m",
    membership_status: "ativo",
    consultant_id: "u-marta",
  }),
  user({
    id: "m-yuri",
    code: "m-yuri",
    role: "membro",
    full_name: "Yuri Novaes",
    email: "yuri.novaes@cft.pt",
    company: "CFT",
    city: "Braga",
    sector: "desp",
    phone: "+351 938 447 220",
    instagram: "instagram.com/yurinovaes",
    bio: "Centro de formação de futebol.",
    gender: "m",
    membership_status: "ativo",
    consultant_id: "u-marta",
  }),
  user({
    id: "m-cris",
    code: "m-cris",
    role: "membro",
    full_name: "Cristiano Silva",
    email: "geral@cristianosilva.pt",
    company: "Cristiano Silva",
    city: "Braga",
    sector: "foto",
    phone: "+351 961 337 508",
    instagram: "instagram.com/cristianosilva",
    bio: "Retrato corporativo de autor.",
    gender: "m",
    membership_status: "ativo",
    consultant_id: "u-marta",
  }),
  user({
    id: "m-avner",
    code: "m-avner",
    role: "membro",
    full_name: "Avner Vasconcelos",
    email: "avner@dadosclaros.pt",
    company: "Dados Claros",
    city: "Braga",
    sector: "dados",
    phone: "+351 924 110 776",
    instagram: "instagram.com/avnervasconcelos",
    bio: "Dashboards e automação para PME.",
    gender: "m",
    membership_status: "ativo",
    consultant_id: "u-marta",
  }),
  user({
    id: "m-sofia",
    code: "m-sofia",
    role: "membro",
    full_name: "Sofia Rebelo",
    email: "sofia.rebelo@gmail.com",
    company: "Rebelo VA",
    city: "Bragança",
    sector: "va",
    phone: "+351 917 004 332",
    instagram: "instagram.com/sofiarebelo",
    bio: "Apoio administrativo remoto a consultores.",
    gender: "f",
    membership_status: "inativo",
    consultant_id: "u-marta",
  }),
  user({
    id: "m-ines",
    code: "m-ines",
    role: "membro",
    full_name: "Inês Cardoso",
    email: "ines@inescardoso.pt",
    company: "Inês Cardoso",
    city: "Porto",
    sector: "marca",
    phone: "+351 913 559 274",
    instagram: "instagram.com/inescardoso",
    bio: "Posicionamento e oferta com terapeutas.",
    gender: "f",
    membership_status: "ativo",
    consultant_id: "u-marta",
  }),
];

export const currentMember = users.find((u) => u.code === "m-roque")!;
export const currentAdmin = users.find((u) => u.code === "u-joao")!;
export const currentConsultant = users.find((u) => u.code === "u-marta")!;

export const members = users.filter((u) => u.role === "membro");

export const courses: NbpCourse[] = [
  {
    id: "crs-formacao",
    code: "crs-formacao",
    title: "Formação NBP",
    subtitle: "Percurso completo em 4 módulos — do nicho às vendas.",
    cover_url: "https://images.unsplash.com/photo-1522202176988-66273b2fe75e?w=800&q=80",
    kind: "formacao",
    sort_order: 0,
  },
  {
    id: "crs-tutoria",
    code: "crs-tutoria",
    title: "Tutorias",
    subtitle: "terças, 18h00 · ensino e dúvidas ao vivo com a equipa.",
    cover_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    kind: "tutoria",
    sort_order: 1,
  },
  {
    id: "crs-acc",
    code: "crs-acc",
    title: "Accountability",
    subtitle: "quintas, 18h00 · números, metas e compromissos semanais.",
    cover_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    kind: "accountability",
    sort_order: 2,
  },
];

export const modules: NbpModule[] = [
  {
    id: "mod-1",
    code: "mod-1",
    course_id: "crs-formacao",
    title: "Fundações",
    subtitle: "Nicho, cliente ideal e diagnóstico da oferta actual.",
    cover_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80",
    module_number: 1,
    color: "#453C96",
    color_light: "#CFCBF7",
    sort_order: 0,
  },
  {
    id: "mod-2",
    code: "mod-2",
    course_id: "crs-formacao",
    title: "Oferta e preço",
    subtitle: "Anatomia da oferta, ancoragem e escalões.",
    cover_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
    module_number: 2,
    color: "#125A47",
    color_light: "#B4E5D3",
    sort_order: 1,
  },
  {
    id: "mod-3",
    code: "mod-3",
    course_id: "crs-formacao",
    title: "Aquisição",
    subtitle: "Um canal, prospeção e parcerias.",
    cover_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
    module_number: 3,
    color: "#7C3218",
    color_light: "#F1C4B0",
    sort_order: 2,
  },
  {
    id: "mod-4",
    code: "mod-4",
    course_id: "crs-formacao",
    title: "Vendas",
    subtitle: "Descoberta, objeções e fecho.",
    cover_url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&q=80",
    module_number: 4,
    color: "#7C2C46",
    color_light: "#F2C0D2",
    sort_order: 3,
  },
  {
    id: "mod-t",
    code: "mod-t",
    course_id: "crs-tutoria",
    title: "Sessões de tutoria",
    subtitle: "Gravações das terças — conteúdo, finanças, IA e mais.",
    cover_url: "https://images.unsplash.com/photo-1588196748096-7d473bf6c0d0?w=400&q=80",
    module_number: null,
    color: "#1E4E7E",
    color_light: "#BBD7F4",
    sort_order: 0,
  },
  {
    id: "mod-a",
    code: "mod-a",
    course_id: "crs-acc",
    title: "Sessões de accountability",
    subtitle: "Gravações das quintas — GROWTH e SCALE.",
    cover_url: "https://images.unsplash.com/photo-1542744173-8e2bd1159915?w=400&q=80",
    module_number: null,
    color: "#6B4310",
    color_light: "#F3D6A6",
    sort_order: 0,
  },
];

export const lessons: NbpLesson[] = [
  { id: "t.con", code: "t.con", module_id: "mod-t", title: "Conteúdo", description: "Como planear e publicar conteúdo que gera conversas comerciais.", duration_label: "46 min", session_label: "18 ago", status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 0 },
  { id: "t.fin", code: "t.fin", module_id: "mod-t", title: "Financeira", description: "Leitura de P&L simplificado e métricas que importam no NBP.", duration_label: "52 min", session_label: "11 ago", status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 1 },
  { id: "t.dp", code: "t.dp", module_id: "mod-t", title: "Desenvolvimento pessoal", description: "Rotinas, foco e gestão de energia para fundadores.", duration_label: "41 min", session_label: "4 ago", status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 2 },
  { id: "t.ia", code: "t.ia", module_id: "mod-t", title: "IA", description: "Fluxos práticos de IA para operação e conteúdo.", duration_label: "58 min", session_label: "28 jul", status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 3 },
  { id: "t.con2", code: "t.con2", module_id: "mod-t", title: "Conteúdo", description: "Repetição do ciclo de conteúdo — novas perguntas da comunidade.", duration_label: "49 min", session_label: "21 jul", status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 4 },
  { id: "a.gro", code: "a.gro", module_id: "mod-a", title: "GROWTH", description: "Revisão de metas de crescimento e bloqueios da semana.", duration_label: "34 min", session_label: "20 ago", status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 0 },
  { id: "a.sca", code: "a.sca", module_id: "mod-a", title: "SCALE", description: "Números de escala: pipeline, conversão e capacidade.", duration_label: "29 min", session_label: "13 ago", status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 1 },
  { id: "a.gro2", code: "a.gro2", module_id: "mod-a", title: "GROWTH", description: "Follow-up das metas GROWTH do mês.", duration_label: "51 min", session_label: "6 ago", status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 2 },
  { id: "a.sca2", code: "a.sca2", module_id: "mod-a", title: "SCALE", description: "Checklist de escala operacional.", duration_label: "26 min", session_label: "30 jul", status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 3 },
  { id: "m1.1", code: "m1.1", module_id: "mod-1", title: "Porquê um nicho", description: "Porque nicho bem escolhido acelera preço e aquisição.", duration_label: "9 min", session_label: null, status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 0 },
  { id: "m1.2", code: "m1.2", module_id: "mod-1", title: "Mapear o cliente ideal", description: "Exercício prático de ICP com perguntas de descoberta.", duration_label: "14 min", session_label: null, status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 1 },
  { id: "m1.3", code: "m1.3", module_id: "mod-1", title: "Auditar a oferta atual", description: "Checklist para perceber o que vender (e o que cortar).", duration_label: "11 min", session_label: null, status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 2 },
  { id: "m1.4", code: "m1.4", module_id: "mod-1", title: "Escolher o mercado", description: "Critérios para decidir o mercado onde jogar nos próximos 90 dias.", duration_label: "8 min", session_label: null, status: "rascunho", video_url: null, sort_order: 3 },
  { id: "m2.1", code: "m2.1", module_id: "mod-2", title: "Anatomia de uma oferta", description: "Promessa, prova, processo e preço numa página.", duration_label: "12 min", session_label: null, status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 0 },
  { id: "m2.2", code: "m2.2", module_id: "mod-2", title: "Ancoragem de valor", description: "Como ancorar valor antes de falar de preço.", duration_label: "16 min", session_label: null, status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 1 },
  { id: "m2.3", code: "m2.3", module_id: "mod-2", title: "Definir a tua oferta principal", description: "Template para a oferta core do negócio.", duration_label: "12 min", session_label: null, status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 2 },
  { id: "m2.4", code: "m2.4", module_id: "mod-2", title: "Estrutura de escalões", description: "Good / better / best adaptado a serviços B2B.", duration_label: "18 min", session_label: null, status: "rascunho", video_url: null, sort_order: 3 },
  { id: "m2.5", code: "m2.5", module_id: "mod-2", title: "Quando subir preços", description: "Sinais de mercado e script de aumento.", duration_label: "10 min", session_label: null, status: "rascunho", video_url: null, sort_order: 4 },
  { id: "m3.1", code: "m3.1", module_id: "mod-3", title: "Escolher um canal só", description: "Porque foco num canal bate dispersão nos primeiros 90 dias.", duration_label: "13 min", session_label: null, status: "rascunho", video_url: null, sort_order: 0 },
  { id: "m3.2", code: "m3.2", module_id: "mod-3", title: "Guião de prospeção fria", description: "Mensagens e sequência para outbound.", duration_label: "21 min", session_label: null, status: "rascunho", video_url: null, sort_order: 1 },
  { id: "m3.3", code: "m3.3", module_id: "mod-3", title: "Parcerias e referências", description: "Como pedir e estruturar referrals.", duration_label: "15 min", session_label: null, status: "rascunho", video_url: null, sort_order: 2 },
  { id: "m4.1", code: "m4.1", module_id: "mod-4", title: "A chamada de descoberta", description: "Agenda da call e perguntas que qualificam.", duration_label: "19 min", session_label: null, status: "publicado", video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", sort_order: 0 },
  { id: "m4.2", code: "m4.2", module_id: "mod-4", title: "Tratar objeções", description: "Objecções clássicas e respostas sem desconto.", duration_label: "23 min", session_label: null, status: "rascunho", video_url: null, sort_order: 1 },
];

export type MockCourseDetail = NbpCourse & {
  modules: (NbpModule & { lessons: NbpLesson[] })[];
};

/** Curso com módulos e aulas aninhados — útil no admin em modo demo. */
export function getMockCourseDetail(courseId: string): MockCourseDetail | null {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return null;
  const mods = modules
    .filter((m) => m.course_id === courseId)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((mod) => ({
      ...mod,
      lessons: lessons
        .filter((l) => l.module_id === mod.id)
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order),
    }));
  return { ...course, modules: mods };
}

/** Conteúdos V2 — tracks ao vivo (Tutorias / Accountability). */
export type LiveTrackSession = {
  title: string;
  duration_label: string;
  date_label: string;
  progress: number;
};

export type LiveTrack = {
  id: "t" | "a";
  title: string;
  subtitle: string;
  color: string;
  color_light: string;
  icon: string;
  next: string;
  kicker: string;
  sessions: LiveTrackSession[];
};

export const liveTracks: LiveTrack[] = [
  {
    id: "t",
    title: "Tutorias",
    subtitle: "terças, 18h00 · ensino e dúvidas",
    color: "#1E4E7E",
    color_light: "#BBD7F4",
    icon: "fa-graduation-cap",
    next: "ter, 25 ago · IA",
    kicker: "Tutoria de terça",
    sessions: [
      { title: "Conteúdo", duration_label: "46 min", date_label: "18 ago", progress: 0 },
      { title: "Financeira", duration_label: "52 min", date_label: "11 ago", progress: 100 },
      { title: "Desenvolvimento pessoal", duration_label: "41 min", date_label: "4 ago", progress: 0 },
      { title: "IA", duration_label: "58 min", date_label: "28 jul", progress: 0 },
      { title: "Conteúdo", duration_label: "49 min", date_label: "21 jul", progress: 0 },
    ],
  },
  {
    id: "a",
    title: "Accountability",
    subtitle: "quintas, 18h00 · números e compromissos",
    color: "#6B4310",
    color_light: "#F3D6A6",
    icon: "fa-people-group",
    next: "qui, 27 ago · SCALE",
    kicker: "Accountability de quinta",
    sessions: [
      { title: "GROWTH", duration_label: "34 min", date_label: "20 ago", progress: 0 },
      { title: "SCALE", duration_label: "29 min", date_label: "13 ago", progress: 100 },
      { title: "GROWTH", duration_label: "51 min", date_label: "6 ago", progress: 0 },
      { title: "SCALE", duration_label: "26 min", date_label: "30 jul", progress: 0 },
    ],
  },
];

export type ContentCategoryId =
  | "all"
  | "sales"
  | "growth"
  | "content"
  | "data"
  | "ops"
  | "design"
  | "automation";

export const contentCategories: {
  id: ContentCategoryId;
  label: string;
  icon: string;
}[] = [
  { id: "all", label: "Todos os conteúdos", icon: "fa-layer-group" },
  { id: "sales", label: "Vendas & Oferta", icon: "fa-handshake" },
  { id: "growth", label: "Growth & Marketing", icon: "fa-chart-line" },
  { id: "content", label: "Conteúdo & Copy", icon: "fa-pen-ruler" },
  { id: "data", label: "Análise de dados", icon: "fa-chart-column" },
  { id: "ops", label: "Operação & Processos", icon: "fa-diagram-project" },
  { id: "design", label: "Design & Interface", icon: "fa-palette" },
  { id: "automation", label: "Automação & No-Code", icon: "fa-wand-magic-sparkles" },
];

export type LibraryCourse = {
  id: string;
  category: Exclude<ContentCategoryId, "all">;
  thumb_title: [string, string];
  thumb_sub: string;
  title: string;
  author: string;
  duration_label: string;
  bg: string;
};

/** Gradientes dos thumbs (contentV2). */
export const libraryCourseBgs: Record<string, string> = {
  a: "linear-gradient(135deg, #1a1a18 0%, #2a2a26 55%, #4B4C47 100%)",
  b: "linear-gradient(135deg, #151515 0%, #2c2d28 55%, #C6C8BA55 100%)",
  c: "linear-gradient(135deg, #0f1412 0%, #1c2a24 55%, #3d5a4c 100%)",
  d: "linear-gradient(135deg, #1a1a1a 0%, #3a2d28 55%, #7c5a3a 100%)",
  e: "linear-gradient(135deg, #132020 0%, #1c3d3d 55%, #19a186 100%)",
  f: "linear-gradient(135deg, #181816 0%, #2e2f2a 55%, #6B6C63 100%)",
  g: "linear-gradient(135deg, #0a1f1a 0%, #11402f 55%, #34d399 100%)",
  h: "linear-gradient(135deg, #1a1208 0%, #4a2e08 55%, #C6C8BA 100%)",
};

export const libraryCourses: LibraryCourse[] = [
  {
    id: "lib-1",
    category: "sales",
    thumb_title: ["Oferta", "irresistível"],
    thumb_sub: "No Blank Page",
    title: "Oferta irresistível: posicionar, precificar e vender serviços",
    author: "João Mafra",
    duration_label: "4h 15min",
    bg: "a",
  },
  {
    id: "lib-2",
    category: "content",
    thumb_title: ["Copy", "que converte"],
    thumb_sub: "Growth · Copy",
    title: "Copywriting que converte: estrutura, tom e testes A/B",
    author: "João Mafra",
    duration_label: "3h 05min",
    bg: "b",
  },
  {
    id: "lib-3",
    category: "growth",
    thumb_title: ["Tráfego", "pago"],
    thumb_sub: "Growth · Ads",
    title: "Tráfego pago: campanhas previsíveis sem viver no operacional",
    author: "João Mafra",
    duration_label: "2h 40min",
    bg: "c",
  },
  {
    id: "lib-4",
    category: "design",
    thumb_title: ["Imagens", "profissionais"],
    thumb_sub: "Design · Visual",
    title: "Identidade visual simples: imagens e templates que vendem",
    author: "João Mafra",
    duration_label: "1h 20min",
    bg: "d",
  },
  {
    id: "lib-5",
    category: "data",
    thumb_title: ["Dashboards", "e dados"],
    thumb_sub: "Data · Analytics",
    title: "Construindo dashboards acionáveis com seus dados",
    author: "João Mafra",
    duration_label: "3h 50min",
    bg: "e",
  },
  {
    id: "lib-6",
    category: "automation",
    thumb_title: ["Automação", "sem código"],
    thumb_sub: "No-Code · Ops",
    title: "Automação no-code: do Zapier ao Make sem complicar",
    author: "João Mafra",
    duration_label: "2h 15min",
    bg: "f",
  },
  {
    id: "lib-7",
    category: "ops",
    thumb_title: ["Processos", "que escalam"],
    thumb_sub: "Operação",
    title: "Processos replicáveis: transformando estratégia em execução",
    author: "João Mafra",
    duration_label: "2h 05min",
    bg: "g",
  },
  {
    id: "lib-8",
    category: "growth",
    thumb_title: ["Social", "Media"],
    thumb_sub: "Conteúdo · Redes",
    title: "Social Media: calendário, copy e performance",
    author: "João Mafra",
    duration_label: "1h 55min",
    bg: "h",
  },
];

export const libraryTotalCount = 24;

export const talks: NbpTalk[] = [
  {
    id: "tk-1",
    code: "tk-1",
    title: "O preço não é o problema",
    published_on: "2026-08-21",
    duration_label: "11 min",
    summary: "Porque é que baixar o preço quase nunca resolve o que parece resolver.",
    status: "publicado",
    featured: true,
    video_url: null,
  },
  {
    id: "tk-2",
    code: "tk-2",
    title: "Fazer menos, melhor",
    published_on: "2026-08-14",
    duration_label: "9 min",
    summary: "Sobre escolher um canal e ficar lá tempo suficiente.",
    status: "publicado",
    featured: false,
    video_url: null,
  },
  {
    id: "tk-3",
    code: "tk-3",
    title: "A conversa que estás a evitar",
    published_on: "2026-08-07",
    duration_label: "14 min",
    summary: "Clientes, sócios, equipa — o custo de adiar.",
    status: "publicado",
    featured: false,
    video_url: null,
  },
  {
    id: "tk-4",
    code: "tk-4",
    title: "Consistência não é motivação",
    published_on: "2026-07-31",
    duration_label: "8 min",
    summary: "Sistemas em vez de vontade.",
    status: "arquivo",
    featured: false,
    video_url: null,
  },
];

/** Waveform heights used by legacy/talksV2.html */
export const talkWaveHeights = [
  8, 14, 20, 11, 17, 24, 13, 9, 19, 22, 15, 10, 18, 25, 12, 16, 21, 9, 14, 20, 11,
  17, 13, 19, 10, 16, 22, 12, 15, 20,
];

export const liveRules: NbpLiveRule[] = [
  { id: "r-tut", code: "r-tut", weekday: 2, hour: "18h00", kind: "tutoria", rotation: ["Desenv. pessoal", "Financeira", "Conteúdo", "IA"] },
  { id: "r-acc", code: "r-acc", weekday: 4, hour: "18h00", kind: "accountability", rotation: ["GROWTH", "SCALE"] },
];

export const folders: NbpFolder[] = [
  { id: "f-root", user_id: "m-roque", parent_id: null, name: "Documentos", sort_order: 0 },
  { id: "f-p0", user_id: "m-roque", parent_id: "f-root", name: "0 · Alinhamento de expectativas", sort_order: 0 },
  { id: "f-p1", user_id: "m-roque", parent_id: "f-root", name: "1 · Identidade do Comunicador", sort_order: 1 },
  { id: "f-p2", user_id: "m-roque", parent_id: "f-root", name: "2 · Posicionamento", sort_order: 2 },
  { id: "f-p3", user_id: "m-roque", parent_id: "f-root", name: "3 · Oferta", sort_order: 3 },
  { id: "f-p4", user_id: "m-roque", parent_id: "f-root", name: "4 · Conversão 10X", sort_order: 4 },
  { id: "f-pev", user_id: "m-roque", parent_id: "f-p4", name: "Evento Presencial", sort_order: 0 },
  { id: "f-ppa", user_id: "m-roque", parent_id: "f-root", name: "Plano de Ação", sort_order: 5 },
  { id: "f-pt", user_id: "m-roque", parent_id: "f-root", name: "Templates", sort_order: 6 },
];

export const documents: NbpDocument[] = [
  { id: "d-r1", folder_id: "f-root", name: "[AT] Mapa de…", file_kind: "gsheet", url: null, sort_order: 0 },
  { id: "d-r2", folder_id: "f-root", name: "DICTIONARY", file_kind: "gdoc", url: null, sort_order: 1 },
  { id: "d-r3", folder_id: "f-root", name: "Ebook.pdf", file_kind: "pdf", url: null, sort_order: 2 },
  { id: "d-r4", folder_id: "f-root", name: "Framework de…", file_kind: "gdoc", url: null, sort_order: 3 },
  { id: "d-r5", folder_id: "f-root", name: "Planilha Controlo…", file_kind: "gsheet", url: null, sort_order: 4 },
  { id: "d-r6", folder_id: "f-root", name: "Script de call…", file_kind: "gdoc", url: null, sort_order: 5 },
  { id: "d-p1-1", folder_id: "f-p1", name: "Clareza e…", file_kind: "doc", url: null, sort_order: 0 },
  { id: "d-p1-2", folder_id: "f-p1", name: "Dashboard Diário", file_kind: "xls", url: null, sort_order: 1 },
  { id: "d-p1-3", folder_id: "f-p1", name: "Identidade Atual…", file_kind: "doc", url: null, sort_order: 2 },
  { id: "d-p1-4", folder_id: "f-p1", name: "Livro de…", file_kind: "doc", url: null, sort_order: 3 },
  { id: "d-p1-5", folder_id: "f-p1", name: "Nova…", file_kind: "doc", url: null, sort_order: 4 },
  { id: "d-p1-6", folder_id: "f-p1", name: "Vida de Sonhos", file_kind: "doc", url: null, sort_order: 5 },
  { id: "d-p2-1", folder_id: "f-p2", name: "Calendário de…", file_kind: "xls", url: null, sort_order: 0 },
  { id: "d-p2-2", folder_id: "f-p2", name: "Posicionamento", file_kind: "doc", url: null, sort_order: 1 },
  { id: "d-p3-1", folder_id: "f-p3", name: "Oferta", file_kind: "doc", url: null, sort_order: 0 },
  { id: "d-p3-2", folder_id: "f-p3", name: "Transformação", file_kind: "doc", url: null, sort_order: 1 },
  { id: "d-p4-1", folder_id: "f-p4", name: "[NBP] Webinar · Ciclos de 7 dias", file_kind: "gsheet", url: null, sort_order: 0 },
  { id: "d-p4-2", folder_id: "f-p4", name: "Conversão", file_kind: "doc", url: null, sort_order: 1 },
  { id: "d-p4-3", folder_id: "f-p4", name: "Planilha de Evento", file_kind: "gsheet", url: null, sort_order: 2 },
  { id: "d-ppa-1", folder_id: "f-ppa", name: "[NBP] MODELO…", file_kind: "xls", url: null, sort_order: 0 },
  { id: "d-ppa-2", folder_id: "f-ppa", name: "[NBP]…", file_kind: "xls", url: null, sort_order: 1 },
];

export const FILE_META: Record<FileKind, { icon: string; color: string; label: string }> = {
  doc: { icon: "fa-file-word", color: "#7FB6EE", label: "Word" },
  gdoc: { icon: "fa-file-lines", color: "#7FB6EE", label: "Documento" },
  xls: { icon: "fa-file-excel", color: "#5FC7A4", label: "Excel" },
  gsheet: { icon: "fa-table", color: "#5FC7A4", label: "Folha" },
  pdf: { icon: "fa-file-pdf", color: "#E88585", label: "PDF" },
  link: { icon: "fa-link", color: "#C6CABE", label: "Link" },
};

export const planMonths: NbpActionPlanMonth[] = [
  {
    id: "pm-jul",
    user_id: "m-roque",
    year: 2026,
    month: 7,
    mrr: 11200,
    rec: 44100,
    nov: 5,
    act: 22,
    chu: 2.8,
    lea: 241,
    title: "Oferta irresistível",
    subtitle: "Etapa 3 de 9 — fechar a proposta e validar com clientes reais.",
    flag_main: "Concluído",
    flag_prefix: "marco",
    flag_target: "Oferta validada",
    fill_pct: 28,
    tela: [
      { t: "ret", x: 70, y: 60, w: 140, h: 70, c: 0, s: 20 },
      { t: "txt", x: 96, y: 102, txt: "Retenção", c: 0, s: 1 },
    ],
    viewport: { ox: 0, oy: 0, z: 1 },
  },
  {
    id: "pm-aug",
    user_id: "m-roque",
    year: 2026,
    month: 8,
    mrr: 13400,
    rec: 48200,
    nov: 6,
    act: 27,
    chu: 2.4,
    lea: 312,
    title: "Rumo à Escala Previsível",
    subtitle: "Etapa 4 de 9 — da página em branco ao negócio que não depende de si.",
    flag_main: "6 dias",
    flag_prefix: "para",
    flag_target: "Vendas previsíveis",
    fill_pct: 38.4,
    tela: [
      { t: "ret", x: 60, y: 55, w: 150, h: 78, c: 0, s: 12 },
      { t: "txt", x: 84, y: 100, txt: "Oferta 2.400 €", c: 0, s: 1 },
      { t: "set", x: 215, y: 94, w: 90, h: 0, c: 1, s: 33 },
      { t: "eli", x: 315, y: 52, w: 150, h: 86, c: 2, s: 7 },
      { t: "txt", x: 342, y: 100, txt: "2 clientes teste", c: 2, s: 2 },
      { t: "set", x: 135, y: 140, w: 0, h: 60, c: 3, s: 51 },
      { t: "txt", x: 68, y: 228, txt: "se resultar → tabela toda", c: 3, s: 3 },
      { t: "ret", x: 640, y: 70, w: 170, h: 90, c: 4, s: 61 },
      { t: "txt", x: 664, y: 122, txt: "plano B: escalões", c: 4, s: 4 },
    ],
    viewport: { ox: 0, oy: 0, z: 1 },
  },
];

export const planStages: NbpActionPlanStage[] = [
  { id: "s0", month_id: "pm-aug", position: 0, name: "Página em branco", status: "done", subtitle: "01 jul" },
  { id: "s1", month_id: "pm-aug", position: 1, name: "Posicionamento", status: "done", subtitle: "08 jul" },
  { id: "s2", month_id: "pm-aug", position: 2, name: "Oferta irresistível", status: "done", subtitle: "18 jul" },
  { id: "s3", month_id: "pm-aug", position: 3, name: "Aquisição de clientes", status: "current", subtitle: "45%" },
  { id: "s4", month_id: "pm-aug", position: 4, name: "Vendas previsíveis", status: "locked", subtitle: "dia 45" },
  { id: "s5", month_id: "pm-aug", position: 5, name: "Processos", status: "locked", subtitle: "dia 60" },
  { id: "s6", month_id: "pm-aug", position: 6, name: "Equipa", status: "locked", subtitle: "dia 80" },
  { id: "s7", month_id: "pm-aug", position: 7, name: "Delegação", status: "locked", subtitle: "dia 100" },
  { id: "s8", month_id: "pm-aug", position: 8, name: "Escala", status: "locked", subtitle: "continue para descobrir" },
];

export const planObjectives: NbpActionPlanObjective[] = [
  { id: "o1", month_id: "pm-aug", title: "Testar escalão a 2.400 € com dois clientes novos", column: "todo", lesson_id: "m2.4", position: 0 },
  { id: "o2", month_id: "pm-aug", title: "Enviar proposta à Vitor & Filhos", column: "todo", lesson_id: "m4.1", position: 1 },
  { id: "o3", month_id: "pm-aug", title: "Gravar o vídeo de onboarding", column: "none", lesson_id: null, position: 2 },
  { id: "o4", month_id: "pm-aug", title: "Sistema de referências a funcionar", column: "done", lesson_id: "m3.3", position: 3 },
];

export const currentPlan = planMonths.find((m) => m.month === 8)!;

export const sessions: NbpSession[] = [
  { id: "ss9", member_id: "m-roque", consultant_id: "u-marta", session_number: 9, starts_at: "2026-07-08T10:00:00+01:00", duration_min: 45, status: "done", summary: "Diagnóstico do churn e desenho do plano de retenção.", recording_url: null, tasks_count: 4 },
  { id: "ss10", member_id: "m-roque", consultant_id: "u-marta", session_number: 10, starts_at: "2026-07-22T10:00:00+01:00", duration_min: 51, status: "done", summary: null, recording_url: null, tasks_count: 0 },
  { id: "ss11", member_id: "m-roque", consultant_id: "u-marta", session_number: 11, starts_at: "2026-08-05T10:00:00+01:00", duration_min: 38, status: "done", summary: "Contratação do apoio comercial e divisão de tarefas para o mês.", recording_url: null, tasks_count: 2 },
  { id: "ss12", member_id: "m-roque", consultant_id: "u-marta", session_number: 12, starts_at: "2026-08-19T10:00:00+01:00", duration_min: 42, status: "done", summary: "Revisão do escalão a 2.400 €. Ficou decidido testar com dois clientes novos antes de mexer na tabela toda.", recording_url: null, tasks_count: 3 },
  { id: "ss13", member_id: "m-roque", consultant_id: "u-marta", session_number: 13, starts_at: "2026-09-02T10:00:00+01:00", duration_min: 45, status: "scheduled", summary: null, recording_url: null, tasks_count: 0 },
];

export const nextSession = sessions.find((s) => s.status === "scheduled")!;

export const communityPosts: NbpCommunityMessage[] = [
  {
    id: "p1",
    community_id: "nbp",
    author_id: "m-alda",
    parent_id: null,
    title: "Fechei o primeiro cliente a 2.400 €",
    body: "Depois de três semanas a recusar desconto, fechei. O guião de descoberta fez a diferença.",
    created_at: "2026-08-20T09:12:00+01:00",
    updated_at: "2026-08-20T09:12:00+01:00",
  },
  {
    id: "p2",
    community_id: "nbp",
    author_id: "m-tiago",
    parent_id: null,
    title: "Como estão a medir CAC sem ads?",
    body: "Estou só em outbound. Queria um número honesto para o dashboard, mesmo que aproximado.",
    created_at: "2026-08-19T16:40:00+01:00",
    updated_at: "2026-08-19T16:40:00+01:00",
  },
  {
    id: "p3",
    community_id: "nbp",
    author_id: "m-ines",
    parent_id: null,
    title: null,
    body: "Semana pesada mas completei as duas tarefas do plano. O streak ajuda mais do que eu queria admitir.",
    created_at: "2026-08-18T21:05:00+01:00",
    updated_at: "2026-08-18T21:05:00+01:00",
  },
];

/** Comunidade Slack-like (nbp-portal.html). */
export type CommRole = "cliente" | "equipa";
export type CommMessage = [string, string];

export const COMM_GROUP = [
  "metas",
  "nbp-members",
  "off-topic",
  "tutor-conteudo",
  "tutoria-comercial",
  "wins",
] as const;

export const COMM_INT = [
  "int-comercial",
  "int-consultor-gustavo",
  "int-conteudo",
  "int-dados",
  "int-estrategista",
  "int-tecnologia",
  "int-tutor-financeiro",
  "team-availability",
] as const;

const COMM_CONS = [
  "ale-fit",
  "ana-freire",
  "beatriz-santos",
  "caio-carvalho",
  "claudia-salgado",
  "daniel-rocha",
  "hugo-figueiredo",
  "nicole-lopes",
  "sofia-perestrelo",
  "solange-fernandes",
  "tiago-ramos",
];

const COMM_EJO = [
  "adriana-guimaraes",
  "alda-vieira",
  "ana-santos",
  "angela-barreiros",
  "avner-vasconcelos",
  "bia-peixe",
  "carolina-dinis",
  "carolina-landeck",
  "catia-cardoso",
  "cristiana-simoes",
  "estudio-base-2",
  "filipa-serras",
  "giovanna-depaoli",
  "ines-de-castro",
  "joao-maia",
  "joao-rabelo",
  "leonardo-magno",
  "lucas-pereira",
  "luciana-souza",
  "luisa-david",
  "mafalda-vieira",
  "marisa-carlos",
  "marta-pimentel",
  "paula-mendes",
  "performance-agency",
  "rafaela-freire",
  "raqueline-luiza",
  "ricardo-almeida",
  "rodrigo-carvalho",
  "soraia-silva",
  "thiago-amanda",
  "vanessa-silva",
  "vania-fonseca",
  "vitor-hugo",
  "yelizaveta-gomes",
];

const COMM_EGU = [
  "ana-patricia-pinto",
  "andré-oliveira",
  "andreia-gaspar",
  "ângela-ferreira",
  "anna-carolina",
  "carla-moreira",
  "catarina-oliveira",
  "cátia-silva",
  "cristiano-silva",
  "david-rodrigues",
  "fabio-duarte",
  "gabriel-silvério",
  "gios-silva",
  "joana-sequeira",
  "joao-luz",
  "joao-mendes",
  "joao-vitor",
  "mara-silva",
  "margarida-simões",
  "marise-gonçalves",
  "media-braza",
  "miriam-machado",
  "monica-azevedo",
  "sara-seita",
  "stéphanie-lima",
  "susana-carvalheira",
  "thalita-aliani",
  "tuca-meireles",
  "yuri-novaes",
];

/** Canal privado do membro atual (vista Cliente). */
export const COMM_MY_CHANNEL = "ext-roque-buarque";

export type CommSection = {
  id: string;
  color: string;
  name: string;
  channels: string[];
};

export const COMM_SECTIONS_EQUIPA: CommSection[] = [
  { id: "grupo", color: "#8FBEEA", name: "Externos · Grupo", channels: [...COMM_GROUP] },
  { id: "int", color: "#E0AC5E", name: "Internos", channels: [...COMM_INT] },
  {
    id: "cons",
    color: "#A79FEA",
    name: "Consultorias · João",
    channels: COMM_CONS.map((n) => `ext-${n}`),
  },
  {
    id: "ejo",
    color: "#5FC7A4",
    name: "Externos · João",
    channels: COMM_EJO.map((n) => `ext-${n}`),
  },
  {
    id: "egu",
    color: "#5FC7A4",
    name: "Externos · Gustavo",
    channels: COMM_EGU.map((n) => `ext-${n}`),
  },
];

export function commSectionsForRole(role: CommRole): CommSection[] {
  if (role === "equipa") return COMM_SECTIONS_EQUIPA;
  return [
    COMM_SECTIONS_EQUIPA[0],
    { id: "meu", color: "#5FC7A4", name: "O teu canal", channels: [COMM_MY_CHANNEL] },
  ];
}

export const COMM_TOPICS: Record<string, string> = {
  "nbp-members": "Todos os membros do NBP",
  wins: "Publica os teus números. As pequenas contam.",
  metas: "Compromissos do mês, à vista de todos",
  "off-topic": "O que não cabe nos outros",
  "tutor-conteudo": "Dúvidas de conteúdo entre tutorias",
  "tutoria-comercial": "Dúvidas comerciais entre tutorias",
  "team-availability": "Quem está onde e quando",
};

export const COMM_UNREAD_SEED: Record<string, number> = {
  "off-topic": 1,
  "int-conteudo": 1,
  "ext-ana-freire": 1,
  [COMM_MY_CHANNEL]: 2,
};

export const COMM_MESSAGES_SEED: Record<string, CommMessage[]> = {
  wins: [
    ["Ana Freire", "Fechei o terceiro cliente do mês. O escalão novo passou sem uma objeção."],
    ["Rodrigo Carvalho", "Boa. Que preço puseste?"],
    ["Ana Freire", "2.400. Nem pestanejou."],
    ["Marta Pimentel", "É exatamente isto que trabalhámos na tutoria. Bem jogado."],
  ],
  "nbp-members": [
    ["João Mafra", "Bom dia. A tutoria de terça é sobre IA — tragam casos concretos."],
    ["Inês de Castro", "Vou levar o meu fluxo de propostas, está uma confusão."],
  ],
  metas: [
    ["Rodrigo Carvalho", "Agosto: 8 negócios novos e churn abaixo de 2,5%."],
    ["Ana Freire", "Eu vou a 6 novos. Prefiro prometer menos e cumprir."],
  ],
  "off-topic": [["Yuri Novaes", "Alguém vai ao encontro presencial de setembro?"]],
  "tutor-conteudo": [
    ["Gustavo", "Deixo aqui o calendário de conteúdo em branco para preencherem."],
  ],
  "tutoria-comercial": [
    ["João Mafra", "Objeção de preço: não respondam nos primeiros três segundos."],
  ],
  [COMM_MY_CHANNEL]: [
    ["João Mafra", "Roque, deixei-te o quadro de agosto no Plano de Ação."],
    ["João Mafra", "Vê a aula dos escalões antes de falarmos na quarta."],
    ["Tu", "Perfeito, vejo hoje à noite."],
  ],
  "ext-ana-freire": [["João Mafra", "Ana, os números de julho já estão registados?"]],
  "ext-carla-moreira": [["Gustavo", "Carla, a proposta ficou pronta. Revês antes de enviar?"]],
  "int-comercial": [
    ["João Mafra", "Três renovações em risco este mês. Passo a lista ao Gustavo."],
    ["Gustavo", "Manda. Vejo antes das 1:1 de quarta."],
  ],
  "int-conteudo": [["Gustavo", "Calendário de setembro fechado. Falta o vídeo para a terça."]],
  "int-dados": [["Avner Vasconcelos", "Dashboard de churn atualizado com os dados de julho."]],
  "int-estrategista": [["João Mafra", "Proposta de mudar as tutorias para as 19h. Opiniões?"]],
  "int-tecnologia": [
    ["Avner Vasconcelos", "O portal já mostra os resumos das 1:1 automaticamente."],
  ],
  "int-tutor-financeiro": [
    ["Marta Pimentel", "Preparei o exercício de demonstração de resultados."],
  ],
  "int-consultor-gustavo": [["João Mafra", "Gustavo, ficas com os hot seats de outubro?"]],
  "team-availability": [["Gustavo", "Fora na sexta de manhã, volto às 14h."]],
};

export function commInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

export function commAvatarTone(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 16% 30%)`;
}

export function commChannelLabel(id: string) {
  if (!id.startsWith("ext-")) return id;
  return id
    .replace(/^ext-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function commTopicFor(id: string) {
  if (COMM_TOPICS[id]) return COMM_TOPICS[id];
  if (id.startsWith("int-") || id === "team-availability") return "Canal interno";
  if (id === COMM_MY_CHANNEL) return "O teu canal com a equipa NBP";
  if (id.startsWith("ext-")) return `Canal de ${commChannelLabel(id)} com a equipa`;
  return "Canal";
}
export const ranking = [
  { pos: 1, name: "Joana Matos", meta: "Etapa 7 · Equipa", score: "4 820", me: false, top: true },
  { pos: 2, name: "Rui Carvalho", meta: "Etapa 6 · Processos", score: "4 310", me: false, top: true },
  { pos: 3, name: "Ana Ferreira", meta: "Etapa 5 · Vendas previsíveis", score: "3 975", me: false, top: true },
  { pos: 11, name: "Tiago Sousa", meta: "Etapa 4 · Aquisição", score: "2 540", me: false, top: false },
  { pos: 12, name: "Roque Buarque · você", meta: "Etapa 4 · Aquisição", score: "2 480", me: true, top: false },
  { pos: 13, name: "Marta Costa", meta: "Etapa 3 · Oferta", score: "2 390", me: false, top: false },
];

/** Início (platformV2) — stats e conquistas. */
export const homeStats = [
  { icon: "fa-fire", trend: "+3", value: "17", unit: null as string | null, unitPrefix: false, label: "Dias seguidos ativo" },
  { icon: "fa-circle-check", trend: "+12", value: "128", unit: null, unitPrefix: false, label: "Tarefas concluídas" },
  { icon: "fa-bullseye", trend: "+8%", value: "45", unit: "%", unitPrefix: false, label: "Progresso no desafio" },
  { icon: "fa-trophy", trend: "+4", value: "12", unit: "#", unitPrefix: true, label: "Posição no ranking" },
];

export const homeAchievements = [
  {
    icon: "fa-seedling",
    title: "Primeira página escrita",
    desc: "Concluiu o onboarding e definiu a meta.",
    locked: false,
  },
  {
    icon: "fa-bullseye",
    title: "Oferta validada",
    desc: "Fechou os 3 primeiros clientes da nova oferta.",
    locked: false,
  },
  {
    icon: "fa-fire",
    title: "Sequência de 14 dias",
    desc: "Duas semanas seguidas a executar sem parar.",
    locked: false,
  },
  {
    icon: "fa-lock",
    title: "Aquisição previsível",
    desc: "Complete a etapa atual para desbloquear.",
    locked: true,
  },
];

export const homeQuickActions = [
  {
    href: "/app/plano",
    icon: "fa-flag-checkered",
    regular: false,
    title: "Continuar desafio",
    desc: "Abra o plano de ação e a próxima tarefa",
  },
  {
    href: "/app/conteudos",
    icon: "fa-play",
    regular: false,
    title: "Cursos",
    desc: "Aulas gravadas para avançar no desafio",
  },
  {
    href: "/app/calendario",
    icon: "fa-calendar",
    regular: true,
    title: "Agendar sessão",
    desc: "Eventos da comunidade e tutoria",
  },
  {
    href: "#ranking",
    icon: "fa-trophy",
    regular: false,
    title: "Ranking",
    desc: "A sua posição na comunidade",
  },
];

export const homeAudioWeek = {
  title: "Priorize o canal que já converte",
  sub: "Mentor Mafra · Semana 18–24 ago · ~6 min",
  duration: "6:42",
};

/** Perfil (profileV2). */
export const profileFacts = [
  { icon: "fa-flag-checkered", regular: false, label: "Etapa", value: "4 · Aquisição" },
  { icon: "fa-user-tie", regular: false, label: "Consultor", value: "João Mafra" },
  { icon: "fa-calendar-check", regular: true, label: "Membro desde", value: "Out 2025" },
  { icon: "fa-location-dot", regular: false, label: null as string | null, value: "Remoto · GMT-3" },
];

export const profileSession = {
  day: "18",
  month: "Mai",
  starts_at: "2026-05-18T19:00:00+01:00",
  title: "Sessão #09 · Aquisição previsível",
  when_label: "Segunda, 18 Mai · 19:00–20:00",
  place_label: "Online · Google Meet",
  consultant_name: "João Mafra",
  consultant_role: "Seu consultor",
  consultant_initials: "JM",
};

export const profileStats = [
  { icon: "fa-fire", trend: "+3", value: "17", unit: null as string | null, unitPrefix: false, label: "Dias seguidos ativo" },
  { icon: "fa-circle-check", trend: "+12", value: "128", unit: null, unitPrefix: false, label: "Tarefas concluídas" },
  { icon: "fa-bullseye", trend: "+8%", value: "45", unit: "%", unitPrefix: false, label: "Progresso no desafio" },
  { icon: "fa-trophy", trend: "+4", value: "12", unit: "#", unitPrefix: true, label: "Ranking · 2.480 pts" },
];

export const profileActivity = [
  {
    icon: "fa-circle-check",
    regular: false,
    textBefore: "Concluiu a tarefa ",
    bold: "Montar o calendário editorial",
    textAfter: "",
    time: "há 2 horas · Etapa 4 · Aquisição",
  },
  {
    icon: "fa-comment",
    regular: true,
    textBefore: "Comentou no post de ",
    bold: "Joana Matos",
    textAfter: " na comunidade",
    time: "há 5 horas",
  },
  {
    icon: "fa-circle-question",
    regular: true,
    textBefore: "Perguntou ao consultor: ",
    bold: "oferta sem soar forçado?",
    textAfter: "",
    time: "ontem · Plano de ação",
  },
  {
    icon: "fa-play",
    regular: false,
    textBefore: "Concluiu a aula ",
    bold: "Construindo o funil",
    textAfter: "",
    time: "há 3 dias · Cursos",
  },
];

export const profileAchievements = [
  {
    icon: "fa-seedling",
    title: "Primeira página escrita",
    desc: "Concluiu o onboarding e definiu a meta.",
    locked: false,
  },
  {
    icon: "fa-bullseye",
    title: "Oferta validada",
    desc: "Estruturou o Programa Carreira a 1.970 EUR.",
    locked: false,
  },
  {
    icon: "fa-fire",
    title: "Sequência de 14 dias",
    desc: "Duas semanas seguidas a executar sem parar.",
    locked: false,
  },
  {
    icon: "fa-lock",
    title: "Aquisição previsível",
    desc: "Complete a etapa atual para desbloquear.",
    locked: true,
  },
];

export const profileBiz = [
  { dt: "Receita mensal · Abril", dd: "16.430 EUR" },
  { dt: "Ticket médio", dd: "1.970 EUR" },
  { dt: "Margem de lucro", dd: "38%" },
];

export function profileSessionCountdown(iso: string, now = new Date()) {
  const sessionDate = new Date(iso);
  const diffMs = sessionDate.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs <= 0) return "hoje";
  if (days <= 1) return "amanhã";
  return `em ${days} dias`;
}

/** Dashboard — dados alinhados a legacy/dashboardV2.html */
export const dashboardBio =
  "Escola de programação que leva iniciantes do zero ao primeiro emprego. Formação prática em desenvolvimento web, turmas ao vivo, mentoria semanal e projetos reais para portfólio e entrevistas. Oferta âncora: Programa Carreira (1.970 EUR, 6 meses), turmas mensais, foco em transição de carreira.";

export const dashboardMeta = [
  { label: "Consultor", value: "João Mafra" },
  { label: "Empresa", value: "Escola Nova Era Tech · Remoto" },
  { label: "Entrada", value: "Outubro 2025" },
  { label: "Última sessão", value: "04 Maio 2026" },
] as const;

export const dashboardKpis = [
  {
    label: "Receita mensal · Abril",
    value: "16.430",
    unit: "EUR",
    foot: "+239 % · 4.850 → 16.430",
    tone: "up" as const,
  },
  {
    label: "Ticket médio",
    value: "1.970",
    unit: "EUR",
    foot: "+103 % · 970 → 1.970",
    tone: "up" as const,
  },
  {
    label: "LTV",
    value: "3.940",
    unit: "EUR",
    foot: null,
    pill: "meta 3.800 · atingida",
    pillMuted: false,
    tone: "neutral" as const,
  },
  {
    label: "CAC",
    value: "—",
    unit: null,
    foot: null,
    pill: "em apuramento",
    pillMuted: true,
    tone: "neutral" as const,
  },
  {
    label: "Margem de lucro",
    value: "38%",
    unit: null,
    foot: "52 % → 38 % (Abr 26)",
    tone: "down" as const,
  },
];

export const dashboardMetricsEntry = {
  when: "Entrada · Out 2025",
  rows: [
    { dt: "Receita mensal Out (fechado)", dd: "4.850 EUR" },
    { dt: "Ticket médio", dd: "~970 EUR" },
    { dt: "Alunos ativos", dd: "—" },
    { dt: "Matrículas fechadas/mês", dd: "—" },
    { dt: "LTV", dd: "~1.940 EUR (6m)" },
    { dt: "CAC", dd: "—" },
    { dt: "Margem de lucro", dd: "52% (2.522 EUR)" },
  ],
};

export const dashboardMetricsToday = {
  when: "Hoje · Abril 2026 (fechado)",
  rows: [
    { dt: "Receita mensal", dd: "16.430 EUR" },
    { dt: "Ticket médio", dd: "1.970 EUR" },
    { dt: "Alunos ativos", dd: "19" },
    { dt: "Matrículas fechadas/mês", dd: "8", hint: "incluindo 09-Abr e 14-Abr" },
    { dt: "LTV (6 meses + mentoria)", dd: "3.940 EUR" },
    { dt: "CAC", dd: "—" },
    { dt: "Margem de lucro", dd: "38% (6.243 EUR)" },
  ],
};

export const dashboardMilestones = [
  {
    day: "02 Out",
    year: "2025",
    open: false,
    title: "Sessão #01 · Kick-off NBP",
    body: "Diagnóstico da Escola Nova Era Tech: Roque entregava 1:1 e conteúdos soltos. Validar o Programa Carreira como oferta âncora, sair do modo professor-freela e tratar a escola como negócio — turmas, ticket e operação.",
    metric: "4.850",
  },
  {
    day: "03 Nov",
    year: "2025",
    open: true,
    title: "Sessão #02 · Unidade económica modelada",
    body: "Ticket (~970 EUR), LTV a 6 meses, CAC por apurar e tamanho de turma. Meta de novembro: fechar 6 matrículas e deixar de vender aulas avulsas. Margem ainda alta (52%) porque o fundador entrega quase tudo.",
    metric: "4.850",
  },
  {
    day: "28 Nov",
    year: "2025",
    open: false,
    title: "Sessão #03 · Oferta única e turmas mensais",
    body: "Programa Carreira fechado em 6 meses. Fim das mentorias avulsas. Primeiro CRM de matrículas e calendário de turmas. Receita sobe com a turma de novembro — ainda sem canal previsível, mas com oferta clara.",
    metric: "6.420",
  },
  {
    day: "06 Jan",
    year: "2026",
    open: true,
    title: "Sessão #04 · Planeamento 2026",
    body: "Meta anual: 22.000 EUR/mês até setembro. Funil conteúdo → aula aberta → turma. Social selling no LinkedIn e Instagram. Dezembro caiu (5.180) — planear o Q1 para não depender do calendário lectivo.",
    metric: "5.180",
  },
  {
    day: "03 Fev",
    year: "2026",
    open: false,
    title: "Sessão #05 · Sair do operacional",
    body: "Contratar dois tutores para lives e correção de projetos. Roque fica em vendas, currículo e empregabilidade. Ticket sobe para o pack 1.970 EUR. Janeiro fecha 7.900 — primeira prova de que a oferta única converte.",
    metric: "7.900",
  },
  {
    day: "09 Mar",
    year: "2026",
    open: true,
    title: "Sessão #06 · Mentoria de emprego",
    body: "Extensão de 3 meses pós-formação (entrevistas, GitHub, indicação a empresas). LTV passa a 3.940 EUR. Fevereiro em 9.840. Margem comprime com tutores — troca consciente de margem por escala.",
    metric: "9.840",
  },
  {
    day: "13 Abr",
    year: "2026",
    open: false,
    title: "Sessão #07 · Duas turmas em paralelo",
    body: "Onboarding documentado. Março fecha 11.250. Capacidade para 19 alunos ativos sem o fundador nas aulas todas as noites. Próximo gargalo: aquisição previsível (CAC ainda em apuramento).",
    metric: "11.250",
  },
  {
    day: "04 Mai",
    year: "2026",
    open: true,
    title: "Sessão #08 · Snapshot e próximo ciclo",
    body: "Abril fechado em 16.430 EUR, 8 matrículas no mês. Meta NBP 22.000 em setembro. Foco do próximo ciclo: canal de aquisição previsível e medir CAC — a operação já aguenta a escala.",
    metric: "16.430",
  },
];

export const dashboardChartMonths = [
  "Out 25",
  "Nov 25",
  "Dez 25",
  "Jan 26",
  "Fev 26",
  "Mar 26",
  "Abr 26",
  "Mai 26",
  "Jun 26",
  "Jul 26",
  "Ago 26",
  "Set 26",
];
export const dashboardChartRevenue = [4850, 6420, 5180, 7900, 9840, 11250, 16430];
export const dashboardChartProfit = [2522, 3210, 2486, 3555, 4133, 4500, 6243];
export const dashboardChartProfitShow: Record<number, boolean> = {
  0: true,
  5: true,
  6: true,
};
export const dashboardChartGoal = { index: 11, value: 22000 };

export function userById(id: string) {
  return users.find((u) => u.id === id || u.code === id);
}

export function formatEur(n: number) {
  return n.toLocaleString("pt-PT");
}

export function formatTalkDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
}

const LISBON = { timeZone: "Europe/Lisbon" } as const;

export function formatSessionWhen(iso: string) {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("pt-PT", { weekday: "long", ...LISBON });
  const day = d.toLocaleDateString("pt-PT", { day: "numeric", month: "long", ...LISBON });
  const time = d.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    ...LISBON,
  });
  return `${weekday}, ${day} às ${time}`;
}
