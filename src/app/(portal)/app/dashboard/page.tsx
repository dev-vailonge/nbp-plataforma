import { Fa } from "@/components/BrandMark";
import { Panel } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { RevenueChart } from "@/components/RevenueChart";
import {
  currentMember,
  dashboardBio,
  dashboardKpis,
  dashboardMeta,
  dashboardMetricsEntry,
  dashboardMetricsToday,
  dashboardMilestones,
} from "@/lib/mocks";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <section className="w-full" aria-label="Dashboard">
      <h1 className="mt-0 mb-[22px] text-[2.55rem] font-semibold tracking-[-0.03em] leading-[1.1] text-nbp-tx max-[860px]:text-[2rem]">
        {currentMember.full_name}
      </h1>

      <section
        className="mb-12 grid grid-cols-1 items-start gap-7 min-[981px]:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.72fr)] min-[981px]:gap-x-10"
        aria-label="Perfil do negócio"
      >
        <p className="m-0 max-w-[52ch] text-[0.98rem] leading-[1.65] text-nbp-tx2 max-[980px]:max-w-none">
          {dashboardBio}
        </p>

        <Panel surface="card" radius="2xl" padding="lg" className="max-[980px]:max-w-[480px] max-[520px]:max-w-none" aria-label="Meta do negócio">
          <dl className="m-0 grid grid-cols-2 gap-x-7 gap-y-[22px] max-[520px]:grid-cols-1">
            {dashboardMeta.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="mb-1 block text-[0.72rem] font-medium tracking-[0.04em] text-nbp-tx3">
                  {item.label}
                </dt>
                <dd className="m-0 text-[0.95rem] font-semibold leading-[1.35] text-nbp-tx">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>
      </section>

      <section aria-labelledby="snap-title">
        <div className="mb-[18px] flex items-baseline justify-between gap-4 border-b border-nbp-bd pb-3.5 max-[520px]:flex-col max-[520px]:gap-1">
          <h2 id="snap-title" className="m-0 text-[1.15rem] font-semibold text-nbp-tx">
            Snapshot atual
          </h2>
          <span className="whitespace-nowrap text-[0.82rem] text-nbp-tx3 max-[520px]:whitespace-normal">
            Variação vs entrada · Out 2025
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 min-[521px]:grid-cols-2 min-[861px]:grid-cols-3 min-[1181px]:grid-cols-5">
          {dashboardKpis.map((kpi) => (
            <Panel
              key={kpi.label}
              surface="card"
              radius="2xl"
              padding="none"
              className="flex min-h-[148px] flex-col px-[18px] pt-[18px] pb-4"
              aria-label={kpi.label}
            >
              <div className="mb-[18px] text-[0.78rem] font-medium text-nbp-tx2">
                {kpi.label}
              </div>
              <div className="mt-auto text-[1.55rem] font-bold tracking-[-0.03em] leading-[1.15] text-nbp-tx">
                {kpi.value}
                {kpi.unit ? (
                  <span className="ml-1 text-[0.72em] font-semibold">{kpi.unit}</span>
                ) : null}
              </div>
              <div
                className={`mt-3 flex flex-wrap items-center gap-1.5 text-[0.78rem] leading-[1.35] ${
                  kpi.tone === "up"
                    ? "text-[#C6C8BA]"
                    : kpi.tone === "down"
                      ? "text-[#C9A39A]"
                      : "text-nbp-tx2"
                }`}
              >
                {kpi.tone === "up" ? <Fa name="fa-arrow-up" className="text-[11px]" /> : null}
                {kpi.tone === "down" ? <Fa name="fa-arrow-down" className="text-[11px]" /> : null}
                {kpi.foot}
                {kpi.pill ? (
                  <Pill tone={kpi.pillMuted ? "sage" : "cream"}>
                    {kpi.pill}
                  </Pill>
                ) : null}
              </div>
            </Panel>
          ))}
        </div>
      </section>

      <section className="mt-[52px]" aria-labelledby="chart-title">
        <h2 id="chart-title" className="mb-4 mt-0 text-[1.15rem] font-semibold text-nbp-tx">
          Evolução da receita mensal
        </h2>
        <Panel surface="card" radius="2xl" padding="none" className="px-[22px] pt-5 pb-2 max-[860px]:px-3 max-[860px]:pt-4">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-4">
            <p className="m-0 text-[0.84rem] text-nbp-tx2">
              Receita mensal e lucro líquido, em euros.
            </p>
            <div className="flex flex-wrap items-center gap-[18px] text-[0.78rem] text-nbp-tx2" aria-hidden>
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

      <section className="mt-[52px]" aria-labelledby="metrics-title">
        <h2 id="metrics-title" className="mb-4 mt-0 text-[1.15rem] font-semibold text-nbp-tx">
          Acompanhamento de métricas
        </h2>
        <div className="grid grid-cols-1 items-stretch gap-4 min-[861px]:grid-cols-[1fr_auto_1fr]">
          <MetricsCard data={dashboardMetricsEntry} />
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center self-center justify-self-center rounded-full border border-nbp-bd bg-nbp-sup2 text-[13px] text-nbp-tx max-[860px]:rotate-90"
            aria-hidden
          >
            <Fa name="fa-arrow-right" />
          </div>
          <MetricsCard data={dashboardMetricsToday} />
        </div>
      </section>

      <section className="mt-[52px]" aria-labelledby="ms-title">
        <div className="mb-[18px] flex items-baseline justify-between gap-4 border-b border-nbp-bd pb-3.5 max-[520px]:flex-col max-[520px]:gap-1">
          <h2 id="ms-title" className="m-0 text-[1.15rem] font-semibold text-nbp-tx">
            Marcos da evolução
          </h2>
          <span className="whitespace-nowrap text-[0.82rem] text-nbp-tx3 max-[520px]:whitespace-normal">
            Oito meses de aceleração com João Mafra
          </span>
        </div>

        <Panel surface="card" radius="2xl" padding="none" className="py-2 pr-7 pl-[22px] max-[860px]:px-4">
          {dashboardMilestones.map((ms, i) => (
            <article
              key={ms.title}
              className="grid grid-cols-[72px_22px_minmax(0,1fr)_118px] items-start gap-x-[18px] gap-y-2 border-b border-nbp-bd py-[26px] last:border-b-0 max-[860px]:grid-cols-[64px_18px_minmax(0,1fr)] max-[860px]:gap-x-3"
            >
              <div className="pt-0.5 text-right">
                <b className="block text-[0.95rem] font-semibold tracking-[-0.02em] text-nbp-tx">
                  {ms.day}
                </b>
                <span className="mt-0.5 block text-[0.78rem] text-nbp-tx3">{ms.year}</span>
              </div>

              <div className="relative w-3 justify-self-center self-stretch">
                {i < dashboardMilestones.length - 1 ? (
                  <span className="absolute top-2 bottom-[-26px] left-1/2 w-px -translate-x-1/2 bg-nbp-bd2" />
                ) : null}
                <span
                  className={`relative z-[1] mx-auto mt-1.5 block h-[11px] w-[11px] rounded-full shadow-[0_0_0_4px_var(--color-nbp-sup)] ${
                    ms.open
                      ? "border-[1.5px] border-nbp-tx bg-nbp-sup"
                      : "bg-nbp-tx"
                  }`}
                />
              </div>

              <div className="min-w-0 pr-3">
                <h3 className="mt-0 mb-2 text-base font-semibold text-nbp-tx">{ms.title}</h3>
                <p className="m-0 text-[0.88rem] leading-[1.55] text-nbp-tx2">{ms.body}</p>
              </div>

              <div className="pt-0.5 text-right max-[860px]:col-start-3 max-[860px]:pt-2 max-[860px]:text-left">
                <b className="block text-[1.35rem] font-bold tracking-[-0.03em] leading-[1.1] text-nbp-tx">
                  {ms.metric}
                </b>
                <span className="mt-1 block text-[0.72rem] text-nbp-tx3">Receita / mês</span>
              </div>
            </article>
          ))}
        </Panel>
      </section>
    </section>
  );
}

function MetricsCard({
  data,
}: {
  data: {
    when: string;
    rows: { dt: string; dd: string; hint?: string }[];
  };
}) {
  return (
    <Panel surface="card" radius="2xl" padding="none" className="min-w-0 px-6 pt-[22px] pb-2.5" aria-label={data.when}>
      <p className="mb-3.5 mt-0 text-[0.92rem] font-medium text-nbp-tx2">{data.when}</p>
      <h3 className="mb-2 mt-0 text-[0.68rem] font-bold tracking-[0.12em] text-nbp-tx uppercase">
        Métricas importantes
      </h3>
      <dl className="m-0">
        {data.rows.map((row) => (
          <div
            key={row.dt}
            className="flex items-baseline justify-between gap-4 border-b border-nbp-bd py-3.5 text-[0.92rem] last:border-b-0"
          >
            <dt className="m-0 font-normal text-nbp-tx2">{row.dt}</dt>
            <dd className="m-0 text-right font-semibold whitespace-nowrap text-nbp-tx max-[520px]:whitespace-normal">
              {row.dd}
              {row.hint ? (
                <span className="mt-0.5 block whitespace-normal text-[0.72rem] font-normal text-nbp-tx3">
                  {row.hint}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
