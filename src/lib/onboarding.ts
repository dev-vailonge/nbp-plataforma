import type {
  NbpOnboardingAnswer,
  NbpOnboardingQuestion,
  NbpOnboardingSection,
  OnboardingProgress,
  OnboardingQuestionKind,
} from "@/types/database";

export type OnboardingSectionView = NbpOnboardingSection & {
  questions: NbpOnboardingQuestion[];
  complete: boolean;
};

export type OnboardingPayload = {
  sections: OnboardingSectionView[];
  answers: NbpOnboardingAnswer[];
  progress: OnboardingProgress;
};

export function formatOnboardingAnswer(
  question: Pick<NbpOnboardingQuestion, "kind" | "options">,
  answer: Pick<NbpOnboardingAnswer, "value_text" | "value_json"> | null | undefined,
) {
  if (!answerIsFilled(question.kind, answer)) return null;
  const labelOf = (id: string) => question.options?.find((option) => option.id === id)?.label ?? id;
  if (question.kind === "multi_choice") {
    return (answer?.value_json ?? []).map(labelOf).join(", ");
  }
  if (question.kind === "single_choice") return labelOf(answer?.value_text ?? "");
  if (question.kind === "yes_no") {
    if (answer?.value_text === "yes") return "Sim";
    if (answer?.value_text === "no") return "Não";
  }
  return answer?.value_text?.trim() || null;
}

export function answerIsFilled(
  kind: OnboardingQuestionKind,
  answer: Pick<NbpOnboardingAnswer, "value_text" | "value_json"> | null | undefined,
) {
  if (!answer) return false;
  if (kind === "multi_choice") {
    return Array.isArray(answer.value_json) && answer.value_json.length > 0;
  }
  return Boolean(answer.value_text && answer.value_text.trim());
}

/** Secções sem perguntas ficam de fora do progresso. */
export function onboardingProgress(
  sections: NbpOnboardingSection[],
  questions: NbpOnboardingQuestion[],
  answers: Pick<NbpOnboardingAnswer, "question_id" | "value_text" | "value_json">[],
): OnboardingProgress {
  const byQuestion = new Map(answers.map((a) => [a.question_id, a]));
  const counted = sections.filter((s) =>
    questions.some((q) => q.section_id === s.id),
  );
  const completed = counted.filter((s) => {
    const required = questions.filter((q) => q.section_id === s.id && q.required);
    if (required.length === 0) return true;
    return required.every((q) => answerIsFilled(q.kind, byQuestion.get(q.id)));
  }).length;
  const total = counted.length;
  const remaining = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, remaining, percent };
}

export function sectionIsComplete(
  sectionId: string,
  questions: NbpOnboardingQuestion[],
  answers: Pick<NbpOnboardingAnswer, "question_id" | "value_text" | "value_json">[],
) {
  const own = questions.filter((q) => q.section_id === sectionId);
  if (own.length === 0) return false;
  return onboardingProgress(
    [{ id: sectionId } as NbpOnboardingSection],
    own,
    answers,
  ).completed === 1;
}
