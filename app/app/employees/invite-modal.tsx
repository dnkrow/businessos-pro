"use client";

import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ActionModal } from "@/components/forms/action-modal";
import { inviteEmployeeAction } from "@/app/actions/employees";

/** Modale d'invitation d'un nouvel employé. */
export function InviteModal({ roles }: { roles: { id: string; name: string }[] }) {
  return (
    <ActionModal
      trigger={
        <Button>
          <UserPlus className="size-4" />
          Inviter un employé
        </Button>
      }
      title="Inviter un employé"
      description="Envoyez une invitation par email. La personne rejoindra l'entreprise après acceptation."
      action={inviteEmployeeAction}
      submitLabel="Envoyer l'invitation"
      pendingLabel="Envoi…"
    >
      {(state) => (
        <>
          <Field label="Adresse email" htmlFor="invite-email" required error={state.fieldErrors?.email}>
            <Input
              id="invite-email"
              name="email"
              type="email"
              placeholder="prenom.nom@exemple.com"
              defaultValue={state.values?.email}
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" htmlFor="invite-firstName" error={state.fieldErrors?.firstName}>
              <Input id="invite-firstName" name="firstName" defaultValue={state.values?.firstName} />
            </Field>
            <Field label="Nom" htmlFor="invite-lastName" error={state.fieldErrors?.lastName}>
              <Input id="invite-lastName" name="lastName" defaultValue={state.values?.lastName} />
            </Field>
          </div>

          <Field label="Poste" htmlFor="invite-jobTitle" error={state.fieldErrors?.jobTitle}>
            <Input
              id="invite-jobTitle"
              name="jobTitle"
              placeholder="Ex : Responsable commercial"
              defaultValue={state.values?.jobTitle}
            />
          </Field>

          <Field label="Rôle" htmlFor="invite-roleId" error={state.fieldErrors?.roleId}>
            <Select id="invite-roleId" name="roleId" defaultValue={state.values?.roleId ?? ""}>
              <option value="">Sélectionner un rôle…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
        </>
      )}
    </ActionModal>
  );
}
