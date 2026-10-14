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

export function readLocalPlans(userId: string): LocalPlanBook {
  if (typeof window === "undefined") return emptyBook();
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
