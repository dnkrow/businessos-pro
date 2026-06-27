import { cn } from "@/lib/utils";

export function Logo({ size = 32, withText = true, className }: { size?: number; withText?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className="relative inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--primary)] to-[#8b5cf6] text-white shadow-[var(--shadow-sm)]"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" fill="none" style={{ width: size * 0.6, height: size * 0.6 }}>
          <path d="M4 20V8l8-5 8 5v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 20v-5h6v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="9.5" r="1.4" fill="currentColor" />
        </svg>
      </span>
      {withText && (
        <span className="text-[1.05rem] font-bold tracking-tight text-[var(--foreground)]">
          BusinessOS <span className="text-[var(--primary)]">Pro</span>
        </span>
      )}
    </span>
  );
}
