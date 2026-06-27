"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  resendEmailVerificationAction,
  sendPhoneCodeAction,
  verifyPhoneAction,
} from "@/app/actions/account";
import { initialFormState } from "@/app/actions/types";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Alert } from "@/components/ui/alert";

/** Vérification de l'adresse email. */
export function EmailVerify({ emailVerified }: { emailVerified: boolean }) {
  const [state, action] = useActionState(
    (_prev: typeof initialFormState) => resendEmailVerificationAction(),
    initialFormState,
  );

  if (emailVerified) {
    return (
      <Alert variant="success" title="Adresse email vérifiée">
        Votre adresse email est confirmée.
      </Alert>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <FormMessage state={state} />
      <p className="text-sm text-[var(--muted)]">
        Nous avons envoyé un lien de vérification à votre adresse email. Cliquez dessus pour
        confirmer votre compte.
      </p>
      <SubmitButton variant="secondary" size="sm" pendingLabel="Envoi…">
        Renvoyer l&apos;email de vérification
      </SubmitButton>
      <p className="text-xs text-[var(--muted)]">
        En démo, consultez la boîte de réception{" "}
        <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 text-[var(--foreground)]">
          /dev/inbox
        </code>
        .
      </p>
    </form>
  );
}

/** Vérification du numéro de téléphone (envoi puis confirmation du code). */
export function PhoneVerify({
  phoneVerified,
  phone,
}: {
  phoneVerified: boolean;
  phone?: string | null;
}) {
  const [sendState, sendAction] = useActionState(sendPhoneCodeAction, initialFormState);
  const [verifyState, verifyAction] = useActionState(verifyPhoneAction, initialFormState);

  if (phoneVerified) {
    return (
      <Alert variant="success" title="Numéro de téléphone vérifié">
        Votre numéro de téléphone est confirmé.
      </Alert>
    );
  }

  const sentPhone = sendState.values?.phone ?? phone ?? "";
  const codeSent = Boolean(sendState.ok);

  return (
    <div className="space-y-4">
      <form action={sendAction} className="space-y-3">
        <FormMessage state={sendState} />
        <Field
          label="Numéro de téléphone"
          htmlFor="phone"
          error={sendState.fieldErrors?.phone}
          hint="Nous vous enverrons un code à 6 chiffres."
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={phone ?? ""}
            placeholder="+33 6 12 34 56 78"
          />
        </Field>
        <SubmitButton variant="secondary" size="sm" pendingLabel="Envoi…">
          {codeSent ? "Renvoyer le code" : "Envoyer le code"}
        </SubmitButton>
      </form>

      {codeSent && (
        <form action={verifyAction} className="space-y-3 border-t border-[var(--border)] pt-4">
          <FormMessage state={verifyState} />
          {sentPhone && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <CheckCircle2 className="size-3.5 text-[var(--success)]" />
              Code envoyé au {sentPhone}.
            </p>
          )}
          <Field
            label="Code de vérification"
            htmlFor="code"
            error={verifyState.fieldErrors?.code}
            hint="6 chiffres reçus par SMS (démo : /dev/inbox)."
          >
            <Input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="tracking-[0.4em]"
            />
          </Field>
          <SubmitButton size="sm" pendingLabel="Vérification…">
            Vérifier le numéro
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
