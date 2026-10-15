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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return restoreAugustExample(userId, emptyBook());
    const parsed = JSON.parse(raw) as Record<string, LocalPlanBook>;
    const book = parsed[userId];
    if (!book || !Array.isArray(book.months)) return restoreAugustExample(userId, emptyBook());
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
