"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { PlanJourney } from "@/components/PlanJourney";
import { PlanWhiteboard } from "@/components/PlanWhiteboard";
import { PageHeader, Panel } from "@/components/Panel";
import { EmptyState } from "@/components/ui";
import { readLocalPlans, saveBoard, boardOf, writeLocalPlans, type LocalPlanBook } from "@/lib/local-plans";
import {
  currentMember,
  lessons,
  planMonths,
  planObjectives as seedObjectives,
  planStages as seedStages,
} from "@/lib/mocks";
import type { NbpActionPlanObjective, NbpActionPlanStage, ObjectiveColumn } from "@/types/database";

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
const MAB = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

const CAMPOS = [
  { k: "mrr" as const, lb: "MRR", pre: "€", dec: 0, up: true },
  { k: "rec" as const, lb: "Receita total", pre: "€", dec: 0, up: true },
  { k: "nov" as const, lb: "Novos clientes", pre: "", dec: 0, up: true },
  { k: "act" as const, lb: "Clientes ativos", pre: "", dec: 0, up: true },
  { k: "chu" as const, lb: "Churn", pre: "", suf: "%", dec: 1, up: false },
  { k: "lea" as const, lb: "Leads", pre: "", dec: 0, up: true },
];

const COLS: { id: ObjectiveColumn; label: string; pill: string }[] = [
  { id: "none", label: "Não iniciado", pill: "none" },
  { id: "todo", label: "Em andamento", pill: "todo" },
  { id: "done", label: "Concluído", pill: "done" },
];

const LESSON_STYLE: Record<string, { bg: string; fg: string }> = {
  "m2.4": { bg: "#3A4A3A", fg: "#C6C8BA" },
  "m3.3": { bg: "#4A3A2A", fg: "#E0C4A8" },
  "m4.1": { bg: "#3A2A4A", fg: "#D2C0E0" },
};

function fmtVal(
  v: number | null | undefined,
  f: (typeof CAMPOS)[number],
) {
  if (v == null) return "—";
  return (
    (f.pre || "") +
    Number(v).toLocaleString("pt-PT", {
      minimumFractionDigits: f.dec,
      maximumFractionDigits: f.dec,
    }) +
    (f.suf || "")
  );
}

const julStages: NbpActionPlanStage[] = [
  { id: "j0", month_id: "pm-jul", position: 0, name: "Página em branco", status: "done", subtitle: "01 jul" },
  { id: "j1", month_id: "pm-jul", position: 1, name: "Posicionamento", status: "done", subtitle: "08 jul" },
  { id: "j2", month_id: "pm-jul", position: 2, name: "Oferta irresistível", status: "done", subtitle: "18 jul" },
  { id: "j3", month_id: "pm-jul", position: 3, name: "Aquisição de clientes", status: "locked", subtitle: "próximo" },
  { id: "j4", month_id: "pm-jul", position: 4, name: "Vendas previsíveis", status: "locked", subtitle: "dia 45" },
  { id: "j5", month_id: "pm-jul", position: 5, name: "Processos", status: "locked", subtitle: "dia 60" },
  { id: "j6", month_id: "pm-jul", position: 6, name: "Equipa", status: "locked", subtitle: "dia 80" },
  { id: "j7", month_id: "pm-jul", position: 7, name: "Delegação", status: "locked", subtitle: "dia 100" },
  { id: "j8", month_id: "pm-jul", position: 8, name: "Escala", status: "locked", subtitle: "continue" },
];

const julObjectives: NbpActionPlanObjective[] = [
  { id: "jo1", month_id: "pm-jul", stage_id: "j2", title: "Guião de descoberta escrito", column: "done", lesson_id: "m4.1", position: 0 },
  { id: "jo2", month_id: "pm-jul", stage_id: "j3", title: "Reduzir churn para 2,5%", column: "todo", lesson_id: null, position: 0 },
];

export function ActionPlanView() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8); // 1-12
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [localBook, setLocalBook] = useState<LocalPlanBook | null>(null);
  const [boardReady, setBoardReady] = useState(false);
  const [objs, setObjs] = useState(() => [...seedObjectives]);
  const [addingStage, setAddingStage] = useState<string | null>(null);
  const [addingObjective, setAddingObjective] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLesson, setNewLesson] = useState("");
  const [addError, setAddError] = useState("");

  useEffect(() => {
    setLocalBook(readLocalPlans(currentMember.id));
    setBoardReady(true);
  }, []);

  const localMonth = useMemo(
    () => localBook?.months.find((item) => item.year === year && item.month === month) ?? null,
    [localBook, year, month],
  );

  const plan = useMemo(
    () => localMonth ?? planMonths.find((p) => p.year === year && p.month === month) ?? null,
    [localMonth, year, month],
  );
  const prevPlan = useMemo(() => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return (
      localBook?.months.find((item) => item.year === prevYear && item.month === prevMonth) ??
      planMonths.find((p) => p.year === prevYear && p.month === prevMonth) ??
      null
    );
  }, [localBook, year, month]);

  const stages = localMonth
    ? (localBook?.stages[localMonth.id] ?? [])
    : month === 7
      ? julStages
      : seedStages.filter((stage) => stage.month_id === plan?.id);
  const monthObjs = useMemo(() => {
    if (localMonth) return objs.filter((objective) => objective.month_id === localMonth.id);
    if (month === 7) return julObjectives;
    return objs.filter((o) => o.month_id === plan?.id);
  }, [localMonth, month, objs, plan?.id]);

  useEffect(() => {
    if (!boardReady) return;
    if (localMonth && localBook) {
      setObjs(localBook.objectives[localMonth.id] ?? []);
      return;
    }
    if (month === 7) {
      setObjs(julObjectives);
      return;
    }
    setObjs(seedObjectives.filter((objective) => objective.month_id === plan?.id));
  }, [boardReady, localMonth?.id, month, plan?.id]);

  const doneN = monthObjs.filter((o) => o.column === "done").length;
  const pct = monthObjs.length ? Math.round((doneN / monthObjs.length) * 100) : 0;
  const fillPct = plan?.fill_pct ?? 0;
  const monthName = MES[month - 1];

  const editable = Boolean(localMonth) || month === 8;
  const board = plan ? boardOf(localBook, plan) : null;

  function commit(next: NbpActionPlanObjective[]) {
    setObjs(next);
    if (!localMonth || !localBook) return;
    const book: LocalPlanBook = {
      ...localBook,
      objectives: { ...localBook.objectives, [localMonth.id]: next },
    };
    writeLocalPlans(currentMember.id, book);
    setLocalBook(book);
  }

  function toggleObj(id: string) {
    commit(
      objs.map((o) =>
        o.id === id ? { ...o, column: o.column === "done" ? "todo" : "done" } : o,
      ),
    );
  }

  function removeObj(id: string) {
    commit(objs.filter((o) => o.id !== id));
  }

  function moveObj(id: string, stageId: string) {
    commit(objs.map((o) => (o.id === id ? { ...o, stage_id: stageId } : o)));
  }

  function moveColumn(id: string, column: ObjectiveColumn) {
    commit(objs.map((o) => (o.id === id ? { ...o, column } : o)));
  }

  function saveObjective() {
    const t = newTitle.trim();
    if (!t) {
      setAddError("Escreve o objetivo primeiro.");
      return;
    }
    if (!plan) return;
    const stageId = stages.find((stage) => stage.status === "current")?.id ?? stages[0]?.id ?? null;
    commit([
      ...objs,
      {
        id: `o-${Date.now()}`,
        month_id: plan.id,
        title: t,
        stage_id: stageId,
        column: "none",
        lesson_id: newLesson || null,
        position: objs.length,
      },
    ]);
    setAddingObjective(false);
    setNewTitle("");
    setNewLesson("");
    setAddError("");
  }

  function saveObj(stageId: string) {
    const t = newTitle.trim();
    if (!t) {
      setAddError("Escreve o objetivo primeiro.");
      return;
    }
    if (!plan) return;
    commit([
      ...objs,
      {
        id: `o-${Date.now()}`,
        month_id: plan.id,
        title: t,
        stage_id: stageId,
        column: "none",
        lesson_id: newLesson || null,
        position: objs.length,
      },
    ]);
    setAddingStage(null);
    setNewTitle("");
    setNewLesson("");
    setAddError("");
  }

  return (
    <>
      <PageHeader title="Plano de ação" subtitle="Define objetivos, acompanha números e avança no desafio." />

      <section className="mt-2" aria-label="Plano do mês">
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-4">
          <h2 className="m-0 text-[1.15rem] font-semibold text-nbp-tx">
            O teu plano do mês
            <span className="mt-0.5 block text-[0.84rem] font-normal text-nbp-tx2 lowercase">
              {monthName} de {year}
            </span>
          </h2>
          <div className="inline-flex items-center gap-1.5 text-[0.88rem] text-nbp-tx2 tabular-nums">
            <button
              type="button"
              aria-label="Ano anterior"
              className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2 hover:border-nbp-bd2 hover:text-nbp-tx"
              onClick={() => setYear((y) => y - 1)}
            >
              <Fa name="fa-chevron-left" />
            </button>
            <strong className="min-w-[42px] text-center font-semibold text-nbp-tx">
              {year}
            </strong>
            <button
              type="button"
              aria-label="Ano seguinte"
              className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-nbp-bd bg-nbp-sup2 text-nbp-tx2 hover:border-nbp-bd2 hover:text-nbp-tx"
              onClick={() => setYear((y) => y + 1)}
            >
              <Fa name="fa-chevron-right" />
            </button>
          </div>
        </div>

        <div
          className="mb-6 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Meses"
        >
          {MAB.map((nm, i) => {
            const m = i + 1;
            const on = m === month && year === 2026;
            const tem =
              planMonths.some((p) => p.year === year && p.month === m) ||
              Boolean(localBook?.months.some((p) => p.year === year && p.month === m));
            const fut = year > 2026 || (year === 2026 && m > 8);
            return (
              <button
                key={nm}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setMonth(m)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.82rem] transition ${
                  on
                    ? "border-nbp-salvia bg-nbp-fill font-semibold text-nbp-tx"
                    : fut
                      ? "border-nbp-bd bg-transparent text-[#5C5B55]"
                      : "border-nbp-bd bg-transparent text-nbp-tx2 hover:border-nbp-bd2 hover:text-nbp-tx"
                }`}
              >
                {nm}
                {tem ? (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${on ? "bg-nbp-salvia" : "bg-nbp-tx3"}`}
                    aria-hidden
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      {!plan ? (
        <EmptyState
          title={`Ainda não há nada em ${monthName}`}
          description="Regista os números, define os objetivos e avança no plano."
        />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-baseline gap-2.5">
            <h3 className="m-0 text-base font-semibold text-nbp-tx">
              Números de {monthName}
            </h3>
            {prevPlan ? (
              <span className="text-[0.82rem] text-nbp-tx2">
                comparado com {MES[prevPlan.month - 1]}
              </span>
            ) : null}
          </div>
          <div className="mb-7 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
            {CAMPOS.map((f) => {
              const v = plan[f.k];
              const pa = prevPlan?.[f.k];
              let dl: number | null = null;
              if (v != null && pa != null && Number(pa) !== 0) {
                dl = ((Number(v) - Number(pa)) / Number(pa)) * 100;
              }
              const bom =
                dl === null ? null : f.up ? dl > 0 : dl < 0;
              const delta =
                dl === null
                  ? ""
                  : Math.abs(dl) < 0.5
                    ? "— 0%"
                    : `${dl > 0 ? "↑" : "↓"} ${Math.abs(dl).toFixed(1).replace(".", ",")}%`;
              return (
                <Panel
                  key={f.k}
                  surface="elev"
                  radius="lg"
                  padding="none"
                  className="px-4 py-3.5"
                >
                  <div className="mb-2 text-[0.74rem] text-nbp-tx2">{f.lb}</div>
                  <div className="text-[1.35rem] font-bold tracking-[-0.02em] leading-[1.15] text-nbp-tx tabular-nums">
                    {f.pre ? (
                      <span className="mr-0.5 text-[0.9rem] font-medium text-nbp-tx2">
                        {f.pre}
                      </span>
                    ) : null}
                    {v == null
                      ? "—"
                      : Number(v).toLocaleString("pt-PT", {
                          minimumFractionDigits: f.dec,
                          maximumFractionDigits: f.dec,
                        })}
                    {f.suf || ""}
                  </div>
                  {delta ? (
                    <div
                      className={`mt-1.5 text-[0.74rem] tabular-nums ${
                        bom === true
                          ? "text-[#6BC4A0]"
                          : bom === false
                            ? "text-[#E87070]"
                            : "text-nbp-tx3"
                      }`}
                    >
                      {delta}
                    </div>
                  ) : null}
                  {pa != null ? (
                    <p className="mt-0.5 mb-0 text-[0.7rem] text-nbp-tx3">
                      antes {fmtVal(pa, f)}
                    </p>
                  ) : null}
                </Panel>
              );
            })}
          </div>

          <Panel
            surface="card"
            radius="3xl"
            padding="none"
            className="mb-7 px-[26px] pt-6 pb-[26px] max-[860px]:px-4"
            aria-label="Desafio do mês"
          >
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-1.5 text-[0.7rem] tracking-[0.14em] text-nbp-tx3 uppercase">
                  Desafio do mês
                </div>
                <h2 className="mt-0 mb-1.5 text-[1.4rem] font-semibold tracking-[-0.02em] text-nbp-tx">
                  {plan.title}
                </h2>
                <p className="m-0 max-w-[60ch] text-[0.88rem] text-nbp-tx2">
                  {plan.subtitle}
                </p>
              </div>
              <div className="shrink-0 text-right text-[0.82rem] text-nbp-tx2">
                <b className="font-bold text-nbp-tx">{plan.flag_main}</b>
                <br />
                {plan.flag_prefix}{" "}
                <span className="text-nbp-salvia">{plan.flag_target}</span>
              </div>
            </div>
            <PlanJourney
              stages={stages}
              fillPct={fillPct}
              selectedId={selectedStep}
              onSelect={setSelectedStep}
            />
          </Panel>

          <div className="mb-3 flex flex-wrap items-baseline gap-2.5">
            <h3 className="m-0 text-base font-semibold text-nbp-tx">Objetivos de {monthName}</h3>
            <span className="ml-auto text-[0.82rem] text-nbp-tx2 tabular-nums">
              {doneN}/{monthObjs.length}
            </span>
          </div>
          <div className="mb-3.5 h-1 overflow-hidden rounded-full bg-nbp-fill" aria-hidden>
            <span
              className="block h-full rounded-full bg-gradient-to-r from-[#8A8B82] to-[#C6C8BA] transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mb-8 grid grid-cols-1 items-start gap-3 min-[961px]:grid-cols-3">
            {COLS.map((col) => {
              const items = monthObjs.filter((objective) => objective.column === col.id);
              return (
                <div
                  key={col.id}
                  className="min-h-[120px] rounded-xl p-0.5"
                  onDragOver={(event) => {
                    if (!editable) return;
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    if (!editable) return;
                    event.preventDefault();
                    const id = event.dataTransfer.getData("text/plain");
                    if (id) moveColumn(id, col.id);
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.78rem] font-medium ${
                        col.pill === "none"
                          ? "bg-[rgba(198,200,186,0.08)] text-nbp-tx2"
                          : col.pill === "todo"
                            ? "bg-[rgba(93,169,240,0.12)] text-[#97C3EC]"
                            : "bg-[rgba(63,190,147,0.12)] text-[#63CBA6]"
                      }`}
                    >
                      <span
                        className={`h-[7px] w-[7px] rounded-full ${
                          col.pill === "none"
                            ? "bg-[#8A8B82]"
                            : col.pill === "todo"
                              ? "bg-[#5DA9F0]"
                              : "bg-[#3FBE93]"
                        }`}
                      />
                      {col.label}
                    </span>
                    <span className="ml-auto text-[0.74rem] text-nbp-tx3 tabular-nums">{items.length}</span>
                  </div>
                  {items.map((objective) => {
                    const done = objective.column === "done";
                    return (
                      <div
                        key={objective.id}
                        draggable={editable}
                        onDragStart={(event) => event.dataTransfer.setData("text/plain", objective.id)}
                        className="mb-2 rounded-[10px] border border-nbp-bd bg-nbp-sup2"
                      >
                        <div className="flex items-start gap-0.5">
                          <button
                            type="button"
                            className={`shrink-0 border-0 bg-transparent py-3 pr-2 pl-2.5 ${
                              done ? "text-[#3FBE93]" : "text-nbp-tx3"
                            }`}
                            aria-label={done ? "Reabrir" : "Concluir"}
                            onClick={() => (editable ? toggleObj(objective.id) : undefined)}
                          >
                            <Fa name={done ? "fa-circle-check" : "fa-circle"} regular={!done} />
                          </button>
                          <span
                            className={`min-w-0 flex-1 py-3 pr-2.5 text-[0.88rem] leading-normal ${
                              done ? "text-nbp-tx3 line-through" : "text-nbp-tx"
                            }`}
                          >
                            {objective.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {items.length === 0 && col.id !== "none" ? (
                    <p className="m-0 px-1.5 py-4 text-[0.8rem] text-nbp-tx3">Arrasta para aqui</p>
                  ) : null}
                  {col.id === "none" && editable && addingObjective ? (
                    <div className="mt-1 rounded-[10px] border border-nbp-bd bg-nbp-sup2 p-3">
                      <input
                        value={newTitle}
                        onChange={(event) => setNewTitle(event.target.value)}
                        placeholder="Novo objetivo"
                        aria-label="Novo objetivo"
                        className="mb-2 h-9 w-full rounded-lg border border-nbp-bd bg-nbp-fill px-2.5 text-[0.86rem] text-nbp-tx outline-none"
                      />
                      {addError ? <p className="mb-2 mt-0 text-[0.76rem] text-[#E87070]">{addError}</p> : null}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveObjective}
                          className="flex-1 rounded-lg border border-nbp-bd2 bg-nbp-tx px-2 py-2 text-[0.82rem] font-semibold text-[#181818]"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingObjective(false);
                            setAddError("");
                          }}
                          className="border-0 bg-transparent px-2.5 py-2 text-[0.82rem] text-nbp-tx2"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {col.id === "none" && editable && !addingObjective ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingObjective(true);
                        setAddingStage(null);
                        setAddError("");
                        setNewTitle("");
                      }}
                      className="flex w-full items-center gap-2 border-0 bg-transparent px-1 py-2.5 text-left text-[0.88rem] text-nbp-tx2 hover:text-nbp-tx"
                    >
                      <Fa name="fa-plus" /> Objetivo
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mb-3 flex flex-wrap items-baseline gap-2.5">
            <h3 className="m-0 text-base font-semibold text-nbp-tx">Tarefas de {monthName}</h3>
          </div>

          <div className="flex items-start gap-3 overflow-x-auto pb-2">
            {stages.map((stage) => {
              const items = monthObjs.filter((objective) => objective.stage_id === stage.id);
              return (
                <div
                  key={stage.id}
                  className="w-[250px] shrink-0 rounded-xl border border-nbp-bd bg-nbp-bg p-3"
                  onDragOver={(event) => {
                    if (!editable) return;
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    if (!editable) return;
                    event.preventDefault();
                    const id = event.dataTransfer.getData("text/plain");
                    if (id) moveObj(id, stage.id);
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="min-w-0 flex-1 text-[0.86rem] font-semibold text-nbp-tx">
                      {stage.name}
                    </span>
                    <span className="text-[0.74rem] text-nbp-tx3 tabular-nums">{items.length}</span>
                  </div>

                  {items.length === 0 ? (
                    <p className="m-0 px-1 py-3 text-[0.8rem] text-nbp-tx3">Larga uma tarefa aqui</p>
                  ) : null}

                  {items.map((o) => {
                    const lesson = lessons.find((l) => l.id === o.lesson_id);
                    const style = o.lesson_id ? LESSON_STYLE[o.lesson_id] : null;
                    const done = o.column === "done";
                    return (
                      <div
                        key={o.id}
                        draggable={editable}
                        onDragStart={(event) => event.dataTransfer.setData("text/plain", o.id)}
                        className="mb-2 rounded-[10px] border border-nbp-bd bg-nbp-sup2 transition hover:border-nbp-bd2"
                      >
                        <div className="flex items-start gap-0.5">
                          <button
                            type="button"
                            className={`shrink-0 border-0 bg-transparent py-3 pr-2 pl-2.5 ${
                              done ? "text-[#3FBE93]" : "text-nbp-tx3"
                            }`}
                            aria-label={done ? "Reabrir" : "Concluir"}
                            onClick={() => (editable ? toggleObj(o.id) : undefined)}
                          >
                            <Fa name={done ? "fa-circle-check" : "fa-circle"} regular={!done} />
                          </button>
                          <span
                            className={`min-w-0 flex-1 py-3 pr-1 text-[0.88rem] leading-normal ${
                              done ? "text-nbp-tx3 line-through" : "text-nbp-tx"
                            }`}
                          >
                            {o.title}
                          </span>
                          {editable ? (
                            <button
                              type="button"
                              className="shrink-0 border-0 bg-transparent py-3 pr-2.5 pl-2 text-nbp-tx3 hover:text-nbp-tx"
                              aria-label="Remover"
                              onClick={() => removeObj(o.id)}
                            >
                              <Fa name="fa-xmark" />
                            </button>
                          ) : null}
                        </div>
                        {lesson && style ? (
                          <Link
                            href="/app/conteudos"
                            className="mb-2.5 ml-[34px] mr-2.5 flex w-[calc(100%-44px)] items-center gap-2 rounded-lg border border-nbp-bd bg-transparent py-1.5 pr-2 pl-1.5 text-left hover:border-nbp-bd2 hover:bg-[rgba(253,255,239,0.02)]"
                          >
                            <span
                              className="flex h-[22px] w-[34px] shrink-0 items-center justify-center rounded text-[10px]"
                              style={{ background: style.bg, color: style.fg }}
                            >
                              <Fa name="fa-play" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[0.74rem] text-nbp-tx">{lesson.title}</span>
                              <span className="block text-[0.66rem] text-nbp-tx3">{lesson.duration_label}</span>
                            </span>
                          </Link>
                        ) : null}
                      </div>
                    );
                  })}

                  {editable && addingStage === stage.id ? (
                    <div className="mt-1 rounded-[10px] border border-nbp-bd bg-nbp-sup2 p-3">
                      <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Nova tarefa"
                        aria-label="Nova tarefa"
                        className="mb-2 h-9 w-full rounded-lg border border-nbp-bd bg-nbp-fill px-2.5 text-[0.86rem] text-nbp-tx outline-none focus:border-nbp-bd2"
                      />
                      <label className="mb-1 block text-[0.72rem] text-nbp-tx2">Aula para rever</label>
                      <select
                        value={newLesson}
                        onChange={(e) => setNewLesson(e.target.value)}
                        className="mb-2 h-9 w-full rounded-lg border border-nbp-bd bg-nbp-fill px-2.5 text-[0.86rem] text-nbp-tx outline-none"
                      >
                        <option value="">Sem aula</option>
                        {lessons
                          .filter((l) => ["m2.4", "m3.3", "m4.1"].includes(l.id))
                          .map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.title}
                            </option>
                          ))}
                      </select>
                      {addError ? (
                        <p className="mb-2 mt-0 text-[0.76rem] text-[#E87070]">{addError}</p>
                      ) : null}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveObj(stage.id)}
                          className="flex-1 rounded-lg border border-nbp-bd2 bg-nbp-tx px-2 py-2 text-[0.82rem] font-semibold text-[#181818]"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingStage(null);
                            setAddError("");
                          }}
                          className="border-0 bg-transparent px-2.5 py-2 text-[0.82rem] text-nbp-tx2"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {editable && addingStage !== stage.id ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingStage(stage.id);
                        setAddingObjective(false);
                        setAddError("");
                        setNewTitle("");
                      }}
                      className="flex w-full items-center gap-2 border-0 bg-transparent px-1 py-2.5 text-left text-[0.88rem] text-nbp-tx2 hover:text-nbp-tx"
                    >
                      <Fa name="fa-plus" /> Tarefa
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          {boardReady && plan && board ? (
            <PlanWhiteboard
              key={plan.id}
              monthLabel={monthName}
              initialShapes={board.tela}
              initialViewport={board.viewport}
              onChange={(tela, viewport) => {
                const book = localBook ?? {
                  months: [],
                  stages: {},
                  objectives: {},
                  boards: {},
                };
                setLocalBook(saveBoard(currentMember.id, book, plan.id, tela, viewport));
              }}
            />
          ) : null}
        </>
      )}
    </>
  );
}
