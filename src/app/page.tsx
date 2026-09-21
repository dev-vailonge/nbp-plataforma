import Link from "next/link";
import { BrandMark, Fa } from "@/components/BrandMark";
import { PublicTopbar } from "@/components/PublicChrome";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-nbp-bg">
      <PublicTopbar actionHref="/login" actionLabel="Entrar" />
      <main className="mx-auto max-w-[880px] px-6 pt-32 pb-20">
        <div className="mb-8 flex items-center gap-3">
          <BrandMark size={40} />
          <span className="text-sm font-semibold tracking-[0.12em] text-nbp-tx2 uppercase">
            No Blank Page
          </span>
        </div>
        <h1 className="mt-0 mb-5 max-w-[18ch] text-[clamp(2.1rem,5vw,3.4rem)] font-light leading-[1.15] tracking-tight">
          Pare de começar{" "}
          <span className="font-semibold text-nbp-salvia">a página</span>
        </h1>
        <p className="mt-0 mb-8 max-w-[62ch] text-[1.05rem] leading-relaxed text-nbp-tx2">
          <strong className="font-semibold text-nbp-tx">
            Mais do que uma mentoria: um ecossistema.
          </strong>{" "}
          A NBP é a comunidade onde empreendedores digitais de serviço partilham
          experiências, recebem orientação estratégica e crescem juntos — com
          tutoria em crescimento, finanças, IA e estratégia de negócio.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-nbp-salvia bg-nbp-salvia px-6 py-3.5 text-[0.82rem] font-semibold tracking-[0.06em] text-nbp-bg uppercase transition hover:-translate-y-px"
          >
            Entrar no ecossistema
            <Fa name="fa-arrow-right" />
          </Link>
          <Link
            href="/cadastro"
            className="inline-flex items-center rounded-full border border-nbp-bd2 px-6 py-3.5 text-[0.82rem] font-semibold tracking-[0.06em] uppercase transition hover:border-nbp-salvia"
          >
            Criar conta
          </Link>
        </div>

        <div className="mt-16 grid gap-3 sm:grid-cols-3">
          {[
            { ic: "fa-users", t: "Comunidade", d: "Empreendedores de serviço no mesmo desafio." },
            { ic: "fa-graduation-cap", t: "Tutoria", d: "Terças às 18h · ensino, finanças, IA." },
            { ic: "fa-flag-checkered", t: "Plano de ação", d: "Acompanhamento 1:1 e métricas do mês." },
          ].map((item) => (
            <article
              key={item.t}
              className="rounded-[12px] border-[0.5px] border-nbp-bd bg-nbp-sup p-5"
            >
              <Fa name={item.ic} className="mb-3 text-nbp-salvia" />
              <h2 className="m-0 text-[0.95rem] font-medium">{item.t}</h2>
              <p className="mt-1.5 mb-0 text-[0.85rem] text-nbp-tx2">{item.d}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
