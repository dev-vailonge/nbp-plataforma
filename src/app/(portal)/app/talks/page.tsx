import { Fa } from "@/components/BrandMark";
import { Panel, PageHeader } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { formatTalkDate, talks, talkWaveHeights } from "@/lib/mocks";

export const metadata = { title: "Mafra Talks" };

function WaveBars({
  heights,
  className,
  barClassName,
}: {
  heights: number[];
  className: string;
  barClassName: string;
}) {
  return (
    <div className={className} aria-hidden>
      {heights.map((h, i) => (
        <span key={i} className={barClassName} style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}

export default function TalksPage() {
  const featured = talks.find((t) => t.featured) ?? talks[0];
  const rest = talks.filter((t) => t.id !== featured.id);
  const smallWave = talkWaveHeights.slice(0, 16).map((x) => Math.round(x * 0.7));

  return (
    <section className="w-full" aria-label="Mafra Talks">
      <PageHeader
        title="Mafra Talks"
        subtitle="O áudio da semana, pelo João Mafra · sexta-feira de manhã"
      />

      <Panel surface="card" radius="xl" padding="sm" className="mb-7 !p-[18px]">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            aria-label="Reproduzir"
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-0 bg-nbp-salvia text-[16px] text-[#1A1A18] transition hover:scale-[1.04] hover:brightness-105"
          >
            <Fa name="fa-play" />
          </button>
          <div className="min-w-[200px] flex-1">
            <p className="m-0 flex flex-wrap items-center gap-[9px]">
              <Pill tone="warn" className="!rounded-lg text-[0.74rem]">
                esta semana
              </Pill>
              <span className="text-[0.82rem] text-nbp-tx2">
                {formatTalkDate(featured.published_on)} · {featured.duration_label}
              </span>
            </p>
            <p className="mt-[7px] mb-0 text-[1.15rem] font-semibold leading-[1.35] text-nbp-tx">
              {featured.title}
            </p>
            <p className="mt-1 mb-0 text-[0.88rem] leading-relaxed text-nbp-tx2">
              {featured.summary}
            </p>
          </div>
        </div>
        <WaveBars
          heights={talkWaveHeights}
          className="mt-4 flex h-8 items-end gap-[3px]"
          barClassName="block w-[3px] rounded-sm bg-[#3A3934]"
        />
      </Panel>

      <h2 className="mt-0 mb-3 text-base font-semibold text-nbp-tx">Anteriores</h2>

      <div className="flex flex-col">
        {rest.map((t) => (
          <Panel
            key={t.id}
            surface="card"
            radius="xl"
            padding="none"
            className="mb-[9px] flex items-center gap-3.5 p-[13px] transition hover:border-nbp-bd2 last:mb-0"
          >
            <button
              type="button"
              aria-label={`Reproduzir ${t.title}`}
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-nbp-bd2 bg-transparent text-[13px] text-nbp-tx transition hover:border-nbp-salvia hover:bg-[rgba(198,200,186,0.08)] hover:text-nbp-salvia"
            >
              <Fa name="fa-play" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[0.92rem] font-semibold text-nbp-tx">{t.title}</p>
              <p className="mt-[3px] mb-0 text-[0.82rem] text-nbp-tx2">
                {formatTalkDate(t.published_on)} · {t.duration_label}
              </p>
            </div>
            <WaveBars
              heights={smallWave}
              className="hidden h-[22px] shrink-0 items-end gap-0.5 min-[861px]:flex"
              barClassName="block w-0.5 rounded-sm bg-[#3A3934]"
            />
          </Panel>
        ))}
      </div>
    </section>
  );
}
