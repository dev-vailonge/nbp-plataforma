import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";

type AnswerInput = {
  question_id?: string;
  value_text?: string | null;
  value_json?: string[] | null;
};

export async function PUT(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  let body: { answers?: AnswerInput[] };
  try {
    body = await parseJson(req);
  } catch (e) {
    if (e instanceof JsonParseError) return err("bad_request", e.message, 400);
    throw e;
  }

  const inputs = (body.answers ?? []).filter((a) => a.question_id);
  if (inputs.length === 0) {
    return err("bad_request", "answers é obrigatório.", 400);
  }

  const byQuestion = new Map<string, AnswerInput>();
  for (const input of inputs) {
    if (input.question_id) byQuestion.set(input.question_id, input);
  }
  const unique = [...byQuestion.values()];
  const ids = unique.map((a) => a.question_id as string);
  const { data: questions, error: qErr } = await supabase
    .from("nbp_onboarding_questions")
    .select("id")
    .in("id", ids);

  if (qErr) return err("db_error", qErr.message, 500);
  const known = new Set((questions ?? []).map((q) => q.id as string));
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length > 0) {
    return err("bad_request", "Pergunta desconhecida.", 400);
  }

  const rows = unique.map((a) => ({
    user_id: nbpUser.id,
    question_id: a.question_id,
    value_text: a.value_text?.trim() ? a.value_text.trim() : null,
    value_json: Array.isArray(a.value_json) ? a.value_json : null,
  }));

  const { data, error: dbError } = await supabase
    .from("nbp_onboarding_answers")
    .upsert(rows, { onConflict: "user_id,question_id" })
    .select();

  if (dbError) return err("db_error", dbError.message, 400);
  return ok(data ?? []);
}
