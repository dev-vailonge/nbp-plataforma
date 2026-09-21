import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Panel } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import {
  formatEur,
  lessons,
  planMonths,
  planObjectives,
  planStages,
  userById,
} from "@/lib/mocks";

export default async function MemberPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = userById(id);
  if (!member) notFound();
  const month = planMonths.find((m) => m.user_id === member.id && m.month === 8);

  return (
    <>
      <PageHeader
        title={`Plano de ${member.full_name}`}
        subtitle={
          <>
            <Link href="/admin/membros" className="text-nbp-tx2 hover:text-nbp-tx">
              ← Membros
            </Link>
            {" · "}
            <Link href={`/admin/membros/${member.code}`} className="text-nbp-tx2 hover:text-nbp-tx">
              Ficha
            </Link>
          </>
        }
        actions={<Pill>Agosto 2026</Pill>}
      />
      {!month ? (
        <p>Não há plano para este membro neste recorte (mocks do seed de Roque).</p>
      ) : (
        <>
          <Panel className="mb-4">
            <h2 className="mt-0 mb-1 text-[1.1rem]">{month.title}</h2>
            <p className="mt-0 mb-4 text-nbp-tx2">{month.subtitle}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ["MRR", `${formatEur(month.mrr ?? 0)} €`],
                ["Receita", `${formatEur(month.rec ?? 0)} €`],
                ["Novos", String(month.nov)],
                ["Ativos", String(month.act)],
                ["Churn", `${month.chu}%`],
                ["Leads", String(month.lea)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[10px] border-[0.5px] border-nbp-bd bg-nbp-bg px-3 py-2">
                  <div className="text-[0.65rem] text-nbp-tx3 uppercase">{k}</div>
                  <div className="font-medium">{v}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel className="mb-4">
            <h3 className="mt-0 mb-3 text-[0.9rem] text-nbp-tx2">Etapas</h3>
            <ol className="m-0 flex list-none flex-col gap-2 p-0">
              {planStages.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-nbp-bg px-3 py-2">
                  <span>{s.name}</span>
                  <Pill tone={s.status === "done" ? "sage" : s.status === "current" ? "violet" : "muted"}>
                    {s.status} · {s.subtitle}
                  </Pill>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel>
            <h3 className="mt-0 mb-3 text-[0.9rem] text-nbp-tx2">Objetivos</h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {planObjectives.map((o) => {
                const lesson = lessons.find((l) => l.id === o.lesson_id);
                return (
                  <li key={o.id} className="rounded-lg border-[0.5px] border-nbp-bd bg-nbp-bg px-3 py-2">
                    <div>{o.title}</div>
                    <div className="text-[0.75rem] text-nbp-tx3">
                      {o.column}
                      {lesson ? ` · aula ${lesson.title}` : ""}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 mb-0 text-[0.8rem] text-nbp-tx3">
              Quadro (tela jsonb) não é editável neste recorte — só leitura dos mocks.
            </p>
          </Panel>
        </>
      )}
    </>
  );
}
