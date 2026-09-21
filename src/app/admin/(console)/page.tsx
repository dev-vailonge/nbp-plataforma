import Link from "next/link";
import { Button } from "@/components/Button";
import { PageHeader, Panel } from "@/components/Panel";
import { lessons, liveRules, members, talks } from "@/lib/mocks";

export const metadata = { title: "Visão geral" };

export default function AdminHomePage() {
  const ativos = members.filter((m) => m.membership_status === "ativo").length;
  const publishedTalks = talks.filter((t) => t.status === "publicado");
  const featured = talks.find((t) => t.featured);

  return (
    <>
      <PageHeader
        title="Visão geral"
        subtitle="O que a equipa gere para o portal do membro."
        actions={
          <Button type="button">
            <i className="fa-solid fa-rotate-left" aria-hidden /> Repor dados de exemplo
          </Button>
        }
      />
      <div className="mb-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/membros", k: "Membros ativos", v: String(ativos), h: `${members.length} no total` },
          { href: "/admin/conteudos", k: "Aulas", v: String(lessons.length), h: "6 módulos" },
          { href: "/admin/talks", k: "Talks publicados", v: String(publishedTalks.length), h: "Mafra Talks" },
          { href: "/admin/calendario", k: "Próximo evento", v: "Tutoria · terça", h: liveRules[0].hour },
        ].map((t) => (
          <Link
            key={t.k}
            href={t.href}
            className="rounded-[12px] border-[0.5px] border-nbp-bd bg-nbp-sup2 p-4 hover:border-nbp-bd2"
          >
            <div className="text-[0.68rem] tracking-[0.1em] text-nbp-tx3 uppercase">{t.k}</div>
            <div className="mt-2 text-[1.45rem] font-medium">{t.v}</div>
            <div className="mt-1 text-[0.78rem] text-nbp-tx2">{t.h}</div>
          </Link>
        ))}
      </div>
      <Panel>
        <h2 className="mt-0 mb-3 text-[1.05rem] font-medium">A publicar esta semana</h2>
        {featured ? (
          <div className="mb-3 flex items-center justify-between gap-3 border-b-[0.5px] border-nbp-bd pb-3">
            <div>
              <strong>{featured.title}</strong>
              <div className="text-[0.82rem] text-nbp-tx2">
                Talk · {featured.duration_label} · {featured.summary}
              </div>
            </div>
            <Link href="/admin/talks" className="text-[0.82rem] text-nbp-salvia">
              Abrir
            </Link>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <div>
            <strong>Tutoria · {liveRules[0].rotation[0]}</strong>
            <div className="text-[0.82rem] text-nbp-tx2">
              terças · {liveRules[0].hour}
            </div>
          </div>
          <Link href="/admin/calendario" className="text-[0.82rem] text-nbp-salvia">
            Abrir
          </Link>
        </div>
      </Panel>
    </>
  );
}
