"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { SECTORS, members } from "@/lib/mocks";
import type { Sector } from "@/types/database";

export default function MembrosPage() {
  const [q, setQ] = useState("");
  const [setor, setSetor] = useState("");
  const [plan, setPlan] = useState("");

  const rows = useMemo(() => {
    const query = q.toLowerCase().trim();
    return members.filter((m) => {
      if (setor && m.sector !== setor) return false;
      if (plan && m.membership_status !== plan) return false;
      if (!query) return true;
      const blob = [m.full_name, m.email, m.city, m.company, m.sector ? SECTORS[m.sector] : ""]
        .join(" ")
        .toLowerCase();
      return blob.includes(query);
    });
  }, [q, setor, plan]);

  return (
    <>
      <PageHeader
        title="Membros"
        subtitle="Quem entra no portal. Desativar em vez de apagar."
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
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="rounded-[10px] border-[0.5px] border-nbp-bd bg-nbp-sup2 px-3 py-2"
        >
          <option value="">Todos os planos</option>
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
                <th className="px-3 py-2.5 font-medium">Plano</th>
                <th className="px-3 py-2.5 font-medium">Papel</th>
                <th className="px-3 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
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
                  <td className="px-3 py-2.5 text-nbp-tx2">{m.role}</td>
                  <td className="px-3 py-2.5 text-right">
                    <Link href={`/admin/membros/${m.code}`} className="text-nbp-salvia">
                      Ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
