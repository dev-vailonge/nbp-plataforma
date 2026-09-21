"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Fa } from "@/components/BrandMark";
import { Button, ButtonLink } from "@/components/Button";
import { Field, PageHeader, Panel, fieldControlClass } from "@/components/Panel";
import { EmptyState } from "@/components/ui";
import { api } from "@/lib/api-client";
import { getMockCourseDetail } from "@/lib/mocks";
import type { NbpCourse, NbpLesson, NbpModule } from "@/types/database";

type ModuleWithLessons = NbpModule & { lessons: NbpLesson[] };
type CourseDetail = NbpCourse & { modules: ModuleWithLessons[] };

export default function CursoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editCover, setEditCover] = useState("");

  const [modOpen, setModOpen] = useState(false);
  const [modTitle, setModTitle] = useState("");
  const [modSubtitle, setModSubtitle] = useState("");
  const [modCover, setModCover] = useState("");

  const [lessonFor, setLessonFor] = useState<string | null>(null);
  const [lesTitle, setLesTitle] = useState("");
  const [lesDesc, setLesDesc] = useState("");
  const [lesUrl, setLesUrl] = useState("");
  const [pending, setPending] = useState(false);

  const applyCourse = useCallback((data: CourseDetail, isDemo: boolean) => {
    setCourse(data);
    setDemo(isDemo);
    setEditTitle(data.title);
    setEditSubtitle(data.subtitle ?? "");
    setEditCover(data.cover_url ?? "");
    setError(null);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api<CourseDetail>(`/api/v1/courses/${id}`);
    setLoading(false);
    if ("error" in res) {
      const mock = getMockCourseDetail(id);
      if (mock) {
        applyCourse(mock, true);
        return;
      }
      setError(res.error.message);
      setCourse(null);
      return;
    }
    applyCourse(res.data, false);
  }, [id, applyCourse]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveCourse(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setFlash(null);
    if (demo && course) {
      setCourse({
        ...course,
        title: editTitle,
        subtitle: editSubtitle || null,
        cover_url: editCover || null,
      });
      setEditOpen(false);
      setPending(false);
      return;
    }
    const res = await api<NbpCourse>(`/api/v1/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: editTitle,
        subtitle: editSubtitle || null,
        cover_url: editCover || null,
      }),
    });
    setPending(false);
    if ("error" in res) {
      setFlash(res.error.message);
      return;
    }
    setEditOpen(false);
    await load();
  }

  async function deleteCourse() {
    if (!confirm("Apagar este curso e toda a estrutura associada?")) return;
    if (demo) {
      router.push("/admin/conteudos");
      return;
    }
    setPending(true);
    const res = await api<{ ok: boolean }>(`/api/v1/courses/${id}`, {
      method: "DELETE",
    });
    setPending(false);
    if ("error" in res) {
      setFlash(res.error.message);
      return;
    }
    router.push("/admin/conteudos");
  }

  async function createModule(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setFlash(null);
    if (demo && course) {
      const newMod: ModuleWithLessons = {
        id: `mod-demo-${Date.now()}`,
        code: `mod-demo-${Date.now()}`,
        course_id: course.id,
        title: modTitle,
        subtitle: modSubtitle || null,
        cover_url: modCover || null,
        module_number: null,
        color: null,
        color_light: null,
        sort_order: course.modules.length,
        lessons: [],
      };
      setCourse({ ...course, modules: [...course.modules, newMod] });
      setModOpen(false);
      setModTitle("");
      setModSubtitle("");
      setModCover("");
      setPending(false);
      return;
    }
    const res = await api<NbpModule>("/api/v1/modules", {
      method: "POST",
      body: JSON.stringify({
        course_id: id,
        title: modTitle,
        subtitle: modSubtitle || null,
        cover_url: modCover || null,
        sort_order: course?.modules.length ?? 0,
      }),
    });
    setPending(false);
    if ("error" in res) {
      setFlash(res.error.message);
      return;
    }
    setModOpen(false);
    setModTitle("");
    setModSubtitle("");
    setModCover("");
    await load();
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Apagar este módulo e as suas aulas?")) return;
    if (demo && course) {
      setCourse({
        ...course,
        modules: course.modules.filter((m) => m.id !== moduleId),
      });
      return;
    }
    setPending(true);
    const res = await api<{ ok: boolean }>(`/api/v1/modules/${moduleId}`, {
      method: "DELETE",
    });
    setPending(false);
    if ("error" in res) {
      setFlash(res.error.message);
      return;
    }
    await load();
  }

  async function createLesson(e: FormEvent) {
    e.preventDefault();
    if (!lessonFor) return;
    setPending(true);
    setFlash(null);
    if (demo && course) {
      const lesson: NbpLesson = {
        id: `les-demo-${Date.now()}`,
        code: `les-demo-${Date.now()}`,
        module_id: lessonFor,
        title: lesTitle,
        description: lesDesc || null,
        video_url: lesUrl || null,
        duration_label: null,
        session_label: null,
        status: "publicado",
        sort_order: 0,
      };
      setCourse({
        ...course,
        modules: course.modules.map((m) =>
          m.id === lessonFor ? { ...m, lessons: [...m.lessons, lesson] } : m,
        ),
      });
      setLessonFor(null);
      setLesTitle("");
      setLesDesc("");
      setLesUrl("");
      setPending(false);
      return;
    }
    const mod = course?.modules.find((m) => m.id === lessonFor);
    const res = await api<NbpLesson>("/api/v1/lessons", {
      method: "POST",
      body: JSON.stringify({
        module_id: lessonFor,
        title: lesTitle,
        description: lesDesc || null,
        video_url: lesUrl || null,
        sort_order: mod?.lessons.length ?? 0,
      }),
    });
    setPending(false);
    if ("error" in res) {
      setFlash(res.error.message);
      return;
    }
    setLessonFor(null);
    setLesTitle("");
    setLesDesc("");
    setLesUrl("");
    await load();
  }

  async function deleteLesson(lessonId: string) {
    if (!confirm("Apagar esta aula?")) return;
    if (demo && course) {
      setCourse({
        ...course,
        modules: course.modules.map((m) => ({
          ...m,
          lessons: m.lessons.filter((l) => l.id !== lessonId),
        })),
      });
      return;
    }
    setPending(true);
    const res = await api<{ ok: boolean }>(`/api/v1/lessons/${lessonId}`, {
      method: "DELETE",
    });
    setPending(false);
    if ("error" in res) {
      setFlash(res.error.message);
      return;
    }
    await load();
  }

  if (loading) {
    return <p className="text-nbp-tx2">A carregar curso…</p>;
  }

  if (error || !course) {
    return (
      <>
        <PageHeader
          title="Curso"
          actions={
            <ButtonLink href="/admin/conteudos" variant="ghost" size="md">
              <Fa name="fa-arrow-left" /> Voltar
            </ButtonLink>
          }
        />
        <EmptyState title="Curso não encontrado" description={error ?? undefined} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={course.title}
        subtitle={course.subtitle || "Sem descrição"}
        actions={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/admin/conteudos" variant="ghost" size="md">
              <Fa name="fa-arrow-left" /> Voltar
            </ButtonLink>
            <Button type="button" variant="outline" size="md" onClick={() => setEditOpen((v) => !v)}>
              <Fa name="fa-pen" /> Editar curso
            </Button>
            <Button type="button" variant="primary" size="md" onClick={() => setModOpen((v) => !v)}>
              <Fa name="fa-plus" /> Novo módulo
            </Button>
            <Button type="button" variant="danger" size="md" onClick={() => void deleteCourse()} disabled={pending}>
              Apagar
            </Button>
          </div>
        }
      />

      {flash ? <p className="mb-4 text-sm text-[#e88585]">{flash}</p> : null}

      {demo ? (
        <p className="mb-4 rounded-[10px] border border-nbp-bd2 bg-nbp-sup2 px-3.5 py-2.5 text-[0.82rem] text-nbp-tx2">
          Modo demonstração — alterações ficam só nesta sessão (não grava na BD).
        </p>
      ) : null}

      {course.cover_url ? (
        <div className="mb-5 overflow-hidden rounded-[12px] border border-nbp-bd">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.cover_url} alt="" className="h-[180px] w-full object-cover" />
        </div>
      ) : null}

      {editOpen ? (
        <Panel surface="card" className="mb-5">
          <h3 className="mt-0 mb-3 text-base font-semibold">Editar curso</h3>
          <form onSubmit={saveCourse} className="flex flex-col gap-3">
            <Field label="Nome" htmlFor="edit-title">
              <input
                id="edit-title"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={fieldControlClass}
              />
            </Field>
            <Field label="Descrição" htmlFor="edit-sub">
              <textarea
                id="edit-sub"
                value={editSubtitle}
                onChange={(e) => setEditSubtitle(e.target.value)}
                rows={3}
                className={`${fieldControlClass} resize-y`}
              />
            </Field>
            <Field label="Imagem de capa (URL)" htmlFor="edit-cover">
              <input
                id="edit-cover"
                type="url"
                value={editCover}
                onChange={(e) => setEditCover(e.target.value)}
                className={fieldControlClass}
              />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md" disabled={pending}>
                Guardar
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {modOpen ? (
        <Panel surface="elev" className="mb-5">
          <h3 className="mt-0 mb-3 text-base font-semibold">Novo módulo</h3>
          <form onSubmit={createModule} className="flex flex-col gap-3">
            <Field label="Nome" htmlFor="mod-title">
              <input
                id="mod-title"
                required
                value={modTitle}
                onChange={(e) => setModTitle(e.target.value)}
                className={fieldControlClass}
              />
            </Field>
            <Field label="Descrição" htmlFor="mod-sub">
              <textarea
                id="mod-sub"
                value={modSubtitle}
                onChange={(e) => setModSubtitle(e.target.value)}
                rows={2}
                className={`${fieldControlClass} resize-y`}
              />
            </Field>
            <Field label="Imagem de capa (URL)" htmlFor="mod-cover">
              <input
                id="mod-cover"
                type="url"
                value={modCover}
                onChange={(e) => setModCover(e.target.value)}
                className={fieldControlClass}
              />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md" disabled={pending}>
                Criar módulo
              </Button>
              <Button type="button" variant="ghost" size="md" onClick={() => setModOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Panel>
      ) : null}

      {course.modules.length === 0 ? (
        <EmptyState
          title="Sem módulos"
          description="Adicione o primeiro módulo para começar a criar aulas."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {course.modules.map((mod) => (
            <Panel key={mod.id} surface="card" padding="md">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-nbp-bd bg-[#1a1a18]">
                    {mod.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mod.cover_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Fa name="fa-folder" className="text-nbp-tx3" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="m-0 text-[1.05rem] font-semibold text-nbp-tx">{mod.title}</h3>
                    <p className="mt-0.5 mb-0 text-[0.84rem] text-nbp-tx2">
                      {mod.subtitle || "Sem descrição"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLessonFor(mod.id);
                      setLesTitle("");
                      setLesDesc("");
                      setLesUrl("");
                    }}
                  >
                    <Fa name="fa-plus" /> Nova aula
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={pending}
                    onClick={() => void deleteModule(mod.id)}
                  >
                    Apagar módulo
                  </Button>
                </div>
              </div>

              {lessonFor === mod.id ? (
                <form
                  onSubmit={createLesson}
                  className="mb-3 rounded-[10px] border border-nbp-bd2 bg-nbp-sup2 p-3"
                >
                  <p className="mt-0 mb-2 text-[0.8rem] font-medium text-nbp-tx2">
                    Nova aula em «{mod.title}»
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <input
                      required
                      value={lesTitle}
                      onChange={(e) => setLesTitle(e.target.value)}
                      placeholder="Nome da aula"
                      className={fieldControlClass}
                    />
                    <textarea
                      value={lesDesc}
                      onChange={(e) => setLesDesc(e.target.value)}
                      placeholder="Descrição"
                      rows={2}
                      className={`${fieldControlClass} resize-y`}
                    />
                    <input
                      type="url"
                      value={lesUrl}
                      onChange={(e) => setLesUrl(e.target.value)}
                      placeholder="Link da aula (URL do vídeo)"
                      className={fieldControlClass}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" variant="primary" size="sm" disabled={pending}>
                        Adicionar aula
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLessonFor(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </form>
              ) : null}

              {mod.lessons.length === 0 ? (
                <p className="m-0 text-[0.84rem] text-nbp-tx3">Ainda sem aulas neste módulo.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                  {mod.lessons.map((l) => (
                    <li
                      key={l.id}
                      className="flex flex-wrap items-start justify-between gap-2 rounded-[10px] border border-nbp-bd bg-nbp-bg px-3 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-nbp-tx">{l.title}</div>
                        {l.description ? (
                          <p className="mt-0.5 mb-0 text-[0.8rem] text-nbp-tx2">{l.description}</p>
                        ) : null}
                        {l.video_url ? (
                          <a
                            href={l.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-[0.78rem] text-nbp-salvia"
                          >
                            <Fa name="fa-arrow-up-right-from-square" /> Abrir link
                          </a>
                        ) : (
                          <span className="mt-1 block text-[0.78rem] text-nbp-tx3">Sem link</span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() => void deleteLesson(l.id)}
                      >
                        Apagar
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
