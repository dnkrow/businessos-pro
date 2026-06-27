"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { buttonClass } from "./button";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "sm";
  className?: string;
  pendingLabel?: string;
};

/** Bouton de soumission lié à l'état du formulaire (server actions). */
export function SubmitButton({ children, variant = "primary", size = "default", className, pendingLabel }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(buttonClass(variant, size), className)}>
      {pending && <Loader2 className="size-4 spin" />}
      {pending ? pendingLabel ?? children : children}
    </button>
  );
}
