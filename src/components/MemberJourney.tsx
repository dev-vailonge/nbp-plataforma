"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { api } from "@/lib/api-client";
import {
  PHASE_LABELS,
  PHASE_TRACK,
  invitePath,
  phaseIndex,
  type MemberPhase,
} from "@/lib/member-phase";
import type { NbpUser } from "@/types/database";

export function MemberJourney({
  userId,
  phase,
  inviteToken,
  phaseBeforePause,
  onChange,
}: {
  userId: string;
  phase: MemberPhase;
  inviteToken: string | null;
  phaseBeforePause: MemberPhase | null;
  onChange: (user: NbpUser) => void;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const current = phase === "pausado" ? phaseBeforePause : phase;
  const currentIndex = current ? phaseIndex(current) : -1;

  async function patch(body: Record<string, unknown>, key: string) {
    setError(null);
    setPending(key);
    const res = await api<NbpUser>(`/api/v1/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    setPending(null);
    if ("error" in res) {
      setError(res.error.message);
      return;
    }
    onChange(res.data);
  }

  async function copyInvite() {
    if (!inviteToken) return;
    const url = `${origin}${invitePath(inviteToken)}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
  }

  return (
    <section className="overflow-hidden rounded-[12px] border-[0.5px] border-nbp-bd bg-nbp-sup">
      <div className="border-b border-nbp-bd px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-[1rem] font-semibold text-nbp-tx">Percurso</h2>
            <p className="mt-0.5 mb-0 text-[0.8rem] text-nbp-tx2">
              {PHASE_LABELS[phase]}
              {phase === "pausado" && phaseBeforePause
                ? ` · estava em ${PHASE_LABELS[phaseBeforePause].toLowerCase()}`
                : ""}
            </p>
          </div>
        </div>
        <ol className="mt-4 mb-0 flex list-none gap-2 overflow-x-auto p-0">
          {PHASE_TRACK.map((step, index) => {
            const done = currentIndex > index;
            const active = phase !== "pausado" && currentIndex === index;
            return (
              <li key={step} className="min-w-[132px] flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.72rem] font-semibold ${
                      done || active
                        ? "bg-nbp-salvia text-nbp-ink"
                        : "border border-nbp-bd text-nbp-tx3"
                    }`}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  {index < PHASE_TRACK.length - 1 ? (
                    <span className={`h-px flex-1 ${done ? "bg-nbp-salvia" : "bg-nbp-bd"}`} />
                  ) : null}
                </div>
                <p className={`m-0 text-[0.75rem] leading-snug ${active ? "text-nbp-tx" : "text-nbp-tx3"}`}>
                  {PHASE_LABELS[step]}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="flex flex-col gap-3 bg-nbp-bg px-5 py-4">
        {phase === "convite_criado" && inviteToken ? (
          <p className="m-0 break-all text-[0.82rem] text-nbp-tx2">
            {origin ? `${origin}${invitePath(inviteToken)}` : invitePath(inviteToken)}
          </p>
        ) : null}
        {error ? <p className="m-0 text-sm text-[#e88585]">{error}</p> : null}
        <div className="flex flex-wrap justify-end gap-2">
          {phase === "convite_criado" && inviteToken ? (
            <>
              <Button type="button" variant="ghost" size="md" disabled={pending !== null} onClick={() => patch({ regenerate_invite: true }, "renew")}>
                {pending === "renew" ? "A gerar…" : "Novo link"}
              </Button>
              <Button type="button" variant="primary" size="md" onClick={() => void copyInvite()}>
                {copied ? "Copiado" : "Copiar convite"}
              </Button>
            </>
          ) : null}
          {phase === "onboarding_finalizado" ? (
            <Button type="button" variant="primary" size="md" disabled={pending !== null} onClick={() => patch({ phase: "diagnostico" }, "diagnostico")}>
              {pending === "diagnostico" ? "A marcar…" : "Marcar diagnóstico"}
            </Button>
          ) : null}
          {phase === "diagnostico" ? (
            <Button type="button" variant="primary" size="md" disabled={pending !== null} onClick={() => patch({ phase: "acompanhamento" }, "acompanhamento")}>
              {pending === "acompanhamento" ? "A marcar…" : "Iniciar acompanhamento"}
            </Button>
          ) : null}
          {phase === "pausado" && phaseBeforePause ? (
            <Button type="button" variant="primary" size="md" disabled={pending !== null} onClick={() => patch({ phase: phaseBeforePause }, "resume")}>
              {pending === "resume" ? "A retomar…" : "Retomar"}
            </Button>
          ) : null}
          {phase !== "pausado" ? (
            <Button type="button" variant="outline" size="md" disabled={pending !== null} onClick={() => patch({ phase: "pausado" }, "pause")}>
              {pending === "pause" ? "A pausar…" : "Pausar"}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
