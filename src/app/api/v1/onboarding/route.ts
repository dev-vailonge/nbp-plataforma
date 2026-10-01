import { ok, err } from "@/lib/api/http";
import { requireAuth } from "@/lib/api/auth";
import { onboardingProgress, sectionIsComplete } from "@/lib/onboarding";
import type {
  NbpOnboardingAnswer,
  NbpOnboardingQuestion,
  NbpOnboardingSection,
} from "@/types/database";

export async function GET() {
  const result = await requireAuth();
  if (result.error) return result.error;
  const { supabase, nbpUser } = result.ctx;

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
      .eq("user_id", nbpUser.id),
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
