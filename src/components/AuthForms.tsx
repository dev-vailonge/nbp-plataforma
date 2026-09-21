"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Field, fieldControlClass } from "@/components/Panel";

export function LoginForm({
  redirectTo,
  submitLabel = "Entrar",
}: {
  redirectTo: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || redirectTo;
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    setPending(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Erro ao entrar.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <Field label="Email" htmlFor="email" className="mb-4">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@negocio.com"
          className={fieldControlClass}
        />
      </Field>
      <Field label="Palavra-passe" htmlFor="password" className="mb-4">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={fieldControlClass}
        />
      </Field>
      {error ? <p className="mb-3 text-sm text-[#e88585]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2.5 w-full cursor-pointer rounded-full border border-nbp-salvia bg-nbp-salvia px-5 py-3.5 font-semibold tracking-[0.06em] text-nbp-bg uppercase transition hover:-translate-y-px hover:bg-transparent hover:text-nbp-salvia disabled:opacity-60"
      >
        {pending ? "A entrar…" : submitLabel}
      </button>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const fullName = String(form.get("name") || "");

    setPending(true);
    try {
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Erro ao criar conta.");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <Field label="Nome" htmlFor="name" className="mb-4">
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="O seu nome"
          className={fieldControlClass}
        />
      </Field>
      <Field label="Email" htmlFor="email" className="mb-4">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@negocio.com"
          className={fieldControlClass}
        />
      </Field>
      <Field label="Palavra-passe" htmlFor="password" className="mb-4">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          className={fieldControlClass}
        />
      </Field>
      {error ? <p className="mb-3 text-sm text-[#e88585]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2.5 w-full cursor-pointer rounded-full border border-nbp-salvia bg-nbp-salvia px-5 py-3.5 font-semibold tracking-[0.06em] text-nbp-bg uppercase transition hover:-translate-y-px hover:bg-transparent hover:text-nbp-salvia disabled:opacity-60"
      >
        {pending ? "A criar…" : "Criar conta"}
      </button>
    </form>
  );
}
