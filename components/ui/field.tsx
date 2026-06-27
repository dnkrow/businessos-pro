import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("label", className)} {...props} />;
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn("input", className)} {...props} />,
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("input min-h-[90px] resize-y", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn("input cursor-pointer pr-8", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs font-medium text-[var(--danger)]">{children}</p>;
}

export function FieldHint({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-[var(--muted)]">{children}</p>;
}

/** Bloc complet label + champ + erreur/indice. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-[var(--danger)]"> *</span>}
        </Label>
      )}
      {children}
      <FieldError>{error}</FieldError>
      {!error && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}
