"use client";

import * as React from "react";
import { ActionModal } from "@/components/forms/action-modal";
import { Field, Input, Select } from "@/components/ui/field";
import {
  createEstablishmentAction,
  updateEstablishmentAction,
} from "@/app/actions/establishments";
import { ESTABLISHMENT_TYPE_META, COUNTRIES } from "@/lib/constants";

type Establishment = {
  id: string;
  name: string;
  type: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
};

export function EstablishmentModal({
  trigger,
  establishment,
}: {
  trigger: React.ReactNode;
  establishment?: Establishment;
}) {
  const isEdit = Boolean(establishment);

  return (
    <ActionModal
      trigger={trigger}
      title={isEdit ? "Modifier l'établissement" : "Nouvel établissement"}
      description={
        isEdit
          ? "Mettez à jour les informations de ce site."
          : "Renseignez les informations du nouveau site."
      }
      action={isEdit ? updateEstablishmentAction : createEstablishmentAction}
      submitLabel={isEdit ? "Enregistrer" : "Créer l'établissement"}
      pendingLabel="Enregistrement…"
      hiddenFields={isEdit ? { establishmentId: establishment!.id } : undefined}
    >
      {(state) => (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom" htmlFor="name" required error={state.fieldErrors?.name}>
              <Input
                id="name"
                name="name"
                defaultValue={establishment?.name ?? ""}
                placeholder="Ex. Boutique centre-ville"
              />
            </Field>
            <Field label="Type" htmlFor="type" required error={state.fieldErrors?.type}>
              <Select id="type" name="type" defaultValue={establishment?.type ?? "OTHER"}>
                {Object.entries(ESTABLISHMENT_TYPE_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Adresse" htmlFor="address" error={state.fieldErrors?.address}>
            <Input
              id="address"
              name="address"
              defaultValue={establishment?.address ?? ""}
              placeholder="12 rue de la Paix"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Code postal" htmlFor="postalCode" error={state.fieldErrors?.postalCode}>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={establishment?.postalCode ?? ""}
                placeholder="75002"
              />
            </Field>
            <Field
              label="Ville"
              htmlFor="city"
              error={state.fieldErrors?.city}
              className="sm:col-span-2"
            >
              <Input
                id="city"
                name="city"
                defaultValue={establishment?.city ?? ""}
                placeholder="Paris"
              />
            </Field>
          </div>

          <Field label="Pays" htmlFor="country" error={state.fieldErrors?.country}>
            <Select id="country" name="country" defaultValue={establishment?.country ?? "France"}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Téléphone" htmlFor="phone" error={state.fieldErrors?.phone}>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={establishment?.phone ?? ""}
                placeholder="01 23 45 67 89"
              />
            </Field>
            <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={establishment?.email ?? ""}
                placeholder="contact@exemple.fr"
              />
            </Field>
          </div>
        </div>
      )}
    </ActionModal>
  );
}
