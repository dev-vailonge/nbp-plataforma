import { Fa } from "@/components/BrandMark";
import { Avatar, IconWell } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { PageHeader, Panel, SectionLabel, Field, fieldControlClass } from "@/components/Panel";
import { Pill, PlanBadge } from "@/components/Pill";
import { EmptyState, Input, ProgressBar, TextArea } from "@/components/ui";
import { color } from "@/design-system";

export const metadata = { title: "Design system" };

const swatches = [
  ["bg", color.bg],
  ["sup", color.sup],
  ["sup2", color.sup2],
  ["fill", color.fill],
  ["rail", color.rail],
  ["bd", color.bd],
  ["tx", color.tx],
  ["tx2", color.tx2],
  ["tx3", color.tx3],
  ["salvia", color.salvia],
  ["cream", color.cream],
  ["violet", color.violet],
  ["success", color.success],
  ["warn", color.warn],
  ["down", color.down],
  ["info", color.info],
] as const;

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <section className="w-full" aria-label="Design system">
      <PageHeader
        title="Design system"
        subtitle="Tokens e primitives da plataforma NBP · docs/design-system.md"
      />

      <Block title="Cor">
        <div className="grid grid-cols-4 gap-2.5 min-[720px]:grid-cols-8">
          {swatches.map(([name, hex]) => (
            <div key={name} className="min-w-0">
              <div
                className="mb-1.5 aspect-square rounded-[10px] border border-nbp-bd"
                style={{ background: hex }}
              />
              <div className="truncate text-[0.72rem] font-medium text-nbp-tx">{name}</div>
              <div className="truncate font-mono text-[0.65rem] text-nbp-tx3">{hex}</div>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Tipografia">
        <Panel surface="card" className="flex flex-col gap-4">
          <div>
            <div className="text-[1.4rem] font-semibold">Page title · 1.4rem / 600</div>
            <div className="text-[0.8rem] text-nbp-tx2">Subtitle muted · 0.8rem</div>
          </div>
          <div className="text-[clamp(1.5rem,2.4vw,2rem)] font-medium tracking-[-0.01em]">
            Bom te ver, <span className="font-bold">Roque</span>.
          </div>
          <div className="text-[1.05rem] font-semibold">Panel title · 1.05rem</div>
          <div className="text-[0.92rem] text-nbp-tx2">
            Body / supporting copy · text-nbp-tx2
          </div>
          <div className="text-[0.68rem] tracking-[0.16em] text-nbp-tx3 uppercase">
            Section label · kicker
          </div>
        </Panel>
      </Block>

      <Block title="Botões">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary">Primary</Button>
          <Button variant="solid">Solid</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="violet">Violet</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="outline" size="pill">
            Pill
          </Button>
        </div>
      </Block>

      <Block title="Pills e badges">
        <div className="flex flex-wrap items-center gap-2">
          <Pill>Sage</Pill>
          <Pill tone="muted">Muted</Pill>
          <Pill tone="violet">Violet</Pill>
          <Pill tone="warn">Warn</Pill>
          <Pill tone="info">Info</Pill>
          <Pill tone="success">Success</Pill>
          <Pill tone="cream">Cream</Pill>
          <PlanBadge>Membro ativo</PlanBadge>
        </div>
      </Block>

      <Block title="Avatares e wells">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name="Roque Buarque" size="xl" />
          <Avatar name="João Mafra" size="lg" tone="mentor" />
          <Avatar name="Marta Nunes" size="md" tone="violet" />
          <Avatar name="Ana Freire" size="sm" tone="fill" />
          <IconWell>
            <Fa name="fa-seedling" />
          </IconWell>
          <IconWell locked>
            <Fa name="fa-lock" />
          </IconWell>
        </div>
      </Block>

      <Block title="Painéis">
        <div className="grid gap-3 min-[900px]:grid-cols-2">
          <Panel surface="elev">
            <div className="text-[0.9rem] font-semibold">surface=elev</div>
            <p className="mt-1 mb-0 text-[0.82rem] text-nbp-tx2">
              Default elevado (sup2).
            </p>
          </Panel>
          <Panel surface="card">
            <div className="text-[0.9rem] font-semibold">surface=card</div>
            <p className="mt-1 mb-0 text-[0.82rem] text-nbp-tx2">
              Cartão V2 (sup).
            </p>
          </Panel>
          <Panel surface="session">
            <div className="text-[0.9rem] font-semibold">surface=session</div>
            <p className="mt-1 mb-0 text-[0.82rem] text-nbp-tx2">
              Gradiente suave para próxima sessão / destaque.
            </p>
          </Panel>
          <Panel surface="violet">
            <div className="text-[0.9rem] font-semibold text-nbp-violet-soft">
              surface=violet
            </div>
            <p className="mt-1 mb-0 text-[0.82rem] text-nbp-violet/80">
              Só para 1:1 / calendário de mentor.
            </p>
          </Panel>
        </div>
      </Block>

      <Block title="Formulário e progresso">
        <Panel surface="card" className="max-w-md space-y-3">
          <Field label="Nome">
            <input className={fieldControlClass} defaultValue="Roque Buarque" />
          </Field>
          <Input placeholder="Input compacto" />
          <TextArea placeholder="Textarea…" rows={3} />
          <div>
            <div className="mb-2 flex justify-between text-[0.82rem] text-nbp-tx2">
              <span>Etapa 4 de 9</span>
              <span>38%</span>
            </div>
            <ProgressBar value={38} />
          </div>
        </Panel>
      </Block>

      <Block title="Empty state">
        <EmptyState
          title="Pasta vazia"
          description="Ainda não há ficheiros partilhados aqui."
        />
      </Block>
    </section>
  );
}
