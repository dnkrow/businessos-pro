"use client";

import { useActionState } from "react";
import { acceptInvitationAction } from "@/app/actions/employees";
import { initialFormState } from "@/app/actions/types";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";

export function AcceptForm({
  token,
  email,
  hasAccount,
}: {
  token: string;
  email: string;
  hasAccount: boolean;
}) {
  const [state, action] = useActionState(acceptInvitationAction, initialFormState);

  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />

      <Field label="Adresse email">
        <Input value={email} readOnly disabled className="cursor-not-allowed opacity-70" />
      </Field>

      {hasAccount ? (
        <p className="text-sm text-[var(--muted)]">
          Un compte existe déjà pour cette adresse. Rejoignez l&apos;entreprise en un clic.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" htmlFor="firstName" error={state.fieldErrors?.firstName} required>
              <Input id="firstName" name="firstName" autoComplete="given-name" placeholder="Marie" required />
            </Field>
            <Field label="Nom" htmlFor="lastName" error={state.fieldErrors?.lastName} required>
              <Input id="lastName" name="lastName" autoComplete="family-name" placeholder="Dubois" required />
            </Field>
          </div>
          <Field
            label="Mot de passe"
            htmlFor="password"
            error={state.fieldErrors?.password}
            hint="Choisissez un mot de passe sécurisé pour votre compte."
            required
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
            />
          </Field>
        </>
      )}

      <SubmitButton className="w-full" pendingLabel="Veuillez patienter…">
        {hasAccount ? "Rejoindre l'entreprise" : "Créer mon compte et rejoindre"}
      </SubmitButton>
    </form>
  );
}
