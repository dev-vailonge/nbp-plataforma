"use client";

import { FormEvent, use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fa } from "@/components/BrandMark";
import { Button, ButtonLink } from "@/components/Button";
import { DriveBrowser } from "@/components/DriveBrowser";
import { MemberJourney } from "@/components/MemberJourney";
import { MemberOnboarding } from "@/components/MemberOnboarding";
import { Field, PageHeader, Panel, fieldControlClass } from "@/components/Panel";
import { EmptyState } from "@/components/ui";
import { api } from "@/lib/api-client";
import { driveFolderUrl, parseDriveFolderId } from "@/lib/drive-folder";
import { invitePath, type MemberPhase } from "@/lib/member-phase";
import { SECTORS, userById } from "@/lib/mocks";
import type { NbpUser, Sector } from "@/types/database";

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
  const [bio, setBio] = useState(existing?.bio ?? "");
  const [phase, setPhase] = useState<MemberPhase>(existing?.phase ?? "convite_criado");
  const [inviteToken, setInviteToken] = useState<string | null>(existing?.invite_token ?? null);
  const [phaseBeforePause, setPhaseBeforePause] = useState<MemberPhase | null>(
    existing?.phase_before_pause ?? null,
  );
  const [driveUrl, setDriveUrl] = useState(
    existing?.drive_folder_id ? driveFolderUrl(existing.drive_folder_id) : "",
  );
  const [savedDriveId, setSavedDriveId] = useState<string | null>(
    existing?.drive_folder_id ?? null,
  );
  const [memberId, setMemberId] = useState(existing?.id ?? "");
  const [drivePending, setDrivePending] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<NbpUser | null>(null);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    api<NbpUser>(`/api/v1/users/${id}`).then((res) => {
      if (cancelled || "error" in res) return;
      const u = res.data;
      setFullName(u.full_name);
      setEmail(u.email);
      setCompany(u.company ?? "");
      setCity(u.city ?? "");
      setSector(u.sector ?? "");
      setPhone(u.phone ?? "");
      setInstagram(u.instagram ?? "");
      setBio(u.bio ?? "");
      setPhase(u.phase);
      setInviteToken(u.invite_token);
      setPhaseBeforePause(u.phase_before_pause);
      setMemberId(u.id);
      setSavedDriveId(u.drive_folder_id);
      setDriveUrl(u.drive_folder_id ? driveFolderUrl(u.drive_folder_id) : "");
    });
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  function drivePayload() {
    const trimmed = driveUrl.trim();
    if (!trimmed) return { ok: true as const, id: null };
    const folderId = parseDriveFolderId(trimmed);
    if (!folderId) return { ok: false as const, id: null };
    return { ok: true as const, id: folderId };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    let driveId: string | null = null;
    if (isNew) {
      const drive = drivePayload();
      if (!drive.ok) {
        setError("Cola o link da pasta do Google Drive.");
        return;
      }
      driveId = drive.id;
    }
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
          drive_folder_id: driveId,
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
            membership_status: "ativo",
            phase: "convite_criado",
            phase_before_pause: null,
            invite_token: `demo-${Date.now().toString(36)}`,
            consultant_id: null,
            drive_folder_id: driveId,
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

  async function onSaveDrive(e: FormEvent) {
    e.preventDefault();
    setDriveError(null);
    const drive = drivePayload();
    if (!drive.ok) {
      setDriveError("Cola o link da pasta do Google Drive.");
      return;
    }
    const target = memberId || existing?.id || id;
    setDrivePending(true);
    const res = await api<NbpUser>(`/api/v1/users/${target}`, {
      method: "PATCH",
      body: JSON.stringify({ drive_folder_id: drive.id }),
    });
    setDrivePending(false);
    if ("error" in res) {
      setDriveError(res.error.message);
      return;
    }
    setMemberId(res.data.id);
    setSavedDriveId(res.data.drive_folder_id);
    setDriveUrl(res.data.drive_folder_id ? driveFolderUrl(res.data.drive_folder_id) : "");
  }

  const draftDriveId = parseDriveFolderId(driveUrl);
  const driveDirty = (draftDriveId ?? null) !== savedDriveId;

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
            {created.email} · Convite criado
          </p>
          {created.invite_token ? (
            <p className="mt-0 mb-4 break-all text-[0.88rem] text-nbp-tx2">
              Envia este link para a pessoa criar a palavra-passe:{" "}
              <span className="text-nbp-tx">
                {window.location.origin}
                {invitePath(created.invite_token)}
              </span>
            </p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2">
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
        title={isNew ? "Novo membro" : fullName || existing?.full_name || "Membro"}
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
      <div className="flex flex-col gap-4">
      {!isNew ? (
        <MemberJourney
          userId={memberId || existing?.id || id}
          phase={phase}
          inviteToken={inviteToken}
          phaseBeforePause={phaseBeforePause}
          onChange={(user) => {
            setMemberId(user.id);
            setPhase(user.phase);
            setInviteToken(user.invite_token);
            setPhaseBeforePause(user.phase_before_pause);
          }}
        />
      ) : null}
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
          {isNew ? (
            <Field label="Pasta do Drive" htmlFor="drive" className="sm:col-span-2">
              <input
                id="drive"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/…"
                className={fieldControlClass}
              />
              <span className="mt-1.5 block text-[0.78rem] text-nbp-tx3">
                Opcional. Depois de criar o membro, a navegação da pasta aparece neste detalhe.
              </span>
            </Field>
          ) : null}
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
          <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
            <Button variant="primary" type="submit" disabled={pending}>
              {pending ? "A guardar…" : isNew ? "Criar membro" : "Guardar"}
            </Button>
            <ButtonLink href="/admin/membros" variant="ghost" size="md">
              Cancelar
            </ButtonLink>
          </div>
        </form>
      </Panel>
      {!isNew ? (
        <section className="overflow-hidden rounded-[12px] border-[0.5px] border-nbp-bd bg-nbp-sup">
          <div className="border-b border-nbp-bd px-5 py-4">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-nbp-bd bg-[rgba(198,200,186,0.08)] text-nbp-salvia">
                <Fa name="fa-folder" />
              </span>
              <div>
                <h2 className="m-0 text-[1rem] font-semibold text-nbp-tx">Documentos</h2>
                <p className="mt-0.5 mb-0 text-[0.8rem] leading-snug text-nbp-tx2">
                  Liga a pasta do Drive. A vista em baixo é a mesma navegação do portal.
                </p>
              </div>
            </div>
            <form onSubmit={onSaveDrive} className="flex flex-col gap-2">
              <input
                id="drive-live"
                aria-label="Link da pasta do Drive"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/…"
                className={fieldControlClass}
              />
              <div className="flex justify-end">
                <Button variant="primary" type="submit" disabled={drivePending || !driveDirty}>
                  {drivePending ? "A ligar…" : savedDriveId ? "Atualizar pasta" : "Ligar pasta"}
                </Button>
              </div>
            </form>
            {driveError ? (
              <p className="mt-2 mb-0 text-sm text-[#e88585]">{driveError}</p>
            ) : driveDirty && savedDriveId ? (
              <p className="mt-2 mb-0 text-[0.78rem] text-nbp-tx3">
                A vista ainda mostra a pasta ligada. Atualiza para a substituir.
              </p>
            ) : null}
          </div>
          <div className="bg-nbp-bg px-5 py-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="m-0 text-[0.68rem] tracking-[0.16em] text-nbp-tx3 uppercase">
                Vista do membro
              </p>
              <span
                className={`rounded-full border px-2 py-0.5 text-[0.68rem] tracking-[0.08em] uppercase ${
                  savedDriveId
                    ? "border-nbp-bd2 text-nbp-salvia"
                    : "border-nbp-bd text-nbp-tx3"
                }`}
              >
                {savedDriveId ? "Portal" : "Por ligar"}
              </span>
            </div>
            {savedDriveId ? (
              <DriveBrowser
                key={savedDriveId}
                userId={memberId || existing?.id || id}
                emptyTitle="Pasta vazia"
                emptyDescription="Ainda não há ficheiros nesta pasta do Drive."
              />
            ) : (
              <EmptyState
                title="Sem pasta ligada"
                description="Cola o link e liga a pasta. As pastas e os ficheiros aparecem aqui, e o documento abre no Drive."
              />
            )}
          </div>
        </section>
      ) : null}
      {!isNew ? <MemberOnboarding userId={memberId || existing?.id || id} /> : null}
      </div>
    </>
  );
}
