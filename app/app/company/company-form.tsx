"use client";

import { useActionState } from "react";
import { updateCompanyAction } from "@/app/actions/company";
import { initialFormState } from "@/app/actions/types";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { COUNTRIES, CURRENCIES, LOCALES, ACTIVITIES } from "@/lib/constants";

type Company = {
  legalName: string;
  tradeName: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  activity: string | null;
  logoUrl: string | null;
  locale: string;
  currency: string;
};

export function CompanyForm({ company }: { company: Company }) {
  const [state, action] = useActionState(updateCompanyAction, initialFormState);

  return (
    <form action={action}>
      <Card>
        <CardHeader
          title="Informations de l'entreprise"
          subtitle="Modifiez le profil, les coordonnées et les préférences."
        />
        <CardBody className="space-y-5">
          <FormMessage state={state} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Raison sociale" htmlFor="legalName" required error={state.fieldErrors?.legalName}>
              <Input id="legalName" name="legalName" defaultValue={company.legalName} />
            </Field>
            <Field label="Nom commercial" htmlFor="tradeName" error={state.fieldErrors?.tradeName}>
              <Input id="tradeName" name="tradeName" defaultValue={company.tradeName ?? ""} />
            </Field>
          </div>

          <Field label="Adresse" htmlFor="address" required error={state.fieldErrors?.address}>
            <Input id="address" name="address" defaultValue={company.address ?? ""} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Code postal" htmlFor="postalCode" required error={state.fieldErrors?.postalCode}>
              <Input id="postalCode" name="postalCode" defaultValue={company.postalCode ?? ""} />
            </Field>
            <Field
              label="Ville"
              htmlFor="city"
              required
              error={state.fieldErrors?.city}
              className="sm:col-span-2"
            >
              <Input id="city" name="city" defaultValue={company.city ?? ""} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Pays" htmlFor="country" required error={state.fieldErrors?.country}>
              <Select id="country" name="country" defaultValue={company.country ?? "France"}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Activité" htmlFor="activity" required error={state.fieldErrors?.activity}>
              <Select id="activity" name="activity" defaultValue={company.activity ?? ACTIVITIES[0]}>
                {ACTIVITIES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone" htmlFor="phone" required error={state.fieldErrors?.phone}>
              <Input id="phone" name="phone" type="tel" defaultValue={company.phone ?? ""} />
            </Field>
            <Field label="Email" htmlFor="email" required error={state.fieldErrors?.email}>
              <Input id="email" name="email" type="email" defaultValue={company.email ?? ""} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Site web" htmlFor="website" error={state.fieldErrors?.website}>
              <Input id="website" name="website" defaultValue={company.website ?? ""} placeholder="https://" />
            </Field>
            <Field label="Logo (URL)" htmlFor="logoUrl" error={state.fieldErrors?.logoUrl}>
              <Input id="logoUrl" name="logoUrl" defaultValue={company.logoUrl ?? ""} placeholder="https://" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Langue" htmlFor="locale" error={state.fieldErrors?.locale}>
              <Select id="locale" name="locale" defaultValue={company.locale}>
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Devise" htmlFor="currency" error={state.fieldErrors?.currency}>
              <Select id="currency" name="currency" defaultValue={company.currency}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </CardBody>
        <div className="flex justify-end border-t border-[var(--border)] px-5 py-4">
          <SubmitButton pendingLabel="Enregistrement…">Enregistrer les modifications</SubmitButton>
        </div>
      </Card>
    </form>
  );
}
