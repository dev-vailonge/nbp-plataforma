import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";
import { onboardingProgress, sectionIsComplete } from "@/lib/onboarding";
import type {
  NbpOnboardingAnswer,
  NbpOnboardingQuestion,
  NbpOnboardingSection,
} from "@/types/database";

export async function GET(req: NextRequest) {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

  let answerUserId = nbpUser.id;
  const requested = req.nextUrl.searchParams.get("user_id")?.trim();
  if (requested && nbpUser.role !== "membro") {
    const { data: owner, error: ownerError } = await supabase
      .from("nbp_users")
      .select("id")
      .or(`id.eq.${requested},code.eq.${requested}`)
      .limit(1)
      .maybeSingle();
    if (ownerError) return err("db_error", ownerError.message, 500);
    if (!owner) return err("not_found", "Membro não encontrado.", 404);
    answerUserId = owner.id;
  }

  const [sectionsRes, questionsRes, answersRes] = await Promise.all([
    supabase
      .from("nbp_onboarding_sections")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("nbp_onboarding_questions")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("nbp_onboarding_answers")
      .select("*")
      .eq("user_id", answerUserId),
  ]);

  if (sectionsRes.error) return err("db_error", sectionsRes.error.message, 500);
  if (questionsRes.error) return err("db_error", questionsRes.error.message, 500);
  if (answersRes.error) return err("db_error", answersRes.error.message, 500);

  const sections = (sectionsRes.data ?? []) as NbpOnboardingSection[];
  const questions = (questionsRes.data ?? []) as NbpOnboardingQuestion[];
  const answers = (answersRes.data ?? []) as NbpOnboardingAnswer[];

  return ok({
    sections: sections.map((section) => ({
      ...section,
      questions: questions.filter((q) => q.section_id === section.id),
      complete: sectionIsComplete(section.id, questions, answers),
    })),
    answers,
    progress: onboardingProgress(sections, questions, answers),
  });
}
