"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { SECTORS, members } from "@/lib/mocks";
import type { Sector } from "@/types/database";

function RowMenu({
  open,
  onToggle,
  onClose,
  detailHref,
  planHref,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  detailHref: string;
  planHref: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        aria-label="Mais opções"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-transparent text-nbp-tx2 hover:border-nbp-bd hover:bg-nbp-sup2 hover:text-nbp-tx"
      >
        <i className="fa-solid fa-ellipsis-vertical" aria-hidden />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 min-w-[160px] overflow-hidden rounded-[10px] border border-nbp-bd bg-nbp-sup2 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        >
          <Link
            role="menuitem"
            href={detailHref}
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 text-[0.84rem] text-nbp-tx hover:bg-nbp-bg"
          >
            <i className="fa-regular fa-user w-4 text-nbp-tx3" aria-hidden />
            Ver detalhes
          </Link>
          <Link
            role="menuitem"
            href={planHref}
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 text-[0.84rem] text-nbp-tx hover:bg-nbp-bg"
          >
            <i className="fa-solid fa-flag-checkered w-4 text-nbp-tx3" aria-hidden />
            Ver plano
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function MembrosPage() {
  const [q, setQ] = useState("");
  const [setor, setSetor] = useState("");
  const [status, setStatus] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;

  const rows = useMemo(() => {
    const query = q.toLowerCase().trim();
    return members.filter((m) => {
      if (setor && m.sector !== setor) return false;
      if (status && m.membership_status !== status) return false;
      if (!query) return true;
      const blob = [m.full_name, m.email, m.city, m.company, m.sector ? SECTORS[m.sector] : ""]
        .join(" ")
        .toLowerCase();
      return blob.includes(query);
    });
  }, [q, setor, status]);

  return (
    <>
      <PageHeader
        title="Membros"
        subtitle="Abre o plano de cada membro para ver ou criar o mês."
        actions={
          <Link
            href="/admin/membros/novo"
            className="inline-flex items-center gap-2 rounded-full border border-nbp-salvia bg-nbp-salvia px-4 py-2.5 text-[13px] font-medium text-nbp-bg"
          >
            <i className="fa-solid fa-plus" aria-hidden /> Novo membro
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nome, email, cidade…"
          className="min-w-[200px] flex-1 rounded-[10px] border-[0.5px] border-nbp-bd bg-nbp-sup2 px-3 py-2"
        />
        <select
          value={setor}
          onChange={(e) => setSetor(e.target.value)}
          className="rounded-[10px] border-[0.5px] border-nbp-bd bg-nbp-sup2 px-3 py-2"
        >
          <option value="">Todos os setores</option>
          {(Object.keys(SECTORS) as Sector[]).map((k) => (
            <option key={k} value={k}>
              {SECTORS[k]}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-[10px] border-[0.5px] border-nbp-bd bg-nbp-sup2 px-3 py-2"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Membro ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
      {rows.length === 0 ? (
        <p className="text-nbp-tx2">Nenhum membro com estes filtros.</p>
      ) : (
        <div className="overflow-x-auto rounded-[12px] border-[0.5px] border-nbp-bd">
          <table className="w-full border-collapse text-left text-[0.88rem]">
            <thead className="bg-nbp-sup2 text-[0.72rem] tracking-[0.08em] text-nbp-tx3 uppercase">
              <tr>
                <th className="px-3 py-2.5 font-medium">Nome</th>
                <th className="px-3 py-2.5 font-medium">Cidade</th>
                <th className="px-3 py-2.5 font-medium">Setor</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const key = m.code || m.id;
                return (
                  <tr key={m.id} className="border-t-[0.5px] border-nbp-bd">
                    <td className="px-3 py-2.5">
                      <div className="font-medium">{m.full_name}</div>
                      <div className="text-[0.75rem] text-nbp-tx3">{m.email}</div>
                    </td>
                    <td className="px-3 py-2.5 text-nbp-tx2">{m.city}</td>
                    <td className="px-3 py-2.5 text-nbp-tx2">
                      {m.sector ? SECTORS[m.sector] : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <Pill tone={m.membership_status === "ativo" ? "sage" : "muted"}>
                        {m.membership_status === "ativo" ? "Ativo" : "Inativo"}
                      </Pill>
                    </td>
                    <td className="px-3 py-2.5">
                      <RowMenu
                        open={menuId === m.id}
                        onToggle={() =>
                          setMenuId((cur) => (cur === m.id ? null : m.id))
                        }
                        onClose={() => setMenuId(null)}
                        detailHref={`/admin/membros/${key}`}
                        planHref={`/admin/membros/${key}/plano?ano=${curYear}&mes=${curMonth}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
