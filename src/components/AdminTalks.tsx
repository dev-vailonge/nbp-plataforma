"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fa } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { Field, PageHeader, Panel, fieldControlClass } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { missingTalkMessage, TalkMedia, TalkPlayButton } from "@/components/TalkPlayback";
import { formatTalkDate } from "@/lib/mocks";
import { featuredTalk, loadTalks, removeTalk, saveTalk, talkSeed, type LoadedTalks, type TalkDraft } from "@/lib/local-talks";
import type { NbpTalk, TalkStatus } from "@/types/database";

const emptyDraft = (): TalkDraft => ({
  title: "",
  published_on: new Date().toISOString().slice(0, 10),
  duration_label: "",
  summary: "",
  video_url: "",
  status: "publicado",
  featured: false,
});

function draftFromTalk(talk: NbpTalk): TalkDraft {
  return {
    title: talk.title,
    published_on: talk.published_on ?? "",
    duration_label: talk.duration_label ?? "",
    summary: talk.summary ?? "",
    video_url: talk.video_url ?? "",
    status: talk.status,
    featured: talk.featured,
  };
}

export function AdminTalks() {
  const [loaded, setLoaded] = useState<LoadedTalks>({ talks: talkSeed(), remote: false });
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<TalkDraft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [missingId, setMissingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    loadTalks().then((next) => {
      if (!live) return;
      setLoaded(next);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  function openNew() {
    setEditingId(null);
    setDraft(emptyDraft());
    setError("");
  }

  function openEdit(talk: NbpTalk) {
    setEditingId(talk.id);
    setDraft(draftFromTalk(talk));
    setError("");
  }

  async function onSave() {
    if (!draft) return;
    if (!draft.title.trim()) {
      setError("O episódio precisa de um título.");
      return;
    }
    const url = draft.video_url.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      setError("O link começa por http:// ou https://.");
      return;
    }
    setError("");
    const next = await saveTalk(loaded, draft, editingId);
    setLoaded(next);
    setDraft(null);
    setEditingId(null);
  }

  async function onRemove(id: string) {
    const next = await removeTalk(loaded, id);
    setLoaded(next);
    if (editingId === id) {
      setDraft(null);
      setEditingId(null);
    }
    if (playingId === id) setPlayingId(null);
  }

  function togglePlay(talk: NbpTalk) {
    if (!talk.video_url) {
      setPlayingId(null);
      setMissingId(talk.id);
      return;
    }
    setMissingId(null);
    setPlayingId((current) => (current === talk.id ? null : talk.id));
  }

  return (
    <>
      <PageHeader
        title="Mafra Talks"
        subtitle="O episódio em destaque é o áudio da semana no portal. O play usa o link."
        actions={
          <Button variant="primary" type="button" onClick={openNew}>
            <i className="fa-solid fa-plus" aria-hidden /> Novo episódio
          </Button>
        }
      />

      {ready && !loaded.remote ? (
        <p className="mt-0 mb-4 text-[0.82rem] text-nbp-tx3">
          Modo local — episódios e links ficam neste browser e aparecem no portal.
        </p>
      ) : null}

      {draft ? (
        <Panel className="mb-4">
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              void onSave();
            }}
          >
            <Field label="Título" htmlFor="talk-title" className="md:col-span-2">
              <input
                id="talk-title"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                className={fieldControlClass}
              />
            </Field>
            <Field label="Data" htmlFor="talk-date">
              <input
                id="talk-date"
                type="date"
                value={draft.published_on}
                onChange={(event) => setDraft({ ...draft, published_on: event.target.value })}
                className={fieldControlClass}
              />
            </Field>
            <Field label="Duração" htmlFor="talk-duration">
              <input
                id="talk-duration"
                value={draft.duration_label}
                placeholder="11 min"
                onChange={(event) => setDraft({ ...draft, duration_label: event.target.value })}
                className={fieldControlClass}
              />
            </Field>
            <Field label="Resumo" htmlFor="talk-summary" className="md:col-span-2">
              <textarea
                id="talk-summary"
                value={draft.summary}
                rows={3}
                onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
                className={`${fieldControlClass} resize-y`}
              />
            </Field>
            <Field label="Link do episódio" htmlFor="talk-url" className="md:col-span-2">
              <input
                id="talk-url"
                value={draft.video_url}
                placeholder="https://… (mp3, mp4 ou YouTube)"
                onChange={(event) => setDraft({ ...draft, video_url: event.target.value })}
                className={fieldControlClass}
              />
            </Field>
            <Field label="Estado" htmlFor="talk-status">
              <select
                id="talk-status"
                value={draft.status}
                onChange={(event) => setDraft({ ...draft, status: event.target.value as TalkStatus })}
                className={fieldControlClass}
              >
                <option value="publicado">publicado</option>
                <option value="arquivo">arquivo</option>
              </select>
            </Field>
            <label className="flex items-end gap-2 pb-3 text-[0.88rem] text-nbp-tx">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) => setDraft({ ...draft, featured: event.target.checked })}
              />
              Destaque da semana
            </label>
            {error ? <p className="m-0 text-[0.82rem] text-[#f0b4b4] md:col-span-2">{error}</p> : null}
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button variant="primary" type="submit">
                Guardar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setDraft(null);
                  setEditingId(null);
                  setError("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      <div className="flex flex-col gap-2">
        {loaded.talks.map((talk) => (
          <Panel key={talk.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <TalkPlayButton
                  label={playingId === talk.id ? `Pausar ${talk.title}` : `Reproduzir ${talk.title}`}
                  playing={playingId === talk.id}
                  onClick={() => togglePlay(talk)}
                  className="mt-0.5 flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-nbp-bd2 bg-transparent text-[13px] text-nbp-tx hover:border-nbp-salvia hover:text-nbp-salvia"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{talk.title}</strong>
                    {talk.featured ? <Pill>featured</Pill> : null}
                    <Pill tone={talk.status === "publicado" ? "sage" : "muted"}>{talk.status}</Pill>
                  </div>
                  <p className="mt-1 mb-0 text-[0.85rem] text-nbp-tx2">
                    {formatTalkDate(talk.published_on)} · {talk.duration_label} · {talk.summary}
                  </p>
                  {talk.video_url ? (
                    <p className="mt-1 mb-0 truncate text-[0.78rem] text-nbp-tx3">{talk.video_url}</p>
                  ) : missingId === talk.id ? (
                    <p className="mt-1 mb-0 text-[0.78rem] text-nbp-tx3">{missingTalkMessage()}</p>
                  ) : (
                    <p className="mt-1 mb-0 text-[0.78rem] text-nbp-tx3">Sem link</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" onClick={() => openEdit(talk)}>
                  <Fa name="fa-pen" /> Editar
                </Button>
                <Button type="button" size="sm" onClick={() => void onRemove(talk.id)}>
                  Remover
                </Button>
              </div>
            </div>
            {playingId === talk.id && talk.video_url ? <TalkMedia url={talk.video_url} /> : null}
          </Panel>
        ))}
      </div>
    </>
  );
}

export function TalksCountCard() {
  const [count, setCount] = useState(() => talkSeed().filter((talk) => talk.status === "publicado").length);

  useEffect(() => {
    let live = true;
    loadTalks().then((loaded) => {
      if (!live) return;
      setCount(loaded.talks.filter((talk) => talk.status === "publicado").length);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <Link
      href="/admin/talks"
      className="rounded-[12px] border-[0.5px] border-nbp-bd bg-nbp-sup2 p-4 hover:border-nbp-bd2"
    >
      <div className="text-[0.68rem] tracking-[0.1em] text-nbp-tx3 uppercase">Talks publicados</div>
      <div className="mt-2 text-[1.45rem] font-medium">{count}</div>
      <div className="mt-1 text-[0.78rem] text-nbp-tx2">Mafra Talks</div>
    </Link>
  );
}

export function FeaturedTalkRow() {
  const [talk, setTalk] = useState<NbpTalk | null>(() => featuredTalk(talkSeed()));

  useEffect(() => {
    let live = true;
    loadTalks().then((loaded) => {
      if (!live) return;
      setTalk(featuredTalk(loaded.talks));
    });
    return () => {
      live = false;
    };
  }, []);

  if (!talk) return null;

  return (
    <div className="mb-3 flex items-center justify-between gap-3 border-b-[0.5px] border-nbp-bd pb-3">
      <div>
        <strong>{talk.title}</strong>
        <div className="text-[0.82rem] text-nbp-tx2">
          Talk · {talk.duration_label} · {talk.summary}
        </div>
      </div>
      <Link href="/admin/talks" className="text-[0.82rem] text-nbp-salvia">
        Abrir
      </Link>
    </div>
  );
}
