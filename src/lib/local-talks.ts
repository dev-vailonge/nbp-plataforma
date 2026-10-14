import { talks as seedTalks } from "@/lib/mocks";
import type { NbpTalk, TalkStatus } from "@/types/database";

const STORAGE_KEY = "nbp-local-talks-v1";

export type TalkDraft = {
  title: string;
  published_on: string;
  duration_label: string;
  summary: string;
  video_url: string;
  status: TalkStatus;
  featured: boolean;
};

export type LoadedTalks = {
  talks: NbpTalk[];
  remote: boolean;
};

export function talkSeed(): NbpTalk[] {
  return seedTalks.map((talk) => ({ ...talk }));
}

export function readLocalTalks(): NbpTalk[] {
  if (typeof window === "undefined") return talkSeed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return talkSeed();
    const parsed = JSON.parse(raw) as NbpTalk[];
    if (!Array.isArray(parsed) || parsed.some((talk) => !talk || typeof talk.id !== "string")) {
      return talkSeed();
    }
    return parsed;
  } catch {
    return talkSeed();
  }
}

export function writeLocalTalks(list: NbpTalk[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function sortTalks(list: NbpTalk[]) {
  return [...list].sort((a, b) => (b.published_on ?? "").localeCompare(a.published_on ?? ""));
}

export function publishedTalks(list: NbpTalk[]) {
  return sortTalks(list.filter((talk) => talk.status === "publicado"));
}

export function featuredTalk(list: NbpTalk[]) {
  const published = publishedTalks(list);
  return published.find((talk) => talk.featured) ?? published[0] ?? null;
}

function applyTalk(list: NbpTalk[], talk: NbpTalk) {
  const rest = list.filter((item) => item.id !== talk.id);
  const next = talk.featured
    ? [talk, ...rest.map((item) => ({ ...item, featured: false }))]
    : [talk, ...rest];
  return sortTalks(next);
}

let cached: LoadedTalks | null = null;
let inflight: Promise<LoadedTalks> | null = null;

function remember(loaded: LoadedTalks) {
  cached = loaded;
  if (!loaded.remote) writeLocalTalks(loaded.talks);
  return loaded;
}

export function loadTalks(): Promise<LoadedTalks> {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = fetchTalks().finally(() => {
      inflight = null;
    });
  }
  return inflight;
}

async function fetchTalks(): Promise<LoadedTalks> {
  try {
    const res = await fetch("/api/v1/talks");
    if (res.ok) {
      const body = (await res.json()) as { data?: NbpTalk[] };
      if (Array.isArray(body.data) && body.data.length > 0) {
        return remember({ talks: sortTalks(body.data), remote: true });
      }
    }
  } catch {
    /* a lista local cobre a pré-visualização neste browser */
  }
  return remember({ talks: sortTalks(readLocalTalks()), remote: false });
}

function draftToTalk(draft: TalkDraft, id: string, code: string): NbpTalk {
  return {
    id,
    code,
    title: draft.title.trim(),
    published_on: draft.published_on || null,
    duration_label: draft.duration_label.trim() || null,
    summary: draft.summary.trim() || null,
    status: draft.status,
    featured: draft.featured,
    video_url: draft.video_url.trim() || null,
  };
}

async function pushRemote(method: "POST" | "PATCH" | "DELETE", id: string | null, body?: TalkDraft) {
  const path = id ? `/api/v1/talks/${id}` : "/api/v1/talks";
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body
      ? JSON.stringify({
          title: body.title.trim(),
          published_on: body.published_on || null,
          duration_label: body.duration_label.trim() || null,
          summary: body.summary.trim() || null,
          status: body.status,
          featured: body.featured,
          video_url: body.video_url.trim() || null,
          ...(method === "POST" ? { code: `tk-${Date.now().toString(36)}` } : {}),
        })
      : undefined,
  });
  if (!res.ok) return null;
  if (method === "DELETE") return { id } as NbpTalk;
  const payload = (await res.json()) as { data?: NbpTalk };
  return payload.data ?? null;
}

async function clearOtherFeatured(list: NbpTalk[], keepId: string) {
  const previous = list.filter((talk) => talk.featured && talk.id !== keepId);
  await Promise.all(previous.map((talk) => pushRemote("PATCH", talk.id, talkToDraft({ ...talk, featured: false }))));
}

function talkToDraft(talk: NbpTalk): TalkDraft {
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

export async function saveTalk(current: LoadedTalks, draft: TalkDraft, id: string | null): Promise<LoadedTalks> {
  if (current.remote) {
    const saved = await pushRemote(id ? "PATCH" : "POST", id, draft);
    if (saved) {
      if (saved.featured) await clearOtherFeatured(current.talks, saved.id);
      return remember({ talks: applyTalk(current.talks, saved), remote: true });
    }
  }

  const existing = id ? current.talks.find((item) => item.id === id) : null;
  const fresh = `tk-${Date.now().toString(36)}`;
  const talk = draftToTalk(draft, id ?? fresh, existing?.code ?? fresh);
  return remember({ talks: applyTalk(current.talks, talk), remote: false });
}

export async function removeTalk(current: LoadedTalks, id: string): Promise<LoadedTalks> {
  if (current.remote) {
    const removed = await pushRemote("DELETE", id);
    if (removed) {
      return remember({
        talks: current.talks.filter((talk) => talk.id !== id),
        remote: true,
      });
    }
  }
  return remember({
    talks: current.talks.filter((talk) => talk.id !== id),
    remote: false,
  });
}
