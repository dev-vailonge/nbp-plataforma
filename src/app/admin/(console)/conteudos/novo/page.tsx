"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Fa } from "@/components/BrandMark";
import { Button, ButtonLink } from "@/components/Button";
import { Field, PageHeader, fieldControlClass } from "@/components/Panel";
import { api } from "@/lib/api-client";
import type { NbpCourse } from "@/types/database";

export default function NovoCursoPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await api<NbpCourse>("/api/v1/courses", {
      method: "POST",
      body: JSON.stringify({
        title,
        subtitle: subtitle || null,
        cover_url: coverUrl || null,
        kind: "formacao",
      }),
    });
    setPending(false);
    if ("error" in res) {
      setError(res.error.message);
      return;
    }
    router.push(`/admin/conteudos/${res.data.id}`);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="Novo curso"
        subtitle="Nome, descrição e imagem de capa."
        actions={
          <ButtonLink href="/admin/conteudos" variant="ghost" size="md">
            <Fa name="fa-arrow-left" /> Voltar
          </ButtonLink>
        }
      />

      <form onSubmit={onSubmit} className="mx-auto flex max-w-[560px] flex-col gap-4">
        <Field label="Nome" htmlFor="title">
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldControlClass}
            placeholder="Ex. Formação NBP"
          />
        </Field>
        <Field label="Descrição" htmlFor="subtitle">
          <textarea
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={4}
            className={`${fieldControlClass} min-h-[100px] resize-y`}
            placeholder="Breve descrição do curso"
          />
        </Field>
        <Field label="Imagem de capa (URL)" htmlFor="cover">
          <input
            id="cover"
            type="url"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className={fieldControlClass}
            placeholder="https://…"
          />
        </Field>
        {coverUrl ? (
          <div className="overflow-hidden rounded-[12px] border border-nbp-bd">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="" className="h-[160px] w-full object-cover" />
          </div>
        ) : null}
        {error ? <p className="m-0 text-sm text-[#e88585]">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? "A criar…" : "Criar curso"}
          </Button>
          <ButtonLink href="/admin/conteudos" variant="ghost" size="md">
            Cancelar
          </ButtonLink>
        </div>
      </form>
    </>
  );
}
