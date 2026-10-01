import { NextRequest } from "next/server";
import { ok, err, parseJson, JsonParseError } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";
import { answerIsFilled, onboardingProgress } from "@/lib/onboarding";
import { nextOnboardingPhase } from "@/lib/member-phase";
import type { NbpOnboardingAnswer, NbpOnboardingQuestion, NbpOnboardingSection } from "@/types/database";

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

  if (nbpUser.phase === "convite_aceito" || nbpUser.phase === "onboarding_iniciado") {
    const [sectionsRes, questionsRes, answersRes] = await Promise.all([
      supabase.from("nbp_onboarding_sections").select("*"),
      supabase.from("nbp_onboarding_questions").select("*"),
      supabase.from("nbp_onboarding_answers").select("*").eq("user_id", nbpUser.id),
    ]);
    if (!sectionsRes.error && !questionsRes.error && !answersRes.error) {
      const sections = (sectionsRes.data ?? []) as NbpOnboardingSection[];
      const questions = (questionsRes.data ?? []) as NbpOnboardingQuestion[];
      const answers = (answersRes.data ?? []) as NbpOnboardingAnswer[];
      const byId = new Map(questions.map((question) => [question.id, question]));
      const anyFilled = answers.some((answer) => {
        const question = byId.get(answer.question_id);
        return question ? answerIsFilled(question.kind, answer) : false;
      });
      const progress = onboardingProgress(sections, questions, answers);
      const next = nextOnboardingPhase(
        nbpUser.phase,
        anyFilled,
        progress.total > 0 && progress.remaining === 0,
      );
      if (next) {
        await supabase.from("nbp_users").update({ phase: next }).eq("id", nbpUser.id);
      }
    }
  }

  return ok(data ?? []);
}
