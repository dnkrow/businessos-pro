"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  trigger,
  title,
  description,
  children,
  className,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolled;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolled(v);
    onOpenChange?.(v);
  };
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      {trigger && (
        <span onClick={() => setOpen(true)} className="contents">
          {trigger}
        </span>
      )}
      {mounted && open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={close}
            />
            <div
              className={cn(
                "card animate-in relative z-10 w-full max-w-lg overflow-hidden shadow-[var(--shadow-lg)]",
                className,
              )}
            >
              {(title || description) && (
                <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
                  <div>
                    {title && <h3 className="font-semibold">{title}</h3>}
                    {description && <p className="mt-0.5 text-sm text-[var(--muted)]">{description}</p>}
                  </div>
                  <button
                    onClick={close}
                    className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]"
                    aria-label="Fermer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
              <div className="px-5 py-4">
                {typeof children === "function" ? children(close) : children}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
