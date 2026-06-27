"use client";

import { Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import {
  toggleEstablishmentAction,
  deleteEstablishmentAction,
} from "@/app/actions/establishments";
import { EstablishmentModal } from "./establishment-modal";

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
  isActive: boolean;
};

export function EstablishmentActions({ establishment }: { establishment: Establishment }) {
  return (
    <>
      <EstablishmentModal
        establishment={establishment}
        trigger={
          <button className="btn btn-ghost btn-sm" type="button">
            <Pencil className="size-3.5" />
            Modifier
          </button>
        }
      />

      <form action={toggleEstablishmentAction}>
        <input type="hidden" name="establishmentId" value={establishment.id} />
        <button className="btn btn-ghost btn-sm" type="submit">
          {establishment.isActive ? (
            <>
              <PowerOff className="size-3.5" />
              Désactiver
            </>
          ) : (
            <>
              <Power className="size-3.5" />
              Activer
            </>
          )}
        </button>
      </form>

      <form action={deleteEstablishmentAction} className="ml-auto">
        <input type="hidden" name="establishmentId" value={establishment.id} />
        <ConfirmSubmit
          confirm={`Supprimer définitivement « ${establishment.name} » ?`}
          variant="ghost"
        >
          <Trash2 className="size-3.5 text-[var(--danger)]" />
        </ConfirmSubmit>
      </form>
    </>
  );
}
