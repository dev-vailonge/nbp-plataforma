"use client";

import { useState } from "react";
import { Fa } from "@/components/BrandMark";
import { Sidebar } from "@/components/Sidebar";
import type { NavItem } from "@/lib/nav";
import type { NbpUser } from "@/types/database";

export function AppShell({
  variant,
  nav,
  footerNav,
  user,
  planLabel,
  profileHref,
  children,
}: {
  variant: "portal" | "admin";
  nav: NavItem[];
  footerNav?: NavItem[];
  user: NbpUser;
  planLabel: string;
  profileHref?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Fechar menu"
        className={`fixed inset-0 z-[90] bg-black/50 min-[861px]:hidden ${
          open ? "block" : "hidden"
        }`}
        onClick={() => setOpen(false)}
      />
      <div className="min-h-screen p-[22px] max-[860px]:p-0">
        <div className="mx-auto flex min-h-[calc(100vh-44px)] max-w-[1180px] overflow-hidden rounded-[14px] border-[0.5px] border-nbp-bd bg-nbp-sup max-[860px]:min-h-screen max-[860px]:rounded-none max-[860px]:border-0">
          <Sidebar
            variant={variant}
            nav={nav}
            footerNav={footerNav}
            user={user}
            planLabel={planLabel}
            profileHref={profileHref}
            open={open}
            onNavigate={() => setOpen(false)}
          />
          <main className="min-w-0 flex-1 bg-nbp-sup px-6 py-6 max-[860px]:px-[18px] max-[860px]:pt-5 max-[860px]:pb-[60px]">
            <div className="mb-5 hidden max-[860px]:flex">
              <button
                type="button"
                aria-label="Abrir menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-[0.5px] border-nbp-bd bg-nbp-sup2 text-nbp-tx"
                onClick={() => setOpen(true)}
              >
                <Fa name="fa-bars" />
              </button>
            </div>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
