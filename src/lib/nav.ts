export type NavItem = {
  href: string;
  label: string;
  icon: string;
  regular?: boolean;
};

export const PORTAL_NAV: NavItem[] = [
  { href: "/app", label: "Início", icon: "fa-house" },
  { href: "/app/plano", label: "Plano de ação", icon: "fa-flag-checkered" },
  { href: "/app/documentos", label: "Documentos", icon: "fa-folder", regular: true },
  { href: "/app/reunioes", label: "Reuniões 1:1", icon: "fa-video" },
  { href: "/app/dashboard", label: "Dashboard", icon: "fa-chart-simple" },
  { href: "/app/conteudos", label: "Cursos", icon: "fa-file-lines", regular: true },
  { href: "/app/talks", label: "Mafra Talks", icon: "fa-microphone-lines" },
  { href: "/app/comunidade", label: "Comunidade", icon: "fa-user-group" },
  { href: "/app/calendario", label: "Calendário", icon: "fa-calendar", regular: true },
];

export const PORTAL_FOOTER_NAV: NavItem[] = [
  { href: "/app/definicoes", label: "Settings", icon: "fa-gear" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Visão geral", icon: "fa-house" },
  { href: "/admin/membros", label: "Membros", icon: "fa-users" },
  { href: "/admin/conteudos", label: "Conteúdos", icon: "fa-file-lines" },
  { href: "/admin/documentos", label: "Documentos", icon: "fa-folder" },
  { href: "/admin/talks", label: "Mafra Talks", icon: "fa-microphone-lines" },
  { href: "/admin/calendario", label: "Calendário", icon: "fa-calendar" },
];

export function navIsActive(pathname: string, href: string) {
  if (href === "/app" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
