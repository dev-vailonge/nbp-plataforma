import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";
import type { NbpActionPlanMonth } from "@/types/database";

type RouteCtx = { params: Promise<{ monthId: string }> };

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { monthId } = await ctx.params;

  const { data: monthRaw, error: monthErr } = await supabase
    .from("nbp_action_plan_months")
    .select("*")
    .eq("id", monthId)
    .single();

  if (monthErr) {
    const status = monthErr.code === "PGRST116" ? 404 : 500;
    return err(status === 404 ? "not_found" : "db_error", monthErr.message, status);
  }

  const month = monthRaw as NbpActionPlanMonth;

  const [stagesRes, objectivesRes] = await Promise.all([
    supabase
      .from("nbp_action_plan_stages")
      .select("*")
      .eq("month_id", monthId)
      .order("position", { ascending: true }),
    supabase
      .from("nbp_action_plan_objectives")
      .select("*")
      .eq("month_id", monthId)
      .order("position", { ascending: true }),
  ]);

  return ok({
    ...month,
    stages: stagesRes.data ?? [],
    objectives: objectivesRes.data ?? [],
  });
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { monthId } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const { data, error: dbError } = await supabase
    .from("nbp_action_plan_months")
    .update(body as never)
    .eq("id", monthId)
    .select()
    .single();

  if (dbError) {
    const status = dbError.code === "PGRST116" ? 404 : 500;
    return err(status === 404 ? "not_found" : "db_error", dbError.message, status);
  }

  return ok(data);
}
