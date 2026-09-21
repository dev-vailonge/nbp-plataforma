"use client";

import { useEffect, useRef } from "react";
import { StageMark } from "@/components/BrandMark";
import type { NbpActionPlanStage } from "@/types/database";

export function PlanJourney({
  stages,
  fillPct,
  selectedId,
  onSelect,
}: {
  stages: NbpActionPlanStage[];
  fillPct: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.width = `${fillPct}%`;
      });
    });
  }, [fillPct]);

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative grid min-w-[720px] grid-cols-9 items-start">
          <div
            className="pointer-events-none absolute top-6 right-[5.5%] left-[5.5%] z-0 h-0.5 rounded-sm bg-nbp-bd2"
            aria-hidden
          />
          <div
            ref={fillRef}
            className="pointer-events-none absolute top-6 left-[5.5%] z-[1] h-0.5 w-0 rounded-sm bg-gradient-to-r from-[#4B4C47] via-[#C6C8BA] to-[#FDFFEF] shadow-[0_0_14px_rgba(198,200,186,0.4)] transition-[width] duration-[1200ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
            aria-hidden
          />
          {stages.map((step) => {
            const selected = selectedId === step.id;
            const locked = step.status === "locked";
            const markStatus =
              selected && step.status !== "locked" ? "current" : step.status;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelect?.(step.id)}
                className={`relative z-[2] flex min-w-0 flex-col items-center gap-1 border-0 bg-transparent px-1.5 text-center ${
                  locked ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span
                  className={`flex h-12 items-center justify-center ${
                    step.status === "current" ? "animate-nbp-pulse" : ""
                  }`}
                >
                  <StageMark
                    status={markStatus}
                    size={step.status === "current" || selected ? 26 : 22}
                  />
                </span>
                <span
                  className={`mt-1.5 w-full text-[0.8rem] leading-tight font-semibold break-words ${
                    locked ? "font-medium text-nbp-tx3" : "text-nbp-tx"
                  } ${selected ? "underline decoration-nbp-bd2 underline-offset-4" : ""}`}
                >
                  {step.name}
                </span>
                <span
                  className={`w-full text-[0.72rem] leading-tight ${
                    step.status === "current"
                      ? "font-bold text-nbp-salvia"
                      : "text-nbp-tx3"
                  }`}
                >
                  {step.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
