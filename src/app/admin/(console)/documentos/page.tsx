"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { DriveBrowser } from "@/components/DriveBrowser";
import { AdminLibrary } from "@/components/AdminLibrary";
import { PageHeader, SectionLabel, fieldControlClass } from "@/components/Panel";
import { api } from "@/lib/api-client";
import { users as mockUsers } from "@/lib/mocks";
import type { NbpUser } from "@/types/database";

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function AdminDocumentosPage() {
  const [members, setMembers] = useState<NbpUser[]>([]);
  const [userId, setUserId] = useState("");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    api<NbpUser[]>("/api/v1/users?role=membro").then((res) => {
      if (cancelled) return;
      const list = "error" in res ? mockUsers.filter((user) => user.role === "membro") : res.data;
      setMembers(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const selected = members.find((member) => member.id === userId) ?? null;
  const matches = useMemo(() => {
    const needle = fold(query.trim());
    if (!needle) return members;
    return members.filter((member) => fold(member.full_name).includes(needle));
  }, [members, query]);

  return (
    <>
      <PageHeader
        title="Documentos"
        subtitle="O padrão é da plataforma. A pesquisa abre a pasta de cada membro."
      />

      <section className="mb-10" aria-label="Padrão da plataforma">
        <SectionLabel>Padrão da plataforma</SectionLabel>
        <p className="mt-0 mb-4 text-[0.88rem] text-nbp-tx2">
          Documentos criados aqui são o modelo universal. Ficam guardados neste browser.
        </p>
        <AdminLibrary />
      </section>

      <section aria-label="Documentos dos membros">
        <SectionLabel>Membros</SectionLabel>
        <p className="mt-0 mb-4 text-[0.88rem] text-nbp-tx2">
          Clica no cartão para ver a lista, ou pesquisa pelo nome. Os documentos aparecem por baixo.
        </p>
        <div ref={menuRef} className="mb-5 max-w-[420px] overflow-hidden rounded-xl border border-nbp-bd bg-nbp-sup">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-3.5 py-3 text-left"
          >
            <span className="min-w-0">
              <span className="block text-[0.68rem] tracking-[0.12em] text-nbp-tx3 uppercase">Membro</span>
              <span className="mt-0.5 block truncate text-[0.95rem] font-medium text-nbp-tx">
                {selected ? selected.full_name : "Escolher membro"}
              </span>
            </span>
            <Fa name={menuOpen ? "fa-chevron-up" : "fa-chevron-down"} />
          </button>
          {menuOpen ? (
            <div className="border-t border-nbp-bd px-2 pt-2 pb-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Pesquisar nome"
                className={fieldControlClass}
                autoFocus
                aria-label="Pesquisar membro"
              />
              <ul className="mt-2 max-h-72 overflow-y-auto overscroll-contain" role="listbox">
                {members.length === 0 ? (
                  <li className="px-3 py-2 text-[0.84rem] text-nbp-tx3">Ainda não há membros.</li>
                ) : matches.length === 0 ? (
                  <li className="px-3 py-2 text-[0.84rem] text-nbp-tx3">Nenhum membro com esse nome.</li>
                ) : (
                  matches.map((member) => (
                    <li key={member.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={member.id === userId}
                        onClick={() => {
                          setUserId(member.id);
                          setMenuOpen(false);
                          setQuery("");
                        }}
                        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border-0 bg-transparent px-3 py-2.5 text-left hover:bg-nbp-sup2"
                      >
                        <span className="truncate text-[0.88rem] text-nbp-tx">{member.full_name}</span>
                        <span className="shrink-0 text-[0.72rem] text-nbp-tx3">
                          {member.drive_folder_id ? "Pasta ligada" : "Sem pasta"}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ) : null}
        </div>
        {selected ? (
          <DriveBrowser
            key={selected.id}
            userId={selected.id}
            emptyHref={`/admin/membros/${selected.id}`}
            emptyTitle={`${selected.full_name} ainda não tem pasta`}
            emptyDescription="Cola o link da pasta do Drive no detalhe deste membro. A navegação passa a ser a árvore dessa pasta."
          />
        ) : (
          <p className="m-0 text-[0.88rem] text-nbp-tx3">Escolhe um membro para ver os documentos dele.</p>
        )}
      </section>
    </>
  );
}
