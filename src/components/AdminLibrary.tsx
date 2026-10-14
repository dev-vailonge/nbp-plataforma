"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { IconWell } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Field, Panel, fieldControlClass } from "@/components/Panel";
import { EmptyState } from "@/components/ui";
import { documents as seedDocuments, FILE_META, folders as seedFolders } from "@/lib/mocks";
import type { FileKind, NbpDocument, NbpFolder } from "@/types/database";

const STORAGE_KEY = "nbp-admin-library-v1";
const ROOT_ID = "f-root";

type Library = {
  folders: NbpFolder[];
  documents: NbpDocument[];
};

function seedLibrary(): Library {
  return {
    folders: seedFolders.map((folder) => ({
      ...folder,
      user_id: "plataforma",
      name: folder.id === ROOT_ID ? "Biblioteca NBP" : folder.name,
    })),
    documents: seedDocuments.map((doc) => ({ ...doc })),
  };
}

function parseLibrary(raw: string | null): Library {
  if (!raw) return seedLibrary();
  try {
    const parsed = JSON.parse(raw) as Partial<Library>;
    if (!Array.isArray(parsed.folders) || !Array.isArray(parsed.documents)) return seedLibrary();
    return { folders: parsed.folders, documents: parsed.documents };
  } catch {
    return seedLibrary();
  }
}

export function AdminLibrary() {
  const [library, setLibrary] = useState<Library>(seedLibrary);
  const [ready, setReady] = useState(false);
  const [currentId, setCurrentId] = useState(ROOT_ID);
  const [folderName, setFolderName] = useState("");
  const [folderOpen, setFolderOpen] = useState(false);
  const fileRail = useRef<HTMLDivElement>(null);
  const [fileEdges, setFileEdges] = useState({ left: false, right: false });
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileKind, setFileKind] = useState<FileKind>("link");

  useEffect(() => {
    setLibrary(parseLibrary(localStorage.getItem(STORAGE_KEY)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }, [library, ready]);

  const trail = useMemo(() => {
    const crumbs: NbpFolder[] = [];
    let cursor = library.folders.find((folder) => folder.id === currentId) ?? null;
    const guard = new Set<string>();
    while (cursor && !guard.has(cursor.id)) {
      guard.add(cursor.id);
      crumbs.unshift(cursor);
      cursor = cursor.parent_id
        ? library.folders.find((folder) => folder.id === cursor?.parent_id) ?? null
        : null;
    }
    return crumbs;
  }, [library.folders, currentId]);

  const childFolders = library.folders
    .filter((folder) => folder.parent_id === currentId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  const childFiles = library.documents
    .filter((doc) => doc.folder_id === currentId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  function addFolder() {
    const name = folderName.trim();
    if (!name) return;
    const folder: NbpFolder = {
      id: `f-${Date.now().toString(36)}`,
      user_id: "plataforma",
      parent_id: currentId,
      name,
      sort_order: childFolders.length,
    };
    setLibrary((current) => ({ ...current, folders: [...current.folders, folder] }));
    setFolderName("");
    setFolderOpen(false);
  }

  function closeFolder() {
    setFolderOpen(false);
    setFolderName("");
  }

  function addFile() {
    const name = fileName.trim();
    if (!name) return;
    const doc: NbpDocument = {
      id: `d-${Date.now().toString(36)}`,
      folder_id: currentId,
      name,
      file_kind: fileKind,
      url: fileUrl.trim() || null,
      sort_order: childFiles.length,
    };
    setLibrary((current) => ({ ...current, documents: [...current.documents, doc] }));
    setFileName("");
    setFileUrl("");
  }

  function removeFolder(id: string) {
    const hasChildren =
      library.folders.some((folder) => folder.parent_id === id) ||
      library.documents.some((doc) => doc.folder_id === id);
    if (hasChildren) return;
    setLibrary((current) => ({
      ...current,
      folders: current.folders.filter((folder) => folder.id !== id),
    }));
  }

  function removeFile(id: string) {
    setLibrary((current) => ({
      ...current,
      documents: current.documents.filter((doc) => doc.id !== id),
    }));
  }

  function syncFileRail() {
    const rail = fileRail.current;
    if (!rail) return;
    setFileEdges({
      left: rail.scrollLeft > 4,
      right: rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4,
    });
  }

  function slideFiles(direction: -1 | 1) {
    const rail = fileRail.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(rail.clientWidth - 48, 180), behavior: "smooth" });
  }

  useEffect(() => {
    const rail = fileRail.current;
    if (rail) rail.scrollTo({ left: 0 });
    syncFileRail();
  }, [currentId, childFiles.length]);

  useEffect(() => {
    if (!folderOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setFolderOpen(false);
      setFolderName("");
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [folderOpen]);

  const parent = trail.length > 1 ? trail[trail.length - 2] : null;

  function folderSummary(id: string) {
    const nested = library.folders.filter((folder) => folder.parent_id === id).length;
    const files = library.documents.filter((doc) => doc.folder_id === id).length;
    if (nested === 0 && files === 0) return "Vazia";
    const parts: string[] = [];
    if (nested > 0) parts.push(nested === 1 ? "1 pasta" : `${nested} pastas`);
    if (files > 0) parts.push(files === 1 ? "1 documento" : `${files} documentos`);
    return parts.join(" · ");
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[0.88rem]">
        {parent ? (
          <button
            type="button"
            onClick={() => setCurrentId(parent.id)}
            aria-label="Voltar"
            className="cursor-pointer border-0 bg-transparent p-0 text-nbp-tx2 hover:text-nbp-tx"
          >
            <Fa name="fa-arrow-left" />
          </button>
        ) : null}
        {trail.map((folder, index) => {
          const last = index === trail.length - 1;
          return (
            <span key={folder.id} className="flex items-center gap-2">
              {index > 0 ? <span className="text-nbp-tx3">/</span> : null}
              {last ? (
                <span className="text-nbp-tx">{folder.name}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentId(folder.id)}
                  className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-nbp-tx2 hover:text-nbp-tx"
                >
                  {folder.name}
                </button>
              )}
            </span>
          );
        })}
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="m-0 text-[0.68rem] tracking-[0.16em] text-nbp-tx3 uppercase">Pastas</p>
        <Button variant="ghost" size="pill" type="button" onClick={() => setFolderOpen(true)}>
          <Fa name="fa-plus" /> Nova pasta
        </Button>
      </div>
      {childFolders.length === 0 ? (
        <p className="mt-0 mb-6 text-[0.86rem] text-nbp-tx3">Ainda não há pastas aqui.</p>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {childFolders.map((folder) => {
            const empty =
              !library.folders.some((item) => item.parent_id === folder.id) &&
              !library.documents.some((doc) => doc.folder_id === folder.id);
            return (
              <div
                key={folder.id}
                className="flex items-center gap-3 rounded-xl border border-nbp-bd bg-nbp-sup p-3.5"
              >
                <button
                  type="button"
                  onClick={() => setCurrentId(folder.id)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left text-nbp-tx"
                >
                  <IconWell className="!border-nbp-bd !bg-[rgba(198,200,186,0.08)] text-nbp-salvia">
                    <Fa name="fa-folder" />
                  </IconWell>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9rem] font-semibold">{folder.name}</span>
                    <span className="mt-0.5 block text-[0.74rem] text-nbp-tx3">{folderSummary(folder.id)}</span>
                  </span>
                </button>
                {empty ? (
                  <button
                    type="button"
                    aria-label={`Remover ${folder.name}`}
                    onClick={() => removeFolder(folder.id)}
                    className="cursor-pointer border-0 bg-transparent p-1 text-nbp-tx3 hover:text-nbp-tx"
                  >
                    <Fa name="fa-xmark" />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-0 mb-3 text-[0.68rem] tracking-[0.16em] text-nbp-tx3 uppercase">Documentos</p>
      {childFiles.length === 0 ? (
        <EmptyState
          title="Sem documentos"
          description="Adiciona um nome e um link no painel abaixo. O cartão abre esse endereço."
        />
      ) : (
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            aria-label="Documentos à esquerda"
            disabled={!fileEdges.left}
            onClick={() => slideFiles(-1)}
            className="shrink-0 disabled:cursor-default disabled:opacity-35"
          >
            <Fa name="fa-chevron-left" />
          </Button>
          <div
            ref={fileRail}
            onScroll={syncFileRail}
            className="flex min-w-0 flex-1 gap-3 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {childFiles.map((doc) => {
              const meta = FILE_META[doc.file_kind];
              const body = (
                <>
                  <div className="flex h-[72px] items-center justify-center border-b border-nbp-bd bg-[#1a1a18] text-[26px]">
                    <span style={{ color: meta.color }}>
                      <Fa name={meta.icon} />
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="m-0 line-clamp-2 min-h-[2.4em] text-[0.84rem] leading-[1.4] text-nbp-tx">{doc.name}</p>
                    <p className="mt-1.5 mb-0 text-[0.72rem] text-nbp-tx3">{meta.label}</p>
                  </div>
                </>
              );
              return (
                <article key={doc.id} className="w-[176px] shrink-0 overflow-hidden rounded-xl border border-nbp-bd bg-nbp-sup">
                  {doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block text-inherit no-underline">
                      {body}
                    </a>
                  ) : (
                    body
                  )}
                  <div className="border-t border-nbp-bd px-3 py-2">
                    <button
                      type="button"
                      onClick={() => removeFile(doc.id)}
                      className="cursor-pointer border-0 bg-transparent p-0 text-[0.75rem] text-nbp-tx3 hover:text-nbp-tx"
                    >
                      Remover
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            aria-label="Documentos à direita"
            disabled={!fileEdges.right}
            onClick={() => slideFiles(1)}
            className="shrink-0 disabled:cursor-default disabled:opacity-35"
          >
            <Fa name="fa-chevron-right" />
          </Button>
        </div>
      )}

      <Panel className="mt-2">
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            addFile();
          }}
        >
          <Field label="Novo documento" htmlFor="file-name">
            <input
              id="file-name"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder="Nome"
              className={fieldControlClass}
            />
          </Field>
          <Field label="Link" htmlFor="file-url">
            <input
              id="file-url"
              value={fileUrl}
              onChange={(event) => setFileUrl(event.target.value)}
              placeholder="https://"
              className={fieldControlClass}
            />
          </Field>
          <Field label="Tipo" htmlFor="file-kind">
            <select
              id="file-kind"
              value={fileKind}
              onChange={(event) => setFileKind(event.target.value as FileKind)}
              className={fieldControlClass}
            >
              {(Object.keys(FILE_META) as FileKind[]).map((value) => (
                <option key={value} value={value}>
                  {FILE_META[value].label}
                </option>
              ))}
            </select>
          </Field>
          <Button variant="primary" type="submit">
            <Fa name="fa-plus" /> Adicionar
          </Button>
        </form>
        <p className="mt-4 mb-0 text-[0.78rem] text-nbp-tx3">
          Esta biblioteca é da plataforma e fica guardada neste browser. Uma pasta só se remove
          quando está vazia.
        </p>
      </Panel>

      {folderOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={closeFolder}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-folder-title"
            className="w-full max-w-[420px] rounded-[14px] border border-nbp-bd bg-nbp-sup p-5 shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id="admin-folder-title" className="m-0 text-[1.05rem] font-semibold text-nbp-tx">
                Nova pasta
              </h2>
              <button
                type="button"
                aria-label="Fechar"
                onClick={closeFolder}
                className="cursor-pointer border-0 bg-transparent p-1 text-nbp-tx3 hover:text-nbp-tx"
              >
                <Fa name="fa-xmark" />
              </button>
            </div>
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                addFolder();
              }}
            >
              <Field label="Nome" htmlFor="folder-name">
                <input
                  id="folder-name"
                  value={folderName}
                  onChange={(event) => setFolderName(event.target.value)}
                  placeholder="Nome da pasta"
                  className={fieldControlClass}
                  autoFocus
                  required
                />
              </Field>
              <div className="mt-1 flex flex-wrap gap-2">
                <Button variant="primary" type="submit">
                  Criar pasta
                </Button>
                <Button variant="ghost" type="button" onClick={closeFolder}>
                  Fechar
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
