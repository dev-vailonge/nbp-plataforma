import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

type RouteCtx = { params: Promise<{ monthId: string; objectiveId: string }> };

const ALLOWED = ["title", "column", "lesson_id", "position"] as const;

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { monthId, objectiveId } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key];
  }
  if (Object.keys(updates).length === 0) {
    return err("bad_request", "No updatable fields provided.", 400);
  }

  const { data, error: dbError } = await supabase
    .from("nbp_action_plan_objectives")
    .update(updates as Partial<import("@/types/database").NbpActionPlanObjective>)
    .eq("id", objectiveId)
    .eq("month_id", monthId)
    .select()
    .single();

  if (dbError) {
    const status = dbError.code === "PGRST116" ? 404 : 500;
    return err(status === 404 ? "not_found" : "db_error", dbError.message, status);
  }

  return ok(data);
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { monthId, objectiveId } = await ctx.params;

  const { error: dbError } = await supabase
    .from("nbp_action_plan_objectives")
    .delete()
    .eq("id", objectiveId)
    .eq("month_id", monthId);

  if (dbError) return err("db_error", dbError.message, 500);

  return ok({ ok: true });
}
