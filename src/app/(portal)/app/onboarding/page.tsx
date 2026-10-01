"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fa } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { PageHeader, Panel, fieldControlClass } from "@/components/Panel";
import { ProgressBar } from "@/components/ui";
import { api } from "@/lib/api-client";
import { onboardingProgress, type OnboardingPayload } from "@/lib/onboarding";
import type { NbpOnboardingAnswer } from "@/types/database";

type Draft = { value_text: string; value_json: string[] };

function draftsFrom(answers: NbpOnboardingAnswer[]): Record<string, Draft> {
  const map: Record<string, Draft> = {};
  for (const answer of answers) {
    map[answer.question_id] = {
      value_text: answer.value_text ?? "",
      value_json: answer.value_json ?? [],
    };
  }
  return map;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<OnboardingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (preserveIndex = false) => {
    const res = await api<OnboardingPayload>("/api/v1/onboarding");
    setLoading(false);
    if ("error" in res) {
      setLoadError(res.error.message);
      setPayload(null);
      return;
    }
    setLoadError(null);
    setPayload(res.data);
    setDrafts(draftsFrom(res.data.answers));
    if (!preserveIndex) {
      const firstOpen = res.data.sections.findIndex((s) => !s.complete);
      setIndex(firstOpen === -1 ? 0 : firstOpen);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const section = payload?.sections[index] ?? null;
  const progress = payload?.progress;

  const answersNow = useMemo(() => {
    if (!payload) return [];
    return payload.sections.flatMap((s) =>
      s.questions.map((q) => ({
        question_id: q.id,
        value_text: drafts[q.id]?.value_text ?? "",
        value_json: drafts[q.id]?.value_json ?? [],
      })),
    );
  }, [payload, drafts]);

  function setText(id: string, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { value_text: value, value_json: prev[id]?.value_json ?? [] },
    }));
  }

  function toggleMulti(id: string, optionId: string) {
    setDrafts((prev) => {
      const current = prev[id]?.value_json ?? [];
      const value_json = current.includes(optionId)
        ? current.filter((v) => v !== optionId)
        : [...current, optionId];
      return {
        ...prev,
        [id]: { value_text: prev[id]?.value_text ?? "", value_json },
      };
    });
  }

  async function saveSection(e?: FormEvent) {
    e?.preventDefault();
    if (!section || !payload) return;
    setPending(true);
    setError(null);
    const body = section.questions.map((q) => ({
      question_id: q.id,
      value_text: drafts[q.id]?.value_text ?? "",
      value_json: drafts[q.id]?.value_json ?? [],
    }));

    const res = await api("/api/v1/onboarding/answers", {
      method: "PUT",
      body: JSON.stringify({ answers: body }),
    });
    setPending(false);
    if ("error" in res) {
      setError(res.error.message);
      return;
    }
    if (index < payload.sections.length - 1) {
      setIndex(index + 1);
      await load(true);
    } else {
      router.push("/app/perfil");
    }
  }

  if (loadError) {
    return <p className="text-[#e88585]">{loadError}</p>;
  }

  if (loading || !payload) {
    return <p className="text-nbp-tx2">A carregar onboarding…</p>;
  }

  if (payload.sections.length === 0) {
    return (
      <>
        <PageHeader
          title="Onboarding"
          subtitle={
            <Link href="/app/perfil" className="text-nbp-tx2 hover:text-nbp-tx">
              ← Perfil
            </Link>
          }
        />
        <p className="text-nbp-tx2">Ainda não há secções para preencher.</p>
      </>
    );
  }

  if (!section || !progress) {
    return <p className="text-nbp-tx2">A carregar onboarding…</p>;
  }

  const liveProgress = onboardingProgress(
    payload.sections,
    payload.sections.flatMap((s) => s.questions),
    answersNow.map((a) => ({
      question_id: a.question_id,
      value_text: a.value_text || null,
      value_json: a.value_json,
    })),
  );

  return (
    <>
      <PageHeader
        title="Onboarding"
        subtitle={
          <Link href="/app/perfil" className="text-nbp-tx2 hover:text-nbp-tx">
            ← Perfil
          </Link>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <nav aria-label="Secções do onboarding" className="lg:sticky lg:top-6">
          <div className="mb-3">
            <div className="text-[0.68rem] tracking-[0.14em] text-nbp-tx3 uppercase">
              Percurso
            </div>
            <p className="mt-1 mb-0 text-[0.86rem] text-nbp-tx2">
              {liveProgress.completed} de {liveProgress.total} secções
              {liveProgress.remaining > 0
                ? ` · faltam ${liveProgress.remaining}`
                : " · concluído"}
            </p>
          </div>
          <ProgressBar value={liveProgress.percent} className="mb-4" />

          <div
            className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Secções"
          >
            {payload.sections.map((item, i) => {
              const on = i === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setIndex(i)}
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.82rem] tabular-nums transition ${
                    on
                      ? "border-nbp-salvia bg-nbp-fill font-semibold text-nbp-tx"
                      : "border-nbp-bd bg-transparent text-nbp-tx2 hover:border-nbp-bd2 hover:text-nbp-tx"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                  {item.complete ? (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${on ? "bg-nbp-salvia" : "bg-nbp-tx3"}`}
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <ol className="relative m-0 hidden list-none flex-col p-0 lg:flex">
            <span
              className="pointer-events-none absolute top-4 bottom-4 left-[15px] w-px bg-nbp-bd"
              aria-hidden
            />
            {payload.sections.map((item, i) => {
              const on = i === index;
              return (
                <li key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-current={on ? "step" : undefined}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-[12px] py-2 pr-3 text-left transition ${
                      on ? "bg-nbp-fill" : "hover:bg-[rgba(253,255,239,0.04)]"
                    }`}
                  >
                    <span
                      className={`relative z-[1] inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border text-[0.72rem] font-bold tabular-nums ${
                        item.complete
                          ? "border-nbp-salvia bg-[rgba(198,200,186,0.16)] text-nbp-salvia"
                          : on
                            ? "border-nbp-cream bg-nbp-cream text-nbp-ink shadow-[0_0_14px_rgba(253,255,239,0.18)]"
                            : "border-nbp-bd2 bg-nbp-bg text-nbp-tx3"
                      }`}
                    >
                      {item.complete ? (
                        <Fa name="fa-check" className="text-[11px]" />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <span className="min-w-0">
                      <span
                        className={`block text-[0.88rem] leading-snug ${
                          on ? "font-semibold text-nbp-tx" : "text-nbp-tx2"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="block text-[0.72rem] text-nbp-tx3">
                        {item.questions.length}{" "}
                        {item.questions.length === 1 ? "pergunta" : "perguntas"}
                        {item.complete ? " · feita" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <Panel surface="card" className="min-w-0">
        <div className="mb-1 text-[0.68rem] tracking-[0.14em] text-nbp-tx3 uppercase">
          Secção {String(index + 1).padStart(2, "0")} de {payload.sections.length}
        </div>
        <h2 className="mt-0 mb-1 text-[1.15rem]">{section.title}</h2>
        {section.description ? (
          <p className="mt-0 mb-4 text-[0.88rem] text-nbp-tx2">{section.description}</p>
        ) : null}
        <form className="grid gap-4" onSubmit={(e) => void saveSection(e)}>
          {section.questions.map((question) => {
            const draft = drafts[question.id] ?? { value_text: "", value_json: [] };
            return (
              <div key={question.id} className="grid gap-2">
                <span className="text-[0.92rem] text-nbp-tx">
                  {question.prompt}
                  {question.required ? "" : (
                    <span className="text-nbp-tx3"> · opcional</span>
                  )}
                </span>
                {question.help_text ? (
                  <span className="text-[0.8rem] text-nbp-tx3">{question.help_text}</span>
                ) : null}
                {question.kind === "long_text" ? (
                  <textarea
                    rows={4}
                    value={draft.value_text}
                    onChange={(e) => setText(question.id, e.target.value)}
                    className={`${fieldControlClass} resize-y`}
                  />
                ) : null}
                {question.kind === "short_text" ? (
                  <input
                    value={draft.value_text}
                    onChange={(e) => setText(question.id, e.target.value)}
                    className={fieldControlClass}
                  />
                ) : null}
                {question.kind === "yes_no" ? (
                  <span className="flex gap-2">
                    {(["yes", "no"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setText(question.id, value)}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-[0.82rem] ${
                          draft.value_text === value
                            ? "border-nbp-salvia bg-nbp-salvia text-nbp-ink"
                            : "border-nbp-bd text-nbp-tx2"
                        }`}
                      >
                        {value === "yes" ? "Sim" : "Não"}
                      </button>
                    ))}
                  </span>
                ) : null}
                {question.kind === "range" ? (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[0.75rem] text-nbp-tx3">
                      <span>1 · pouco</span>
                      <span className="text-[1rem] font-semibold text-nbp-tx tabular-nums">
                        {draft.value_text || "—"}
                      </span>
                      <span>10 · muito</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={draft.value_text || "1"}
                      onChange={(e) => setText(question.id, e.target.value)}
                      aria-label={question.prompt}
                      className="w-full accent-[#C6CABE]"
                    />
                  </div>
                ) : null}
                {question.kind === "single_choice" ? (
                  <div className="flex flex-wrap gap-2">
                    {(question.options ?? []).map((option) => {
                      const on = draft.value_text === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setText(question.id, option.id)}
                          className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.84rem] transition ${
                            on
                              ? "border-nbp-salvia bg-nbp-fill font-semibold text-nbp-tx"
                              : "border-nbp-bd text-nbp-tx2 hover:border-nbp-bd2 hover:text-nbp-tx"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                {question.kind === "multi_choice" ? (
                  <div className="flex flex-wrap gap-2">
                    {(question.options ?? []).map((option) => {
                      const on = draft.value_json.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => toggleMulti(question.id, option.id)}
                          className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.84rem] transition ${
                            on
                              ? "border-nbp-salvia bg-nbp-fill font-semibold text-nbp-tx"
                              : "border-nbp-bd text-nbp-tx2 hover:border-nbp-bd2 hover:text-nbp-tx"
                          }`}
                        >
                          {on ? "● " : ""}
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
          {error ? <p className="m-0 text-sm text-[#e88585]">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" variant="primary" size="md" disabled={pending}>
              <Fa name="fa-check" />
              {pending
                ? "A guardar…"
                : index < payload.sections.length - 1
                  ? "Guardar e continuar"
                  : "Guardar e concluir"}
            </Button>
            {index > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIndex(index - 1)}
              >
                Anterior
              </Button>
            ) : null}
          </div>
        </form>
        </Panel>
      </div>
    </>
  );
}
