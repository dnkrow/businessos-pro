import { cn } from "@/lib/utils";

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-[var(--surface-2)] text-[var(--muted)]",
  primary: "bg-[var(--primary-soft)] text-[var(--primary-hover)]",
  success: "bg-[var(--success-soft)] text-[#0f8a63]",
  warning: "bg-[var(--warning-soft)] text-[#b26a04]",
  danger: "bg-[var(--danger-soft)] text-[#c43030]",
  info: "bg-[var(--info-soft)] text-[#0676a8]",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span className={cn("badge", toneStyles[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
