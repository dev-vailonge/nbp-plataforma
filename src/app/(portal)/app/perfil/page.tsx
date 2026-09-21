"use client";

import { useMemo } from "react";
import { Fa } from "@/components/BrandMark";
import { Avatar, IconWell } from "@/components/Avatar";
import { Button, ButtonLink } from "@/components/Button";
import { PageHeader, Panel, PanelHead } from "@/components/Panel";
import { PlanBadge } from "@/components/Pill";
import { ProgressBar } from "@/components/ui";
import {
  currentMember,
  currentPlan,
  profileAchievements,
  profileActivity,
  profileBiz,
  profileFacts,
  profileSession,
  profileSessionCountdown,
  profileStats,
} from "@/lib/mocks";

export default function PerfilPage() {
  const handle = currentMember.instagram?.split("/").pop() ?? "roquebuarque";
  const countdown = useMemo(
    () => profileSessionCountdown(profileSession.starts_at),
    [],
  );

  return (
    <section className="w-full" aria-label="Perfil">
      <PageHeader title="Perfil" subtitle="A sua identidade, progresso e próximos passos na No Blank Page." />

      <section className="mb-5 grid grid-cols-1 gap-5 min-[1081px]:grid-cols-[minmax(0,1fr)_320px]">
        <Panel surface="card" radius="3xl" padding="none" className="px-7 py-[26px] max-[520px]:px-5">
          <div className="flex gap-5 max-[520px]:flex-col">
            <Avatar name={currentMember.full_name} size="xl" tone="sage" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="m-0 text-[1.7rem] font-semibold tracking-[-0.02em] text-nbp-tx max-[520px]:text-[1.4rem]">
                  {currentMember.full_name}
                </h2>
                <PlanBadge>Membro ativo</PlanBadge>
              </div>
              <div className="mt-0.5 text-[0.86rem] text-nbp-tx3">
                @{handle} · {currentMember.company} · Fundador
              </div>
              <p className="mt-3.5 mb-0 max-w-[60ch] text-[0.92rem] leading-relaxed text-nbp-tx2">
                {currentMember.bio}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-2.5 gap-y-2">
                {profileFacts.map((f) => (
                  <span
                    key={f.value}
                    className="inline-flex items-center gap-2 rounded-full border border-nbp-bd bg-nbp-sup2 px-3 py-[7px] text-[0.82rem] text-nbp-tx2"
                  >
                    <Fa
                      name={f.icon}
                      regular={f.regular}
                      className="text-[12px] text-nbp-tx3"
                    />
                    {f.label ? (
                      <>
                        {f.label} <b className="font-semibold text-nbp-tx">{f.value}</b>
                      </>
                    ) : (
                      <b className="font-semibold text-nbp-tx">{f.value}</b>
                    )}
                  </span>
                ))}
              </div>
              <div className="mt-[18px] flex flex-wrap gap-2.5">
                <Button variant="solid" size="md">
                  <Fa name="fa-pen" className="text-[12px]" /> Editar perfil
                </Button>
                <ButtonLink href="/app/plano" variant="outline" size="md">
                  <Fa name="fa-flag-checkered" className="text-[12px]" /> Ver plano de ação
                </ButtonLink>
              </div>
            </div>
          </div>
        </Panel>

        <Panel surface="session" radius="3xl" padding="none" className="flex flex-col px-[22px] py-[22px]">
          <div className="mb-4 flex items-center gap-2 text-[0.66rem] tracking-[0.12em] text-nbp-tx3 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-nbp-salvia shadow-[0_0_8px_rgba(198,200,186,0.8)]" />
            Próxima sessão
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-[62px] shrink-0 rounded-xl border border-nbp-bd bg-nbp-sup px-0 pt-2 pb-1.5 text-center">
              <div className="text-[1.5rem] leading-none font-bold text-nbp-tx">
                {profileSession.day}
              </div>
              <div className="mt-[3px] text-[0.7rem] tracking-[0.08em] text-nbp-tx3 uppercase">
                {profileSession.month}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[0.98rem] font-semibold text-nbp-tx">
                {profileSession.title}
              </div>
              <div className="mt-1 flex items-center gap-[7px] text-[0.82rem] text-nbp-tx2">
                <Fa name="fa-clock" regular className="text-[11px] text-nbp-tx3" />
                {profileSession.when_label}
              </div>
              <div className="mt-1 flex items-center gap-[7px] text-[0.82rem] text-nbp-tx2">
                <Fa name="fa-video" className="text-[11px] text-nbp-tx3" />
                {profileSession.place_label}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-[9px] border-t border-nbp-bd pt-4">
            <Avatar label={profileSession.consultant_initials} size="sm" tone="mentor" />
            <div className="text-[0.82rem]">
              <b className="font-semibold text-nbp-tx">{profileSession.consultant_name}</b>
              <span className="block text-[0.74rem] text-nbp-tx3">
                {profileSession.consultant_role}
              </span>
            </div>
            <span className="ml-auto whitespace-nowrap rounded-full bg-[rgba(198,200,186,0.14)] px-2.5 py-1 text-[0.74rem] font-semibold text-nbp-salvia">
              {countdown}
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            <ButtonLink href="#join" variant="solid" size="sm" className="flex-1">
              <Fa name="fa-video" className="text-[12px]" /> Entrar
            </ButtonLink>
            <ButtonLink href="/app/calendario" variant="outline" size="sm" className="flex-1">
              <Fa name="fa-calendar" regular className="text-[12px]" /> Ver no calendário
            </ButtonLink>
          </div>
        </Panel>
      </section>

      <section
        className="mb-5 grid grid-cols-2 gap-3.5 max-[520px]:grid-cols-1 min-[1081px]:grid-cols-4"
        aria-label="Resumo"
      >
        {profileStats.map((s) => (
          <Panel
            key={s.label}
            surface="card"
            radius="2xl"
            padding="none"
            className="p-[18px]"
          >
            <div className="mb-3.5 flex items-center justify-between">
              <IconWell>
                <Fa name={s.icon} />
              </IconWell>
              <span className="text-[0.74rem] text-nbp-salvia">
                <Fa name="fa-arrow-trend-up" /> {s.trend}
              </span>
            </div>
            <div className="text-[1.6rem] font-bold tracking-[-0.03em] text-nbp-tx">
              {s.unitPrefix && s.unit ? (
                <span className="mr-0.5 font-semibold text-nbp-tx2">{s.unit}</span>
              ) : null}
              {s.value}
              {!s.unitPrefix && s.unit ? (
                <span className="ml-0.5 font-semibold text-nbp-tx2">{s.unit}</span>
              ) : null}
            </div>
            <div className="mt-1.5 text-[0.8rem] text-nbp-tx2">{s.label}</div>
          </Panel>
        ))}
      </section>

      <div className="grid items-start gap-5 min-[1081px]:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <Panel surface="card" radius="2xl" padding="lg" className="mb-5">
            <PanelHead title="Progresso no desafio" href="/app/plano" linkLabel="Abrir" />
            <div className="mb-4 flex items-center gap-2.5">
              <span className="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-nbp-salvia bg-[rgba(198,200,186,0.16)] text-[0.82rem] font-bold text-nbp-salvia">
                4
              </span>
              <div>
                <b className="font-semibold text-nbp-tx">Aquisição de clientes</b>
                <span className="block text-[0.8rem] text-nbp-tx2">
                  {currentPlan.title} · próximo marco: {currentPlan.flag_target}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[0.82rem] text-nbp-tx2">
              <ProgressBar value={38} className="flex-1" />
              <span>38% · etapa 4 de 9</span>
            </div>
          </Panel>

          <Panel surface="card" radius="2xl" padding="lg" className="mb-5">
            <div className="mb-[18px]">
              <h3 className="m-0 text-[1.05rem] font-semibold text-nbp-tx">Atividade recente</h3>
            </div>
            {profileActivity.map((a, i) => (
              <div
                key={a.time}
                className={`flex gap-[13px] py-3.5 ${i === 0 ? "" : "border-t border-nbp-bd"}`}
              >
                <IconWell className="!h-[34px] !w-[34px] !rounded-[9px] !border-nbp-bd !bg-nbp-sup2 !text-[13px] !text-nbp-tx2">
                  <Fa name={a.icon} regular={a.regular} />
                </IconWell>
                <div className="min-w-0">
                  <div className="text-[0.88rem] text-nbp-tx">
                    {a.textBefore}
                    <b className="font-semibold">{a.bold}</b>
                    {a.textAfter}
                  </div>
                  <div className="mt-0.5 text-[0.74rem] text-nbp-tx3">{a.time}</div>
                </div>
              </div>
            ))}
          </Panel>
        </div>

        <div>
          <Panel surface="card" radius="2xl" padding="lg" className="mb-5">
            <div className="mb-[18px]">
              <h3 className="m-0 text-[1.05rem] font-semibold text-nbp-tx">Conquistas</h3>
            </div>
            {profileAchievements.map((a, i) => (
              <div
                key={a.title}
                className={`flex items-center gap-3.5 py-[11px] ${
                  i === 0 ? "" : "border-t border-nbp-bd"
                }`}
              >
                <IconWell locked={a.locked}>
                  <Fa name={a.icon} />
                </IconWell>
                <div className="min-w-0">
                  <div
                    className={`text-[0.9rem] font-semibold ${
                      a.locked ? "text-nbp-tx3" : "text-nbp-tx"
                    }`}
                  >
                    {a.title}
                  </div>
                  <div className="text-[0.76rem] text-nbp-tx2">{a.desc}</div>
                </div>
              </div>
            ))}
          </Panel>

          <Panel surface="card" radius="2xl" padding="lg" className="mb-5">
            <PanelHead title="Negócio" href="/app/dashboard" linkLabel="Dashboard" />
            <dl className="m-0">
              {profileBiz.map((row, i) => (
                <div
                  key={row.dt}
                  className={`flex items-center justify-between gap-3 py-3 text-[0.9rem] ${
                    i === 0 ? "" : "border-t border-nbp-bd"
                  }`}
                >
                  <dt className="m-0 text-nbp-tx2">{row.dt}</dt>
                  <dd className="m-0 font-semibold text-nbp-tx">{row.dd}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      </div>
    </section>
  );
}
