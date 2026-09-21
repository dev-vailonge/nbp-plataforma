import Link from "next/link";
import { Suspense } from "react";
import { BrandMark } from "@/components/BrandMark";
import { AuthCard } from "@/components/PublicChrome";
import { LoginForm } from "@/components/AuthForms";

export const metadata = { title: "Backoffice" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-nbp-bg px-6 py-16">
      <AuthCard
        title="Entrar na"
        titleStrong="gestão"
        description="Com as variáveis Supabase definidas, o login usa a Auth. Sem env, o formulário abre o backoffice para o preview visual."
      >
        <div className="mb-4 flex items-center gap-2">
          <BrandMark />
          <span className="text-[10px] font-medium tracking-[0.08em] text-nbp-salvia uppercase">
            Backoffice
          </span>
        </div>
        <Suspense>
          <LoginForm redirectTo="/admin" />
        </Suspense>
        <p className="mt-[22px] mb-0 text-center text-[0.9rem] text-nbp-tx2">
          <Link href="/login" className="font-semibold text-nbp-tx">
            Portal do membro
          </Link>
        </p>
      </AuthCard>
    </div>
  );
}
