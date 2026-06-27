"use client";

import { useActionState } from "react";
import { User, AtSign, Phone, Lock, MailCheck, BadgeCheck, ShieldX } from "lucide-react";
import {
  updateProfileAction,
  changePasswordAction,
  resendEmailVerificationAction,
  sendPhoneCodeAction,
  verifyPhoneAction,
} from "@/app/actions/account";
import { initialFormState, type FormState } from "@/app/actions/types";
import { LOCALES } from "@/lib/constants";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  locale: string;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
};

// Enveloppe l'action sans formData pour useActionState.
const resendEmail = async (_prev: FormState): Promise<FormState> => resendEmailVerificationAction();

export function AccountForms({
  firstName,
  lastName,
  email,
  locale,
  emailVerified,
  phone,
  phoneVerified,
}: Props) {
  const [profileState, profileAction] = useActionState(updateProfileAction, initialFormState);
  const [resendState, resendAction] = useActionState(resendEmail, initialFormState);
  const [phoneCodeState, phoneCodeAction] = useActionState(sendPhoneCodeAction, initialFormState);
  const [phoneVerifyState, phoneVerifyAction] = useActionState(verifyPhoneAction, initialFormState);
  const [passwordState, passwordAction] = useActionState(changePasswordAction, initialFormState);

  // Une fois le code envoyé (ou un numéro saisi), proposer la saisie du code.
  const codeSent = !!phoneCodeState.ok;
  const phoneValue = phoneCodeState.values?.phone ?? phone ?? "";

  return (
    <div className="space-y-6">
      {/* ───────────── Profil ───────────── */}
      <Card>
        <CardHeader title="Profil" subtitle="Vos informations personnelles." />
        <CardBody>
          <form action={profileAction} className="space-y-4">
            <FormMessage state={profileState} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Prénom" htmlFor="firstName" error={profileState.fieldErrors?.firstName} required>
                <Input id="firstName" name="firstName" defaultValue={firstName} autoComplete="given-name" />
              </Field>
              <Field label="Nom" htmlFor="lastName" error={profileState.fieldErrors?.lastName} required>
                <Input id="lastName" name="lastName" defaultValue={lastName} autoComplete="family-name" />
              </Field>
            </div>
            <Field label="Langue" htmlFor="locale" className="max-w-xs">
              <Select id="locale" name="locale" defaultValue={locale}>
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="flex justify-end border-t border-[var(--border)] pt-4">
              <SubmitButton size="sm" pendingLabel="Enregistrement…">
                <User className="size-4" />
                Enregistrer
              </SubmitButton>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* ───────────── Email & téléphone ───────────── */}
      <Card>
        <CardHeader title="Email & téléphone" subtitle="Coordonnées de contact et vérification." />
        <CardBody className="space-y-6">
          {/* Email */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <AtSign className="size-4 text-[var(--muted-2)]" />
                <span className="font-medium text-[var(--foreground)]">{email}</span>
                {emailVerified ? (
                  <Badge tone="success" dot>
                    Vérifié
                  </Badge>
                ) : (
                  <Badge tone="warning" dot>
                    Non vérifié
                  </Badge>
                )}
              </div>
              {!emailVerified && (
                <form action={resendAction}>
                  <SubmitButton variant="secondary" size="sm" pendingLabel="Envoi…">
                    <MailCheck className="size-4" />
                    Renvoyer l&apos;email
                  </SubmitButton>
                </form>
              )}
            </div>
            {!emailVerified && <FormMessage state={resendState} />}
          </div>

          <div className="border-t border-[var(--border)]" />

          {/* Téléphone */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm">
              <Phone className="size-4 text-[var(--muted-2)]" />
              <span className="font-medium text-[var(--foreground)]">
                {phone || "Aucun numéro enregistré"}
              </span>
              {phoneVerified ? (
                <Badge tone="success" dot>
                  <BadgeCheck className="size-3" />
                  Vérifié
                </Badge>
              ) : (
                <Badge tone="neutral" dot>
                  <ShieldX className="size-3" />
                  Non vérifié
                </Badge>
              )}
            </div>

            {!phoneVerified && (
              <div className="space-y-4">
                <form action={phoneCodeAction} className="space-y-3">
                  <FormMessage state={phoneCodeState} />
                  <div className="flex flex-wrap items-end gap-3">
                    <Field
                      label="Numéro de téléphone"
                      htmlFor="phone"
                      error={phoneCodeState.fieldErrors?.phone}
                      className="max-w-xs flex-1"
                    >
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={phoneValue}
                        placeholder="+33 6 12 34 56 78"
                        autoComplete="tel"
                      />
                    </Field>
                    <SubmitButton variant="secondary" size="sm" pendingLabel="Envoi…" className="mb-px">
                      Envoyer un code
                    </SubmitButton>
                  </div>
                </form>

                {codeSent && (
                  <form action={phoneVerifyAction} className="space-y-3">
                    <FormMessage state={phoneVerifyState} />
                    <div className="flex flex-wrap items-end gap-3">
                      <Field
                        label="Code reçu par SMS"
                        htmlFor="phone-code"
                        error={phoneVerifyState.fieldErrors?.code}
                        className="max-w-[200px]"
                      >
                        <Input
                          id="phone-code"
                          name="code"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="123456"
                          className="text-center font-mono tracking-[0.3em]"
                        />
                      </Field>
                      <SubmitButton size="sm" pendingLabel="Vérification…" className="mb-px">
                        Vérifier
                      </SubmitButton>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ───────────── Mot de passe ───────────── */}
      <Card>
        <CardHeader title="Mot de passe" subtitle="Modifiez votre mot de passe de connexion." />
        <CardBody>
          <form action={passwordAction} className="space-y-4">
            <FormMessage state={passwordState} />
            <Field
              label="Mot de passe actuel"
              htmlFor="currentPassword"
              error={passwordState.fieldErrors?.currentPassword}
              className="max-w-md"
              required
            >
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
              />
            </Field>
            <Field
              label="Nouveau mot de passe"
              htmlFor="newPassword"
              error={passwordState.fieldErrors?.newPassword}
              hint="Au moins 8 caractères."
              className="max-w-md"
              required
            >
              <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" />
            </Field>
            <div className="flex justify-end border-t border-[var(--border)] pt-4">
              <SubmitButton size="sm" pendingLabel="Modification…">
                <Lock className="size-4" />
                Modifier le mot de passe
              </SubmitButton>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
