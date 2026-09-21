import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  /** Salvia fill — default CTA */
  primary:
    "border-nbp-salvia bg-nbp-salvia !text-nbp-ink hover:bg-transparent hover:!text-nbp-salvia",
  /** Cream / text fill — profile & session CTAs */
  solid:
    "border-transparent bg-nbp-tx !text-nbp-ink hover:translate-y-[-1px] hover:shadow-[0_8px_24px_rgba(253,255,239,0.14)]",
  ghost:
    "border-nbp-bd bg-transparent text-nbp-tx2 hover:border-nbp-bd2 hover:text-nbp-tx hover:bg-nbp-sup2",
  outline:
    "border-nbp-bd2 bg-transparent text-nbp-tx hover:bg-[rgba(253,255,239,0.05)]",
  danger:
    "border-transparent bg-[#3a1f1f] text-[#f0b4b4] hover:bg-[#4a2626]",
  violet:
    "border-nbp-violet-bd bg-nbp-violet-deep text-nbp-violet-soft hover:border-nbp-violet",
} as const;

const sizes = {
  sm: "rounded-[10px] px-3 py-[7px] text-[0.82rem]",
  md: "rounded-[10px] px-4 py-2.5 text-[0.86rem]",
  lg: "rounded-[10px] px-5 py-3 text-[0.92rem]",
  pill: "rounded-full px-4 py-2 text-[13px]",
} as const;

type Shared = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
  className?: string;
};

function classes({
  variant = "ghost",
  size = "pill",
  className = "",
}: Omit<Shared, "children">) {
  return `inline-flex cursor-pointer items-center justify-center gap-2 border font-semibold transition ${sizes[size]} ${variants[variant]} ${className}`;
}

export function Button({
  variant = "ghost",
  size = "pill",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & Shared) {
  return (
    <button className={classes({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "ghost",
  size = "pill",
  className = "",
  children,
  external,
}: Shared & { href: string; external?: boolean }) {
  const cls = classes({ variant, size, className });
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
