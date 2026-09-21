import Link from "next/link";
import { Avatar, IconWell } from "@/components/Avatar";
import { Fa } from "@/components/BrandMark";
import { ButtonLink } from "@/components/Button";
import { Panel, SectionLabel } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { PlanJourney } from "@/components/PlanJourney";
import { RevenueChart } from "@/components/RevenueChart";
import {
  currentMember,
  currentPlan,
  formatSessionWhen,
  homeAchievements,
  homeAudioWeek,
  homeQuickActions,
  homeStats,
  nextSession,
  planStages,
  ranking,
} from "@/lib/mocks";

export const metadata = { title: "Início" };

export default function PortalHomePage() {
  const firstName = currentMember.full_name.split(" ")[0];

  return (
    <section className="w-full max-w-[1180px]" aria-label="Início">
      <h2 className="mt-0 mb-1.5 text-left text-[clamp(1.5rem,2.4vw,2rem)] font-medium tracking-[-0.01em] text-nbp-tx">
        Bom te ver, <span className="font-bold">{firstName}</span>.
      </h2>
      <p className="mt-0 mb-[22px] max-w-[640px] text-left text-[0.95rem] text-nbp-tx2">
        Menos operação, mais faturação. Continue de onde parou e avance no seu desafio.
      </p>

      <Panel
        surface="violet"
        radius="lg"
        padding="sm"
        className="mb-[18px] flex flex-wrap items-center gap-3 !rounded-[9px] !border-0 px-[15px] py-[13px]"
        aria-label="Próxima sessão 1:1"
      >
        <Fa
          name="fa-calendar"
          regular
          className="w-[22px] shrink-0 text-center text-[19px] text-nbp-violet"
        />
        <p className="m-0 min-w-0 flex-1 text-[13px] leading-normal text-nbp-violet-soft">
          <b className="font-medium">
            Próxima sessão · {formatSessionWhen(nextSession.starts_at)}
          </b>
          <br />
          Sessão {nextSession.session_number} · {nextSession.duration_min} min · Marta Nunes
        </p>
        <ButtonLink
          href="/app/reunioes"
          variant="violet"
          size="sm"
          className="!rounded-[7px] whitespace-nowrap px-[13px] py-[7px] text-[13px] font-normal"
        >
          Ver sessão
        </ButtonLink>
      </Panel>

      <Panel
        surface="card"
        radius="2xl"
        padding="lg"
        className="relative mb-10 overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[linear-gradient(180deg,#FDFFEF_0%,#C6C8BA_100%)] before:shadow-[0_0_12px_rgba(253,255,239,0.35)] before:content-[''] max-[560px]:px-[18px] max-[560px]:py-[18px]"
        aria-labelledby="audio-week-title"
      >
        <div className="mb-[18px] flex items-start gap-4">
          <Avatar label="JM" size="lg" tone="sage" className="!bg-[linear-gradient(135deg,#FDFFEF_0%,#C6C8BA_55%,#8A8B82_100%)] shadow-[0_0_0_1px_rgba(253,255,239,0.2),0_8px_24px_rgba(0,0,0,0.25)]" />
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 inline-flex items-center gap-[7px] text-[0.66rem] tracking-[0.14em] text-nbp-tx3 uppercase">
              <Fa name="fa-headphones" className="text-[11px] text-[#C6C8BA]" />
              Áudio da semana
            </div>
            <h3
              id="audio-week-title"
              className="m-0 text-[1.1rem] font-semibold tracking-[-0.01em] text-nbp-tx"
            >
              {homeAudioWeek.title}
            </h3>
            <p className="mt-[5px] mb-0 text-[0.86rem] text-nbp-tx2">
              {homeAudioWeek.sub} ·{" "}
              <Link
                href="/app/talks"
                className="text-nbp-tx2 underline underline-offset-2 hover:text-nbp-tx"
              >
                Ver todos
              </Link>
            </p>
          </div>
          <Pill tone="salvia" className="hidden uppercase tracking-[0.06em] min-[561px]:inline-flex">
            Novo
          </Pill>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-nbp-bd bg-[rgba(253,255,239,0.02)] px-3.5 py-3">
          <button
            type="button"
            aria-label="Reproduzir áudio da semana"
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 text-[#181818] shadow-[0_6px_18px_rgba(198,200,186,0.25)] transition hover:scale-105 hover:shadow-[0_8px_22px_rgba(198,200,186,0.35)]"
            style={{ background: "linear-gradient(135deg, #FDFFEF 0%, #C6C8BA 100%)" }}
          >
            <Fa name="fa-play" className="ml-0.5 text-[15px]" />
          </button>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div
              className="relative h-1.5 cursor-pointer overflow-hidden rounded-full bg-[rgba(198,200,186,0.12)]"
              role="slider"
              aria-label="Progresso do áudio"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              tabIndex={0}
            >
              <div
                className="h-full w-0 rounded-full bg-[linear-gradient(90deg,#C6C8BA,#FDFFEF)]"
                aria-hidden
              />
            </div>
            <div className="flex justify-between text-[0.72rem] text-nbp-tx3 tabular-nums">
              <span>0:00</span>
              <span>{homeAudioWeek.duration}</span>
            </div>
          </div>
        </div>
      </Panel>

      <SectionLabel>Ações rápidas</SectionLabel>
      <div className="mb-10 grid grid-cols-2 gap-3.5 max-[560px]:grid-cols-1 min-[1081px]:grid-cols-4">
        {homeQuickActions.map((c) => (
          <Link
            key={c.title}
            href={c.href}
            className="flex flex-col gap-3 rounded-[14px] border border-nbp-bd bg-nbp-sup p-[18px] transition hover:translate-y-[-2px] hover:border-nbp-bd2 hover:bg-nbp-sup2"
          >
            <IconWell>
              <Fa name={c.icon} regular={c.regular} />
            </IconWell>
            <span className="font-semibold text-nbp-tx">{c.title}</span>
            <span className="text-[0.82rem] leading-[1.4] text-nbp-tx2">{c.desc}</span>
          </Link>
        ))}
      </div>

      <SectionLabel>A sua evolução</SectionLabel>
      <div className="mb-[22px] grid grid-cols-2 gap-3.5 max-[560px]:grid-cols-1 min-[1081px]:grid-cols-4">
        {homeStats.map((s) => (
          <Panel
            key={s.label}
            surface="card"
            radius="xl"
            padding="none"
            className="px-5 py-[18px]"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-nbp-bd bg-[rgba(253,255,239,0.05)] text-[14px] text-nbp-tx2">
                <Fa name={s.icon} />
              </span>
              <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-[#C6C8BA]">
                <Fa name="fa-arrow-trend-up" /> {s.trend}
              </span>
            </div>
            <div className="text-[1.9rem] leading-none font-bold tracking-[-0.02em] text-nbp-tx">
              {s.unitPrefix && s.unit ? (
                <span className="mr-0.5 text-base font-semibold text-nbp-tx2">{s.unit}</span>
              ) : null}
              {s.value}
              {!s.unitPrefix && s.unit ? (
                <span className="ml-0.5 text-base font-semibold text-nbp-tx2">{s.unit}</span>
              ) : null}
            </div>
            <div className="mt-[7px] text-[0.8rem] text-nbp-tx2">{s.label}</div>
          </Panel>
        ))}
      </div>

      <section className="mt-2 mb-9" aria-labelledby="chart-title">
        <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="chart-title" className="m-0 text-[1.05rem] font-medium text-nbp-tx">
            Evolução da receita mensal
          </h2>
          <Link
            href="/app/dashboard"
            className="border-0 bg-transparent p-0 text-[13px] text-nbp-tx2 hover:text-nbp-tx"
          >
            Ver dashboard →
          </Link>
        </div>
        <Panel
          surface="elev"
          radius="xl"
          padding="none"
          className="px-5 pt-[18px] pb-1.5 max-[860px]:px-3"
        >
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-4">
            <p className="m-0 text-[0.84rem] text-nbp-tx2">
              Receita mensal e lucro líquido, em euros.
            </p>
            <div
              className="flex flex-wrap items-center gap-[18px] text-[0.78rem] text-nbp-tx2"
              aria-hidden
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-[22px] rounded-sm bg-[#FDFFEF]" /> Receita mensal
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-[22px] rounded-sm bg-[#C6C8BA]" /> Lucro líquido
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-[22px] border-t-2 border-dashed border-[#FDFFEF]" /> Meta NBP
              </span>
            </div>
          </div>
          <RevenueChart />
        </Panel>
      </section>

      <Panel
        id="desafio"
        surface="card"
        radius="2xl"
        padding="none"
        className="mb-5 px-[26px] py-6 max-[860px]:overflow-hidden max-[860px]:px-4 max-[860px]:py-5"
      >
        <div className="mb-[26px] flex flex-wrap items-start justify-between gap-4 max-[860px]:mb-[18px] max-[860px]:flex-col max-[860px]:items-stretch">
          <div>
            <SectionLabel className="mb-[7px]">Desafio atual</SectionLabel>
            <h3 className="m-0 text-[1.1rem] font-semibold text-nbp-tx">{currentPlan.title}</h3>
            <p className="mt-1 mb-0 text-[0.86rem] text-nbp-tx2">{currentPlan.subtitle}</p>
          </div>
          <div className="shrink-0 text-right text-[0.82rem] text-nbp-tx2 max-[860px]:flex max-[860px]:flex-wrap max-[860px]:items-baseline max-[860px]:gap-1.5 max-[860px]:rounded-[10px] max-[860px]:border max-[860px]:border-nbp-bd max-[860px]:bg-[rgba(253,255,239,0.03)] max-[860px]:px-3 max-[860px]:py-2.5 max-[860px]:text-left max-[860px]:text-[0.84rem]">
            <b className="font-bold text-nbp-tx">{currentPlan.flag_main}</b>
            <br className="max-[860px]:hidden" />{" "}
            {currentPlan.flag_prefix}{" "}
            <span className="text-[#C6C8BA]">{currentPlan.flag_target}</span>
          </div>
        </div>
        <PlanJourney stages={planStages} fillPct={currentPlan.fill_pct ?? 0} />
      </Panel>

      <div className="grid items-start gap-5 min-[1081px]:grid-cols-[1.35fr_1fr]">
        <Panel
          id="ranking"
          surface="card"
          radius="2xl"
          padding="none"
          className="px-[26px] py-6"
        >
          <div className="mb-[26px]">
            <SectionLabel className="mb-[7px]">Ranking da comunidade</SectionLabel>
            <h3 className="m-0 text-[1.1rem] font-semibold text-nbp-tx">Top da temporada</h3>
            <p className="mt-1 mb-0 text-[0.86rem] text-nbp-tx2">
              Pontos por tarefas concluídas e marcos alcançados.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            {ranking.map((row, i) => {
              const showDivider = i === 3;
              return (
                <div key={row.pos}>
                  {showDivider ? (
                    <div className="px-0 py-0.5 text-center text-[0.9rem] tracking-[0.2em] text-nbp-tx3">
                      · · ·
                    </div>
                  ) : null}
                  <div
                    className={`grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-xl border px-3.5 py-[11px] transition ${
                      row.me
                        ? "border-nbp-bd2 bg-[rgba(253,255,239,0.05)]"
                        : "border-transparent hover:bg-[rgba(253,255,239,0.03)]"
                    }`}
                  >
                    <div
                      className={`text-center text-[0.9rem] font-bold ${
                        row.top ? "text-[#E0AC5E]" : "text-nbp-tx2"
                      }`}
                    >
                      {row.pos}
                    </div>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar
                        name={row.name.replace(" · você", "")}
                        size="md"
                        tone="sage"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-nbp-tx">{row.name}</div>
                        <div className="text-[0.74rem] text-nbp-tx3">{row.meta}</div>
                      </div>
                    </div>
                    <div className="text-[0.95rem] font-bold text-nbp-tx">
                      {row.score}
                      <span className="ml-[3px] text-[0.72rem] font-medium text-nbp-tx3">
                        pts
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel surface="card" radius="2xl" padding="none" className="px-[26px] py-6">
          <div className="mb-[26px]">
            <SectionLabel className="mb-[7px]">Conquistas</SectionLabel>
            <h3 className="m-0 text-[1.1rem] font-semibold text-nbp-tx">
              O que já desbloqueou
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {homeAchievements.map((a) => (
              <div key={a.title} className="flex items-center gap-3.5">
                <IconWell locked={a.locked}>
                  <Fa name={a.icon} />
                </IconWell>
                <div className="min-w-0">
                  <div className="text-[0.9rem] font-semibold text-nbp-tx">{a.title}</div>
                  <div className="text-[0.76rem] text-nbp-tx2">{a.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}
