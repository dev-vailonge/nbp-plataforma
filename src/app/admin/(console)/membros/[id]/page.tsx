"use client";

import { FormEvent, use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fa } from "@/components/BrandMark";
import { Button, ButtonLink } from "@/components/Button";
import { Field, PageHeader, Panel, fieldControlClass } from "@/components/Panel";
import { api } from "@/lib/api-client";
import { SECTORS, userById } from "@/lib/mocks";
import type { MembershipStatus, NbpUser, Sector } from "@/types/database";

export default function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === "novo";
  const existing = useMemo(() => (isNew ? null : userById(id) ?? null), [id, isNew]);

  const [fullName, setFullName] = useState(existing?.full_name ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [company, setCompany] = useState(existing?.company ?? "");
  const [city, setCity] = useState(existing?.city ?? "");
  const [sector, setSector] = useState<Sector | "">(existing?.sector ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [instagram, setInstagram] = useState(existing?.instagram ?? "");
  const [status, setStatus] = useState<MembershipStatus>(
    existing?.membership_status ?? "ativo",
  );
  const [bio, setBio] = useState(existing?.bio ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<NbpUser | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    if (isNew) {
      const res = await api<NbpUser>("/api/v1/users", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName,
          email,
          company: company || null,
          city: city || null,
          sector: sector || null,
          phone: phone || null,
          instagram: instagram || null,
          bio: bio || null,
          membership_status: status,
        }),
      });
      setPending(false);

      if ("error" in res) {
        if (
          res.error.code === "unauthorized" ||
          res.error.code === "forbidden" ||
          res.error.code === "supabase_unconfigured" ||
          res.error.code === "user_not_found"
        ) {
          const mock: NbpUser = {
            id: `m-demo-${Date.now()}`,
            auth_id: null,
            code: `m-${fullName.toLowerCase().replace(/\s+/g, "-").slice(0, 20)}`,
            role: "membro",
            full_name: fullName,
            email,
            company: company || null,
            city: city || null,
            sector: sector || null,
            phone: phone || null,
            instagram: instagram || null,
            bio: bio || null,
            gender: null,
            avatar_url: null,
            membership_status: status,
            consultant_id: null,
            login_streak: 0,
            last_login_on: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCreated(mock);
          return;
        }
        setError(res.error.message);
        return;
      }
      setCreated(res.data);
      return;
    }

    const res = await api<NbpUser>(`/api/v1/users/${existing?.id ?? id}`, {
      method: "PATCH",
      body: JSON.stringify({
        full_name: fullName,
        email,
        company: company || null,
        city: city || null,
        sector: sector || null,
        phone: phone || null,
        instagram: instagram || null,
        bio: bio || null,
        membership_status: status,
      }),
    });
    setPending(false);
    if ("error" in res) {
      setError(res.error.message);
      return;
    }
    router.push("/admin/membros");
    router.refresh();
  }

  if (created) {
    const planHref = `/admin/membros/${created.id}/plano`;
    return (
      <>
        <PageHeader
          title="Membro criado"
          subtitle={
            <Link href="/admin/membros" className="text-nbp-tx2 hover:text-nbp-tx">
              ← Membros
            </Link>
          }
        />
        <Panel surface="card" className="max-w-[560px]">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nbp-fill text-nbp-salvia">
            <Fa name="fa-check" />
          </div>
          <h2 className="mt-0 mb-1 text-[1.2rem] font-semibold text-nbp-tx">
            {created.full_name}
          </h2>
          <p className="mt-0 mb-5 text-[0.9rem] text-nbp-tx2">
            {created.email} · {created.membership_status === "ativo" ? "Ativo" : "Inativo"}
          </p>
          <p className="mt-0 mb-4 text-[0.88rem] text-nbp-tx2">
            Podes ver o plano mensal deste membro e criar o mês em falta a partir daí.
          </p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={planHref} variant="primary" size="md">
              <Fa name="fa-flag-checkered" /> Ver plano
            </ButtonLink>
            <ButtonLink href={`/admin/membros/${created.id}`} variant="outline" size="md">
              Ver detalhes
            </ButtonLink>
            <ButtonLink href="/admin/membros" variant="ghost" size="md">
              Voltar à lista
            </ButtonLink>
          </div>
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={existing ? existing.full_name : "Novo membro"}
        subtitle={
          <Link href="/admin/membros" className="text-nbp-tx2 hover:text-nbp-tx">
            ← Membros
          </Link>
        }
        actions={
          existing ? (
            <ButtonLink
              href={`/admin/membros/${existing.id}/plano`}
              variant="primary"
              size="md"
            >
              Ver plano
            </ButtonLink>
          ) : null
        }
      />
      <Panel>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="n">
            <input
              id="n"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Email" htmlFor="e">
            <input
              id="e"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Empresa" htmlFor="empresa">
            <input
              id="empresa"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Cidade" htmlFor="c">
            <input
              id="c"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Setor" htmlFor="s">
            <select
              id="s"
              value={sector}
              onChange={(e) => setSector(e.target.value as Sector | "")}
              className={fieldControlClass}
            >
              <option value="">—</option>
              {(Object.keys(SECTORS) as Sector[]).map((k) => (
                <option key={k} value={k}>
                  {SECTORS[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Telefone" htmlFor="tel">
            <input
              id="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Instagram" htmlFor="ig">
            <input
              id="ig"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Estado" htmlFor="plan">
            <select
              id="plan"
              value={status}
              onChange={(e) => setStatus(e.target.value as MembershipStatus)}
              className={fieldControlClass}
            >
              <option value="ativo">Membro ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </Field>
          <Field label="Bio" htmlFor="bio" className="sm:col-span-2">
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={fieldControlClass}
            />
          </Field>
          {error ? (
            <p className="m-0 text-sm text-[#e88585] sm:col-span-2">{error}</p>
          ) : null}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? "A guardar…" : isNew ? "Criar membro" : "Guardar"}
            </Button>
            <ButtonLink href="/admin/membros" variant="ghost" size="md">
              Cancelar
            </ButtonLink>
          </div>
        </form>
      </Panel>
    </>
  );
}
