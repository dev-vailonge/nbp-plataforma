"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Fa } from "@/components/BrandMark";
import { Button } from "@/components/Button";
import { Field, PageHeader, Panel, fieldControlClass } from "@/components/Panel";
import { EmptyState } from "@/components/ui";
import { api } from "@/lib/api-client";
import type {
  NbpOnboardingQuestion,
  NbpOnboardingSection,
  OnboardingOption,
  OnboardingQuestionKind,
} from "@/types/database";

type SectionRow = NbpOnboardingSection & { questions: NbpOnboardingQuestion[] };

const KIND_LABEL: Record<OnboardingQuestionKind, string> = {
  short_text: "Texto curto",
  long_text: "Texto longo",
  single_choice: "Escolha única",
  multi_choice: "Escolha múltipla",
  yes_no: "Sim / não",
  range: "Escala",
};

const emptyQuestion = {
  prompt: "",
  help_text: "",
  kind: "short_text" as OnboardingQuestionKind,
  required: true,
  options: [
    { id: "opt-1", label: "" },
    { id: "opt-2", label: "" },
  ] as OnboardingOption[],
};

function stamp() {
  return `ob-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function AdminOnboardingPage() {
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingSection, setCreatingSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyQuestion);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api<SectionRow[]>("/api/v1/onboarding/sections");
    setLoading(false);
    if ("error" in res) {
      setError(res.error.message);
      setSections([]);
      return;
    }
    setError(null);
    setSections(res.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createSection(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const title = sectionTitle.trim();
    if (!title) return;
    const res = await api<NbpOnboardingSection>("/api/v1/onboarding/sections", {
      method: "POST",
      body: JSON.stringify({
        title,
        description: sectionDescription.trim() || null,
      }),
    });
    if ("error" in res) {
      setError(res.error.message);
      return;
    }
    setSectionTitle("");
    setSectionDescription("");
    setCreatingSection(false);
    await load();
  }

  async function patchSection(id: string, body: Record<string, unknown>) {
    const res = await api(`/api/v1/onboarding/sections/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if ("error" in res) setError(res.error.message);
    else await load();
  }

  async function removeSection(id: string) {
    const res = await api(`/api/v1/onboarding/sections/${id}`, { method: "DELETE" });
    if ("error" in res) setError(res.error.message);
    else await load();
  }

  async function moveSection(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= sections.length) return;
    const a = sections[index];
    const b = sections[next];
    await Promise.all([
      api(`/api/v1/onboarding/sections/${a.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sort_order: b.sort_order }),
      }),
      api(`/api/v1/onboarding/sections/${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sort_order: a.sort_order }),
      }),
    ]);
    await load();
  }

  function startQuestion(sectionId: string, question?: NbpOnboardingQuestion) {
    setOpenQuestion(sectionId);
    setEditingId(question?.id ?? null);
    setDraft(
      question
        ? {
            prompt: question.prompt,
            help_text: question.help_text ?? "",
            kind: question.kind,
            required: question.required,
            options: question.options?.length
              ? question.options
              : emptyQuestion.options,
          }
        : emptyQuestion,
    );
  }

  async function saveQuestion(e: FormEvent, sectionId: string) {
    e.preventDefault();
    setError(null);
    const prompt = draft.prompt.trim();
    if (!prompt) return;
    const needsOptions =
      draft.kind === "single_choice" || draft.kind === "multi_choice";
    const options = needsOptions
      ? draft.options
          .map((o, i) => ({
            id: o.id || `opt-${i + 1}`,
            label: o.label.trim(),
          }))
          .filter((o) => o.label)
      : null;
    if (needsOptions && (!options || options.length < 2)) {
      setError("Escolha precisa de pelo menos duas opções.");
      return;
    }
    const payload = {
      prompt,
      help_text: draft.help_text.trim() || null,
      kind: draft.kind,
      required: draft.required,
      options,
    };

    const res = editingId
      ? await api(`/api/v1/onboarding/questions/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await api(`/api/v1/onboarding/sections/${sectionId}/questions`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
    if ("error" in res) {
      setError(res.error.message);
      return;
    }
    setOpenQuestion(null);
    setEditingId(null);
    await load();
  }

  async function removeQuestion(_sectionId: string, questionId: string) {
    const res = await api(`/api/v1/onboarding/questions/${questionId}`, {
      method: "DELETE",
    });
    if ("error" in res) setError(res.error.message);
    else await load();
  }

  async function moveQuestion(sectionId: string, index: number, dir: -1 | 1) {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const next = index + dir;
    if (next < 0 || next >= section.questions.length) return;
    const a = section.questions[index];
    const b = section.questions[next];
    await Promise.all([
      api(`/api/v1/onboarding/questions/${a.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sort_order: b.sort_order }),
      }),
      api(`/api/v1/onboarding/questions/${b.id}`, {
        method: "PATCH",
        body: JSON.stringify({ sort_order: a.sort_order }),
      }),
    ]);
    await load();
  }

  return (
    <>
      <PageHeader
        title="Onboarding"
        subtitle="Secções e perguntas que o membro preenche no perfil. Não é obrigatório."
        actions={
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setCreatingSection((v) => !v)}
          >
            <Fa name="fa-plus" /> Nova secção
          </Button>
        }
      />

      {error ? <p className="mb-4 text-sm text-[#e88585]">{error}</p> : null}

      {creatingSection ? (
        <Panel surface="card" className="mb-4 max-w-[640px]">
          <form onSubmit={createSection} className="grid gap-3">
            <Field label="Título" htmlFor="section-title">
              <input
                id="section-title"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className={fieldControlClass}
                required
              />
            </Field>
            <Field label="Descrição" htmlFor="section-desc">
              <textarea
                id="section-desc"
                rows={2}
                value={sectionDescription}
                onChange={(e) => setSectionDescription(e.target.value)}
                className={`${fieldControlClass} resize-y`}
              />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md">
                Criar secção
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setCreatingSection(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {loading ? (
        <p className="text-nbp-tx2">A carregar onboarding…</p>
      ) : sections.length === 0 ? (
        <EmptyState
          title="Ainda sem secções"
          description="Cria a primeira secção e adiciona as perguntas que o membro vai responder."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sections.map((section, index) => (
            <Panel key={section.id} surface="card">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-[1.05rem] font-semibold">{section.title}</h2>
                  {section.description ? (
                    <p className="mt-1 mb-0 text-[0.86rem] text-nbp-tx2">
                      {section.description}
                    </p>
                  ) : null}
                  <p className="mt-1 mb-0 text-[0.78rem] text-nbp-tx3">
                    {section.questions.length}{" "}
                    {section.questions.length === 1 ? "pergunta" : "perguntas"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Subir secção"
                    disabled={index === 0}
                    onClick={() => void moveSection(index, -1)}
                  >
                    <Fa name="fa-chevron-up" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="Descer secção"
                    disabled={index === sections.length - 1}
                    onClick={() => void moveSection(index, 1)}
                  >
                    <Fa name="fa-chevron-down" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingSection(section.id);
                      setEditTitle(section.title);
                      setEditDescription(section.description ?? "");
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => void removeSection(section.id)}
                  >
                    Apagar
                  </Button>
                </div>
              </div>

              {editingSection === section.id ? (
                <form
                  className="mb-3 grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void patchSection(section.id, {
                      title: editTitle.trim(),
                      description: editDescription.trim() || null,
                    });
                    setEditingSection(null);
                  }}
                >
                  <Field label="Título" htmlFor={`edit-title-${section.id}`}>
                    <input
                      id={`edit-title-${section.id}`}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={fieldControlClass}
                      required
                    />
                  </Field>
                  <Field label="Descrição" htmlFor={`edit-desc-${section.id}`}>
                    <textarea
                      id={`edit-desc-${section.id}`}
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className={`${fieldControlClass} resize-y`}
                    />
                  </Field>
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm">
                      Guardar secção
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSection(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : null}

              <ol className="m-0 flex list-none flex-col gap-2 p-0">
                {section.questions.map((question, qIndex) => (
                  <li
                    key={question.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-nbp-bg px-3 py-2"
                  >
                    <div>
                      <div className="text-[0.9rem]">{question.prompt}</div>
                      <div className="text-[0.75rem] text-nbp-tx3">
                        {KIND_LABEL[question.kind]}
                        {question.required ? " · obrigatória" : " · opcional"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Subir pergunta"
                        disabled={qIndex === 0}
                        onClick={() => void moveQuestion(section.id, qIndex, -1)}
                      >
                        <Fa name="fa-chevron-up" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Descer pergunta"
                        disabled={qIndex === section.questions.length - 1}
                        onClick={() => void moveQuestion(section.id, qIndex, 1)}
                      >
                        <Fa name="fa-chevron-down" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => startQuestion(section.id, question)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => void removeQuestion(section.id, question.id)}
                      >
                        Apagar
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>

              {openQuestion === section.id ? (
                <form
                  className="mt-3 grid gap-3"
                  onSubmit={(e) => void saveQuestion(e, section.id)}
                >
                  <Field label="Pergunta" htmlFor={`prompt-${section.id}`}>
                    <input
                      id={`prompt-${section.id}`}
                      value={draft.prompt}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, prompt: e.target.value }))
                      }
                      className={fieldControlClass}
                      required
                    />
                  </Field>
                  <Field label="Ajuda" htmlFor={`help-${section.id}`}>
                    <input
                      id={`help-${section.id}`}
                      value={draft.help_text}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, help_text: e.target.value }))
                      }
                      className={fieldControlClass}
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Tipo" htmlFor={`kind-${section.id}`}>
                      <select
                        id={`kind-${section.id}`}
                        value={draft.kind}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            kind: e.target.value as OnboardingQuestionKind,
                          }))
                        }
                        className={fieldControlClass}
                      >
                        {(Object.keys(KIND_LABEL) as OnboardingQuestionKind[]).map(
                          (kind) => (
                            <option key={kind} value={kind}>
                              {KIND_LABEL[kind]}
                            </option>
                          ),
                        )}
                      </select>
                    </Field>
                    <label className="flex items-end gap-2 pb-3 text-[0.86rem] text-nbp-tx2">
                      <input
                        type="checkbox"
                        checked={draft.required}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, required: e.target.checked }))
                        }
                      />
                      Obrigatória para concluir a secção
                    </label>
                  </div>
                  {draft.kind === "single_choice" || draft.kind === "multi_choice" ? (
                    <div className="grid gap-2">
                      <span className="text-[0.72rem] tracking-[0.12em] text-nbp-tx3 uppercase">
                        Opções
                      </span>
                      {draft.options.map((option, optIndex) => (
                        <div key={option.id} className="flex gap-2">
                          <input
                            value={option.label}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                options: d.options.map((o, i) =>
                                  i === optIndex ? { ...o, label: e.target.value } : o,
                                ),
                              }))
                            }
                            placeholder={`Opção ${optIndex + 1}`}
                            className={fieldControlClass}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDraft((d) => ({
                                ...d,
                                options: d.options.filter((_, i) => i !== optIndex),
                              }))
                            }
                          >
                            <Fa name="fa-xmark" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            options: [
                              ...d.options,
                              { id: stamp(), label: "" },
                            ],
                          }))
                        }
                      >
                        <Fa name="fa-plus" /> Opção
                      </Button>
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="md">
                      {editingId ? "Guardar pergunta" : "Adicionar pergunta"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setOpenQuestion(null);
                        setEditingId(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => startQuestion(section.id)}
                >
                  <Fa name="fa-plus" /> Pergunta
                </Button>
              )}
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
