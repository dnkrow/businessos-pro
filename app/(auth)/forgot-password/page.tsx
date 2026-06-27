"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth";
import { initialFormState } from "@/app/actions/types";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(forgotPasswordAction, initialFormState);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Saisissez votre email, nous vous enverrons un lien de réinitialisation.
        </p>
      </div>
      <form action={action} className="space-y-4">
        <FormMessage state={state} />
        <Field label="Adresse email" htmlFor="email" error={state.fieldErrors?.email} required>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="vous@entreprise.fr" required />
        </Field>
        <SubmitButton className="w-full" pendingLabel="Envoi…">Envoyer le lien</SubmitButton>
        <p className="text-center text-sm text-[var(--muted)]">
          <Link href="/login" className="font-semibold text-[var(--primary)] hover:underline">Retour à la connexion</Link>
        </p>
      </form>
    </div>
  );
}
