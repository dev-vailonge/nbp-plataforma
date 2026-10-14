"use client";

import { useEffect, useState } from "react";
import { PageHeader, Panel } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { EmptyState } from "@/components/ui";
import { formatTalkDate, talkWaveHeights } from "@/lib/mocks";
import { featuredTalk, loadTalks, publishedTalks, talkSeed } from "@/lib/local-talks";
import type { NbpTalk } from "@/types/database";
import { missingTalkMessage, TalkMedia, TalkPlayButton } from "@/components/TalkPlayback";

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
      {heights.map((height, index) => (
        <span key={index} className={barClassName} style={{ height: `${height}px` }} />
      ))}
    </div>
  );
}

export function MemberTalks() {
  const [talks, setTalks] = useState<NbpTalk[]>(talkSeed);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [missingId, setMissingId] = useState<string | null>(null);
  const smallWave = talkWaveHeights.slice(0, 16).map((height) => Math.round(height * 0.7));

  useEffect(() => {
    let live = true;
    loadTalks().then((loaded) => {
      if (!live) return;
      setTalks(loaded.talks);
    });
    return () => {
      live = false;
    };
  }, []);

  const published = publishedTalks(talks);
  const featured = featuredTalk(talks);
  const rest = featured ? published.filter((talk) => talk.id !== featured.id) : [];

  function toggle(talk: NbpTalk) {
    if (!talk.video_url) {
      setPlayingId(null);
      setMissingId(talk.id);
      return;
    }
    setMissingId(null);
    setPlayingId((current) => (current === talk.id ? null : talk.id));
  }

  return (
    <section className="w-full" aria-label="Mafra Talks">
      <PageHeader
        title="Mafra Talks"
        subtitle="O áudio da semana, pelo João Mafra · sexta-feira de manhã"
      />

      {!featured ? (
        <EmptyState
          title="Ainda sem episódios"
          description="Quando houver um talk publicado, ele aparece aqui."
        />
      ) : (
        <Panel surface="card" radius="xl" padding="sm" className="mb-7 !p-[18px]">
          <div className="flex flex-wrap items-center gap-4">
            <TalkPlayButton
              label={playingId === featured.id ? "Pausar" : "Reproduzir"}
              playing={playingId === featured.id}
              onClick={() => toggle(featured)}
              className="flex h-[52px] w-[52px] shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-nbp-salvia text-[16px] text-[#1A1A18] transition hover:scale-[1.04] hover:brightness-105"
            />
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
              <p className="mt-1 mb-0 text-[0.88rem] leading-relaxed text-nbp-tx2">{featured.summary}</p>
              {missingId === featured.id ? (
                <p className="mt-2 mb-0 text-[0.82rem] text-nbp-tx3">{missingTalkMessage()}</p>
              ) : null}
            </div>
          </div>
          {playingId === featured.id && featured.video_url ? <TalkMedia url={featured.video_url} /> : null}
          <WaveBars
            heights={talkWaveHeights}
            className="mt-4 flex h-8 items-end gap-[3px]"
            barClassName="block w-[3px] rounded-sm bg-[#3A3934]"
          />
        </Panel>
      )}

      {rest.length > 0 ? (
        <>
          <h2 className="mt-0 mb-3 text-base font-semibold text-nbp-tx">Anteriores</h2>
          <div className="flex flex-col">
            {rest.map((talk) => (
              <Panel
                key={talk.id}
                surface="card"
                radius="xl"
                padding="none"
                className="mb-[9px] p-[13px] transition hover:border-nbp-bd2 last:mb-0"
              >
                <div className="flex items-center gap-3.5">
                  <TalkPlayButton
                    label={playingId === talk.id ? `Pausar ${talk.title}` : `Reproduzir ${talk.title}`}
                    playing={playingId === talk.id}
                    onClick={() => toggle(talk)}
                    className="flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-nbp-bd2 bg-transparent text-[13px] text-nbp-tx transition hover:border-nbp-salvia hover:bg-[rgba(198,200,186,0.08)] hover:text-nbp-salvia"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 text-[0.92rem] font-semibold text-nbp-tx">{talk.title}</p>
                    <p className="mt-[3px] mb-0 text-[0.82rem] text-nbp-tx2">
                      {formatTalkDate(talk.published_on)} · {talk.duration_label}
                    </p>
                    {missingId === talk.id ? (
                      <p className="mt-1 mb-0 text-[0.78rem] text-nbp-tx3">{missingTalkMessage()}</p>
                    ) : null}
                  </div>
                  <WaveBars
                    heights={smallWave}
                    className="hidden h-[22px] shrink-0 items-end gap-0.5 min-[861px]:flex"
                    barClassName="block w-0.5 rounded-sm bg-[#3A3934]"
                  />
                </div>
                {playingId === talk.id && talk.video_url ? <TalkMedia url={talk.video_url} /> : null}
              </Panel>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
