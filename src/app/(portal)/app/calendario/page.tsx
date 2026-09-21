"use client";

import { useMemo, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { PageHeader, Panel } from "@/components/Panel";
import { liveRules, nextSession } from "@/lib/mocks";

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

function eventsOn(d: Date) {
  const w = d.getDay();
  const n = Math.floor((d.getDate() - 1) / 7);
  const out: { label: string; kind: string }[] = [];
  const tut = liveRules.find((r) => r.weekday === 2);
  const acc = liveRules.find((r) => r.weekday === 4);
  if (w === 2 && tut) out.push({ label: tut.rotation[n % tut.rotation.length], kind: "tutoria" });
  if (w === 4 && acc) out.push({ label: acc.rotation[n % acc.rotation.length], kind: "acc" });
  const sess = new Date(nextSession.starts_at);
  if (
    d.getFullYear() === sess.getFullYear() &&
    d.getMonth() === sess.getMonth() &&
    d.getDate() === sess.getDate()
  ) {
    out.push({ label: "1:1 Marta", kind: "oneone" });
  }
  return out;
}

export default function CalendarioPage() {
  const [y, setY] = useState(2026);
  const [mo, setMo] = useState(7);

  const cells = useMemo(() => {
    const off = (new Date(y, mo, 1).getDay() + 6) % 7;
    const start = new Date(y, mo, 1 - off);
    return Array.from({ length: 42 }, (_, i) => {
      const dd = new Date(start);
      dd.setDate(start.getDate() + i);
      return dd;
    });
  }, [y, mo]);

  function shift(delta: number) {
    const d = new Date(y, mo + delta, 1);
    setY(d.getFullYear());
    setMo(d.getMonth());
  }

  return (
    <>
      <PageHeader title="Calendário de eventos" />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => shift(-1)}>
          <Fa name="fa-chevron-left" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setY(2026);
            setMo(7);
          }}
        >
          Hoje
        </Button>
        <Button variant="ghost" size="sm" onClick={() => shift(1)}>
          <Fa name="fa-chevron-right" />
        </Button>
        <p className="m-0 ml-2 font-medium capitalize">
          {MES[mo]} de {y}
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
          const inMonth = d.getMonth() === mo;
          const ev = eventsOn(d);
          return (
            <div
              key={d.toISOString()}
              className={`min-h-[88px] border-nbp-bd border-t-[0.5px] border-l-[0.5px] p-1.5 ${
                inMonth ? "bg-nbp-sup2" : "bg-nbp-bg text-nbp-tx3"
              }`}
            >
              <div className="mb-1 text-[0.75rem]">{d.getDate()}</div>
              {ev.map((e) => (
                <div
                  key={e.label}
                  className={`mb-0.5 truncate rounded px-1 py-0.5 text-[10px] ${
                    e.kind === "oneone"
                      ? "bg-nbp-violet-deep text-nbp-violet-soft"
                      : e.kind === "tutoria"
                        ? "bg-nbp-fill text-nbp-salvia"
                        : "bg-[#2a2418] text-[#e8c48a]"
                  }`}
                >
                  {e.label}
                </div>
              ))}
            </div>
          );
        })}
      </Panel>
    </>
  );
}
