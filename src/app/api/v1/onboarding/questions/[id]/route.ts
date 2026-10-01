import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireRole } from "@/lib/api/auth";
import type { NbpOnboardingQuestion, OnboardingOption, OnboardingQuestionKind } from "@/types/database";

type RouteCtx = { params: Promise<{ id: string }> };

const KINDS: OnboardingQuestionKind[] = [
  "short_text",
  "long_text",
  "single_choice",
  "multi_choice",
  "yes_no",
  "range",
];

function parseOptions(raw: unknown): OnboardingOption[] | null {
  if (!Array.isArray(raw)) return null;
  const options = raw
    .map((item, i) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { id?: string; label?: string };
      const label = row.label?.trim();
      if (!label) return null;
      return { id: row.id?.trim() || `opt-${i + 1}`, label };
    })
    .filter((o): o is OnboardingOption => Boolean(o));
  return options.length ? options : null;
}

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

  const updates: Partial<NbpOnboardingQuestion> = {};
  if ("prompt" in body) {
    const prompt = String(body.prompt ?? "").trim();
    if (!prompt) return err("bad_request", "prompt é obrigatório.", 400);
    updates.prompt = prompt;
  }
  if ("help_text" in body) {
    updates.help_text =
      typeof body.help_text === "string" && body.help_text.trim()
        ? body.help_text.trim()
        : null;
  }
  if ("kind" in body) {
    const kind = body.kind as OnboardingQuestionKind;
    if (!KINDS.includes(kind)) return err("bad_request", "kind inválido.", 400);
    updates.kind = kind;
  }
  if ("options" in body) updates.options = parseOptions(body.options);
  if ("required" in body) updates.required = Boolean(body.required);
  if ("sort_order" in body) updates.sort_order = Number(body.sort_order);
  if ("section_id" in body && typeof body.section_id === "string") {
    updates.section_id = body.section_id;
  }
  if ("code" in body && typeof body.code === "string" && body.code.trim()) {
    updates.code = body.code.trim();
  }

  if (Object.keys(updates).length === 0) {
    return err("bad_request", "Nenhum campo para actualizar.", 400);
  }

  const { data, error: dbError } = await supabase
    .from("nbp_onboarding_questions")
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
    .from("nbp_onboarding_questions")
    .delete()
    .eq("id", id);

  if (dbError) return err("db_error", dbError.message, 400);
  return ok({ id });
}
