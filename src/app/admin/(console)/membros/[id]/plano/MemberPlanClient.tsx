"use client";

import { FormEvent, use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fa } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Field, PageHeader, Panel, fieldControlClass } from "@/components/Panel";
import { PlanJourney } from "@/components/PlanJourney";
import { PlanWhiteboard } from "@/components/PlanWhiteboard";
import { Pill } from "@/components/Pill";
import { EmptyState } from "@/components/ui";
import { api } from "@/lib/api-client";
import {
  objectiveTone,
  readLocalPlans,
  syncObjectiveFromTasks,
  saveBoard,
  boardOf,
  withCurrentStage,
  writeLocalPlans,
  type LocalPlanBook,
} from "@/lib/local-plans";
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
  ObjectiveColumn,
} from "@/types/database";

const OBJECTIVE_COLS: { id: ObjectiveColumn; label: string; pill: "none" | "todo" | "done" }[] = [
  { id: "none", label: "Não iniciado", pill: "none" },
  { id: "todo", label: "Em andamento", pill: "todo" },
  { id: "done", label: "Concluído", pill: "done" },
];

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
type TaskComposer = { title: string; description: string; objectiveId: string };
type ObjectiveComposer = {
  title: string;
  description: string;
  taskIds: string[];
};

function freshDraft(): DraftStage[] {
  return [{ id: "draft-0", name: "", tasks: [] }];
}

function emptyComposer(): TaskComposer {
  return { title: "", description: "", objectiveId: "" };
}

function emptyObjective(): ObjectiveComposer {
  return { title: "", description: "", taskIds: [] };
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
  const [addingObjective, setAddingObjective] = useState(false);
  const [objectiveDraft, setObjectiveDraft] = useState<ObjectiveComposer>(emptyObjective());
  const [composingStage, setComposingStage] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | {
    title: string;
    body: string;
    confirmLabel: string;
    run: () => void;
  }>(null);

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
          kind: "task",
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

  function persistPlan(nextStages: NbpActionPlanStage[], nextObjectives: NbpActionPlanObjective[]) {
    if (!plan || !member) return;
    const stagesNext = withCurrentStage(nextStages);
    setStages(stagesNext);
    setObjectives(nextObjectives);
    setDemoStagesByMonth((current) => ({ ...current, [plan.id]: stagesNext }));
    setDemoObjectivesByMonth((current) => ({ ...current, [plan.id]: nextObjectives }));
    const base = book ?? { months: [], stages: {}, objectives: {}, boards: {} };
    const monthsNext = base.months.some((item) => item.id === plan.id)
      ? base.months
      : [...base.months, plan];
    const nextBook: LocalPlanBook = {
      ...base,
      months: monthsNext,
      stages: { ...base.stages, [plan.id]: stagesNext },
      objectives: { ...base.objectives, [plan.id]: nextObjectives },
    };
    writeLocalPlans(member.id, nextBook);
    setBook(nextBook);
    if (!months.some((item) => item.id === plan.id)) {
      setMonths((current) => (current.some((item) => item.id === plan.id) ? current : [plan, ...current]));
    }
  }

  function renameSavedStage(stageId: string, name: string) {
    persistPlan(
      stages.map((stage) => (stage.id === stageId ? { ...stage, name } : stage)),
      objectives,
    );
  }

  function concludeSavedStage() {
    if (!plan || !member) return;
    const ordered = [...stages].sort((a, b) => a.position - b.position);
    const index = ordered.findIndex((stage) => stage.status === "current");
    if (index < 0) return;
    const nextStages = ordered.map((stage, i) => {
      if (i === index) return { ...stage, status: "done" as const };
      if (i === index + 1) return { ...stage, status: "current" as const };
      return stage;
    });
    persistPlan(nextStages, objectives);
  }

  function addSavedStage() {
    if (!plan) return;
    persistPlan(
      [
        ...stages,
        {
          id: `stg-${Date.now()}`,
          month_id: plan.id,
          position: stages.length,
          name: "Nova etapa",
          status: stages.some((stage) => stage.status === "current") ? "locked" : "current",
          subtitle: null,
        },
      ],
      objectives,
    );
  }

  function removeSavedStage(stageId: string) {
    const touched = new Set(
      objectives
        .filter((item) => item.kind === "task" && item.stage_id === stageId)
        .map((item) => item.objective_id)
        .filter((id): id is string => Boolean(id)),
    );
    let next = objectives.filter((objective) => objective.stage_id !== stageId);
    for (const id of touched) next = syncObjectiveFromTasks(next, id);
    persistPlan(
      stages.filter((stage) => stage.id !== stageId),
      next,
    );
  }

  function removeSavedTask(taskId: string) {
    const removed = objectives.find((item) => item.id === taskId);
    const next = objectives.filter((objective) => objective.id !== taskId);
    persistPlan(stages, syncObjectiveFromTasks(next, removed?.objective_id));
  }

  function updateSavedTask(
    taskId: string,
    patch: { title?: string; description?: string | null; objective_id?: string | null },
  ) {
    const previous = objectives.find((item) => item.id === taskId);
    const next = objectives.map((objective) => (objective.id === taskId ? { ...objective, ...patch } : objective));
    const updated = next.find((item) => item.id === taskId);
    let synced = syncObjectiveFromTasks(next, previous?.kind === "task" ? previous.objective_id : null);
    if (updated?.kind === "task" && updated.objective_id !== previous?.objective_id) {
      synced = syncObjectiveFromTasks(synced, updated.objective_id);
    }
    persistPlan(stages, synced);
  }

  function moveSavedColumn(taskId: string, column: ObjectiveColumn) {
    const next = objectives.map((objective) => (objective.id === taskId ? { ...objective, column } : objective));
    const changed = next.find((item) => item.id === taskId);
    persistPlan(stages, changed?.kind === "task" ? syncObjectiveFromTasks(next, changed.objective_id) : next);
  }

  function moveSavedToStage(taskId: string, stageId: string) {
    persistPlan(
      stages,
      objectives.map((objective) => (objective.id === taskId ? { ...objective, stage_id: stageId } : objective)),
    );
  }

  function removeSavedObjective(objectiveId: string) {
    persistPlan(
      stages,
      objectives.filter((objective) => objective.id !== objectiveId && objective.objective_id !== objectiveId),
    );
  }

  function addSavedObjective() {
    if (!plan) return;
    const title = objectiveDraft.title.trim();
    if (!title) {
      setError("Escreve o título do objetivo.");
      return;
    }
    const objectiveId = `obj-${Date.now()}`;
    const selected = new Set(objectiveDraft.taskIds);
    const next = objectives.map((item) =>
      item.kind === "task" && selected.has(item.id) ? { ...item, objective_id: objectiveId } : item,
    );
    persistPlan(
      stages,
      syncObjectiveFromTasks(
        [
          ...next,
          {
            id: objectiveId,
            month_id: plan.id,
            stage_id: null,
            title,
            description: objectiveDraft.description.trim() || null,
            column: "none" as const,
            lesson_id: null,
            position: objectives.length,
            kind: "objective" as const,
            objective_id: null,
          },
        ],
        objectiveId,
      ),
    );
    setObjectiveDraft(emptyObjective());
    setAddingObjective(false);
    setError(null);
  }

  function addSavedTask(stageId: string) {
    if (!plan) return;
    const goals = objectives.filter((objective) => objective.kind !== "task");
    if (goals.length === 0) {
      setError("Cria um objetivo primeiro. A tarefa fica ligada a ele.");
      return;
    }
    const composer = taskDraft[stageId] ?? emptyComposer();
    const title = composer.title.trim();
    if (!title) {
      setError("Escreve o título da tarefa.");
      return;
    }
    if (!goals.some((goal) => goal.id === composer.objectiveId)) {
      setError("Escolhe o objetivo desta tarefa.");
      return;
    }
    setError(null);
    const inStage = objectives.filter((objective) => objective.stage_id === stageId && objective.kind === "task").length;
    persistPlan(stages, [
      ...objectives,
      {
        id: `task-${Date.now()}`,
        month_id: plan.id,
        stage_id: stageId,
        title,
        description: composer.description.trim() || null,
        column: "none",
        lesson_id: null,
        position: inStage,
        kind: "task",
        objective_id: composer.objectiveId,
      },
    ]);
    setTaskDraft((current) => ({ ...current, [stageId]: emptyComposer() }));
    setComposingStage(null);
  }

  function askConfirm(next: { title: string; body: string; confirmLabel: string; run: () => void }) {
    setConfirm({
      ...next,
      run: () => {
        next.run();
        setConfirm(null);
      },
    });
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
                          onClick={() =>
                            askConfirm({
                              title: "Excluir etapa",
                              body: `Queres excluir «${stage.name.trim() || `etapa ${index + 1}`}»?`,
                              confirmLabel: "Excluir etapa",
                              run: () => removeDraftStage(stage.id),
                            })
                          }
                          className="cursor-pointer rounded-md border border-nbp-bd bg-transparent p-1 text-nbp-tx3 hover:text-nbp-tx"
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
                      <div className="mb-3 flex items-center gap-2">
                        <input
                          value={stage.name}
                          aria-label={`Nome da etapa ${stage.name}`}
                          onChange={(event) =>
                            setDraft((current) =>
                              current.map((item) =>
                                item.id === stage.id ? { ...item, name: event.target.value } : item,
                              ),
                            )
                          }
                          className={fieldControlClass}
                        />
                        <button
                          type="button"
                          aria-label={`Excluir etapa ${stage.name}`}
                          onClick={() =>
                            askConfirm({
                              title: "Excluir etapa",
                              body: `Queres excluir «${stage.name}»? As tarefas desta etapa também saem.`,
                              confirmLabel: "Excluir etapa",
                              run: () => removeDraftStage(stage.id),
                            })
                          }
                          className="cursor-pointer rounded-md border border-nbp-bd bg-transparent p-1.5 text-nbp-tx3 hover:text-nbp-tx"
                        >
                          <Fa name="fa-xmark" />
                        </button>
                      </div>
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
                                  className="cursor-pointer rounded-md border border-nbp-bd bg-transparent p-1 text-nbp-tx3"
                                  onClick={() =>
                                    askConfirm({
                                      title: "Excluir tarefa",
                                      body: `Queres excluir «${task.title}»?`,
                                      confirmLabel: "Excluir tarefa",
                                      run: () =>
                                        setDraft((current) =>
                                          current.map((item) =>
                                            item.id === stage.id
                                              ? {
                                                  ...item,
                                                  tasks: item.tasks.filter((_, taskIndex) => taskIndex !== index),
                                                }
                                              : item,
                                          ),
                                        ),
                                    })
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
                <Button type="button" variant="ghost" size="sm" onClick={addDraftStage}>
                  <Fa name="fa-plus" /> Etapa
                </Button>
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
            {stages.length > 0 ? (
              <div className="mt-5">
                <PlanJourney
                  stages={[...stages].sort((a, b) => a.position - b.position)}
                  fillPct={
                    stages.length
                      ? Math.round((stages.filter((stage) => stage.status === "done").length / stages.length) * 100)
                      : 0
                  }
                />
                {stages.some((stage) => stage.status === "current") ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button type="button" variant="solid" size="sm" onClick={concludeSavedStage}>
                      Concluir {stages.find((stage) => stage.status === "current")?.name}
                    </Button>
                    <p className="m-0 text-[0.8rem] text-nbp-tx2">A etapa seguinte fica disponível para o membro.</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Panel>

          <div className="mb-3 flex flex-wrap items-baseline gap-2.5">
            <h3 className="m-0 text-base font-semibold text-nbp-tx">Objetivos de {monthName}</h3>
            <span className="ml-auto text-[0.82rem] text-nbp-tx2 tabular-nums">
              {objectives.filter((objective) => objective.kind !== "task" && objective.column === "done").length}/
              {objectives.filter((objective) => objective.kind !== "task").length}
            </span>
          </div>
          <div className="mb-8 grid grid-cols-1 items-start gap-3 min-[961px]:grid-cols-3">
            {OBJECTIVE_COLS.map((col) => {
              const cards = objectives.filter((objective) => objective.kind !== "task" && objective.column === col.id);
              return (
                <div
                  key={col.id}
                  className="min-h-[120px] rounded-xl p-0.5"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const id = event.dataTransfer.getData("text/plain");
                    if (id) moveSavedColumn(id, col.id);
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
                          col.pill === "none" ? "bg-[#8A8B82]" : col.pill === "todo" ? "bg-[#5DA9F0]" : "bg-[#3FBE93]"
                        }`}
                      />
                      {col.label}
                    </span>
                    <span className="ml-auto text-[0.74rem] text-nbp-tx3 tabular-nums">{cards.length}</span>
                  </div>
                  {cards.map((objective) => {
                    const tone = objectiveTone(
                      objective.id,
                      objectives.filter((item) => item.kind !== "task"),
                    );
                    return (
                    <div
                      key={objective.id}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("text/plain", objective.id)}
                      className="mb-2 rounded-[10px] border border-nbp-bd bg-nbp-sup2"
                      style={{ boxShadow: `inset 3px 0 0 ${tone}` }}
                    >
                      <div className="flex items-start gap-1 px-2.5 py-2.5">
                        <div className="min-w-0 flex-1">
                          <input
                            value={objective.title}
                            aria-label={`Título do objetivo ${objective.title}`}
                            onChange={(event) => updateSavedTask(objective.id, { title: event.target.value })}
                            className="w-full border-0 bg-transparent p-0 text-[0.88rem] text-nbp-tx outline-none"
                          />
                          <textarea
                            value={objective.description ?? ""}
                            aria-label={`Descrição do objetivo ${objective.title}`}
                            rows={2}
                            onChange={(event) =>
                              updateSavedTask(objective.id, { description: event.target.value || null })
                            }
                            placeholder="Descrição"
                            className="mt-1 w-full resize-y border-0 bg-transparent p-0 text-[0.78rem] text-nbp-tx2 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          aria-label={`Excluir objetivo ${objective.title}`}
                          onClick={() =>
                            askConfirm({
                              title: "Excluir objetivo",
                              body: `Queres excluir «${objective.title}»? As tarefas ligadas a este objetivo também saem.`,
                              confirmLabel: "Excluir",
                              run: () => removeSavedObjective(objective.id),
                            })
                          }
                          className="cursor-pointer border-0 bg-transparent p-1 text-nbp-tx3 hover:text-nbp-tx"
                        >
                          <Fa name="fa-xmark" />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                  {cards.length === 0 && col.id !== "none" ? (
                    <p className="m-0 px-1.5 py-4 text-[0.8rem] text-nbp-tx3">Arrasta para aqui</p>
                  ) : null}
                  {col.id === "none" && addingObjective ? (
                    <div className="mt-1 rounded-[10px] border border-nbp-bd bg-nbp-sup2 p-3">
                      <input
                        value={objectiveDraft.title}
                        onChange={(event) => setObjectiveDraft((current) => ({ ...current, title: event.target.value }))}
                        placeholder="Novo objetivo"
                        aria-label="Novo objetivo"
                        className="mb-2 h-9 w-full rounded-lg border border-nbp-bd bg-nbp-fill px-2.5 text-[0.86rem] text-nbp-tx outline-none"
                      />
                      <textarea
                        value={objectiveDraft.description}
                        onChange={(event) =>
                          setObjectiveDraft((current) => ({ ...current, description: event.target.value }))
                        }
                        placeholder="Descrição"
                        aria-label="Descrição do objetivo"
                        rows={2}
                        className="mb-2 w-full resize-y rounded-lg border border-nbp-bd bg-nbp-fill px-2.5 py-2 text-[0.82rem] text-nbp-tx outline-none"
                      />
                      <p className="mt-1 mb-2 text-[0.72rem] font-medium tracking-[0.08em] text-nbp-tx3 uppercase">
                        Tarefas já criadas
                      </p>
                      {objectives.filter((item) => item.kind === "task").length === 0 ? (
                        <p className="m-0 mb-3 text-[0.78rem] text-nbp-tx2">
                          Cria as tarefas na etapa. Depois marca aqui as que pertencem a este objetivo.
                        </p>
                      ) : (
                        <div className="mb-3 max-h-40 space-y-1.5 overflow-y-auto">
                          {objectives
                            .filter((item) => item.kind === "task")
                            .map((task) => {
                              const stageName = stages.find((stage) => stage.id === task.stage_id)?.name;
                              const currentGoal = objectives.find((item) => item.id === task.objective_id);
                              const checked = objectiveDraft.taskIds.includes(task.id);
                              return (
                                <label key={task.id} className="flex cursor-pointer items-start gap-2 text-[0.8rem] text-nbp-tx">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      setObjectiveDraft((current) => ({
                                        ...current,
                                        taskIds: checked
                                          ? current.taskIds.filter((id) => id !== task.id)
                                          : [...current.taskIds, task.id],
                                      }))
                                    }
                                    className="mt-1"
                                  />
                                  <span className="min-w-0">
                                    {task.title}
                                    <span className="block text-[0.72rem] text-nbp-tx3">
                                      {stageName ?? "Sem etapa"}
                                      {currentGoal ? ` · ${currentGoal.title}` : ""}
                                    </span>
                                  </span>
                                </label>
                              );
                            })}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={addSavedObjective}
                          className="flex-1 rounded-lg border border-nbp-bd2 bg-nbp-tx px-2 py-2 text-[0.82rem] font-semibold text-[#181818]"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingObjective(false);
                            setObjectiveDraft(emptyObjective());
                          }}
                          className="border-0 bg-transparent px-2.5 py-2 text-[0.82rem] text-nbp-tx2"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {col.id === "none" && !addingObjective ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingObjective(true);
                        setObjectiveDraft(emptyObjective());
                        setError(null);
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

          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            <h3 className="m-0 text-base font-semibold text-nbp-tx">Tarefas de {monthName}</h3>
            <Button type="button" variant="ghost" size="sm" onClick={addSavedStage}>
              <Fa name="fa-plus" /> Etapa
            </Button>
          </div>
          <Panel>
            {stages.length === 0 ? (
              <p className="m-0 text-nbp-tx3">Sem etapas neste mês.</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {stages.map((stage) => {
                  const cards = objectives.filter((objective) => objective.kind === "task" && objective.stage_id === stage.id);
                  const goals = objectives.filter((objective) => objective.kind !== "task");
                  return (
                    <div
                      key={stage.id}
                      className="w-[250px] shrink-0 rounded-xl border border-nbp-bd bg-nbp-bg p-3"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const id = event.dataTransfer.getData("text/plain");
                        if (id) moveSavedToStage(id, stage.id);
                      }}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <input
                          value={stage.name}
                          aria-label={`Nome da etapa ${stage.name}`}
                          onChange={(event) => renameSavedStage(stage.id, event.target.value)}
                          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[0.86rem] font-semibold text-nbp-tx outline-none"
                        />
                        <span className="text-[0.74rem] text-nbp-tx3 tabular-nums">{cards.length}</span>
                        <button
                          type="button"
                          aria-label={`Excluir etapa ${stage.name}`}
                          onClick={() =>
                            askConfirm({
                              title: "Excluir etapa",
                              body: `Queres excluir «${stage.name}»? As tarefas desta etapa também saem.`,
                              confirmLabel: "Excluir etapa",
                              run: () => removeSavedStage(stage.id),
                            })
                          }
                          className="cursor-pointer border-0 bg-transparent p-1 text-nbp-tx3 hover:text-nbp-tx"
                        >
                          <Fa name="fa-xmark" />
                        </button>
                      </div>
                      {cards.length === 0 && composingStage !== stage.id ? (
                        <p className="m-0 px-1 py-3 text-[0.8rem] text-nbp-tx3">Larga uma tarefa aqui</p>
                      ) : null}
                      {cards.map((objective) => {
                        const done = objective.column === "done";
                        const editing = editingTask === objective.id;
                        const parent = goals.find((goal) => goal.id === objective.objective_id);
                        const tone = parent ? objectiveTone(parent.id, goals) : "#8A8B82";
                        return (
                          <div
                            key={objective.id}
                            draggable={!editing}
                            onDragStart={(event) => event.dataTransfer.setData("text/plain", objective.id)}
                            className="mb-2 rounded-[10px] border border-nbp-bd bg-nbp-sup2"
                            style={{ boxShadow: `inset 3px 0 0 ${tone}` }}
                          >
                            <div className="flex items-start gap-0.5">
                              <button
                                type="button"
                                className={`shrink-0 border-0 bg-transparent py-3 pr-2 pl-2.5 ${
                                  done ? "text-[#3FBE93]" : "text-nbp-tx3"
                                }`}
                                aria-label={done ? "Reabrir" : "Concluir"}
                                onClick={() => moveSavedColumn(objective.id, done ? "none" : "done")}
                              >
                                <Fa name={done ? "fa-circle-check" : "fa-circle"} regular={!done} />
                              </button>
                              {editing ? (
                                <div className="min-w-0 flex-1 py-2 pr-1">
                                  <select
                                    value={objective.objective_id ?? ""}
                                    aria-label={`Objetivo da tarefa ${objective.title}`}
                                    onChange={(event) =>
                                      updateSavedTask(objective.id, { objective_id: event.target.value || null })
                                    }
                                    className="mb-1 h-8 w-full rounded-lg border border-nbp-bd bg-nbp-fill px-2 text-[0.78rem] text-nbp-tx outline-none"
                                  >
                                    <option value="">Escolhe o objetivo</option>
                                    {goals.map((goal) => (
                                      <option key={goal.id} value={goal.id}>
                                        {goal.title}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    value={objective.title}
                                    aria-label={`Título da tarefa ${objective.title}`}
                                    onChange={(event) => updateSavedTask(objective.id, { title: event.target.value })}
                                    className="mb-1 w-full rounded-lg border border-nbp-bd bg-nbp-fill px-2 py-1.5 text-[0.84rem] text-nbp-tx outline-none"
                                  />
                                  <textarea
                                    value={objective.description ?? ""}
                                    aria-label={`Descrição da tarefa ${objective.title}`}
                                    rows={2}
                                    onChange={(event) =>
                                      updateSavedTask(objective.id, { description: event.target.value || null })
                                    }
                                    placeholder="Descrição"
                                    className="w-full resize-y rounded-lg border border-nbp-bd bg-nbp-fill px-2 py-1.5 text-[0.78rem] text-nbp-tx2 outline-none"
                                  />
                                </div>
                              ) : (
                                <span className="min-w-0 flex-1 py-3 pr-1">
                                  <span className="mb-1 block text-[0.66rem] font-medium tracking-[0.08em] uppercase" style={{ color: tone }}>
                                    {parent ? parent.title : "Sem objetivo"}
                                  </span>
                                  <span
                                    className={`block text-[0.88rem] leading-normal ${
                                      done ? "text-nbp-tx3 line-through" : "text-nbp-tx"
                                    }`}
                                  >
                                    {objective.title}
                                  </span>
                                  {objective.description ? (
                                    <span className="mt-1 block text-[0.78rem] leading-snug text-nbp-tx2">
                                      {objective.description}
                                    </span>
                                  ) : null}
                                </span>
                              )}
                              <button
                                type="button"
                                aria-label={editing ? "Fechar edição" : `Editar tarefa ${objective.title}`}
                                onClick={() => setEditingTask(editing ? null : objective.id)}
                                className="shrink-0 border-0 bg-transparent py-3 pr-1 pl-1 text-nbp-tx3 hover:text-nbp-tx"
                              >
                                <Fa name={editing ? "fa-check" : "fa-pen"} />
                              </button>
                              <button
                                type="button"
                                aria-label={`Excluir tarefa ${objective.title}`}
                                onClick={() =>
                                  askConfirm({
                                    title: "Excluir tarefa",
                                    body: `Queres excluir «${objective.title}»?`,
                                    confirmLabel: "Excluir tarefa",
                                    run: () => removeSavedTask(objective.id),
                                  })
                                }
                                className="shrink-0 border-0 bg-transparent py-3 pr-2.5 pl-1 text-nbp-tx3 hover:text-nbp-tx"
                              >
                                <Fa name="fa-xmark" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {composingStage === stage.id ? (
                        <div className="mt-1 rounded-[10px] border border-nbp-bd bg-nbp-sup2 p-3">
                          {goals.length === 0 ? (
                            <p className="m-0 mb-2 text-[0.8rem] text-nbp-tx2">
                              Cria um objetivo primeiro. A tarefa fica ligada a ele.
                            </p>
                          ) : (
                            <>
                              <label className="mb-1 block text-[0.72rem] text-nbp-tx3" htmlFor={`goal-${stage.id}`}>
                                Objetivo desta tarefa
                              </label>
                              <select
                                id={`goal-${stage.id}`}
                                value={(taskDraft[stage.id] ?? emptyComposer()).objectiveId}
                                onChange={(event) =>
                                  setTaskDraft((current) => ({
                                    ...current,
                                    [stage.id]: {
                                      ...(current[stage.id] ?? emptyComposer()),
                                      objectiveId: event.target.value,
                                    },
                                  }))
                                }
                                className="mb-2 h-9 w-full rounded-lg border border-nbp-bd bg-nbp-fill px-2.5 text-[0.82rem] text-nbp-tx outline-none"
                              >
                                <option value="">Escolhe o objetivo</option>
                                {goals.map((goal) => (
                                  <option key={goal.id} value={goal.id}>
                                    {goal.title}
                                  </option>
                                ))}
                              </select>
                              <input
                                value={(taskDraft[stage.id] ?? emptyComposer()).title}
                                aria-label={`Nova tarefa em ${stage.name}`}
                                onChange={(event) =>
                                  setTaskDraft((current) => ({
                                    ...current,
                                    [stage.id]: {
                                      ...(current[stage.id] ?? emptyComposer()),
                                      title: event.target.value,
                                    },
                                  }))
                                }
                                placeholder="Título da tarefa"
                                className="mb-2 h-9 w-full rounded-lg border border-nbp-bd bg-nbp-fill px-2.5 text-[0.86rem] text-nbp-tx outline-none"
                              />
                              <textarea
                                value={(taskDraft[stage.id] ?? emptyComposer()).description}
                                aria-label={`Descrição da nova tarefa em ${stage.name}`}
                                rows={3}
                                onChange={(event) =>
                                  setTaskDraft((current) => ({
                                    ...current,
                                    [stage.id]: {
                                      ...(current[stage.id] ?? emptyComposer()),
                                      description: event.target.value,
                                    },
                                  }))
                                }
                                placeholder="Descrição: o que fazer, com quem e como saber que ficou feito"
                                className="mb-2 w-full resize-y rounded-lg border border-nbp-bd bg-nbp-fill px-2.5 py-2 text-[0.82rem] text-nbp-tx outline-none"
                              />
                            </>
                          )}
                          <div className="flex gap-2">
                            {goals.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => addSavedTask(stage.id)}
                                className="flex-1 rounded-lg border border-nbp-bd2 bg-nbp-tx px-2 py-2 text-[0.82rem] font-semibold text-[#181818]"
                              >
                                Guardar
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => setComposingStage(null)}
                              className="border-0 bg-transparent px-2.5 py-2 text-[0.82rem] text-nbp-tx2"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const only = goals.length === 1 ? goals[0].id : "";
                            setComposingStage(stage.id);
                            setTaskDraft((current) => ({
                              ...current,
                              [stage.id]: { ...(current[stage.id] ?? emptyComposer()), objectiveId: current[stage.id]?.objectiveId || only },
                            }));
                            setError(null);
                          }}
                          className="flex w-full items-center gap-2 border-0 bg-transparent px-1 py-2.5 text-left text-[0.88rem] text-nbp-tx2 hover:text-nbp-tx"
                        >
                          <Fa name="fa-plus" /> Tarefa
                        </button>
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
      {confirm ? (
        <ConfirmDialog
          title={confirm.title}
          body={confirm.body}
          confirmLabel={confirm.confirmLabel}
          onConfirm={confirm.run}
          onClose={() => setConfirm(null)}
        />
      ) : null}
    </>
  );
}
