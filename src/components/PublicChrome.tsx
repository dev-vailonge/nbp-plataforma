import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export function PublicTopbar({
  actionHref,
  actionLabel,
}: {
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 border-b border-nbp-bd/80 bg-nbp-bg/86 px-7 py-3.5 backdrop-blur-[18px] max-[680px]:px-4">
      <Link href="/" className="flex items-center gap-2.5" aria-label="No Blank Page">
        <BrandMark size={28} />
        <span className="text-[0.82rem] font-semibold tracking-[0.08em] uppercase max-[680px]:hidden">
          No Blank Page
        </span>
      </Link>
      <Link
        href={actionHref}
        className="inline-flex rounded-full border border-nbp-salvia/30 px-[18px] py-2.5 text-[0.78rem] font-semibold tracking-[0.06em] uppercase transition hover:border-nbp-salvia hover:bg-nbp-salvia/5"
      >
        {actionLabel}
      </Link>
    </header>
  );
}

export function AuthCard({
  title,
  titleStrong,
  description,
  children,
}: {
  title: string;
  titleStrong: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[440px] rounded-[20px] border border-nbp-salvia/25 bg-nbp-sup p-10 shadow-[0_12px_60px_rgba(0,0,0,0.35)] max-[680px]:px-[22px] max-[680px]:py-8">
      <h1 className="mt-0 mb-2.5 text-[1.7rem] font-light tracking-[0.02em] uppercase">
        {title} <strong className="font-bold">{titleStrong}</strong>
      </h1>
      <p className="mt-0 mb-7 text-[0.95rem] leading-relaxed text-nbp-tx2">
        {description}
      </p>
      {children}
    </div>
  );
}
