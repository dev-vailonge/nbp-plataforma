import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireRole } from "@/lib/api/auth";
import { slugifyCode } from "@/lib/api-client";
import type { NbpOnboardingQuestion, NbpOnboardingSection } from "@/types/database";

function sectionCode(title: string, explicit?: string) {
  const given = explicit?.trim();
  if (given) return given;
  return slugifyCode(title, "sec-").replace(/-[a-z0-9]{4}$/, "") || "sec";
}

export async function GET() {
  const result = await requireRole("admin", "consultor");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  const [sectionsRes, questionsRes] = await Promise.all([
    supabase
      .from("nbp_onboarding_sections")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("nbp_onboarding_questions")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  if (sectionsRes.error) return err("db_error", sectionsRes.error.message, 500);
  if (questionsRes.error) return err("db_error", questionsRes.error.message, 500);

  const sections = (sectionsRes.data ?? []) as NbpOnboardingSection[];
  const questions = (questionsRes.data ?? []) as NbpOnboardingQuestion[];

  return ok(
    sections.map((section) => ({
      ...section,
      questions: questions.filter((q) => q.section_id === section.id),
    })),
  );
}

export async function POST(req: NextRequest) {
  const result = await requireRole("admin", "consultor");
  if (result.error) return result.error;
  const { supabase } = result.ctx;

  let body: {
    title?: string;
    description?: string | null;
    sort_order?: number;
    code?: string;
  };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const title = body.title?.trim();
  if (!title) return err("bad_request", "title é obrigatório.", 400);
  const code = sectionCode(title, body.code);
  const description = body.description?.trim() || null;

  const existing = await supabase
    .from("nbp_onboarding_sections")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (existing.error) return err("db_error", existing.error.message, 500);

  if (existing.data) {
    const updates: Partial<NbpOnboardingSection> = { title, description };
    if (body.sort_order != null) updates.sort_order = body.sort_order;
    const { data, error: dbError } = await supabase
      .from("nbp_onboarding_sections")
      .update(updates)
      .eq("code", code)
      .select()
      .single();
    if (dbError) return err("db_error", dbError.message, 400);
    return ok(data);
  }

  let sortOrder = body.sort_order;
  if (sortOrder == null) {
    const { data: last } = await supabase
      .from("nbp_onboarding_sections")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = ((last?.sort_order as number | undefined) ?? -1) + 1;
  }

  const { data, error: dbError } = await supabase
    .from("nbp_onboarding_sections")
    .insert({ code, title, description, sort_order: sortOrder })
    .select()
    .single();

  if (dbError?.code === "23505") {
    const { data: raced, error: raceErr } = await supabase
      .from("nbp_onboarding_sections")
      .update({ title, description })
      .eq("code", code)
      .select()
      .single();
    if (raceErr) return err("db_error", raceErr.message, 400);
    return ok(raced);
  }
  if (dbError) return err("db_error", dbError.message, 400);
  return ok(data, 201);
}
