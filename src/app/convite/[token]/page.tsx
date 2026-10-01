"use client";

import { FormEvent, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard, PublicTopbar } from "@/components/PublicChrome";
import { Button } from "@/components/Button";
import { Field, fieldControlClass } from "@/components/Panel";
import { api } from "@/lib/api-client";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [invite, setInvite] = useState<{ full_name: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api<{ full_name: string; email: string }>(`/api/v1/invites/${encodeURIComponent(token)}`).then(
      (res) => {
        if (cancelled) return;
        setLoading(false);
        if ("error" in res) {
          setError(res.error.message);
          return;
        }
        setInvite(res.data);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password !== confirm) {
      setError("As palavras-passe não coincidem.");
      return;
    }
    setPending(true);
    const res = await api<{ confirmed: boolean }>(`/api/v1/invites/${encodeURIComponent(token)}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    setPending(false);
    if ("error" in res) {
      setError(res.error.message);
      return;
    }
    if (res.data.confirmed) {
      router.push("/app");
      router.refresh();
      return;
    }
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-nbp-bg">
      <PublicTopbar actionHref="/login" actionLabel="Entrar" />
      <main className="flex min-h-screen items-center justify-center px-6 pt-[110px] pb-[60px]">
        <AuthCard
          title="Aceitar o"
          titleStrong="convite"
          description="Cria a palavra-passe para entrar na plataforma. O convite fica ligado a este email."
        >
          {loading ? (
            <p className="m-0 text-[0.9rem] text-nbp-tx2">A abrir o convite…</p>
          ) : invite ? (
            <form onSubmit={onSubmit} className="flex flex-col">
              <p className="mt-0 mb-4 text-[0.95rem] text-nbp-tx">
                {invite.full_name}
                <span className="mt-1 block text-[0.82rem] text-nbp-tx3">{invite.email}</span>
              </p>
              <Field label="Palavra-passe" htmlFor="password" className="mb-4">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={fieldControlClass}
                />
              </Field>
              <Field label="Confirmar" htmlFor="confirm" className="mb-4">
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={fieldControlClass}
                />
              </Field>
              {error ? <p className="mt-0 mb-3 text-sm text-[#e88585]">{error}</p> : null}
              <div className="flex justify-end">
                <Button variant="primary" type="submit" disabled={pending}>
                  {pending ? "A criar…" : "Aceitar convite"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="m-0 text-[0.9rem] text-[#e88585]">{error ?? "Convite indisponível."}</p>
          )}
        </AuthCard>
      </main>
    </div>
  );
}
