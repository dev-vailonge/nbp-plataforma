"use client";

import { useEffect, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { EmptyState, ProgressBar } from "@/components/ui";
import { api } from "@/lib/api-client";
import {
  answerIsFilled,
  formatOnboardingAnswer,
  type OnboardingPayload,
} from "@/lib/onboarding";

export function MemberOnboarding({ userId }: { userId: string }) {
  const [payload, setPayload] = useState<OnboardingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api<OnboardingPayload>(`/api/v1/onboarding?user_id=${encodeURIComponent(userId)}`).then(
      (res) => {
        if (cancelled) return;
        setLoading(false);
        if ("error" in res) {
          setPayload(null);
          setError(res.error.message);
          return;
        }
        setPayload(res.data);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <section className="overflow-hidden rounded-[12px] border-[0.5px] border-nbp-bd bg-nbp-sup">
      <div className="border-b border-nbp-bd px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-nbp-bd bg-[rgba(198,200,186,0.08)] text-nbp-salvia">
            <Fa name="fa-list-check" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="m-0 text-[1rem] font-semibold text-nbp-tx">Onboarding</h2>
            <p className="mt-0.5 mb-0 text-[0.8rem] leading-snug text-nbp-tx2">
              Respostas que este membro preencheu no perfil.
            </p>
          </div>
        </div>
        {payload && payload.progress.total > 0 ? (
          <div className="mt-4 flex items-center gap-3 text-[0.82rem] text-nbp-tx2">
            <ProgressBar value={payload.progress.percent} className="flex-1" />
            <span className="shrink-0 tabular-nums">
              {payload.progress.completed}/{payload.progress.total} · {payload.progress.percent}%
            </span>
          </div>
        ) : null}
      </div>
      <div className="bg-nbp-bg px-5 py-5">
        {loading ? (
          <p className="m-0 text-[0.88rem] text-nbp-tx3">A ler o onboarding…</p>
        ) : error ? (
          <p className="m-0 text-sm text-[#e88585]">{error}</p>
        ) : !payload || payload.sections.length === 0 ? (
          <EmptyState
            title="Sem questionário"
            description="Ainda não há secções de onboarding configuradas."
          />
        ) : (
          <div className="flex flex-col gap-6">
            {payload.sections.map((section, index) => {
              const byQuestion = new Map(payload.answers.map((answer) => [answer.question_id, answer]));
              const filled = section.questions.filter((question) =>
                answerIsFilled(question.kind, byQuestion.get(question.id)),
              ).length;
              return (
                <article key={section.id}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h3 className="m-0 text-[0.95rem] font-semibold text-nbp-tx">
                      <span className="mr-2 text-nbp-tx3 tabular-nums">{index + 1}</span>
                      {section.title}
                    </h3>
                    <span className="shrink-0 text-[0.75rem] text-nbp-tx3">
                      {filled}/{section.questions.length}
                    </span>
                  </div>
                  {section.questions.length === 0 ? (
                    <p className="m-0 text-[0.84rem] text-nbp-tx3">Sem perguntas.</p>
                  ) : (
                    <ul className="m-0 flex list-none flex-col gap-3 p-0">
                      {section.questions.map((question) => {
                        const text = formatOnboardingAnswer(
                          question,
                          byQuestion.get(question.id),
                        );
                        return (
                          <li key={question.id}>
                            <p className="m-0 text-[0.78rem] leading-snug text-nbp-tx3">
                              {question.prompt}
                            </p>
                            <p
                              className={`mt-1 mb-0 text-[0.9rem] leading-relaxed whitespace-pre-wrap ${
                                text ? "text-nbp-tx" : "text-nbp-tx3"
                              }`}
                            >
                              {text ?? "Por preencher"}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
