"use client";

import { useEffect, useMemo, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { PageHeader, Panel } from "@/components/Panel";
import { currentMember, sessions, userById } from "@/lib/mocks";

const STORAGE_KEY = "nbp-member-calendar-v1";

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

type PersonalEvent = {
  id: string;
  onDate: string;
  title: string;
  hour: string;
};

const SEED_EVENTS: PersonalEvent[] = [
  { id: "pe-1", onDate: "2026-08-12", title: "Gravar vídeo de onboarding", hour: "15h00" },
  { id: "pe-2", onDate: "2026-08-26", title: "Rever proposta com a equipa", hour: "09h30" },
  { id: "pe-3", onDate: "2026-09-16", title: "Enviar proposta à Vitor & Filhos", hour: "11h00" },
];

function isoDate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function readPersonalEvents(): PersonalEvent[] {
  if (typeof window === "undefined") return SEED_EVENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_EVENTS;
    const parsed = JSON.parse(raw) as Record<string, PersonalEvent[]>;
    const list = parsed[currentMember.id];
    return Array.isArray(list) ? list : SEED_EVENTS;
  } catch {
    return SEED_EVENTS;
  }
}

export default function CalendarioPage() {
  const mine = useMemo(
    () => sessions.filter((session) => session.member_id === currentMember.id && session.status !== "cancelled"),
    [],
  );
  const next = mine.find((session) => session.status === "scheduled") ?? mine[mine.length - 1];
  const start = next ? new Date(next.starts_at) : new Date();

  const [year, setYear] = useState(start.getFullYear());
  const [month, setMonth] = useState(start.getMonth());
  const [selected, setSelected] = useState(isoDate(start));
  const [events, setEvents] = useState<PersonalEvent[]>(SEED_EVENTS);

  useEffect(() => {
    setEvents(readPersonalEvents());
  }, []);

  const cells = useMemo(() => {
    const off = (new Date(year, month, 1).getDay() + 6) % 7;
    const origin = new Date(year, month, 1 - off);
    return Array.from({ length: 42 }, (_, i) => {
      const day = new Date(origin);
      day.setDate(origin.getDate() + i);
      return day;
    });
  }, [year, month]);

  function sessionsOn(date: string) {
    return mine.filter((session) => isoDate(new Date(session.starts_at)) === date);
  }

  function personalOn(date: string) {
    return events.filter((event) => event.onDate === date);
  }

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  const selectedDate = cells.find((day) => isoDate(day) === selected) ?? start;
  const daySessions = sessionsOn(selected);
  const dayEvents = personalOn(selected);

  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle="As tuas sessões e os teus eventos pessoais, no mesmo calendário, para veres conflitos de agenda."
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => shift(-1)} aria-label="Mês anterior">
          <Fa name="fa-chevron-left" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const today = new Date();
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
      <Panel surface="elev" radius="lg" padding="none" className="mb-5 grid grid-cols-7 overflow-hidden">
        {cells.map((day) => {
          const inMonth = day.getMonth() === month;
          const date = isoDate(day);
          const dayItems = [
            ...sessionsOn(date).map((session) => ({
              key: session.id,
              label: `1:1 ${userById(session.consultant_id)?.full_name.split(" ")[0] ?? "sessão"}`,
              tone: "session" as const,
            })),
            ...personalOn(date).map((event) => ({
              key: event.id,
              label: event.title,
              tone: "personal" as const,
            })),
          ];
          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelected(date)}
              className={`min-h-[88px] border-t-[0.5px] border-l-[0.5px] border-nbp-bd p-1.5 text-left ${
                inMonth ? "bg-nbp-sup2" : "bg-nbp-bg text-nbp-tx3"
              } ${date === selected ? "ring-1 ring-nbp-salvia ring-inset" : ""}`}
            >
              <div className="mb-1 text-[0.75rem]">{day.getDate()}</div>
              {dayItems.map((item) => (
                <div
                  key={item.key}
                  className={`mb-0.5 truncate rounded px-1 py-0.5 text-[10px] ${
                    item.tone === "session"
                      ? "bg-nbp-violet-deep text-nbp-violet-soft"
                      : "bg-nbp-fill text-nbp-salvia"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </button>
          );
        })}
      </Panel>

      <Panel>
        <h2 className="mt-0 mb-3 text-[1.02rem] font-semibold text-nbp-tx">
          {selectedDate.getDate()} de {MES[selectedDate.getMonth()]}
        </h2>
        {daySessions.length === 0 && dayEvents.length === 0 ? (
          <p className="m-0 text-[0.86rem] text-nbp-tx2">Nada neste dia.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {daySessions.length > 0 && dayEvents.length > 0 ? (
              <p className="m-0 text-[0.82rem] text-[#e8c48a]">
                Este dia tem sessão e evento pessoal. Confere se os horários se cruzam.
              </p>
            ) : null}
            {daySessions.map((session) => {
              const when = new Date(session.starts_at);
              const hh = String(when.getHours()).padStart(2, "0");
              const mm = String(when.getMinutes()).padStart(2, "0");
              const consultant = userById(session.consultant_id)?.full_name ?? "Consultor";
              return (
                <div
                  key={session.id}
                  className="rounded-[10px] bg-nbp-violet-deep px-3 py-2 text-[0.86rem] text-nbp-violet-soft"
                >
                  <span className="font-semibold">Sessão {session.session_number} · {consultant}</span>
                  <span className="ml-2 opacity-80">
                    {hh}h{mm} · {session.duration_min} min
                  </span>
                </div>
              );
            })}
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-[10px] bg-nbp-fill px-3 py-2 text-[0.86rem] text-nbp-salvia"
              >
                <span className="font-semibold">{event.title}</span>
                <span className="ml-2 opacity-80">{event.hour}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
