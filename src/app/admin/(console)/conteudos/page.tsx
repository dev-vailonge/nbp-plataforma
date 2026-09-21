"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Fa } from "@/components/BrandMark";
import { ButtonLink } from "@/components/Button";
import { PageHeader } from "@/components/Panel";
import { EmptyState } from "@/components/ui";
import { api } from "@/lib/api-client";
import { courses as mockCourses } from "@/lib/mocks";
import type { NbpCourse } from "@/types/database";

export default function AdminConteudosPage() {
  const [courses, setCourses] = useState<NbpCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api<NbpCourse[]>("/api/v1/courses");
    setLoading(false);
    if ("error" in res || res.data.length === 0) {
      setCourses(mockCourses);
      setDemo(true);
      return;
    }
    setCourses(res.data);
    setDemo(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Conteúdos"
        subtitle="Cursos, módulos e aulas do catálogo."
        actions={
          <ButtonLink href="/admin/conteudos/novo" variant="primary" size="md">
            <Fa name="fa-plus" /> Novo curso
          </ButtonLink>
        }
      />

      {demo ? (
        <p className="mb-4 rounded-[10px] border border-nbp-bd2 bg-nbp-sup2 px-3.5 py-2.5 text-[0.82rem] text-nbp-tx2">
          A mostrar <b className="text-nbp-tx">dados de demonstração</b>. Clique num
          curso (ex. Formação NBP) para ver módulos e aulas.
        </p>
      ) : null}

      {loading ? (
        <p className="text-nbp-tx2">A carregar cursos…</p>
      ) : courses.length === 0 ? (
        <EmptyState
          title="Ainda sem cursos"
          description="Crie o primeiro curso para começar a organizar módulos e aulas."
        />
      ) : (
        <div className="grid gap-3 min-[720px]:grid-cols-2">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/admin/conteudos/${c.id}`}
              className="block overflow-hidden rounded-[12px] border-[0.5px] border-nbp-bd bg-nbp-sup transition hover:border-nbp-bd2 hover:bg-nbp-sup2"
            >
              <div className="flex h-[120px] items-center justify-center bg-[#1a1a18]">
                {c.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.cover_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Fa name="fa-graduation-cap" className="text-[28px] text-nbp-tx3" />
                )}
              </div>
              <div className="p-4">
                <h2 className="m-0 text-[1.05rem] font-semibold text-nbp-tx">{c.title}</h2>
                <p className="mt-1 mb-0 line-clamp-2 text-[0.84rem] text-nbp-tx2">
                  {c.subtitle || "Sem descrição"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
