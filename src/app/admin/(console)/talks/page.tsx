import { Button } from "@/components/Button";
import { PageHeader, Panel } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { formatTalkDate, talks } from "@/lib/mocks";

export const metadata = { title: "Mafra Talks" };

export default function AdminTalksPage() {
  return (
    <>
      <PageHeader
        title="Mafra Talks"
        subtitle="O episódio publicado mais recente é o featured do membro."
        actions={
          <Button variant="primary" type="button">
            <i className="fa-solid fa-plus" aria-hidden /> Novo episódio
          </Button>
        }
      />
      <div className="flex flex-col gap-2">
        {talks.map((t) => (
          <Panel key={t.id} className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <strong>{t.title}</strong>
                {t.featured ? <Pill>featured</Pill> : null}
                <Pill tone={t.status === "publicado" ? "sage" : "muted"}>{t.status}</Pill>
              </div>
              <p className="mt-1 mb-0 text-[0.85rem] text-nbp-tx2">
                {formatTalkDate(t.published_on)} · {t.duration_label} · {t.summary}
              </p>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
