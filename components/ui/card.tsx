import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card", className)} {...props} />;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4", className)}>
      <div className="min-w-0">
        <h3 className="text-[0.95rem] font-semibold text-[var(--foreground)]">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-[var(--muted)]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}
