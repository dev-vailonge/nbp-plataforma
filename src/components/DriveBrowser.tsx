"use client";

import { useCallback, useEffect, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { IconWell } from "@/components/Avatar";
import { ButtonLink } from "@/components/Button";
import { EmptyState } from "@/components/ui";
import { api } from "@/lib/api-client";
import type { DriveListing } from "@/lib/drive-folder";
import { FILE_META } from "@/lib/mocks";

export function DriveBrowser({
  userId,
  emptyHref,
  emptyTitle = "Ainda não há pasta do Drive",
  emptyDescription = "Quando a pasta for partilhada, as pastas aparecem aqui. O ficheiro abre no próprio documento.",
}: {
  userId?: string;
  emptyHref?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [listing, setListing] = useState<DriveListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextFolder: string | null) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (userId) params.set("user_id", userId);
    if (nextFolder) params.set("folder_id", nextFolder);
    const query = params.toString();
    const res = await api<DriveListing>(`/api/v1/drive${query ? `?${query}` : ""}`);
    setLoading(false);
    if ("error" in res) {
      setListing(null);
      setError(res.error.message);
      return;
    }
    setListing(res.data);
  }, [userId]);

  useEffect(() => {
    void load(null);
  }, [load]);

  function openFolder(id: string) {
    void load(id);
  }

  if (loading && !listing) {
    return <p className="m-0 text-[0.88rem] text-nbp-tx3">A ler a pasta…</p>;
  }

  if (error) {
    return <p className="m-0 text-sm text-[#e88585]">{error}</p>;
  }

  if (!listing?.linked) {
    return (
      <div>
        <EmptyState title={emptyTitle} description={emptyDescription} />
        {emptyHref ? (
          <div className="mt-4 flex justify-center">
            <ButtonLink href={emptyHref} variant="primary" size="md">
              Partilhar pasta
            </ButtonLink>
          </div>
        ) : null}
      </div>
    );
  }

  const trail = listing.trail;
  const isRoot = listing.folder_id === listing.root_id;
  const parent = trail.length > 1 ? trail[trail.length - 2] : null;
  const empty = listing.folders.length === 0 && listing.files.length === 0;

  return (
    <div className={loading ? "opacity-70" : undefined}>
      {isRoot ? (
        <p className="mt-0 mb-[18px] text-[0.88rem] text-nbp-tx2">
          {listing.folders.length} pastas · {listing.files.length} ficheiros
        </p>
      ) : (
        <div className="mb-[18px] flex flex-wrap items-center gap-2 text-[0.88rem]">
          <button
            type="button"
            onClick={() => parent && openFolder(parent.id)}
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
                    onClick={() => openFolder(f.id)}
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
        <EmptyState title="Pasta vazia" description="Ainda não há ficheiros nesta pasta do Drive." />
      ) : (
        <>
          {listing.folders.length > 0 ? (
            <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3">
              {listing.folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => openFolder(f.id)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-nbp-bd bg-nbp-sup p-3.5 text-left text-nbp-tx transition hover:border-nbp-bd2 hover:bg-nbp-sup2"
                >
                  <IconWell className="!border-nbp-bd !bg-[rgba(198,200,186,0.08)] text-nbp-salvia">
                    <Fa name="fa-folder" />
                  </IconWell>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9rem] leading-[1.35] font-semibold">
                      {f.name}
                    </span>
                    <span className="mt-0.5 block text-[0.74rem] text-nbp-tx3">Pasta</span>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {listing.files.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
              {listing.files.map((d) => {
                const meta = FILE_META[d.file_kind];
                const card = (
                  <>
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
                  </>
                );
                const className =
                  "overflow-hidden rounded-xl border border-nbp-bd bg-nbp-sup text-inherit no-underline transition hover:translate-y-[-1px] hover:border-nbp-bd2";
                if (!d.url) {
                  return (
                    <article key={d.id} className={className}>
                      {card}
                    </article>
                  );
                }
                return (
                  <a
                    key={d.id}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={d.name}
                    className={className}
                  >
                    {card}
                  </a>
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
