"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { initialFormState } from "@/app/actions/types";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { passwordStrength } from "@/lib/password";

const barColors = ["#ef4444", "#f59e0b", "#eab308", "#10b981", "#10b981"];

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialFormState);
  const [pw, setPw] = useState("");
  const strength = passwordStrength(pw);

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prénom" htmlFor="firstName" error={state.fieldErrors?.firstName} required>
          <Input id="firstName" name="firstName" autoComplete="given-name" placeholder="Marie" required />
        </Field>
        <Field label="Nom" htmlFor="lastName" error={state.fieldErrors?.lastName} required>
          <Input id="lastName" name="lastName" autoComplete="family-name" placeholder="Dubois" required />
        </Field>
      </div>

      <Field label="Adresse email" htmlFor="email" error={state.fieldErrors?.email} required>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="vous@entreprise.fr" required />
      </Field>

      <Field label="Téléphone" htmlFor="phone" error={state.fieldErrors?.phone} hint="Optionnel — vérifiable plus tard par SMS.">
        <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+33 6 12 34 56 78" />
      </Field>

      <Field label="Mot de passe" htmlFor="password" error={state.fieldErrors?.password} required>
        <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••"
          value={pw} onChange={(e) => setPw(e.target.value)} required />
        {pw && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="flex-1 rounded-full transition-colors"
                  style={{ background: i < strength.score ? barColors[strength.score] : "var(--border-strong)" }} />
              ))}
            </div>
            <span className="text-xs font-medium text-[var(--muted)]">{strength.label}</span>
          </div>
        )}
      </Field>

      <SubmitButton className="w-full" pendingLabel="Création…">Créer mon compte</SubmitButton>

      <p className="text-center text-xs text-[var(--muted)]">
        En créant un compte, vous acceptez les conditions d'utilisation de BusinessOS Pro.
      </p>
      <p className="text-center text-sm text-[var(--muted)]">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">Se connecter</Link>
      </p>
    </form>
  );
}
