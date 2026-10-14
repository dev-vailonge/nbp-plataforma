"use client";

import { useEffect, useMemo, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { Field, PageHeader, Panel, fieldControlClass } from "@/components/Panel";
import { liveRules } from "@/lib/mocks";
import type { LiveEventKind } from "@/types/database";

const STORAGE_KEY = "nbp-admin-calendar-v1";

const MES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

const KIND_LABEL: Record<LiveEventKind, string> = {
  tutoria: "Tutoria",
  growth: "Growth",
  scale: "Scale",
  presencial: "Presencial",
};

type OneOff = {
  id: string;
  onDate: string;
  title: string;
  hour: string;
  kind: LiveEventKind;
};

type Override = {
  title: string;
  hour: string;
};

type Store = {
  oneoffs: OneOff[];
  hidden: string[];
  overrides: Record<string, Override>;
};

type CellEvent = {
  key: string;
  label: string;
  hour: string;
  tone: "tutoria" | "acc" | "presencial";
  source: "rule" | "oneoff";
};

const EMPTY_STORE: Store = { oneoffs: [], hidden: [], overrides: {} };

function isoDate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function parseStore(raw: string | null): Store {
  if (!raw) return EMPTY_STORE;
  try {
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      oneoffs: Array.isArray(parsed.oneoffs) ? parsed.oneoffs : [],
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
      overrides: parsed.overrides && typeof parsed.overrides === "object" ? parsed.overrides : {},
    };
  } catch {
    return EMPTY_STORE;
  }
}

function toneFor(kind: string): CellEvent["tone"] {
  if (kind === "presencial") return "presencial";
  if (kind === "tutoria") return "tutoria";
  return "acc";
}

function chipClass(tone: CellEvent["tone"]) {
  if (tone === "presencial") return "bg-nbp-violet-deep text-nbp-violet-soft";
  if (tone === "tutoria") return "bg-nbp-fill text-nbp-salvia";
  return "bg-[#2a2418] text-[#e8c48a]";
}

export function AdminCommunityCalendar() {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [store, setStore] = useState<Store>(EMPTY_STORE);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(isoDate(today));
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [hour, setHour] = useState("18h00");
  const [kind, setKind] = useState<LiveEventKind>("tutoria");
  const [eventDate, setEventDate] = useState(isoDate(today));
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    setStore(parseStore(localStorage.getItem(STORAGE_KEY)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store, ready]);

  const cells = useMemo(() => {
    const off = (new Date(year, month, 1).getDay() + 6) % 7;
    const start = new Date(year, month, 1 - off);
    return Array.from({ length: 42 }, (_, i) => {
      const dd = new Date(start);
      dd.setDate(start.getDate() + i);
      return dd;
    });
  }, [year, month]);

  function eventsOn(d: Date): CellEvent[] {
    const date = isoDate(d);
    const week = Math.floor((d.getDate() - 1) / 7);
    const out: CellEvent[] = [];
    for (const rule of liveRules) {
      if (d.getDay() !== rule.weekday) continue;
      const key = `rule:${rule.id}:${date}`;
      if (store.hidden.includes(key)) continue;
      const override = store.overrides[key];
      const label = override?.title || rule.rotation[week % rule.rotation.length];
      out.push({
        key,
        label,
        hour: override?.hour || rule.hour,
        tone: rule.kind === "tutoria" ? "tutoria" : "acc",
        source: "rule",
      });
    }
    for (const event of store.oneoffs) {
      if (event.onDate !== date || store.hidden.includes(event.id)) continue;
      out.push({
        key: event.id,
        label: event.title,
        hour: event.hour,
        tone: toneFor(event.kind),
        source: "oneoff",
      });
    }
    return out;
  }

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function openCreate() {
    setActiveKey(null);
    setTitle("");
    setHour("18h00");
    setKind("tutoria");
    setEventDate(selected);
    setComposerOpen(true);
  }

  function openEvent(event: CellEvent, date: string) {
    setSelected(date);
    setActiveKey(event.key);
    setTitle(event.label);
    setHour(event.hour);
    setEventDate(date);
    const oneoff = store.oneoffs.find((item) => item.id === event.key);
    setKind(oneoff?.kind ?? "tutoria");
    setComposerOpen(true);
  }

  function closeComposer() {
    setComposerOpen(false);
    setActiveKey(null);
  }

  function focusDate(date: string) {
    const [y, m] = date.split("-").map(Number);
    if (!y || !m) return;
    setYear(y);
    setMonth(m - 1);
    setSelected(date);
  }

  function saveEvent() {
    const name = title.trim();
    if (!name || !eventDate) return;
    const nextHour = hour.trim() || "18h00";
    if (activeKey?.startsWith("rule:")) {
      setStore((current) => ({
        ...current,
        overrides: { ...current.overrides, [activeKey]: { title: name, hour: nextHour } },
      }));
      closeComposer();
      focusDate(eventDate);
      return;
    }
    if (activeKey) {
      setStore((current) => ({
        ...current,
        oneoffs: current.oneoffs.map((item) =>
          item.id === activeKey ? { ...item, onDate: eventDate, title: name, hour: nextHour, kind } : item,
        ),
      }));
      closeComposer();
      focusDate(eventDate);
      return;
    }
    const created: OneOff = {
      id: `ev-${Date.now().toString(36)}`,
      onDate: eventDate,
      title: name,
      hour: nextHour,
      kind,
    };
    setStore((current) => ({ ...current, oneoffs: [...current.oneoffs, created] }));
    closeComposer();
    focusDate(eventDate);
  }

  function cancelEvent() {
    if (!activeKey) return;
    setStore((current) => ({
      ...current,
      hidden: current.hidden.includes(activeKey) ? current.hidden : [...current.hidden, activeKey],
    }));
    closeComposer();
  }

  useEffect(() => {
    if (!composerOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setComposerOpen(false);
      setActiveKey(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [composerOpen]);

  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle="Regras recorrentes (terças / quintas) e eventos pontuais."
        actions={
          <Button variant="primary" type="button" onClick={openCreate}>
            <Fa name="fa-plus" /> Novo evento
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        {liveRules.map((rule) => (
          <Panel key={rule.id}>
            <div className="text-[0.68rem] tracking-[0.1em] text-nbp-tx3 uppercase">{rule.kind}</div>
            <h2 className="mt-1 mb-1 text-[1.05rem] font-medium">
              {rule.weekday === 2 ? "Terças" : "Quintas"} · {rule.hour}
            </h2>
            <p className="m-0 text-[0.85rem] text-nbp-tx2">Rotação: {rule.rotation.join(" → ")}</p>
          </Panel>
        ))}
      </div>
      <Panel className="mb-6">
        <p className="m-0 text-[0.85rem] text-nbp-tx2">
          O calendário do membro combina estas regras com sessões 1:1. A grelha interativa está no
          portal em /app/calendario. Overrides pontuais ficam para o recorte com queries reais.
        </p>
      </Panel>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => shift(-1)} aria-label="Mês anterior">
          <Fa name="fa-chevron-left" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setYear(today.getFullYear());
            setMonth(today.getMonth());
            setSelected(isoDate(today));
          }}
        >
          Hoje
        </Button>
        <Button variant="ghost" size="sm" onClick={() => shift(1)} aria-label="Mês seguinte">
          <Fa name="fa-chevron-right" />
        </Button>
        <p className="m-0 ml-2 font-medium capitalize">
          {MES[month]} de {year}
        </p>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-[0.72rem] text-nbp-tx3">
        {DIAS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <Panel surface="elev" radius="lg" padding="none" className="grid grid-cols-7 overflow-hidden">
        {cells.map((d) => {
          const inMonth = d.getMonth() === month;
          const date = isoDate(d);
          const ev = eventsOn(d);
          const isSelected = date === selected;
          return (
            <div
              key={date}
              onClick={() => setSelected(date)}
              className={`min-h-[88px] border-t-[0.5px] border-l-[0.5px] border-nbp-bd p-1.5 text-left ${
                inMonth ? "bg-nbp-sup2" : "bg-nbp-bg text-nbp-tx3"
              } ${isSelected ? "ring-1 ring-nbp-salvia ring-inset" : ""}`}
            >
              <div className="mb-1 text-[0.75rem]">{d.getDate()}</div>
              {ev.map((e) => (
                <button
                  key={e.key}
                  type="button"
                  onClick={(click) => {
                    click.stopPropagation();
                    openEvent(e, date);
                  }}
                  className={`mb-0.5 block w-full cursor-pointer truncate rounded border-0 px-1 py-0.5 text-left text-[10px] ${chipClass(e.tone)}`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          );
        })}
      </Panel>

      {composerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          onClick={closeComposer}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-event-title"
            className="w-full max-w-[480px] rounded-[14px] border border-nbp-bd bg-nbp-sup p-5 shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 id="admin-event-title" className="m-0 text-[1.05rem] font-semibold text-nbp-tx">
                {activeKey ? "Editar evento" : "Novo evento"}
              </h2>
              <button
                type="button"
                aria-label="Fechar"
                onClick={closeComposer}
                className="cursor-pointer border-0 bg-transparent p-1 text-nbp-tx3 hover:text-nbp-tx"
              >
                <Fa name="fa-xmark" />
              </button>
            </div>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                saveEvent();
              }}
            >
              <Field label="Data" htmlFor="event-date" className="sm:col-span-2">
                <input
                  id="event-date"
                  type="date"
                  value={eventDate}
                  disabled={Boolean(activeKey?.startsWith("rule:"))}
                  onChange={(event) => setEventDate(event.target.value)}
                  className={fieldControlClass}
                  required
                />
              </Field>
              <Field label="Título" htmlFor="event-title">
                <input
                  id="event-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex. Tutoria de conteúdo"
                  className={fieldControlClass}
                  autoFocus
                  required
                />
              </Field>
              <Field label="Hora" htmlFor="event-hour">
                <input
                  id="event-hour"
                  value={hour}
                  onChange={(event) => setHour(event.target.value)}
                  className={fieldControlClass}
                />
              </Field>
              {activeKey?.startsWith("rule:") ? null : (
                <Field label="Tipo" htmlFor="event-kind">
                  <select
                    id="event-kind"
                    value={kind}
                    onChange={(event) => setKind(event.target.value as LiveEventKind)}
                    className={fieldControlClass}
                  >
                    {(Object.keys(KIND_LABEL) as LiveEventKind[]).map((value) => (
                      <option key={value} value={value}>
                        {KIND_LABEL[value]}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <div className="mt-1 flex flex-wrap gap-2 sm:col-span-2">
                <Button variant="primary" type="submit">
                  {activeKey ? "Guardar" : "Adicionar neste dia"}
                </Button>
                {activeKey ? (
                  <Button variant="danger" type="button" onClick={cancelEvent}>
                    Cancelar evento
                  </Button>
                ) : null}
                <Button variant="ghost" type="button" onClick={closeComposer}>
                  Fechar
                </Button>
              </div>
            </form>
            <p className="mt-3 mb-0 text-[0.78rem] text-nbp-tx3">
              As terças e quintas repetem-se a partir das regras da comunidade. O que criares ou
              cancelares fica guardado neste browser.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
