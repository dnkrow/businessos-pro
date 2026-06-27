import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "default" | "sm";

export function buttonClass(variant: Variant = "primary", size: Size = "default", className?: string) {
  const variants: Record<Variant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-danger",
  };
  return cn("btn", variants[variant], size === "sm" && "btn-sm", className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "default", className, ...props }, ref) => (
    <button ref={ref} className={buttonClass(variant, size, className)} {...props} />
  ),
);
Button.displayName = "Button";
