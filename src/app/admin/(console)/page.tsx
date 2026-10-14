import Link from "next/link";
import { Button } from "@/components/Button";
import { PageHeader, Panel } from "@/components/Panel";
import { FeaturedTalkRow, TalksCountCard } from "@/components/AdminTalks";
import { lessons, liveRules, members } from "@/lib/mocks";

export const metadata = { title: "Visão geral" };

export default function AdminHomePage() {
  const ativos = members.filter((m) => m.membership_status === "ativo").length;

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
        <TalksCountCard />
        <Link
          href="/admin/calendario"
          className="rounded-[12px] border-[0.5px] border-nbp-bd bg-nbp-sup2 p-4 hover:border-nbp-bd2"
        >
          <div className="text-[0.68rem] tracking-[0.1em] text-nbp-tx3 uppercase">Próximo evento</div>
          <div className="mt-2 text-[1.45rem] font-medium">Tutoria · terça</div>
          <div className="mt-1 text-[0.78rem] text-nbp-tx2">{liveRules[0].hour}</div>
        </Link>
      </div>
      <Panel>
        <h2 className="mt-0 mb-3 text-[1.05rem] font-medium">A publicar esta semana</h2>
        <FeaturedTalkRow />
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
