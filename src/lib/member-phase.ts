export const MEMBER_PHASES = [
  "convite_criado",
  "convite_aceito",
  "onboarding_iniciado",
  "onboarding_finalizado",
  "diagnostico",
  "acompanhamento",
  "pausado",
] as const;

export type MemberPhase = (typeof MEMBER_PHASES)[number];

export const PHASE_TRACK = [
  "convite_criado",
  "convite_aceito",
  "onboarding_iniciado",
  "onboarding_finalizado",
  "diagnostico",
  "acompanhamento",
] as const satisfies readonly MemberPhase[];

export const PHASE_LABELS: Record<MemberPhase, string> = {
  convite_criado: "Convite criado",
  convite_aceito: "Convite aceito",
  onboarding_iniciado: "Onboarding iniciado",
  onboarding_finalizado: "Onboarding finalizado",
  diagnostico: "Diagnóstico (primeira call)",
  acompanhamento: "Em acompanhamento",
  pausado: "Pausado",
};

export function isMemberPhase(value: unknown): value is MemberPhase {
  return typeof value === "string" && (MEMBER_PHASES as readonly string[]).includes(value);
}

export function phaseIndex(phase: MemberPhase) {
  if (phase === "pausado") return -1;
  return PHASE_TRACK.indexOf(phase as (typeof PHASE_TRACK)[number]);
}

export function invitePath(token: string) {
  return `/convite/${token}`;
}

export function nextOnboardingPhase(
  current: MemberPhase,
  anyFilled: boolean,
  complete: boolean,
): MemberPhase | null {
  if (!anyFilled) return null;
  if (complete && (current === "convite_aceito" || current === "onboarding_iniciado")) {
    return "onboarding_finalizado";
  }
  if (current === "convite_aceito") return "onboarding_iniciado";
  return null;
}

export function canAdminSetPhase(
  from: MemberPhase,
  to: MemberPhase,
  beforePause: MemberPhase | null,
) {
  if (to === from) return true;
  if (to === "pausado") return from !== "pausado";
  if (from === "pausado") return beforePause != null && to === beforePause;
  if (to === "diagnostico") return from === "onboarding_finalizado";
  if (to === "acompanhamento") return from === "diagnostico";
  return false;
}
