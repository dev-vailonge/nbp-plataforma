"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark, Fa } from "@/components/BrandMark";
import { navIsActive, type NavItem } from "@/lib/nav";
import { initials } from "@/lib/mocks";
import type { NbpUser } from "@/types/database";

export function Sidebar({
  variant,
  nav,
  footerNav = [],
  user,
  planLabel,
  profileHref,
  open,
  onNavigate,
}: {
  variant: "portal" | "admin";
  nav: NavItem[];
  footerNav?: NavItem[];
  user: NbpUser;
  planLabel: string;
  profileHref?: string;
  open: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const width = variant === "admin" ? "w-[214px]" : "w-[200px]";

  return (
    <aside
      className={`${width} relative z-10 flex shrink-0 flex-col bg-nbp-rail p-4 max-[860px]:fixed max-[860px]:inset-y-0 max-[860px]:left-0 max-[860px]:z-[100] max-[860px]:w-[min(280px,86vw)] max-[860px]:transition-transform max-[860px]:duration-300 ${
        open ? "max-[860px]:translate-x-0" : "max-[860px]:-translate-x-full"
      }`}
      aria-label="Navegação"
    >
      <div className="mb-1 flex items-center gap-2.5 px-2 pt-1 pb-4">
        <BrandMark />
        <span className="text-base font-medium tracking-[0.07em]">NBP</span>
      </div>

      {variant === "admin" ? (
        <span className="mb-3.5 ml-2 inline-flex w-fit rounded-full bg-nbp-fill px-2 py-0.5 text-[10px] font-medium tracking-[0.08em] text-nbp-salvia uppercase">
          Backoffice
        </span>
      ) : null}

      {profileHref ? (
        <Link
          href={profileHref}
          onClick={onNavigate}
          className="mb-3.5 flex items-center gap-2.5 rounded-[9px] border-[0.5px] border-nbp-bd bg-nbp-sup2 px-2 py-2.5 transition hover:border-nbp-bd2 hover:bg-[#24231F]"
        >
          <ProfileBlock user={user} planLabel={planLabel} />
        </Link>
      ) : (
        <div className="mb-3.5 flex items-center gap-2.5 rounded-[9px] border-[0.5px] border-nbp-bd bg-nbp-sup2 px-2 py-2.5">
          <ProfileBlock user={user} planLabel={planLabel} />
        </div>
      )}

      <p className="m-0 px-2 pt-1 pb-2 text-[0.62rem] tracking-[0.14em] text-nbp-tx3 uppercase">
        Menu
      </p>
      <nav className="flex flex-col gap-0.5" aria-label="Menu">
        {nav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={navIsActive(pathname, item.href)}
            onClick={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 border-t-[0.5px] border-nbp-bd pt-3">
        {footerNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={navIsActive(pathname, item.href)}
            onClick={onNavigate}
          />
        ))}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-2.5 text-[13.5px] text-nbp-tx2 hover:bg-nbp-sup2 hover:text-nbp-tx"
        >
          <Fa name="fa-arrow-right-from-bracket" className="w-[18px] text-center text-[15px]" />
          <span>Sair</span>
        </Link>
      </div>
    </aside>
  );
}

function ProfileBlock({ user, planLabel }: { user: NbpUser; planLabel: string }) {
  return (
    <>
      <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-nbp-fill text-[0.72rem] font-semibold text-nbp-salvia">
        {initials(user.full_name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[0.82rem] font-medium leading-tight">
          {user.full_name}
        </div>
        <span className="mt-0.5 inline-flex items-center gap-1.5 text-[0.64rem] font-medium tracking-[0.06em] text-nbp-tx3 uppercase before:h-[5px] before:w-[5px] before:rounded-full before:bg-nbp-salvia before:content-['']">
          {planLabel}
        </span>
      </div>
    </>
  );
}

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-2.5 text-[13.5px] leading-snug ${
        active
          ? "bg-nbp-fill text-nbp-tx"
          : "text-nbp-tx2 hover:bg-nbp-sup2 hover:text-nbp-tx"
      }`}
    >
      <Fa
        name={item.icon}
        regular={item.regular}
        className="w-[18px] text-center text-[15px] opacity-90"
      />
      <span>{item.label}</span>
    </Link>
  );
}
