import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { Field, PageHeader, Panel, fieldControlClass } from "@/components/Panel";
import { SECTORS, userById } from "@/lib/mocks";
import type { Sector } from "@/types/database";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "novo";
  const member = isNew ? null : userById(id);
  if (!isNew && !member) notFound();

  return (
    <>
      <PageHeader
        title={member ? member.full_name : "Novo membro"}
        subtitle={
          <Link href="/admin/membros" className="text-nbp-tx2 hover:text-nbp-tx">
            ← Membros
          </Link>
        }
        actions={
          member ? (
            <Link href={`/admin/membros/${member.code}/plano`}>
              <Button variant="primary">Plano de ação</Button>
            </Link>
          ) : null
        }
      />
      <Panel>
        <form className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="n">
            <input
              id="n"
              name="n"
              defaultValue={member?.full_name ?? ""}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Email" htmlFor="e">
            <input
              id="e"
              name="e"
              type="email"
              defaultValue={member?.email ?? ""}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Empresa" htmlFor="empresa">
            <input
              id="empresa"
              name="empresa"
              defaultValue={member?.company ?? ""}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Cidade" htmlFor="c">
            <input id="c" name="c" defaultValue={member?.city ?? ""} className={fieldControlClass} />
          </Field>
          <Field label="Setor" htmlFor="s">
            <select id="s" name="s" defaultValue={member?.sector ?? ""} className={fieldControlClass}>
              <option value="">—</option>
              {(Object.keys(SECTORS) as Sector[]).map((k) => (
                <option key={k} value={k}>
                  {SECTORS[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Telefone" htmlFor="tel">
            <input
              id="tel"
              name="tel"
              defaultValue={member?.phone ?? ""}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Instagram" htmlFor="ig">
            <input
              id="ig"
              name="ig"
              defaultValue={member?.instagram ?? ""}
              className={fieldControlClass}
            />
          </Field>
          <Field label="Plano" htmlFor="plan">
            <select
              id="plan"
              name="plan"
              defaultValue={member?.membership_status ?? "ativo"}
              className={fieldControlClass}
            >
              <option value="ativo">Membro ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </Field>
          <Field label="Bio" htmlFor="bio" className="sm:col-span-2">
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={member?.bio ?? ""}
              className={fieldControlClass}
            />
          </Field>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button variant="primary" type="button">
              Guardar
            </Button>
            <Link href="/admin/membros">
              <Button type="button">Cancelar</Button>
            </Link>
          </div>
        </form>
      </Panel>
    </>
  );
}
