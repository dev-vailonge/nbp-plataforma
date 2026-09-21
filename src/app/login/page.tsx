import Link from "next/link";
import { Suspense } from "react";
import { AuthCard, PublicTopbar } from "@/components/PublicChrome";
import { LoginForm } from "@/components/AuthForms";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-nbp-bg">
      <PublicTopbar actionHref="/cadastro" actionLabel="Criar conta" />
      <main className="flex min-h-screen items-center justify-center px-6 pt-[110px] pb-[60px]">
        <AuthCard
          title="Entrar no"
          titleStrong="ecossistema"
          description="Continue a comunidade, as tutorias e o acompanhamento — crescimento, finanças, IA e estratégia no mesmo sítio."
        >
          <Suspense>
            <LoginForm redirectTo="/app" />
          </Suspense>
          <p className="mt-[22px] mb-0 text-center text-[0.9rem] text-nbp-tx2">
            Ainda não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold text-nbp-tx">
              Criar conta
            </Link>
          </p>
          <p className="mt-3 mb-0 text-center text-[0.8rem] text-nbp-tx3">
            <Link href="/admin/login">Backoffice</Link>
          </p>
        </AuthCard>
      </main>
    </div>
  );
}
