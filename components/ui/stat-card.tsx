import { cn } from "@/lib/utils";
import type { Tone } from "./badge";

const toneBg: Record<Tone, string> = {
  neutral: "bg-[var(--surface-2)] text-[var(--muted)]",
  primary: "bg-[var(--primary-soft)] text-[var(--primary-hover)]",
  success: "bg-[var(--success-soft)] text-[#0f8a63]",
  warning: "bg-[var(--warning-soft)] text-[#b26a04]",
  danger: "bg-[var(--danger-soft)] text-[#c43030]",
  info: "bg-[var(--info-soft)] text-[#0676a8]",
};

export function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className="card flex items-center gap-4 px-5 py-4">
      {icon && (
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", toneBg[tone])}>{icon}</div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-[var(--muted)]">{label}</p>
        <p className="mt-0.5 text-2xl font-bold leading-none tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-[var(--muted-2)]">{hint}</p>}
      </div>
    </div>
  );
}
