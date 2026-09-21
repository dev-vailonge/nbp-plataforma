import { Button } from "@/components/Button";
import { PageHeader, Panel } from "@/components/Panel";
import { FILE_META, documents, folders } from "@/lib/mocks";
import { Fa } from "@/components/BrandMark";

export const metadata = { title: "Documentos" };

export default function AdminDocumentosPage() {
  return (
    <>
      <PageHeader
        title="Documentos"
        subtitle="Pastas e ficheiros por utilizador (mocks do membro Roque)."
        actions={
          <>
            <Button type="button">Nova pasta</Button>
            <Button variant="primary" type="button">
              Novo ficheiro
            </Button>
          </>
        }
      />
      <div className="flex flex-col gap-3">
        {folders.map((f) => {
          const files = documents.filter((d) => d.folder_id === f.id);
          return (
            <Panel key={f.id}>
              <div className="mb-2 flex items-center gap-2 font-medium">
                <Fa name="fa-folder" className="text-nbp-salvia" />
                {f.name}
              </div>
              {files.length === 0 ? (
                <p className="m-0 text-[0.82rem] text-nbp-tx3">Sem ficheiros.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {files.map((d) => (
                    <li key={d.id} className="flex items-center gap-2 text-[0.88rem]">
                      <Fa name={FILE_META[d.file_kind].icon} />
                      {d.name}
                      <span className="text-nbp-tx3">{FILE_META[d.file_kind].label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>
    </>
  );
}
