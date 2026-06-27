"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "@/app/actions/auth";
import { initialFormState } from "@/app/actions/types";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { passwordStrength } from "@/lib/password";

const barColors = ["#ef4444", "#f59e0b", "#eab308", "#10b981", "#10b981"];

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initialFormState);
  const [pw, setPw] = useState("");
  const strength = passwordStrength(pw);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <Field label="Nouveau mot de passe" htmlFor="password" error={state.fieldErrors?.password} required>
        <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••"
          value={pw} onChange={(e) => setPw(e.target.value)} required />
        {pw && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="flex-1 rounded-full"
                  style={{ background: i < strength.score ? barColors[strength.score] : "var(--border-strong)" }} />
              ))}
            </div>
            <span className="text-xs font-medium text-[var(--muted)]">{strength.label}</span>
          </div>
        )}
      </Field>
      <SubmitButton className="w-full" pendingLabel="Mise à jour…">Réinitialiser le mot de passe</SubmitButton>
      <p className="text-center text-sm text-[var(--muted)]">
        <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">Retour à la connexion</Link>
      </p>
    </form>
  );
}
