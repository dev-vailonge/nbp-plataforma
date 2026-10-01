"use client";

import { useEffect, useState } from "react";
import { DriveBrowser } from "@/components/DriveBrowser";
import { PageHeader, fieldControlClass } from "@/components/Panel";
import { api } from "@/lib/api-client";
import { users as mockUsers } from "@/lib/mocks";
import type { NbpUser } from "@/types/database";

export default function AdminDocumentosPage() {
  const [members, setMembers] = useState<NbpUser[]>([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<NbpUser[]>("/api/v1/users?role=membro").then((res) => {
      if (cancelled) return;
      const list = "error" in res ? mockUsers.filter((u) => u.role === "membro") : res.data;
      setMembers(list);
      setUserId((current) => current || list[0]?.id || "");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = members.find((m) => m.id === userId) ?? null;

  return (
    <>
      <PageHeader
        title="Documentos"
        subtitle="Cada membro lê a pasta do Drive partilhada no detalhe dele. Aqui vês a mesma árvore."
      />
      <label className="mb-5 flex max-w-[420px] flex-col gap-1.5 text-[0.82rem] text-nbp-tx2">
        Membro
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className={fieldControlClass}
        >
          {members.length === 0 ? <option value="">Sem membros</option> : null}
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name}
              {m.drive_folder_id ? "" : " · sem pasta"}
            </option>
          ))}
        </select>
      </label>
      {selected ? (
        <DriveBrowser
          key={selected.id}
          userId={selected.id}
          emptyHref={`/admin/membros/${selected.id}`}
          emptyTitle={`${selected.full_name} ainda não tem pasta`}
          emptyDescription="Cola o link da pasta do Drive no detalhe deste membro. A navegação passa a ser a árvore dessa pasta."
        />
      ) : null}
    </>
  );
}
