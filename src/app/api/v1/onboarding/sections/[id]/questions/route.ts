import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireRole } from "@/lib/api/auth";
import { slugifyCode } from "@/lib/api-client";
import type { OnboardingOption, OnboardingQuestionKind } from "@/types/database";

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

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const result = await requireRole("admin", "consultor");
  if (result.error) return result.error;
  const { supabase } = result.ctx;
  const { id: sectionId } = await ctx.params;

  let body: {
    prompt?: string;
    help_text?: string | null;
    kind?: OnboardingQuestionKind;
    options?: OnboardingOption[] | null;
    required?: boolean;
    sort_order?: number;
    code?: string;
  };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const prompt = body.prompt?.trim();
  const kind = body.kind;
  if (!prompt) return err("bad_request", "prompt é obrigatório.", 400);
  if (!kind || !KINDS.includes(kind)) {
    return err("bad_request", "kind inválido.", 400);
  }

  const section = await supabase
    .from("nbp_onboarding_sections")
    .select("id, code")
    .eq("id", sectionId)
    .maybeSingle();
  if (section.error) return err("db_error", section.error.message, 500);
  if (!section.data) return err("not_found", "Secção não encontrada.", 404);

  const needsOptions = kind === "single_choice" || kind === "multi_choice";
  const options = needsOptions ? parseOptions(body.options) : null;
  if (needsOptions && (!options || options.length < 2)) {
    return err("bad_request", "Escolha precisa de pelo menos duas opções.", 400);
  }

  const sectionCode = (section.data.code as string) || "sec";
  const code =
    body.code?.trim() ||
    `${sectionCode}-${slugifyCode(prompt).replace(/-[a-z0-9]{4}$/, "")}`;
  const helpText = body.help_text?.trim() || null;
  const required = body.required !== false;

  const existing = await supabase
    .from("nbp_onboarding_questions")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (existing.error) return err("db_error", existing.error.message, 500);

  if (existing.data) {
    const { data, error: dbError } = await supabase
      .from("nbp_onboarding_questions")
      .update({
        section_id: sectionId,
        prompt,
        help_text: helpText,
        kind,
        options,
        required,
        ...(body.sort_order != null ? { sort_order: body.sort_order } : {}),
      })
      .eq("code", code)
      .select()
      .single();
    if (dbError) return err("db_error", dbError.message, 400);
    return ok(data);
  }

  let sortOrder = body.sort_order;
  if (sortOrder == null) {
    const { data: last } = await supabase
      .from("nbp_onboarding_questions")
      .select("sort_order")
      .eq("section_id", sectionId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = ((last?.sort_order as number | undefined) ?? -1) + 1;
  }

  const { data, error: dbError } = await supabase
    .from("nbp_onboarding_questions")
    .insert({
      code,
      section_id: sectionId,
      prompt,
      help_text: helpText,
      kind,
      options,
      required,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (dbError?.code === "23505") {
    const { data: raced, error: raceErr } = await supabase
      .from("nbp_onboarding_questions")
      .update({
        section_id: sectionId,
        prompt,
        help_text: helpText,
        kind,
        options,
        required,
      })
      .eq("code", code)
      .select()
      .single();
    if (raceErr) return err("db_error", raceErr.message, 400);
    return ok(raced);
  }
  if (dbError) return err("db_error", dbError.message, 400);
  return ok(data, 201);
}
