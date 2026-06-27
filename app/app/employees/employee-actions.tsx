"use client";

import { Power, PowerOff, UserMinus } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import { toggleEmployeeAction, removeEmployeeAction } from "@/app/actions/employees";

function ToggleButton({ active }: { active: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass("ghost", "sm")}>
      {pending ? (
        <Loader2 className="size-3.5 spin" />
      ) : active ? (
        <PowerOff className="size-3.5" />
      ) : (
        <Power className="size-3.5" />
      )}
      {active ? "Désactiver" : "Activer"}
    </button>
  );
}

/** Boutons d'action (activer/désactiver, retirer) pour un employé. */
export function EmployeeActions({
  membershipId,
  isActive,
  name,
}: {
  membershipId: string;
  isActive: boolean;
  name: string;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <form action={toggleEmployeeAction}>
        <input type="hidden" name="membershipId" value={membershipId} />
        <ToggleButton active={isActive} />
      </form>
      <form action={removeEmployeeAction}>
        <input type="hidden" name="membershipId" value={membershipId} />
        <ConfirmSubmit confirm={`Retirer ${name} de l'entreprise ? Cette action est définitive.`}>
          <UserMinus className="size-3.5" />
          Retirer
        </ConfirmSubmit>
      </form>
    </div>
  );
}
