"use client";

import { useMemo, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { IconWell } from "@/components/Avatar";
import { PageHeader } from "@/components/Panel";
import { EmptyState } from "@/components/ui";
import { FILE_META, documents, folders } from "@/lib/mocks";

function folderItemCount(folderId: string) {
  const childFolders = folders.filter((f) => f.parent_id === folderId).length;
  const childFiles = documents.filter((d) => d.folder_id === folderId).length;
  return childFolders + childFiles;
}

function countLabel(n: number) {
  if (n === 0) return "vazia";
  return n === 1 ? "1 item" : `${n} itens`;
}

export default function DocumentosPage() {
  const [folderId, setFolderId] = useState("f-root");
  const current = folders.find((f) => f.id === folderId)!;
  const isRoot = current.parent_id === null;

  const kids = useMemo(
    () =>
      folders
        .filter((f) => f.parent_id === folderId)
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order),
    [folderId],
  );

  const files = useMemo(
    () =>
      documents
        .filter((d) => d.folder_id === folderId)
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order),
    [folderId],
  );

  const trail = useMemo(() => {
    const path = [current];
    let p = folders.find((f) => f.id === current.parent_id);
    while (p) {
      path.unshift(p);
      p = folders.find((f) => f.id === p!.parent_id);
    }
    return path;
  }, [current]);

  function goBack() {
    setFolderId(current.parent_id ?? "f-root");
  }

  const empty = kids.length === 0 && files.length === 0;

  return (
    <section className="w-full" aria-label="Documentos">
      <PageHeader
        title="Documentos"
        subtitle="Materiais e ficheiros partilhados pelo mentor"
      />

      {isRoot ? (
        <p className="mt-0 mb-[18px] text-[0.88rem] text-nbp-tx2">
          {kids.length} pastas · {files.length} ficheiros soltos
        </p>
      ) : (
        <div className="mb-[18px] flex flex-wrap items-center gap-2 text-[0.88rem]">
          <button
            type="button"
            onClick={goBack}
            aria-label="Voltar"
            className="cursor-pointer border-0 bg-transparent p-0 text-nbp-tx2 hover:text-nbp-tx"
          >
            <Fa name="fa-arrow-left" />
          </button>
          {trail.map((f, i) => {
            const last = i === trail.length - 1;
            return (
              <span key={f.id} className="flex items-center gap-2">
                {i > 0 ? <span className="text-nbp-tx3">/</span> : null}
                {last ? (
                  <span className="text-nbp-tx">{f.name}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFolderId(f.id)}
                    className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-nbp-tx2 hover:text-nbp-tx"
                  >
                    {f.name}
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      {empty ? (
        <EmptyState
          title="Pasta vazia"
          description="Ainda não há ficheiros partilhados aqui."
        />
      ) : (
        <>
          {kids.length > 0 ? (
            <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3">
              {kids.map((f) => {
                const n = folderItemCount(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFolderId(f.id)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-nbp-bd bg-nbp-sup p-3.5 text-left text-nbp-tx transition hover:border-nbp-bd2 hover:bg-nbp-sup2"
                  >
                    <IconWell className="!border-nbp-bd !bg-[rgba(198,200,186,0.08)] text-nbp-salvia">
                      <Fa name="fa-folder" />
                    </IconWell>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9rem] leading-[1.35] font-semibold">
                        {f.name}
                      </span>
                      <span className="mt-0.5 block text-[0.74rem] text-nbp-tx3">
                        {countLabel(n)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {files.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
              {files.map((d) => {
                const meta = FILE_META[d.file_kind];
                return (
                  <article
                    key={d.id}
                    tabIndex={0}
                    role="button"
                    aria-label={d.name}
                    className="cursor-pointer overflow-hidden rounded-xl border border-nbp-bd bg-nbp-sup transition hover:translate-y-[-1px] hover:border-nbp-bd2"
                  >
                    <div className="flex h-[84px] items-center justify-center border-b border-nbp-bd bg-[#1a1a18] text-[28px]">
                      <span style={{ color: meta.color }}>
                        <Fa name={meta.icon} />
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="m-0 line-clamp-2 text-[0.84rem] leading-[1.4] text-nbp-tx">
                        {d.name}
                      </p>
                      <p className="mt-1.5 mb-0 text-[0.72rem] text-nbp-tx3">{meta.label}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
