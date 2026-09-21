import Link from "next/link";
import { AuthCard, PublicTopbar } from "@/components/PublicChrome";
import { SignupForm } from "@/components/AuthForms";

export const metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-nbp-bg">
      <PublicTopbar actionHref="/login" actionLabel="Entrar" />
      <main className="flex min-h-screen items-center justify-center px-6 pt-[110px] pb-[60px]">
        <AuthCard
          title="Fazer parte do"
          titleStrong="ecossistema"
          description="Crie a sua conta para entrar na comunidade NBP: tutoria, acompanhamento e formação para empreendedores de serviço."
        >
          <SignupForm />
          <p className="mt-[22px] mb-0 text-center text-[0.9rem] text-nbp-tx2">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-nbp-tx">
              Entrar
            </Link>
          </p>
        </AuthCard>
      </main>
    </div>
  );
}
