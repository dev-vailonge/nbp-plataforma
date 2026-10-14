"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Fa } from "@/components/BrandMark";
import { Panel } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { missingTalkMessage, TalkMedia, TalkPlayButton } from "@/components/TalkPlayback";
import { formatTalkDate } from "@/lib/mocks";
import { featuredTalk, loadTalks, talkSeed } from "@/lib/local-talks";
import type { NbpTalk } from "@/types/database";

export function TalkOfTheWeek() {
  const [talk, setTalk] = useState<NbpTalk | null>(() => featuredTalk(talkSeed()));
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let live = true;
    loadTalks().then((loaded) => {
      if (!live) return;
      setTalk(featuredTalk(loaded.talks));
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  if (ready && !talk) return null;

  const title = talk?.title ?? "Mafra Talks";
  const sub = talk
    ? `${formatTalkDate(talk.published_on)}${talk.duration_label ? ` · ${talk.duration_label}` : ""}`
    : "A carregar o episódio da semana";

  return (
    <Panel
      surface="card"
      radius="2xl"
      padding="lg"
      className="relative mb-10 overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[linear-gradient(180deg,#FDFFEF_0%,#C6C8BA_100%)] before:shadow-[0_0_12px_rgba(253,255,239,0.35)] before:content-[''] max-[560px]:px-[18px] max-[560px]:py-[18px]"
      aria-labelledby="audio-week-title"
    >
      <div className="mb-[18px] flex items-start gap-4">
        <Avatar
          label="JM"
          size="lg"
          tone="sage"
          className="!bg-[linear-gradient(135deg,#FDFFEF_0%,#C6C8BA_55%,#8A8B82_100%)] shadow-[0_0_0_1px_rgba(253,255,239,0.2),0_8px_24px_rgba(0,0,0,0.25)]"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 inline-flex items-center gap-[7px] text-[0.66rem] tracking-[0.14em] text-nbp-tx3 uppercase">
            <Fa name="fa-headphones" className="text-[11px] text-[#C6C8BA]" />
            Áudio da semana
          </div>
          <h3 id="audio-week-title" className="m-0 text-[1.1rem] font-semibold tracking-[-0.01em] text-nbp-tx">
            {title}
          </h3>
          <p className="mt-[5px] mb-0 text-[0.86rem] text-nbp-tx2">
            {sub} ·{" "}
            <Link href="/app/talks" className="text-nbp-tx2 underline underline-offset-2 hover:text-nbp-tx">
              Ver todos
            </Link>
          </p>
        </div>
        <Pill tone="salvia" className="hidden uppercase tracking-[0.06em] min-[561px]:inline-flex">
          Novo
        </Pill>
      </div>

      <div className="rounded-xl border border-nbp-bd bg-[rgba(253,255,239,0.02)] px-3.5 py-3">
        <div className="flex items-center gap-3.5">
          <TalkPlayButton
            label={playing ? "Pausar áudio da semana" : "Reproduzir áudio da semana"}
            playing={playing}
            onClick={() => {
              if (!talk?.video_url) {
                setPlaying(false);
                setMissing(true);
                return;
              }
              setMissing(false);
              setPlaying((current) => !current);
            }}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[linear-gradient(135deg,#FDFFEF_0%,#C6C8BA_100%)] text-[#181818] shadow-[0_6px_18px_rgba(198,200,186,0.25)] transition hover:scale-105 hover:shadow-[0_8px_22px_rgba(198,200,186,0.35)]"
          />
          <div className="min-w-0 flex-1 text-[0.82rem] text-nbp-tx2">
            {missing ? missingTalkMessage() : talk?.summary || "O episódio em destaque no Mafra Talks."}
          </div>
        </div>
        {playing && talk?.video_url ? <TalkMedia url={talk.video_url} /> : null}
      </div>
    </Panel>
  );
}
