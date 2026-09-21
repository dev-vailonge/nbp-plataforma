import { StageMark } from "@/components/BrandMark";
import type { NbpActionPlanStage } from "@/types/database";

export function PlanStages({
  stages,
  stepWidth = 108,
}: {
  stages: NbpActionPlanStage[];
  stepWidth?: number;
}) {
  return (
    <div className="flex gap-0 overflow-x-auto pb-1">
      {stages.map((step) => (
        <div
          key={step.id}
          className="shrink-0 px-2 text-center"
          style={{ width: stepWidth }}
        >
          <div className="mb-2 flex justify-center">
            <StageMark status={step.status} size={20} />
          </div>
          <div
            className={`text-[0.72rem] leading-tight ${
              step.status === "locked" ? "font-medium text-nbp-tx3" : ""
            }`}
          >
            {step.name}
          </div>
          <div
            className={`mt-0.5 text-[0.66rem] ${
              step.status === "current"
                ? "font-semibold text-nbp-salvia"
                : "text-nbp-tx3"
            }`}
          >
            {step.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
}
