"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Bouton de soumission avec confirmation navigateur (pour actions destructives). */
export function ConfirmSubmit({
  children,
  confirm,
  variant = "danger",
  size = "sm",
  className,
}: {
  children: React.ReactNode;
  confirm: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "sm";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
      className={cn(buttonClass(variant, size), className)}
    >
      {pending && <Loader2 className="size-3.5 spin" />}
      {children}
    </button>
  );
}
