import { Fa } from "@/components/BrandMark";
import { PageHeader, Panel } from "@/components/Panel";

export const metadata = { title: "Definições" };

export default function DefinicoesPage() {
  const sections = [
    { id: "aparencia", ic: "fa-palette", t: "Aparência", d: "Tema escuro NBP (único neste recorte)." },
    { id: "conta", ic: "fa-user", t: "Conta", d: "Email e nome vêm do perfil nbp_users." },
    { id: "notificacoes", ic: "fa-bell", t: "Notificações", d: "Lives, 1:1 e áudio da semana." },
    { id: "preferencias", ic: "fa-sliders", t: "Preferências", d: "Idioma e fuso horário." },
    { id: "seguranca", ic: "fa-shield-halved", t: "Segurança", d: "Palavra-passe via Supabase Auth." },
    { id: "plano", ic: "fa-credit-card", t: "Plano", d: "Membro ativo · faturação fora deste recorte." },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Faça a gestão da sua conta, aparência e preferências."
      />
      <div className="grid gap-3">
        {sections.map((s) => (
          <Panel key={s.id} id={s.id} className="flex items-start gap-3">
            <span className="mt-0.5 text-nbp-salvia">
              <Fa name={s.ic} />
            </span>
            <div>
              <h2 className="mt-0 mb-1 text-[1rem] font-medium">{s.t}</h2>
              <p className="m-0 text-[0.85rem] text-nbp-tx2">{s.d}</p>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
