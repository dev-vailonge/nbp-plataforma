import { Button } from "@/components/Button";
import { PageHeader, Panel } from "@/components/Panel";
import { liveRules } from "@/lib/mocks";

export const metadata = { title: "Calendário" };

export default function AdminCalendarioPage() {
  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle="Regras recorrentes (terças / quintas) e eventos pontuais."
        actions={
          <Button variant="primary" type="button">
            Novo evento
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {liveRules.map((r) => (
          <Panel key={r.id}>
            <div className="text-[0.68rem] tracking-[0.1em] text-nbp-tx3 uppercase">
              {r.kind}
            </div>
            <h2 className="mt-1 mb-1 text-[1.05rem] font-medium">
              {r.weekday === 2 ? "Terças" : "Quintas"} · {r.hour}
            </h2>
            <p className="m-0 text-[0.85rem] text-nbp-tx2">
              Rotação: {r.rotation.join(" → ")}
            </p>
          </Panel>
        ))}
      </div>
      <Panel className="mt-4">
        <p className="m-0 text-[0.85rem] text-nbp-tx2">
          O calendário do membro combina estas regras com sessões 1:1. A grelha
          interativa está no portal em /app/calendario. Overrides pontuais ficam para
          o recorte com queries reais.
        </p>
      </Panel>
    </>
  );
}
