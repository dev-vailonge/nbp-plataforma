import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireRole } from "@/lib/api/auth";
import type { NbpOnboardingSection } from "@/types/database";

type RouteCtx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const result = await requireRole("admin", "consultor");
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const updates: Partial<NbpOnboardingSection> = {};
  if ("title" in body) {
    const title = String(body.title ?? "").trim();
    if (!title) return err("bad_request", "title é obrigatório.", 400);
    updates.title = title;
  }
  if ("description" in body) {
    updates.description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null;
  }
  if ("sort_order" in body) updates.sort_order = Number(body.sort_order);
  if ("code" in body && typeof body.code === "string" && body.code.trim()) {
    updates.code = body.code.trim();
  }

  if (Object.keys(updates).length === 0) {
    return err("bad_request", "Nenhum campo para actualizar.", 400);
  }

  const { data, error: dbError } = await supabase
    .from("nbp_onboarding_sections")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    const status = dbError.code === "PGRST116" ? 404 : 400;
    return err(status === 404 ? "not_found" : "db_error", dbError.message, status);
  }
  return ok(data);
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx) {
  const result = await requireRole("admin", "consultor");
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id } = await ctx.params;

  const { error: dbError } = await supabase
    .from("nbp_onboarding_sections")
    .delete()
    .eq("id", id);

  if (dbError) return err("db_error", dbError.message, 400);
  return ok({ id });
}
