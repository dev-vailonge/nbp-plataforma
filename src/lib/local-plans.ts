import { planMonths } from "@/lib/mocks";
import type {
  NbpActionPlanMonth,
  NbpActionPlanObjective,
  NbpActionPlanStage,
  TelaShape,
  Viewport,
} from "@/types/database";

const STORAGE_KEY = "nbp-local-plans-v1";
const AUGUST_EXAMPLE_KEY = "nbp-aug-board-example-v1";
const CLEAR_LATE_2026_KEY = "nbp-clear-out-nov-dez-2026-v1";
const CLEAR_SEP_DEC_KEY = "nbp-clear-set-dez-2026-v1";
const CLEAR_SEP_DEC_V2_KEY = "nbp-clear-set-dez-2026-v2";
const CLEAR_SEP_DEC_V3_KEY = "nbp-clear-set-dez-2026-v3";
const STAGE_SIM_KEY = "nbp-stage-sim-v1";

const STAGE_SIM_ID = "pm-sim-set-2026";
const LINK_DEMO_ID = "pm-link-set-2026";

const OBJECTIVE_TONES = ["#E2B657", "#5DA9F0", "#3FBE93", "#C98BD0", "#E8A06A"];

export function objectiveTone(id: string, goals: { id: string }[]): string {
  const index = goals.findIndex((goal) => goal.id === id);
  return OBJECTIVE_TONES[(index < 0 ? 0 : index) % OBJECTIVE_TONES.length];
}

/** Quando todas as tarefas do objetivo estão feitas, o objetivo passa a concluído. Se alguma volta atrás, o objetivo fica em andamento. */
export function syncObjectiveFromTasks(
  records: NbpActionPlanObjective[],
  objectiveId: string | null | undefined,
): NbpActionPlanObjective[] {
  if (!objectiveId) return records;
  const tasks = records.filter((item) => item.kind === "task" && item.objective_id === objectiveId);
  if (tasks.length === 0) return records;
  const allDone = tasks.every((item) => item.column === "done");
  return records.map((item) => {
    if (item.id !== objectiveId || item.kind === "task") return item;
    if (allDone) return item.column === "done" ? item : { ...item, column: "done" };
    if (item.column === "done") return { ...item, column: "todo" };
    return item;
  });
}

export type SavedBoard = {
  tela: TelaShape[];
  viewport: Viewport;
};

export type LocalPlanBook = {
  months: NbpActionPlanMonth[];
  stages: Record<string, NbpActionPlanStage[]>;
  objectives: Record<string, NbpActionPlanObjective[]>;
  boards: Record<string, SavedBoard>;
};

const DEFAULT_VIEW: Viewport = { ox: 0, oy: 0, z: 1 };

function emptyBook(): LocalPlanBook {
  return { months: [], stages: {}, objectives: {}, boards: {} };
}

function restoreAugustExample(userId: string, book: LocalPlanBook): LocalPlanBook {
  if (userId !== "m-roque" || typeof window === "undefined") return book;
  if (localStorage.getItem(AUGUST_EXAMPLE_KEY) === "1") return book;
  localStorage.setItem(AUGUST_EXAMPLE_KEY, "1");

  const seed = planMonths.find((month) => month.id === "pm-aug");
  if (!seed?.tela?.length) return book;
  const example: SavedBoard = {
    tela: seed.tela,
    viewport: seed.viewport ?? DEFAULT_VIEW,
  };

  const stored = book.months.find((month) => month.id === "pm-aug");
  if (stored && (stored.tela?.length ?? 0) === 0) {
    const next: LocalPlanBook = {
      ...book,
      months: book.months.map((month) =>
        month.id === "pm-aug" ? { ...month, tela: example.tela, viewport: example.viewport } : month,
      ),
    };
    writeLocalPlans(userId, next);
    return next;
  }

  const overlay = book.boards["pm-aug"];
  if (overlay && overlay.tela.length === 0) {
    const next: LocalPlanBook = {
      ...book,
      boards: { ...book.boards, "pm-aug": example },
    };
    writeLocalPlans(userId, next);
    return next;
  }

  return book;
}

function dropLate2026(book: LocalPlanBook): LocalPlanBook {
  const removed = (book.months ?? []).filter((month) => month.year === 2026 && month.month >= 10 && month.month <= 12);
  if (removed.length === 0) return book;
  const ids = new Set(removed.map((month) => month.id));
  const stages = { ...(book.stages ?? {}) };
  const objectives = { ...(book.objectives ?? {}) };
  const boards = { ...(book.boards ?? {}) };
  for (const id of ids) {
    delete stages[id];
    delete objectives[id];
    delete boards[id];
  }
  return {
    months: book.months.filter((month) => !ids.has(month.id)),
    stages,
    objectives,
    boards,
  };
}

export function withCurrentStage(list: NbpActionPlanStage[]): NbpActionPlanStage[] {
  const ordered = list.map((stage, index) => ({ ...stage, position: index }));
  if (ordered.length === 0 || ordered.some((stage) => stage.status === "current")) return ordered;
  const locked = ordered.findIndex((stage) => stage.status === "locked");
  if (locked < 0) return ordered;
  return ordered.map((stage, index) =>
    index === locked ? { ...stage, status: "current" } : stage,
  );
}

function dropSepToDec2026(book: LocalPlanBook): LocalPlanBook {
  const removed = (book.months ?? []).filter(
    (month) =>
      month.id === STAGE_SIM_ID ||
      month.id === LINK_DEMO_ID ||
      (month.year === 2026 && month.month >= 9 && month.month <= 12),
  );
  if (removed.length === 0) return book;
  const ids = new Set(removed.map((month) => month.id));
  const stages = { ...(book.stages ?? {}) };
  const objectives = { ...(book.objectives ?? {}) };
  const boards = { ...(book.boards ?? {}) };
  for (const id of ids) {
    delete stages[id];
    delete objectives[id];
    delete boards[id];
  }
  return {
    months: book.months.filter((month) => !ids.has(month.id)),
    stages,
    objectives,
    boards,
  };
}

function clearSepToDec2026() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(CLEAR_SEP_DEC_KEY) === "1") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(CLEAR_SEP_DEC_KEY, "1");
    localStorage.setItem(STAGE_SIM_KEY, "1");
    return;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<LocalPlanBook>>;
    const next: Record<string, LocalPlanBook> = {};
    for (const [userId, book] of Object.entries(parsed)) {
      if (!book || !Array.isArray(book.months)) {
        if (book) next[userId] = book as LocalPlanBook;
        continue;
      }
      next[userId] = dropSepToDec2026({
        months: book.months,
        stages: book.stages ?? {},
        objectives: book.objectives ?? {},
        boards: book.boards ?? {},
      });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(CLEAR_SEP_DEC_KEY, "1");
    localStorage.setItem(STAGE_SIM_KEY, "1");
  } catch {
    localStorage.removeItem(CLEAR_SEP_DEC_KEY);
  }
}

function clearSepToDec2026Again() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(CLEAR_SEP_DEC_V2_KEY) === "1") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(CLEAR_SEP_DEC_V2_KEY, "1");
    localStorage.setItem(STAGE_SIM_KEY, "1");
    return;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<LocalPlanBook>>;
    const next: Record<string, LocalPlanBook> = {};
    for (const [userId, book] of Object.entries(parsed)) {
      if (!book || !Array.isArray(book.months)) {
        if (book) next[userId] = book as LocalPlanBook;
        continue;
      }
      next[userId] = dropSepToDec2026({
        months: book.months,
        stages: book.stages ?? {},
        objectives: book.objectives ?? {},
        boards: book.boards ?? {},
      });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(CLEAR_SEP_DEC_V2_KEY, "1");
    localStorage.setItem(STAGE_SIM_KEY, "1");
  } catch {
    localStorage.removeItem(CLEAR_SEP_DEC_V2_KEY);
  }
}

function clearSepToDec2026Final() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(CLEAR_SEP_DEC_V3_KEY) === "1") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(CLEAR_SEP_DEC_V3_KEY, "1");
    localStorage.setItem(STAGE_SIM_KEY, "1");
    return;
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<LocalPlanBook>>;
    const next: Record<string, LocalPlanBook> = {};
    for (const [userId, book] of Object.entries(parsed)) {
      if (!book || !Array.isArray(book.months)) {
        if (book) next[userId] = book as LocalPlanBook;
        continue;
      }
      next[userId] = dropSepToDec2026({
        months: book.months,
        stages: book.stages ?? {},
        objectives: book.objectives ?? {},
        boards: book.boards ?? {},
      });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(CLEAR_SEP_DEC_V3_KEY, "1");
    localStorage.setItem(STAGE_SIM_KEY, "1");
  } catch {
    localStorage.removeItem(CLEAR_SEP_DEC_V3_KEY);
  }
}

function clearLate2026Plans() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(CLEAR_LATE_2026_KEY) === "1") return;
  const raw = localStorage.getItem(STORAGE_KEY);
  localStorage.setItem(CLEAR_LATE_2026_KEY, "1");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<LocalPlanBook>>;
    const next: Record<string, LocalPlanBook> = {};
    for (const [userId, book] of Object.entries(parsed)) {
      if (!book || !Array.isArray(book.months)) {
        if (book) next[userId] = book as LocalPlanBook;
        continue;
      }
      next[userId] = dropLate2026({
        months: book.months,
        stages: book.stages ?? {},
        objectives: book.objectives ?? {},
        boards: book.boards ?? {},
      });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    localStorage.removeItem(CLEAR_LATE_2026_KEY);
  }
}

export function readLocalPlans(userId: string): LocalPlanBook {
  if (typeof window === "undefined") return emptyBook();
  clearLate2026Plans();
  clearSepToDec2026();
  clearSepToDec2026Again();
  clearSepToDec2026Final();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return restoreAugustExample(userId, emptyBook());
    const parsed = JSON.parse(raw) as Record<string, LocalPlanBook>;
    const book = parsed[userId];
    if (!book || !Array.isArray(book.months)) {
      return restoreAugustExample(userId, emptyBook());
    }
    return restoreAugustExample(userId, {
      months: book.months,
      stages: book.stages ?? {},
      objectives: book.objectives ?? {},
      boards: book.boards ?? {},
    });
  } catch {
    return emptyBook();
  }
}

export function writeLocalPlans(userId: string, book: LocalPlanBook) {
  if (typeof window === "undefined") return;
  let all: Record<string, LocalPlanBook> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) all = JSON.parse(raw) as Record<string, LocalPlanBook>;
  } catch {
    all = {};
  }
  all[userId] = book;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function boardOf(book: LocalPlanBook | null, month: NbpActionPlanMonth): SavedBoard {
  const stored = book?.months.find((item) => item.id === month.id);
  if (stored) {
    return {
      tela: stored.tela ?? [],
      viewport: stored.viewport ?? DEFAULT_VIEW,
    };
  }
  const overlay = book?.boards?.[month.id];
  if (overlay) return overlay;
  return {
    tela: month.tela ?? [],
    viewport: month.viewport ?? DEFAULT_VIEW,
  };
}

export function saveBoard(
  userId: string,
  book: LocalPlanBook,
  monthId: string,
  tela: TelaShape[],
  viewport: Viewport,
): LocalPlanBook {
  const inBook = book.months.some((item) => item.id === monthId);
  const next: LocalPlanBook = inBook
    ? {
        ...book,
        months: book.months.map((item) =>
          item.id === monthId ? { ...item, tela, viewport } : item,
        ),
      }
    : {
        ...book,
        boards: { ...book.boards, [monthId]: { tela, viewport } },
      };
  writeLocalPlans(userId, next);
  void fetch(`/api/v1/plans/${monthId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tela, viewport }),
  }).catch(() => undefined);
  return next;
}
