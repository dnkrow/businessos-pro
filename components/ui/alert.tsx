import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

type Variant = "success" | "warning" | "danger" | "info";

const map: Record<Variant, { cls: string; Icon: typeof Info }> = {
  success: { cls: "bg-[var(--success-soft)] text-[#0f8a63] border-[#bfe9d8]", Icon: CheckCircle2 },
  warning: { cls: "bg-[var(--warning-soft)] text-[#b26a04] border-[#f4ddb0]", Icon: AlertTriangle },
  danger: { cls: "bg-[var(--danger-soft)] text-[#c43030] border-[#f3c9c9]", Icon: XCircle },
  info: { cls: "bg-[var(--info-soft)] text-[#0676a8] border-[#bce6f7]", Icon: Info },
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: Variant;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const { cls, Icon } = map[variant];
  return (
    <div className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", cls, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "opacity-90")}>{children}</div>}
      </div>
    </div>
  );
}
