"use client";

import * as React from "react";
import { useActionState, useState, useTransition } from "react";
import { ShieldCheck, KeyRound, Loader2, Copy, Check } from "lucide-react";
import { startTwoFactorAction, confirmTwoFactorAction } from "@/app/actions/account";
import { initialFormState } from "@/app/actions/types";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Alert } from "@/components/ui/alert";

/**
 * Activation guidée de la double authentification.
 * Étape 1 : générer un secret + QR (startTwoFactorAction).
 * Étape 2 : confirmer avec un code TOTP (confirmTwoFactorAction).
 * Étape 3 : afficher les codes de secours.
 */
export function TwoFactorSetup() {
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [state, action] = useActionState(confirmTwoFactorAction, initialFormState);
  const [copied, setCopied] = useState(false);

  const backupCodes = state.values?.backupCodes ? state.values.backupCodes.split(" ").filter(Boolean) : [];

  function begin() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await startTwoFactorAction();
        setSetup({ secret: res.secret, qr: res.qr });
      } catch {
        setError("Impossible de démarrer la configuration. Réessayez.");
      }
    });
  }

  function copySecret() {
    if (!setup) return;
    navigator.clipboard?.writeText(setup.secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // Étape finale : codes de secours.
  if (backupCodes.length > 0) {
    return (
      <Alert variant="success" title="Conservez ces codes de secours">
        <p className="mb-3">
          Chaque code ne peut être utilisé qu&apos;une seule fois pour vous connecter si vous perdez l&apos;accès à
          votre application d&apos;authentification. Stockez-les en lieu sûr.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          {backupCodes.map((code) => (
            <code
              key={code}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-center font-mono text-sm tracking-wider text-[var(--foreground)]"
            >
              {code}
            </code>
          ))}
        </div>
      </Alert>
    );
  }

  // Étape 0 : rien n'est lancé.
  if (!setup) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--muted)]">
          Ajoutez une couche de protection supplémentaire. À chaque connexion, un code temporaire généré par votre
          application d&apos;authentification (Google Authenticator, Authy…) vous sera demandé.
        </p>
        {error && <Alert variant="danger">{error}</Alert>}
        <button type="button" onClick={begin} disabled={pending} className="btn btn-primary btn-sm">
          {pending ? <Loader2 className="size-4 spin" /> : <ShieldCheck className="size-4" />}
          Activer la 2FA
        </button>
      </div>
    );
  }

  // Étapes 1 & 2 : scan du QR + confirmation du code.
  return (
    <div className="space-y-5">
      <ol className="space-y-5">
        <li className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-semibold text-[var(--primary-hover)]">
            1
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--foreground)]">Scannez ce QR code</p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Ouvrez votre application d&apos;authentification et scannez l&apos;image ci-dessous.
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setup.qr}
                alt="QR code de configuration 2FA"
                className="size-40 rounded-xl border border-[var(--border)] bg-white p-2"
              />
              <div className="min-w-0">
                <p className="text-xs text-[var(--muted)]">Ou saisissez la clé manuellement :</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="block max-w-full overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 font-mono text-xs tracking-wider text-[var(--foreground)]">
                    {setup.secret}
                  </code>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="btn btn-ghost btn-sm shrink-0"
                    aria-label="Copier la clé"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </li>

        <li className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-xs font-semibold text-[var(--primary-hover)]">
            2
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--foreground)]">Saisissez le code généré</p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              Entrez le code à 6 chiffres affiché dans votre application pour confirmer.
            </p>
            <form action={action} className="mt-3 space-y-3">
              <FormMessage state={state} />
              <Field error={state.fieldErrors?.code} className="max-w-[200px]">
                <Input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  maxLength={6}
                  className="text-center font-mono text-lg tracking-[0.3em]"
                />
              </Field>
              <SubmitButton size="sm" pendingLabel="Vérification…">
                <KeyRound className="size-4" />
                Confirmer et activer
              </SubmitButton>
            </form>
          </div>
        </li>
      </ol>
    </div>
  );
}
