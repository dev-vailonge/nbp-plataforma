"use client";

import { FormEvent, use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fa } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { Field, PageHeader, Panel, fieldControlClass } from "@/components/Panel";
import { PlanWhiteboard } from "@/components/PlanWhiteboard";
import { Pill } from "@/components/Pill";
import { EmptyState } from "@/components/ui";
import { api } from "@/lib/api-client";
import { readLocalPlans, saveBoard, boardOf, writeLocalPlans, type LocalPlanBook } from "@/lib/local-plans";
import {
  formatEur,
  planMonths as mockPlanMonths,
  planObjectives as mockPlanObjectives,
  planStages,
  userById,
} from "@/lib/mocks";
import type {
  NbpActionPlanMonth,
  NbpActionPlanObjective,
  NbpActionPlanStage,
  NbpUser,
} from "@/types/database";

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

type DraftTask = { title: string; description: string };
type DraftStage = { id: string; name: string; tasks: DraftTask[] };
type TaskComposer = { title: string; description: string };

function freshDraft(): DraftStage[] {
  return [{ id: "draft-0", name: "", tasks: [] }];
}

function emptyComposer(): TaskComposer {
  return { title: "", description: "" };
}

type PlanCreateResult = {
  month: NbpActionPlanMonth;
  stages: NbpActionPlanStage[];
  objectives: NbpActionPlanObjective[];
};

export default function MemberPlanClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const search = useSearchParams();
  const forceNew = search.get("novo") === "1";

  const now = new Date();
  const qYear = Number(search.get("ano")) || now.getFullYear();
  const qMonth = Number(search.get("mes")) || now.getMonth() + 1;

  const mockMember = useMemo(() => userById(id) ?? null, [id]);
  const [member, setMember] = useState<NbpUser | null>(mockMember);
  const [months, setMonths] = useState<NbpActionPlanMonth[]>([]);
  const [year, setYear] = useState(qYear);
  const [month, setMonth] = useState(
    qMonth >= 1 && qMonth <= 12 ? qMonth : now.getMonth() + 1,
  );
  const [stages, setStages] = useState<NbpActionPlanStage[]>([]);
  const [objectives, setObjectives] = useState<NbpActionPlanObjective[]>([]);
  const [demoStagesByMonth, setDemoStagesByMonth] = useState<
    Record<string, NbpActionPlanStage[]>
  >({});
  const [demoObjectivesByMonth, setDemoObjectivesByMonth] = useState<
    Record<string, NbpActionPlanObjective[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [book, setBook] = useState<LocalPlanBook | null>(null);
  const [creating, setCreating] = useState(forceNew);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [flagMain, setFlagMain] = useState("");
  const [flagTarget, setFlagTarget] = useState("");
  const [draft, setDraft] = useState<DraftStage[]>(freshDraft);
  const [createStep, setCreateStep] = useState<"stages" | "tasks">("stages");
  const [taskDraft, setTaskDraft] = useState<Record<string, TaskComposer>>({});

  const plan = useMemo(
    () => months.find((p) => p.year === year && p.month === month) ?? null,
    [months, year, month],
  );

  const monthName = MES[month - 1];

  const loadDetailFor = useCallback(
    async (
      planMonth: NbpActionPlanMonth | null,
      isDemo: boolean,
      sessionStages?: Record<string, NbpActionPlanStage[]>,
      sessionObjectives?: Record<string, NbpActionPlanObjective[]>,
    ) => {
      if (!planMonth) {
        setStages([]);
        setObjectives([]);
        return;
      }
      if (isDemo || sessionStages?.[planMonth.id] || sessionObjectives?.[planMonth.id]) {
        const fromSession = sessionStages?.[planMonth.id];
        const objsFromSession = sessionObjectives?.[planMonth.id];
        setStages(
          fromSession ??
            planStages.filter((s) => s.month_id === planMonth.id),
        );
        setObjectives(
          objsFromSession ??
            mockPlanObjectives.filter((o) => o.month_id === planMonth.id),
        );
        return;
      }
      const detail = await api<
        NbpActionPlanMonth & {
          stages: NbpActionPlanStage[];
          objectives: NbpActionPlanObjective[];
        }
      >(`/api/v1/plans/${planMonth.id}`);
      if ("error" in detail) {
        setStages([]);
        setObjectives([]);
        return;
      }
      setStages(detail.data.stages ?? []);
      setObjectives(detail.data.objectives ?? []);
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const userRes = await api<NbpUser>(`/api/v1/users/${id}`);
    let resolved: NbpUser | null = null;
    if (!("error" in userRes)) {
      resolved = userRes.data;
    } else {
      resolved = mockMember;
      if (!resolved && id.startsWith("m-demo-")) {
        resolved = {
          id,
          auth_id: null,
          code: id,
          role: "membro",
          full_name: "Novo membro",
          email: "novo@nbp.local",
          company: null,
          city: null,
          sector: null,
          phone: null,
          instagram: null,
          bio: null,
          gender: null,
          avatar_url: null,
          membership_status: "ativo",
          phase: "convite_criado",
          phase_before_pause: null,
          invite_token: null,
          consultant_id: null,
          drive_folder_id: null,
          login_streak: 0,
          last_login_on: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }
    setMember(resolved);

    if (!resolved) {
      setLoading(false);
      setError("Membro não encontrado.");
      return;
    }

    const plansRes = await api<NbpActionPlanMonth[]>(
      `/api/v1/plans?user_id=${encodeURIComponent(resolved.id)}`,
    );

    let list: NbpActionPlanMonth[] = [];
    let isDemo = false;
    if ("error" in plansRes) {
      list = mockPlanMonths.filter((m) => m.user_id === resolved!.id);
      isDemo = true;
    } else {
      list = plansRes.data;
    }

    const local = readLocalPlans(resolved.id);
    if (local.months.length > 0) {
      const byId = new Map(list.map((item) => [item.id, item]));
      for (const item of local.months) byId.set(item.id, item);
      list = [...byId.values()];
    }

    setMonths(list);
    setDemo(isDemo);
    setBook(local);
    setDemoStagesByMonth(local.stages);
    setDemoObjectivesByMonth(local.objectives);

    const current =
      list.find((p) => p.year === year && p.month === month) ?? null;
    setCreating(forceNew && !current);
    await loadDetailFor(current, isDemo, local.stages, local.objectives);
    setLoading(false);
    // year/month only seed the first paint; month nav updates stages below
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: load once per member
  }, [id, mockMember, forceNew, loadDetailFor]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreateForMonth() {
    setTitle(`Plano ${monthName} ${year}`);
    setSubtitle("");
    setFlagMain("");
    setFlagTarget("");
    setDraft(freshDraft());
    setCreateStep("stages");
    setTaskDraft({});
    setCreating(true);
    setError(null);
  }

  async function selectMonth(m: number, nextYear = year) {
    setMonth(m);
    setYear(nextYear);
    setCreating(false);
    const found =
      months.find((p) => p.year === nextYear && p.month === m) ?? null;
    await loadDetailFor(found, demo, demoStagesByMonth, demoObjectivesByMonth);
  }

  async function shiftYear(delta: number) {
    const nextYear = year + delta;
    setYear(nextYear);
    setCreating(false);
    const found =
      months.find((p) => p.year === nextYear && p.month === month) ?? null;
    await loadDetailFor(found, demo, demoStagesByMonth, demoObjectivesByMonth);
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!member) return;
    setPending(true);
    setError(null);

    if (plan) {
      setError(`Já existe um plano para ${monthName} de ${year}.`);
      setPending(false);
      return;
    }

    const namedDraft = draft
      .map((stage) => ({
        ...stage,
        name: stage.name.trim(),
        tasks: stage.tasks
          .map((task) => ({ title: task.title.trim(), description: task.description.trim() }))
          .filter((task) => task.title),
      }))
      .filter((stage) => stage.name);

    if (namedDraft.length === 0) {
      setError("Adiciona pelo menos uma etapa.");
      setPending(false);
      return;
    }

    const stamp = Date.now();
    const builtStages: NbpActionPlanStage[] = namedDraft.map((stage, i) => ({
      id: `stg-${stamp}-${i}`,
      month_id: "",
      position: i,
      name: stage.name,
      subtitle: null,
      status: i === 0 ? "current" : "locked",
    }));
    const builtObjectives: NbpActionPlanObjective[] = [];
    namedDraft.forEach((stage, stageIndex) => {
      stage.tasks.forEach((task, taskIndex) => {
        builtObjectives.push({
          id: `obj-${stamp}-${stageIndex}-${taskIndex}`,
          month_id: "",
          stage_id: builtStages[stageIndex].id,
          title: task.title,
          description: task.description || null,
          column: "none",
          lesson_id: null,
          position: taskIndex,
        });
      });
    });

    if (demo) {
      const newMonth: NbpActionPlanMonth = {
        id: `pm-demo-${year}-${month}-${stamp}`,
        user_id: member.id,
        year,
        month,
        title: title || `Plano ${monthName} ${year}`,
        subtitle: subtitle || null,
        flag_main: flagMain || null,
        flag_prefix: "meta",
        flag_target: flagTarget || null,
        fill_pct: 0,
        mrr: null,
        rec: null,
        nov: null,
        act: null,
        chu: null,
        lea: null,
        tela: [],
        viewport: { ox: 0, oy: 0, z: 1 },
      };
      const newStages = builtStages.map((stage) => ({ ...stage, month_id: newMonth.id }));
      const newObjectives = builtObjectives.map((objective) => ({
        ...objective,
        month_id: newMonth.id,
      }));
      const nextMonths = [newMonth, ...months];
      const nextStages = { ...demoStagesByMonth, [newMonth.id]: newStages };
      const nextObjectives = { ...demoObjectivesByMonth, [newMonth.id]: newObjectives };
      setMonths(nextMonths);
      setStages(newStages);
      setObjectives(newObjectives);
      setDemoStagesByMonth(nextStages);
      setDemoObjectivesByMonth(nextObjectives);
      const previous = readLocalPlans(member.id);
      const nextBook: LocalPlanBook = {
        ...previous,
        months: [...previous.months.filter((item) => item.id !== newMonth.id), newMonth],
        stages: { ...previous.stages, [newMonth.id]: newStages },
        objectives: { ...previous.objectives, [newMonth.id]: newObjectives },
      };
      writeLocalPlans(member.id, nextBook);
      setBook(nextBook);
      setCreating(false);
      setPending(false);
      return;
    }

    const res = await api<PlanCreateResult>("/api/v1/plans", {
      method: "POST",
      body: JSON.stringify({
        user_id: member.id,
        year,
        month,
        title: title || `Plano ${monthName} ${year}`,
        subtitle: subtitle || null,
        flag_main: flagMain || null,
        flag_prefix: flagTarget ? "meta" : null,
        flag_target: flagTarget || null,
        stages: namedDraft.map((stage) => ({ name: stage.name })),
        objectives: builtObjectives.map((objective) => ({ title: objective.title })),
      }),
    });
    setPending(false);
    if ("error" in res) {
      setError(res.error.message);
      return;
    }
    const apiStages = [...(res.data.stages ?? [])].sort((a, b) => a.position - b.position);
    const linked = (res.data.objectives ?? []).map((objective, index) => {
      const local = builtObjectives[index];
      const stageIndex = builtStages.findIndex((stage) => stage.id === local?.stage_id);
      return {
        ...objective,
        description: local?.description ?? null,
        stage_id: apiStages[stageIndex]?.id ?? objective.stage_id ?? null,
      };
    });
    setMonths((prev) => [res.data.month, ...prev]);
    setStages(apiStages);
    setObjectives(linked);
    setCreating(false);
  }

  function addDraftStage() {
    setDraft((current) => [
      ...current,
      { id: `draft-${Date.now().toString(36)}`, name: "", tasks: [] },
    ]);
  }

  function removeDraftStage(stageId: string) {
    setDraft((current) => current.filter((stage) => stage.id !== stageId));
  }

  function continueToTasks() {
    const named = draft.map((stage) => ({ ...stage, name: stage.name.trim() })).filter((stage) => stage.name);
    if (named.length === 0) {
      setError("Adiciona pelo menos uma etapa.");
      return;
    }
    setDraft(named);
    setError(null);
    setCreateStep("tasks");
  }

  function addDraftTask(stageId: string) {
    const composer = taskDraft[stageId] ?? emptyComposer();
    const title = composer.title.trim();
    const description = composer.description.trim();
    if (!title) {
      setError("Escreve o título da tarefa.");
      return;
    }
    setError(null);
    setDraft((current) =>
      current.map((stage) =>
        stage.id === stageId
          ? { ...stage, tasks: [...stage.tasks, { title, description }] }
          : stage,
      ),
    );
    setTaskDraft((current) => ({ ...current, [stageId]: emptyComposer() }));
  }

  if (loading) {
    return <p className="text-nbp-tx2">A carregar plano…</p>;
  }

  if (!member) {
    return (
      <>
        <PageHeader title="Plano" />
        <EmptyState title="Membro não encontrado" description={error ?? undefined} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Plano de ${member.full_name}`}
        subtitle={
          <>
            <Link href="/admin/membros" className="text-nbp-tx2 hover:text-nbp-tx">
              ← Membros
            </Link>
            {" · "}
            <Link
              href={`/admin/membros/${member.code || member.id}`}
              className="text-nbp-tx2 hover:text-nbp-tx"
            >
              Ficha
            </Link>
          </>
        }
      />

      {demo ? (
        <p className="mb-4 rounded-[10px] border border-nbp-bd2 bg-nbp-sup2 px-3.5 py-2.5 text-[0.82rem] text-nbp-tx2">
          Modo local — planos criados ficam neste browser e aparecem no portal deste membro.
        </p>
      ) : null}

      {/* Navegação ano + meses (igual ao portal do membro) */}
      <section className="mb-5" aria-label="Plano do mês">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h2 className="m-0 text-[1.15rem] font-semibold text-nbp-tx">
            Plano do mês
            <span className="ml-2 text-[0.95rem] font-normal text-nbp-tx2">
              {monthName} de {year}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Ano anterior"
              className="cursor-pointer rounded-lg border border-nbp-bd px-2.5 py-1.5 text-nbp-tx2 hover:text-nbp-tx"
              onClick={() => void shiftYear(-1)}
            >
              <Fa name="fa-chevron-left" />
            </button>
            <span className="min-w-[3.5rem] text-center text-[0.9rem] font-medium text-nbp-tx">
              {year}
            </span>
            <button
              type="button"
              aria-label="Ano seguinte"
              className="cursor-pointer rounded-lg border border-nbp-bd px-2.5 py-1.5 text-nbp-tx2 hover:text-nbp-tx"
              onClick={() => void shiftYear(1)}
            >
              <Fa name="fa-chevron-right" />
            </button>
          </div>
        </div>

        <div
          className="mb-5 flex gap-1.5 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Meses"
        >
          {MAB.map((label, i) => {
            const m = i + 1;
            const on = m === month;
            const has = months.some((p) => p.year === year && p.month === m);
            return (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => void selectMonth(m)}
                className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.78rem] transition ${
                  on
                    ? "border-nbp-salvia bg-nbp-salvia font-semibold text-nbp-ink"
                    : "border-nbp-bd bg-transparent text-nbp-tx2 hover:border-nbp-bd2 hover:text-nbp-tx"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    has ? "bg-nbp-salvia" : "bg-nbp-tx3"
                  } ${on ? "!bg-nbp-ink" : ""}`}
                />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {creating ? (
        <Panel surface="card" className="mb-5">
          <h2 className="mt-0 mb-1 text-[1.1rem] font-semibold">
            {createStep === "stages" ? "1. Etapas" : "2. Tarefas"} — {monthName} {year}
          </h2>
          <p className="mt-0 mb-4 text-[0.86rem] text-nbp-tx2">
            {createStep === "stages"
              ? "Cria primeiro as etapas do plano. As tarefas entram no passo seguinte."
              : "Cada etapa já existe. Adiciona as tarefas com título e descrição."}
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (createStep === "stages") continueToTasks();
              else void onCreate(event);
            }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <Field label="Título do desafio" htmlFor="title" className="sm:col-span-2">
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Plano ${monthName} ${year}`}
                className={fieldControlClass}
              />
            </Field>
            <Field label="Descrição" htmlFor="subtitle" className="sm:col-span-2">
              <textarea
                id="subtitle"
                rows={2}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className={`${fieldControlClass} resize-y`}
              />
            </Field>
            <Field label="Flag principal" htmlFor="flagMain">
              <input
                id="flagMain"
                value={flagMain}
                onChange={(e) => setFlagMain(e.target.value)}
                placeholder="Ex. +3 clientes"
                className={fieldControlClass}
              />
            </Field>
            <Field label="Meta / alvo" htmlFor="flagTarget">
              <input
                id="flagTarget"
                value={flagTarget}
                onChange={(e) => setFlagTarget(e.target.value)}
                placeholder="Ex. 20k MRR"
                className={fieldControlClass}
              />
            </Field>
            {createStep === "stages" ? (
              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[0.72rem] tracking-[0.12em] text-nbp-tx3 uppercase">Etapas</span>
                  <Button type="button" variant="ghost" size="sm" onClick={addDraftStage}>
                    <Fa name="fa-plus" /> Etapa
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {draft.map((stage, index) => (
                    <div key={stage.id} className="flex items-center gap-2">
                      <span className="w-6 shrink-0 text-[0.78rem] text-nbp-tx3 tabular-nums">{index + 1}</span>
                      <input
                        value={stage.name}
                        aria-label={`Etapa ${index + 1}`}
                        onChange={(event) =>
                          setDraft((current) =>
                            current.map((item) =>
                              item.id === stage.id ? { ...item, name: event.target.value } : item,
                            ),
                          )
                        }
                        placeholder="Nome da etapa"
                        className={fieldControlClass}
                      />
                      {draft.length > 1 ? (
                        <button
                          type="button"
                          aria-label={`Remover etapa ${index + 1}`}
                          onClick={() => removeDraftStage(stage.id)}
                          className="cursor-pointer border-0 bg-transparent p-1 text-nbp-tx3 hover:text-nbp-tx"
                        >
                          <Fa name="fa-xmark" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:col-span-2">
                {draft.map((stage) => {
                  const composer = taskDraft[stage.id] ?? emptyComposer();
                  return (
                    <div key={stage.id} className="rounded-xl border border-nbp-bd bg-nbp-bg p-3.5">
                      <h3 className="mt-0 mb-3 text-[0.95rem] font-semibold text-nbp-tx">{stage.name}</h3>
                      {stage.tasks.length === 0 ? (
                        <p className="mt-0 mb-3 text-[0.82rem] text-nbp-tx3">Ainda sem tarefas nesta etapa.</p>
                      ) : (
                        <div className="mb-3 flex flex-col gap-2">
                          {stage.tasks.map((task, index) => (
                            <div
                              key={`${stage.id}-${index}`}
                              className="rounded-[10px] border border-nbp-bd bg-nbp-sup2 px-3 py-2.5"
                            >
                              <div className="flex items-start gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="m-0 text-[0.88rem] font-medium text-nbp-tx">{task.title}</p>
                                  {task.description ? (
                                    <p className="mt-1 mb-0 text-[0.8rem] leading-snug text-nbp-tx2">{task.description}</p>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  aria-label="Remover tarefa"
                                  className="cursor-pointer border-0 bg-transparent p-0 text-nbp-tx3"
                                  onClick={() =>
                                    setDraft((current) =>
                                      current.map((item) =>
                                        item.id === stage.id
                                          ? { ...item, tasks: item.tasks.filter((_, taskIndex) => taskIndex !== index) }
                                          : item,
                                      ),
                                    )
                                  }
                                >
                                  <Fa name="fa-xmark" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="grid gap-2">
                        <input
                          value={composer.title}
                          aria-label={`Título da tarefa em ${stage.name}`}
                          onChange={(event) =>
                            setTaskDraft((current) => ({
                              ...current,
                              [stage.id]: { ...composer, title: event.target.value },
                            }))
                          }
                          placeholder="Título da tarefa"
                          className={fieldControlClass}
                        />
                        <textarea
                          value={composer.description}
                          aria-label={`Descrição da tarefa em ${stage.name}`}
                          rows={3}
                          onChange={(event) =>
                            setTaskDraft((current) => ({
                              ...current,
                              [stage.id]: { ...composer, description: event.target.value },
                            }))
                          }
                          placeholder="Descrição: o que fazer, com quem e como saber que ficou feito"
                          className={`${fieldControlClass} resize-y`}
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => addDraftTask(stage.id)}>
                          <Fa name="fa-plus" /> Adicionar tarefa
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {error ? (
              <p className="m-0 text-sm text-[#e88585] sm:col-span-2">{error}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              {createStep === "stages" ? (
                <Button type="button" variant="primary" size="md" onClick={continueToTasks}>
                  Seguinte: tarefas
                </Button>
              ) : (
                <>
                  <Button type="submit" variant="primary" size="md" disabled={pending}>
                    {pending ? "A criar…" : "Criar plano deste mês"}
                  </Button>
                  <Button type="button" variant="ghost" size="md" onClick={() => setCreateStep("stages")}>
                    Voltar às etapas
                  </Button>
                </>
              )}
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setCreating(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {!creating && !plan ? (
        <div className="rounded-[12px] border border-dashed border-nbp-bd2 px-4 py-10 text-center">
          <h3 className="mt-0 mb-1.5 text-base text-nbp-tx">
            Ainda não há plano em {monthName} de {year}
          </h3>
          <p className="mt-0 mb-4 text-[0.86rem] text-nbp-tx2">
            Cada mês pode ter o seu próprio plano de ação (desafio, etapas e tarefas).
          </p>
          <Button type="button" variant="primary" size="md" onClick={openCreateForMonth}>
            <Fa name="fa-plus" /> Criar plano de {monthName}
          </Button>
        </div>
      ) : null}

      {!creating && plan ? (
        <>
          <Panel className="mb-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="mb-1 text-[0.68rem] tracking-[0.14em] text-nbp-tx3 uppercase">
                  Desafio do mês
                </div>
                <h2 className="mt-0 mb-1 text-[1.1rem]">
                  {plan.title || `${monthName} ${year}`}
                </h2>
                <p className="mt-0 mb-0 text-nbp-tx2">{plan.subtitle}</p>
              </div>
              <Pill>
                {monthName} {year}
              </Pill>
            </div>
            {(plan.flag_main || plan.flag_target) && (
              <p className="mt-0 mb-4 text-[0.9rem] text-nbp-tx">
                <b>{plan.flag_main}</b>
                {plan.flag_target ? (
                  <>
                    {" "}
                    · {plan.flag_prefix ?? "meta"}{" "}
                    <span className="text-nbp-salvia">{plan.flag_target}</span>
                  </>
                ) : null}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["MRR", plan.mrr != null ? `${formatEur(plan.mrr)} €` : "—"],
                ["Receita", plan.rec != null ? `${formatEur(plan.rec)} €` : "—"],
                ["Novos", plan.nov != null ? String(plan.nov) : "—"],
                ["Ativos", plan.act != null ? String(plan.act) : "—"],
                ["Churn", plan.chu != null ? `${plan.chu}%` : "—"],
                ["Leads", plan.lea != null ? String(plan.lea) : "—"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-[10px] border-[0.5px] border-nbp-bd bg-nbp-bg px-3 py-2"
                >
                  <div className="text-[0.65rem] text-nbp-tx3 uppercase">{k}</div>
                  <div className="font-medium">{v}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="mb-4">
            <h3 className="mt-0 mb-3 text-[0.9rem] text-nbp-tx2">Objetivos de {monthName}</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {(
                [
                  ["none", "Não iniciado"],
                  ["todo", "Em andamento"],
                  ["done", "Concluído"],
                ] as const
              ).map(([column, label]) => {
                const cards = objectives.filter((objective) => objective.column === column);
                return (
                  <div key={column}>
                    <div className="mb-2 text-[0.78rem] font-medium text-nbp-tx2">
                      {label} · {cards.length}
                    </div>
                    {cards.length === 0 ? (
                      <p className="m-0 text-[0.8rem] text-nbp-tx3">Sem objetivos neste estado.</p>
                    ) : (
                      cards.map((objective) => (
                        <div
                          key={objective.id}
                          className="mb-2 rounded-[10px] border border-nbp-bd bg-nbp-sup2 px-2.5 py-2 text-[0.84rem] text-nbp-tx"
                        >
                          {objective.title}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h3 className="m-0 text-[0.9rem] text-nbp-tx2">
                Tarefas de {monthName}
              </h3>
              {stages.some((stage) => stage.status === "current") ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (!plan || !member) return;
                    const ordered = [...stages].sort((a, b) => a.position - b.position);
                    const index = ordered.findIndex((stage) => stage.status === "current");
                    if (index < 0) return;
                    const nextStages = ordered.map((stage, i) => {
                      if (i === index) return { ...stage, status: "done" as const };
                      if (i === index + 1) return { ...stage, status: "current" as const };
                      return stage;
                    });
                    setStages(nextStages);
                    setDemoStagesByMonth((current) => ({ ...current, [plan.id]: nextStages }));
                    const base = book ?? { months: [], stages: {}, objectives: {}, boards: {} };
                    const nextBook = {
                      ...base,
                      stages: { ...base.stages, [plan.id]: nextStages },
                    };
                    writeLocalPlans(member.id, nextBook);
                    setBook(nextBook);
                  }}
                >
                  Concluir {stages.find((stage) => stage.status === "current")?.name}
                </Button>
              ) : null}
            </div>
            {stages.length === 0 ? (
              <p className="m-0 text-nbp-tx3">Sem etapas neste mês.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {stages.map((stage) => {
                  const cards = objectives.filter((objective) => objective.stage_id === stage.id);
                  return (
                    <div
                      key={stage.id}
                      className="w-[240px] shrink-0 rounded-xl border border-nbp-bd bg-nbp-bg p-3"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-[0.86rem] font-semibold text-nbp-tx">{stage.name}</span>
                        <span className="text-[0.74rem] text-nbp-tx3">{cards.length}</span>
                      </div>
                      {cards.length === 0 ? (
                        <p className="m-0 text-[0.8rem] text-nbp-tx3">Sem tarefas nesta etapa.</p>
                      ) : (
                        cards.map((objective) => (
                          <div
                            key={objective.id}
                            className="mb-2 rounded-[10px] border border-nbp-bd bg-nbp-sup2 px-2.5 py-2 text-[0.84rem] text-nbp-tx"
                          >
                            <span className="block">{objective.title}</span>
                            {objective.description ? (
                              <span className="mt-1 block text-[0.78rem] leading-snug text-nbp-tx2">
                                {objective.description}
                              </span>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
          <PlanWhiteboard
            key={plan.id}
            monthLabel={monthName}
            initialShapes={boardOf(book, plan).tela}
            initialViewport={boardOf(book, plan).viewport}
            onChange={(tela, viewport) => {
              const current = book ?? { months: [], stages: {}, objectives: {}, boards: {} };
              const next = saveBoard(member.id, current, plan.id, tela, viewport);
              setBook(next);
              setMonths((items) =>
                items.map((item) => (item.id === plan.id && next.months.some((saved) => saved.id === plan.id)
                  ? { ...item, tela, viewport }
                  : item)),
              );
            }}
          />
        </>
      ) : null}
    </>
  );
}
