"use client";

import { useActionState, useState } from "react";
import { Building2, PlusCircle } from "lucide-react";
import { createCompanyAction } from "@/app/actions/company";
import { initialFormState } from "@/app/actions/types";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { COUNTRIES, ACTIVITIES, LOCALES, CURRENCIES } from "@/lib/constants";

const TYPES = [
  {
    value: "NEW",
    title: "Créer une nouvelle entreprise",
    description: "Vous démarrez une activité et créez votre structure.",
    Icon: PlusCircle,
  },
  {
    value: "EXISTING",
    title: "Ajouter une entreprise existante",
    description: "Votre entreprise est déjà immatriculée et en activité.",
    Icon: Building2,
  },
] as const;

export function CompanyForm() {
  const [state, action] = useActionState(createCompanyAction, initialFormState);
  const [type, setType] = useState<"NEW" | "EXISTING">("NEW");

  return (
    <form action={action} className="space-y-6">
      <FormMessage state={state} />

      <div>
        <p className="label mb-2">Type d&apos;enregistrement</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {TYPES.map(({ value, title, description, Icon }) => {
            const active = type === value;
            return (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                  active
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-[var(--border)] hover:border-[var(--border-strong)]",
                )}
              >
                <input
                  type="radio"
                  name="registrationType"
                  value={value}
                  checked={active}
                  onChange={() => setType(value)}
                  className="sr-only"
                />
                <Icon
                  className={cn(
                    "mt-0.5 size-5 shrink-0",
                    active ? "text-[var(--primary)]" : "text-[var(--muted)]",
                  )}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--foreground)]">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">{description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nom de l'entreprise"
          htmlFor="legalName"
          error={state.fieldErrors?.legalName}
          required
          className="sm:col-span-2"
        >
          <Input id="legalName" name="legalName" placeholder="Ex. Dubois & Associés SARL" required />
        </Field>

        <Field
          label="Nom commercial"
          htmlFor="tradeName"
          error={state.fieldErrors?.tradeName}
          hint="Le nom sous lequel vous êtes connu (optionnel)."
        >
          <Input id="tradeName" name="tradeName" placeholder="Ex. Dubois Conseil" />
        </Field>

        <Field label="Activité" htmlFor="activity" error={state.fieldErrors?.activity}>
          <Select id="activity" name="activity" defaultValue="">
            <option value="" disabled>
              Sélectionnez une activité…
            </option>
            {ACTIVITIES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Adresse"
          htmlFor="address"
          error={state.fieldErrors?.address}
          className="sm:col-span-2"
        >
          <Input id="address" name="address" placeholder="12 rue de la République" />
        </Field>

        <Field label="Ville" htmlFor="city" error={state.fieldErrors?.city}>
          <Input id="city" name="city" placeholder="Paris" />
        </Field>

        <Field label="Code postal" htmlFor="postalCode" error={state.fieldErrors?.postalCode}>
          <Input id="postalCode" name="postalCode" placeholder="75001" />
        </Field>

        <Field
          label="Pays"
          htmlFor="country"
          error={state.fieldErrors?.country}
          className="sm:col-span-2"
        >
          <Select id="country" name="country" defaultValue="France">
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Téléphone" htmlFor="phone" error={state.fieldErrors?.phone}>
          <Input id="phone" name="phone" type="tel" placeholder="+33 1 23 45 67 89" />
        </Field>

        <Field label="Email de l'entreprise" htmlFor="email" error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" placeholder="contact@entreprise.fr" />
        </Field>

        <Field
          label="Site web"
          htmlFor="website"
          error={state.fieldErrors?.website}
          hint="Optionnel."
          className="sm:col-span-2"
        >
          <Input id="website" name="website" type="url" placeholder="https://entreprise.fr" />
        </Field>

        <Field
          label="URL du logo"
          htmlFor="logoUrl"
          error={state.fieldErrors?.logoUrl}
          hint="Lien vers une image (optionnel)."
          className="sm:col-span-2"
        >
          <Input id="logoUrl" name="logoUrl" type="url" placeholder="https://…/logo.png" />
        </Field>

        <Field label="Langue" htmlFor="locale" error={state.fieldErrors?.locale}>
          <Select id="locale" name="locale" defaultValue="fr">
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Devise" htmlFor="currency" error={state.fieldErrors?.currency}>
          <Select id="currency" name="currency" defaultValue="EUR">
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Alert variant="info" title="Validation manuelle">
        Votre entreprise sera vérifiée manuellement par l&apos;équipe BusinessOS Pro avant
        d&apos;accéder à la plateforme.
      </Alert>

      <SubmitButton className="w-full" pendingLabel="Envoi…">
        Soumettre pour validation
      </SubmitButton>
    </form>
  );
}
