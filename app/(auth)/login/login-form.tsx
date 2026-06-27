"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { initialFormState } from "@/app/actions/types";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Alert } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export function LoginForm({ reset }: { reset?: boolean }) {
  const [state, action] = useActionState(loginAction, initialFormState);

  return (
    <form action={action} className="space-y-4">
      {reset && <Alert variant="success">Votre mot de passe a été réinitialisé. Connectez-vous.</Alert>}
      <FormMessage state={state} />

      <Field label="Adresse email" htmlFor="email" error={state.fieldErrors?.email} required>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="vous@entreprise.fr"
          defaultValue={state.values?.email} required />
      </Field>

      <Field label="Mot de passe" htmlFor="password" error={state.fieldErrors?.password} required>
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••"
          defaultValue={state.values?.password} required />
      </Field>

      {state.needs2fa && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-[var(--primary)]" /> Double authentification
          </div>
          <Field label="Code à 6 chiffres" htmlFor="twoFactorCode" hint="Code de votre application d'authentification ou code de secours.">
            <Input id="twoFactorCode" name="twoFactorCode" inputMode="numeric" placeholder="123456" autoFocus />
          </Field>
        </div>
      )}

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs font-medium text-[var(--primary)] hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>

      <SubmitButton className="w-full" pendingLabel="Connexion…">Se connecter</SubmitButton>

      <p className="text-center text-sm text-[var(--muted)]">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold text-[var(--primary)] hover:underline">Créer un compte</Link>
      </p>
    </form>
  );
}
