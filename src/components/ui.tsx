import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "nbp-focus w-full border border-nbp-bd bg-nbp-sup2 text-nbp-tx outline-none transition placeholder:text-nbp-tx3 focus:border-nbp-salvia";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`${base} h-9 rounded-[10px] px-3 text-[13px] ${className}`}
      {...props}
    />
  );
}

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${base} min-h-[88px] resize-y rounded-[10px] px-3 py-2.5 text-[0.9rem] ${className}`}
      {...props}
    />
  );
}

export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <span
      className={`block h-2 overflow-hidden rounded-full bg-nbp-sup2 ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span
        className="block h-full rounded-full bg-[linear-gradient(90deg,#C6C8BA,#FDFFEF)]"
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-[12px] border border-dashed border-nbp-bd2 px-4 py-[42px] text-center">
      <h3 className="mt-0 mb-1.5 text-base text-nbp-tx">{title}</h3>
      {description ? (
        <p className="m-0 text-[0.86rem] text-nbp-tx2">{description}</p>
      ) : null}
    </div>
  );
}
