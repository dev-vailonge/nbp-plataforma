import type { StageStatus } from "@/types/database";

export function BrandMark({ size = 32 }: { size?: number }) {
  const inner = Math.round(size * 0.53);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-nbp-fill"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={inner} height={inner} viewBox="0 0 20 20">
        <rect width="20" height="20" fill="#C6CABE" />
        <circle cx="10" cy="10" r="6.2" fill="#2A2926" />
      </svg>
    </span>
  );
}

/** NBP mark as journey stage node (done / current / locked). */
export function StageMark({
  status,
  size = 20,
  className = "",
}: {
  status: StageStatus;
  size?: number;
  className?: string;
}) {
  const fills =
    status === "done"
      ? { sq: "#C6CABE", dot: "#2A2926" }
      : status === "current"
        ? { sq: "#FDFFEF", dot: "#2A2926" }
        : { sq: "#4B4C47", dot: "#232320" };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden
      className={`mx-auto block shrink-0 ${
        status === "current" ? "drop-shadow-[0_0_8px_rgba(198,200,186,0.45)]" : ""
      } ${status === "locked" ? "opacity-85" : ""} ${className}`}
    >
      <rect width="20" height="20" fill={fills.sq} />
      <circle cx="10" cy="10" r="6.2" fill={fills.dot} />
    </svg>
  );
}

export function Fa({
  name,
  regular,
  className = "",
}: {
  name: string;
  regular?: boolean;
  className?: string;
}) {
  return (
    <i
      className={`${regular ? "fa-regular" : "fa-solid"} ${name} ${className}`}
      aria-hidden
    />
  );
}
