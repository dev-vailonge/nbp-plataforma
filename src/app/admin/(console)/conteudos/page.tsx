import { Button } from "@/components/Button";
import { PageHeader, Panel } from "@/components/Panel";
import { Pill } from "@/components/Pill";
import { lessons, modules } from "@/lib/mocks";

export const metadata = { title: "Conteúdos" };

export default function AdminConteudosPage() {
  return (
    <>
      <PageHeader
        title="Conteúdos"
        subtitle="Módulos, tutorias e aulas que o membro vê em Cursos."
        actions={
          <Button type="button">
            <i className="fa-solid fa-plus" aria-hidden /> Novo módulo
          </Button>
        }
      />
      <div className="flex flex-col gap-3">
        {modules.map((mod) => {
          const list = lessons.filter((l) => l.module_id === mod.id);
          return (
            <Panel key={mod.id}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="m-0 text-[1.05rem] font-medium">{mod.title}</h2>
                  <p className="m-0 text-[0.82rem] text-nbp-tx2">{mod.subtitle}</p>
                </div>
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: mod.color ?? "#C6CABE" }}
                />
              </div>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {list.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between rounded-lg bg-nbp-bg px-3 py-2 text-[0.88rem]"
                  >
                    <span>
                      {l.title}
                      <span className="ml-2 text-nbp-tx3">{l.duration_label}</span>
                    </span>
                    <Pill tone={l.status === "publicado" ? "sage" : "muted"}>{l.status}</Pill>
                  </li>
                ))}
              </ul>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
