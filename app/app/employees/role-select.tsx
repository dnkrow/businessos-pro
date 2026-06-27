"use client";

import { Select } from "@/components/ui/field";
import { changeEmployeeRoleAction } from "@/app/actions/employees";

/** Sélecteur de rôle en auto-submit pour un employé. */
export function RoleSelect({
  membershipId,
  currentRoleId,
  roles,
}: {
  membershipId: string;
  currentRoleId: string | null;
  roles: { id: string; name: string }[];
}) {
  return (
    <form action={changeEmployeeRoleAction}>
      <input type="hidden" name="membershipId" value={membershipId} />
      <Select
        name="roleId"
        defaultValue={currentRoleId ?? ""}
        className="btn-sm h-8 py-0 text-xs"
        aria-label="Changer le rôle"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {currentRoleId === null && <option value="">Aucun rôle</option>}
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </Select>
    </form>
  );
}
