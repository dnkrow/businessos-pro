"use client";

import { deleteRoleAction } from "@/app/actions/roles";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";

export function DeleteRole({ roleId }: { roleId: string }) {
  return (
    <form action={deleteRoleAction}>
      <input type="hidden" name="roleId" value={roleId} />
      <ConfirmSubmit
        variant="ghost"
        confirm="Supprimer ce rôle ? Les membres seront réaffectés au rôle par défaut."
      >
        Supprimer
      </ConfirmSubmit>
    </form>
  );
}
