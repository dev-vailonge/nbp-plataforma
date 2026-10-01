"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { ProgressBar } from "@/components/ui";
import { api } from "@/lib/api-client";
import type { OnboardingPayload } from "@/lib/onboarding";
import type { OnboardingProgress } from "@/types/database";

export function OnboardingEntry() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await api<OnboardingPayload>("/api/v1/onboarding");
      if (cancelled) return;
      if ("error" in res) {
        setError(res.error.message);
        setProgress(null);
        return;
      }
      setError(null);
      setProgress(res.data.progress.total > 0 ? res.data.progress : null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="mb-5 text-sm text-[#e88585]">{error}</p>;
  }

  if (!progress) return null;

  const done = progress.remaining === 0;
  const started = progress.completed > 0;
  const label = done
    ? "Onboarding concluído"
    : started
      ? "Continuar onboarding"
      : "Começar onboarding";
  const remainingLabel =
    progress.remaining === 1
      ? "falta 1 secção"
      : `faltam ${progress.remaining} secções`;

  return (
    <Panel surface="card" radius="2xl" padding="lg" className="mb-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-[1.05rem] font-semibold text-nbp-tx">Onboarding</h3>
          <p className="mt-1 mb-0 text-[0.86rem] text-nbp-tx2">
            {progress.completed} de {progress.total} secções
            {done ? "" : ` · ${remainingLabel}`}
          </p>
        </div>
        <ButtonLink href="/app/onboarding" variant={done ? "outline" : "solid"} size="sm">
          {label}
        </ButtonLink>
      </div>
      <div className="flex items-center gap-3 text-[0.82rem] text-nbp-tx2">
        <ProgressBar value={progress.percent} className="flex-1" />
        <span>{progress.percent}%</span>
      </div>
    </Panel>
  );
}
