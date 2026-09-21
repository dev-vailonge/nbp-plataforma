import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { Fa } from "@/components/BrandMark";

const surfaces = {
  /** Default elev card (sup2) */
  elev: "border-nbp-bd bg-nbp-sup2",
  /** Flat surface card (sup) — V2 panels */
  card: "border-nbp-bd bg-nbp-sup",
  /** Soft gradient session card */
  session:
    "border-nbp-bd2 bg-[linear-gradient(160deg,rgba(198,200,186,0.10),rgba(24,24,24,0.4))]",
  /** Violet accent strip */
  violet: "border-nbp-violet-bd bg-nbp-violet-deep",
} as const;

const radii = {
  lg: "rounded-[12px]",
  xl: "rounded-[14px]",
  "2xl": "rounded-2xl",
  "3xl": "rounded-[18px]",
} as const;

export function Panel({
  children,
  className = "",
  id,
  surface = "elev",
  padding = "md",
  radius = "lg",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  surface?: keyof typeof surfaces;
  padding?: "sm" | "md" | "lg" | "none";
  radius?: keyof typeof radii;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "id">) {
  const pads = {
    none: "p-0",
    sm: "p-4",
    md: "p-5",
    lg: "px-6 py-[22px]",
  };
  return (
    <section
      id={id}
      className={`${radii[radius]} border-[0.5px] ${surfaces[surface]} ${pads[padding]} ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

/** V2 page title + subtitle (topbar pattern). */
export function PageHeader({
  title,
  subtitle,
  actions,
  className = "",
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-[22px] flex flex-wrap items-start justify-between gap-4 ${className}`}
    >
      <div>
        <h1 className="m-0 text-[1.4rem] font-semibold text-nbp-tx">
          {title}
          {subtitle ? (
            <small className="mt-0.5 block text-[0.8rem] font-normal text-nbp-tx2">
              {subtitle}
            </small>
          ) : null}
        </h1>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`} htmlFor={htmlFor}>
      <span className="text-[0.72rem] tracking-[0.12em] text-nbp-tx3 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

export const fieldControlClass =
  "nbp-focus w-full rounded-[10px] border border-nbp-bd bg-nbp-bg px-3.5 py-3 text-nbp-tx outline-none transition focus:border-nbp-salvia";

/** Uppercase section kicker used across home / lists. */
export function SectionLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-3.5 text-[0.68rem] tracking-[0.16em] text-nbp-tx3 uppercase ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHead({
  title,
  href,
  linkLabel,
  className = "",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={`mb-[18px] flex items-center justify-between gap-3 ${className}`}
    >
      <h3 className="m-0 text-[1.05rem] font-semibold text-nbp-tx">{title}</h3>
      {href && linkLabel ? (
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-[0.8rem] text-nbp-tx2 hover:text-nbp-tx"
        >
          {linkLabel} <Fa name="fa-arrow-right" />
        </Link>
      ) : null}
    </div>
  );
}
