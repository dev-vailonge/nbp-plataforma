import type { ReactNode } from "react";

const sizes = {
  xs: "h-7 w-7 text-[0.65rem]",
  sm: "h-8 w-8 text-[0.7rem]",
  md: "h-[34px] w-[34px] text-[0.75rem]",
  lg: "h-12 w-12 text-[0.9rem]",
  xl: "h-[84px] w-[84px] text-[1.7rem]",
} as const;

const tones = {
  fill: "bg-nbp-fill text-nbp-salvia",
  sage: "bg-[linear-gradient(135deg,#C6C8BA_0%,#4B4C47_100%)] text-nbp-ink shadow-[inset_0_0_0_1px_rgba(253,255,239,0.15)]",
  mentor: "bg-[linear-gradient(135deg,#cbc2a6,#6a6047)] text-nbp-ink",
  violet: "bg-nbp-violet-deep text-nbp-violet-soft",
} as const;

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function Avatar({
  name,
  label,
  size = "md",
  tone = "sage",
  className = "",
  rounded = "full",
}: {
  name?: string;
  label?: string;
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  className?: string;
  rounded?: "full" | "md";
}) {
  const text = label ?? (name ? initialsFrom(name) : "?");
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center font-bold ${
        rounded === "full" ? "rounded-full" : "rounded-[7px]"
      } ${sizes[size]} ${tones[tone]} ${className}`}
      aria-hidden
    >
      {text}
    </span>
  );
}

export function IconWell({
  children,
  className = "",
  locked,
}: {
  children: ReactNode;
  className?: string;
  locked?: boolean;
}) {
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border text-[15px] ${
        locked
          ? "border-nbp-bd bg-[#232320] text-nbp-tx3"
          : "border-nbp-bd2 bg-[linear-gradient(135deg,rgba(198,200,186,0.18),rgba(75,76,71,0.28))] text-nbp-tx"
      } ${className}`}
    >
      {children}
    </span>
  );
}
