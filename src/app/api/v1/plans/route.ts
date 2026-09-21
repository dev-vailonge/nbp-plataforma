import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth, requireRole } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  const query = supabase.from("nbp_action_plan_months").select("*");

  const userId = req.nextUrl.searchParams.get("user_id") ?? nbpUser.id;
  query.eq("user_id", userId);

  const year = req.nextUrl.searchParams.get("year");
  if (year) query.eq("year", parseInt(year, 10));

  const month = req.nextUrl.searchParams.get("month");
  if (month) query.eq("month", parseInt(month, 10));

  query.order("year", { ascending: false }).order("month", { ascending: false });

  const { data, error: dbError } = await query;
  if (dbError) return err("db_error", dbError.message, 500);

  return ok(data ?? []);
}

export async function POST(req: NextRequest) {
  const result = await requireRole("admin", "consultor");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  let body: {
    user_id?: string;
    year?: number;
    month?: number;
    title?: string | null;
    subtitle?: string | null;
    flag_main?: string | null;
    flag_prefix?: string | null;
    flag_target?: string | null;
    fill_pct?: number | null;
    mrr?: number | null;
    rec?: number | null;
    nov?: number | null;
    act?: number | null;
    chu?: number | null;
    lea?: number | null;
    stages?: { name: string; subtitle?: string | null; status?: string }[];
    objectives?: { title: string; column?: string; lesson_id?: string | null }[];
  };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const userId = body.user_id;
  const year = body.year;
  const month = body.month;
  if (!userId) return err("bad_request", "user_id é obrigatório.", 400);
  if (!year || !month || month < 1 || month > 12) {
    return err("bad_request", "year e month (1–12) são obrigatórios.", 400);
  }

  const insert = {
    user_id: userId,
    year,
    month,
    title: body.title?.trim() || null,
    subtitle: body.subtitle?.trim() || null,
    flag_main: body.flag_main?.trim() || null,
    flag_prefix: body.flag_prefix?.trim() || null,
    flag_target: body.flag_target?.trim() || null,
    fill_pct: body.fill_pct ?? 0,
    mrr: body.mrr ?? null,
    rec: body.rec ?? null,
    nov: body.nov ?? null,
    act: body.act ?? null,
    chu: body.chu ?? null,
    lea: body.lea ?? null,
    tela: [],
    viewport: { ox: 0, oy: 0, z: 1 },
  };

  const { data: monthRow, error: dbError } = await supabase
    .from("nbp_action_plan_months")
    .insert(insert)
    .select()
    .single();

  if (dbError) return err("db_error", dbError.message, 400);

  const stagesInput = body.stages?.filter((s) => s.name?.trim()) ?? [];
  let stages: unknown[] = [];
  if (stagesInput.length > 0) {
    const rows = stagesInput.map((s, i) => ({
      month_id: monthRow.id,
      name: s.name.trim(),
      subtitle: s.subtitle?.trim() || null,
      status: (s.status as "done" | "current" | "locked") || (i === 0 ? "current" : "locked"),
      position: i,
    }));
    const { data: stageData, error: stageErr } = await supabase
      .from("nbp_action_plan_stages")
      .insert(rows)
      .select();
    if (stageErr) return err("db_error", stageErr.message, 400);
    stages = stageData ?? [];
  }

  const objectivesInput = body.objectives?.filter((o) => o.title?.trim()) ?? [];
  let objectives: unknown[] = [];
  if (objectivesInput.length > 0) {
    const rows = objectivesInput.map((o, i) => ({
      month_id: monthRow.id,
      title: o.title.trim(),
      column: (o.column as "none" | "todo" | "done") || "none",
      lesson_id: o.lesson_id ?? null,
      position: i,
    }));
    const { data: objData, error: objErr } = await supabase
      .from("nbp_action_plan_objectives")
      .insert(rows)
      .select();
    if (objErr) return err("db_error", objErr.message, 400);
    objectives = objData ?? [];
  }

  return ok({ month: monthRow, stages, objectives }, 201);
}
