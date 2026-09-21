import Link from "next/link";
import { Fa } from "@/components/BrandMark";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { PageHeader, Panel } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import {
  currentConsultant,
  formatSessionWhen,
  nextSession,
  sessions,
} from "@/lib/mocks";

export const metadata = { title: "Reuniões 1:1" };

export default function ReunioesPage() {
  const past = sessions.filter((s) => s.status !== "scheduled").reverse();

  return (
    <>
      <PageHeader
        title="Reuniões 1:1"
        subtitle="As tuas sessões individuais com a mentora, gravadas e sempre disponíveis — com resumo e tarefas no plano de ação."
      />
      <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_1.1fr]">
        <Panel className="flex flex-wrap items-center gap-4">
          <Avatar name={currentConsultant.full_name} size="lg" tone="violet" />
          <div className="min-w-0 flex-1">
            <p className="m-0 font-medium">{currentConsultant.full_name}</p>
            <p className="m-0 text-[0.82rem] text-nbp-tx2">
              A tua mentora desde março · 12 sessões juntos
            </p>
          </div>
          <Link
            href="/app/comunidade"
            className="inline-flex items-center rounded-full border border-nbp-bd2 px-3 py-1.5 text-[12px] hover:border-nbp-salvia"
          >
            Enviar mensagem
          </Link>
        </Panel>
        <div className="flex flex-wrap items-center gap-3 rounded-[12px] border-[0.5px] border-nbp-violet-bd bg-nbp-violet-deep p-5 text-nbp-violet-soft">
          <Fa name="fa-calendar" regular className="text-nbp-violet" />
          <div className="min-w-0 flex-1">
            <p className="m-0 font-medium">
              Próxima sessão · {formatSessionWhen(nextSession.starts_at)}
            </p>
            <span className="text-[0.82rem] text-nbp-violet/80">
              Sessão {nextSession.session_number} · {nextSession.duration_min} min
            </span>
          </div>
          <Button variant="violet" size="sm">
            Reagendar
          </Button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="m-0 text-[1.05rem] font-medium">
          Sessões anteriores <span className="text-nbp-tx3">· {past.length}</span>
        </h2>
      </div>
      <div className="flex flex-col gap-2">
        {past.map((s) => (
          <Panel key={s.id} className="flex flex-wrap items-start gap-4">
            <div>
              <div className="text-[0.85rem] font-medium">Sessão {s.session_number}</div>
              <div className="text-[0.78rem] text-nbp-tx2">
                {formatSessionWhen(s.starts_at)} · {s.duration_min} min
              </div>
            </div>
            <p className="m-0 min-w-[200px] flex-1 text-[0.88rem] text-nbp-tx2">
              {s.summary || "Sem resumo registado."}
            </p>
            <div className="flex items-center gap-2">
              {s.tasks_count ? <Pill tone="sage">{s.tasks_count} tarefas</Pill> : null}
              <Pill tone="violet">Feita</Pill>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
