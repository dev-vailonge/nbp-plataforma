"use client";

import { useMemo, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { PageHeader, Panel } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import {
  contentCategories,
  libraryCourseBgs,
  libraryCourses,
  libraryTotalCount,
  liveTracks,
  type ContentCategoryId,
  type LiveTrack,
  type LiveTrackSession,
} from "@/lib/mocks";

type PlayerState = { trackId: "t" | "a"; lessonIndex: number } | null;
type LibraryTab = "recentes" | "populares" | "salvos";

function LiveRow({
  track,
  sessions,
  onOpen,
}: {
  track: LiveTrack;
  sessions: LiveTrackSession[];
  onOpen: (index: number) => void;
}) {
  const accent = track.color_light;

  return (
    <section className="mb-[26px]" aria-label={track.title}>
      <header className="mb-3 min-h-[42px]">
        <p className="m-0 flex items-center gap-2 text-[0.95rem] leading-[1.4] font-semibold text-nbp-tx">
          <span style={{ color: accent }}>
            <Fa name={track.icon} className="text-[15px]" />
          </span>
          {track.title}
        </p>
        <p className="mt-[3px] mb-0 text-[0.76rem] leading-[1.4] text-nbp-tx2">{track.subtitle}</p>
      </header>
      <div className="flex gap-3 overflow-x-auto pb-2.5 [scrollbar-color:#45443E_#24231F] [scrollbar-width:thin]">
        <div
          className="box-border flex aspect-video w-[150px] shrink-0 flex-col justify-center rounded-[10px] border border-dashed bg-nbp-sup p-3"
          style={{ borderColor: accent }}
          aria-label="Próxima sessão"
        >
          <p className="m-0 text-[0.7rem] font-normal" style={{ color: accent }}>
            a seguir
          </p>
          <p className="mt-1.5 mb-0 text-[0.8rem] leading-[1.35] font-medium text-nbp-tx">
            {track.next}
          </p>
        </div>

        {sessions.map((s, i) => {
          const done = s.progress === 100;
          const showProgress = s.progress > 0 && s.progress < 100;
          return (
            <button
              key={`${track.id}-${i}-${s.date_label}`}
              type="button"
              onClick={() => onOpen(i)}
              className="w-[150px] shrink-0 cursor-pointer border-0 bg-transparent p-0 text-left font-[inherit] text-nbp-tx"
            >
              <div
                className="relative mb-2 flex aspect-video items-center justify-center overflow-hidden rounded-[10px] transition hover:translate-y-[-1px] hover:brightness-110"
                style={{ background: track.color }}
              >
                <span
                  className="absolute top-1.5 left-[7px] rounded-lg bg-black/40 px-2 py-px text-[0.7rem]"
                  style={{ color: accent }}
                >
                  {s.date_label}
                </span>
                <span style={{ color: accent }}>
                  <Fa name={done ? "fa-circle-check" : track.icon} className="text-[20px]" />
                </span>
                {showProgress ? (
                  <div className="absolute right-0 bottom-0 left-0 h-[3px] bg-[rgba(255,255,239,0.15)]">
                    <span
                      className="block h-full"
                      style={{ width: `${s.progress}%`, background: accent }}
                    />
                  </div>
                ) : null}
              </div>
              <p className="m-0 line-clamp-2 h-9 text-[0.88rem] leading-[1.35] font-semibold">
                {s.title}
              </p>
              <p className="mt-[3px] mb-0 text-[0.74rem] text-nbp-tx2">{s.duration_label}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ConteudosView() {
  const [tracks, setTracks] = useState(() =>
    liveTracks.map((t) => ({
      ...t,
      sessions: t.sessions.map((s) => ({ ...s })),
    })),
  );
  const [player, setPlayer] = useState<PlayerState>(null);
  const [category, setCategory] = useState<ContentCategoryId>("all");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<LibraryTab>("recentes");

  const activeTrack = player ? tracks.find((t) => t.id === player.trackId) : null;
  const activeLesson =
    activeTrack && player ? activeTrack.sessions[player.lessonIndex] : null;

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return libraryCourses.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.thumb_sub.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  function openPlayer(trackId: "t" | "a", lessonIndex: number) {
    setPlayer({ trackId, lessonIndex });
  }

  function closePlayer() {
    setPlayer(null);
  }

  function toggleDone() {
    if (!player) return;
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== player.trackId) return t;
        return {
          ...t,
          sessions: t.sessions.map((s, i) =>
            i === player.lessonIndex
              ? { ...s, progress: s.progress === 100 ? 0 : 100 }
              : s,
          ),
        };
      }),
    );
  }

  return (
    <section className="w-full" aria-label="Cursos">
      <PageHeader title="Cursos" subtitle="Sessões ao vivo e trilhas gravadas da No Blank Page." />

      {player && activeTrack && activeLesson ? (
        <Panel
          surface="card"
          radius="xl"
          padding="none"
          className="mb-7 p-[18px]"
          aria-live="polite"
        >
          <button
            type="button"
            onClick={closePlayer}
            className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-nbp-bd bg-nbp-bg px-3 py-[7px] text-[0.84rem] text-nbp-tx transition hover:border-nbp-bd2 hover:bg-nbp-sup2"
          >
            <Fa name="fa-arrow-left" /> Voltar
          </button>
          <div className="flex flex-wrap gap-5">
            <div className="min-w-[260px] flex-1">
              <div
                className="mb-3.5 flex aspect-video items-center justify-center rounded-xl"
                style={{ background: activeTrack.color }}
              >
                <span style={{ color: activeTrack.color_light }}>
                  <Fa name="fa-play" className="text-[40px]" />
                </span>
              </div>
              <p className="m-0 text-[0.82rem] text-nbp-tx2">
                {activeTrack.kicker} · {activeLesson.date_label}
              </p>
              <p className="mt-1.5 mb-1 text-[1.15rem] font-semibold text-nbp-tx">
                {activeLesson.title}
              </p>
              <p className="mt-0 mb-3.5 text-[0.84rem] text-nbp-tx2">
                {activeLesson.duration_label}
              </p>
              <button
                type="button"
                onClick={toggleDone}
                className="w-full cursor-pointer rounded-lg border border-nbp-bd2 bg-nbp-bg px-2.5 py-2.5 text-[0.86rem] text-nbp-tx transition hover:bg-nbp-sup2"
              >
                {activeLesson.progress === 100 ? "Concluída" : "Marcar como concluída"}
              </button>
            </div>
            <aside className="w-[230px] shrink-0 rounded-xl border border-nbp-bd p-3">
              <h3 className="mt-0 mb-2.5 text-[0.86rem] font-semibold text-nbp-tx">
                Outras sessões
              </h3>
              {activeTrack.sessions.map((x, j) => (
                <button
                  key={`${activeTrack.id}-pli-${j}`}
                  type="button"
                  onClick={() => setPlayer({ trackId: activeTrack.id, lessonIndex: j })}
                  className={`mb-0.5 flex w-full cursor-pointer items-start gap-2 rounded-lg border-0 px-2 py-2 text-left text-[0.82rem] leading-[1.45] transition last:mb-0 ${
                    j === player.lessonIndex
                      ? "bg-nbp-sup2 text-nbp-tx"
                      : "bg-transparent text-nbp-tx2 hover:bg-nbp-sup2 hover:text-nbp-tx"
                  }`}
                >
                  <Fa
                    name={x.progress === 100 ? "fa-circle-check" : "fa-circle"}
                    className={`mt-0.5 w-3.5 shrink-0 ${
                      x.progress === 100 ? "text-[#5FC7A4]" : ""
                    }`}
                  />
                  <span>
                    {x.title}
                    {x.date_label ? ` · ${x.date_label}` : ""}
                  </span>
                </button>
              ))}
            </aside>
          </div>
        </Panel>
      ) : (
        <>
          <div>
            <p className="mt-0 mb-4 text-[0.84rem] text-nbp-tx2">
              Sessões ao vivo · gravação disponível no dia seguinte
            </p>
            {tracks.map((track) => (
              <LiveRow
                key={track.id}
                track={track}
                sessions={track.sessions}
                onOpen={(i) => openPlayer(track.id, i)}
              />
            ))}
          </div>

          <div>
            <div className="mt-2 mb-[22px] border-t border-nbp-bd pt-[22px]">
              <p className="m-0 text-[0.84rem] text-nbp-tx2">Cursos · ao teu ritmo</p>
            </div>

            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="m-0 text-[1.05rem] font-semibold text-nbp-tx">
                  Explore por categoria
                </h2>
                <p className="mt-1 mb-0 text-[0.82rem] text-nbp-tx2">
                  Selecione a categoria para filtrar os conteúdos abaixo
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Fa
                    name="fa-magnifying-glass"
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[13px] text-nbp-tx3"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Pesquise aqui"
                    aria-label="Pesquisar cursos"
                    className="w-[260px] max-w-full rounded-full border border-nbp-bd bg-nbp-sup py-2.5 pr-3.5 pl-[38px] text-[0.9rem] text-nbp-tx outline-none transition focus:border-nbp-bd2"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-nbp-bd bg-nbp-sup px-4 py-2.5 text-[0.85rem] font-medium text-nbp-tx transition hover:border-nbp-bd2 hover:bg-nbp-sup2"
                >
                  <Fa name="fa-sliders" className="text-[12px] text-nbp-tx2" />
                  Mais filtros
                </button>
              </div>
            </div>

            <div className="mb-10 grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-4">
              {contentCategories.map((cat) => {
                const active = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-[14px] border px-5 py-[18px] text-left transition hover:translate-y-[-2px] hover:border-nbp-bd2 hover:bg-nbp-sup2 ${
                      active
                        ? "border-[#C6C8BA60] bg-[linear-gradient(160deg,rgba(253,255,239,0.06),rgba(253,255,239,0.02))]"
                        : "border-nbp-bd bg-nbp-sup"
                    }`}
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-nbp-bd bg-[linear-gradient(135deg,rgba(198,200,186,0.18),rgba(75,76,71,0.32))] text-[15px] text-nbp-tx">
                      <Fa name={cat.icon} />
                    </span>
                    <span className="text-[0.88rem] leading-[1.3] font-medium text-nbp-tx">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="m-0 text-[0.95rem] font-semibold text-nbp-tx">
                Biblioteca{" "}
                <Pill tone="muted" className="ml-1.5">
                  {libraryTotalCount} conteúdos encontrados
                </Pill>
              </h3>
              <div className="inline-flex rounded-full border border-nbp-bd bg-nbp-sup p-1">
                {(
                  [
                    ["recentes", "Recentes"],
                    ["populares", "Populares"],
                    ["salvos", "Meus salvos"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`cursor-pointer rounded-full border-0 px-3.5 py-1.5 text-[0.82rem] transition ${
                      tab === id
                        ? "bg-nbp-tx font-semibold text-[#181818]"
                        : "bg-transparent text-nbp-tx2 hover:text-nbp-tx"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <section
              className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-[18px] gap-y-[22px]"
              aria-label="Lista de conteúdos"
            >
              {filteredCourses.map((c) => (
                <article
                  key={c.id}
                  className="cursor-pointer overflow-hidden rounded-[14px] bg-transparent transition hover:translate-y-[-3px]"
                >
                  <div
                    className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-[14px] border border-nbp-bd hover:border-nbp-bd2"
                    style={{ background: libraryCourseBgs[c.bg] }}
                  >
                    <div className="absolute top-[18px] right-[18px] left-[18px] text-[1.25rem] leading-[1.1] font-extrabold tracking-[0.01em] text-[#FDFFEF] uppercase [text-shadow:0_2px_16px_rgba(0,0,0,0.4)]">
                      {c.thumb_title[0]}
                      <br />
                      {c.thumb_title[1]}
                    </div>
                    <div className="absolute bottom-3.5 left-[18px] text-[0.72rem] font-semibold tracking-[0.18em] text-[rgba(253,255,239,0.75)] uppercase">
                      {c.thumb_sub}
                    </div>
                  </div>
                  <div className="px-1 pt-3 pb-1">
                    <h4 className="mt-0 mb-2 line-clamp-2 text-[0.95rem] leading-[1.35] font-semibold text-nbp-tx">
                      {c.title}
                    </h4>
                    <div className="flex items-center justify-between text-[0.78rem] text-nbp-tx2">
                      <span className="inline-flex items-center gap-1.5">
                        <Fa name="fa-user" regular className="text-[11px] text-nbp-tx3" />
                        Por {c.author}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Fa name="fa-clock" regular className="text-[11px] text-nbp-tx3" />
                        {c.duration_label}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </div>
        </>
      )}
    </section>
  );
}
