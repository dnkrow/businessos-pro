"use client";

import { ActionModal } from "@/components/forms/action-modal";
import { Field, Input, Textarea } from "@/components/ui/field";
import { createRoleAction, updateRoleAction } from "@/app/actions/roles";
import { PermissionPicker } from "./permission-picker";

type RoleData = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  isSystem: boolean;
  permissions: string[];
};

export function RoleModal({
  mode,
  role,
  trigger,
}: {
  mode: "create" | "edit";
  role?: RoleData;
  trigger: React.ReactNode;
}) {
  const isEdit = mode === "edit";
  const isSystem = isEdit && role?.isSystem;

  return (
    <ActionModal
      trigger={trigger}
      title={isEdit ? "Modifier le rôle" : "Créer un rôle"}
      description={
        isEdit
          ? "Ajustez le nom, la description, la couleur et les permissions de ce rôle."
          : "Définissez un rôle personnalisé et les permissions qui lui sont accordées."
      }
      action={isEdit ? updateRoleAction : createRoleAction}
      submitLabel={isEdit ? "Enregistrer" : "Créer le rôle"}
      pendingLabel={isEdit ? "Enregistrement…" : "Création…"}
      hiddenFields={isEdit && role ? { roleId: role.id } : undefined}
    >
      {(state) => (
        <>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <Field
              label="Nom du rôle"
              htmlFor="role-name"
              required
              error={state.fieldErrors?.name}
              hint={isSystem ? "Le nom d'un rôle système ne peut pas être modifié." : undefined}
            >
              <Input
                id="role-name"
                name="name"
                defaultValue={role?.name ?? ""}
                placeholder="ex. Responsable boutique"
                disabled={isSystem}
                required
              />
            </Field>

            <Field label="Couleur" htmlFor="role-color" error={state.fieldErrors?.color}>
              <input
                id="role-color"
                type="color"
                name="color"
                defaultValue={role?.color ?? "#6366f1"}
                className="h-10 w-16 cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1"
              />
            </Field>
          </div>

          <Field
            label="Description"
            htmlFor="role-description"
            error={state.fieldErrors?.description}
          >
            <Textarea
              id="role-description"
              name="description"
              defaultValue={role?.description ?? ""}
              placeholder="À quoi sert ce rôle ?"
            />
          </Field>

          <PermissionPicker defaultSelected={role?.permissions ?? []} />
        </>
      )}
    </ActionModal>
  );
}
