import type { ReactNode } from "react";

const tones = {
  sage: "bg-nbp-fill text-nbp-salvia",
  cream: "bg-nbp-cream text-nbp-ink",
  salvia: "bg-nbp-salvia text-nbp-ink",
  muted: "bg-nbp-sup2 text-nbp-tx3",
  violet: "bg-nbp-violet-deep text-nbp-violet-soft",
  warn: "bg-nbp-warn-deep text-nbp-warn",
  info: "bg-nbp-info-deep text-nbp-info",
  success: "bg-[#123028] text-nbp-success",
} as const;

export type PillTone = keyof typeof tones;

export function Pill({
  children,
  tone = "sage",
  className = "",
}: {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Plan / status badge (uppercase, salvia fill). */
export function PlanBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-nbp-salvia px-2.5 py-1 text-[0.64rem] font-semibold tracking-[0.08em] text-nbp-ink uppercase">
      {children}
    </span>
  );
}
