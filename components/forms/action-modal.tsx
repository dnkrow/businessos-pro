"use client";

import * as React from "react";
import { useActionState } from "react";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { initialFormState, type FormState } from "@/app/actions/types";

/**
 * Modale contenant un formulaire lié à une server action.
 * - affiche les erreurs (FormMessage + erreurs de champ via `children(state)`)
 * - se ferme automatiquement quand l'action réussit (state.ok)
 */
export function ActionModal({
  trigger,
  title,
  description,
  action,
  submitLabel = "Enregistrer",
  pendingLabel,
  hiddenFields,
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel?: string;
  pendingLabel?: string;
  hiddenFields?: Record<string, string>;
  children: (state: FormState) => React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialFormState);
  const [open, setOpen] = React.useState(false);
  const justOpened = React.useRef(false);

  React.useEffect(() => {
    if (open) justOpened.current = true;
  }, [open]);

  React.useEffect(() => {
    if (state.ok && open && justOpened.current) {
      setOpen(false);
      justOpened.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Modal trigger={trigger} title={title} description={description} open={open} onOpenChange={setOpen}>
      <form action={formAction} className="space-y-4">
        {hiddenFields &&
          Object.entries(hiddenFields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <FormMessage state={state} />
        {children(state)}
        <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
          <button type="button" onClick={() => setOpen(false)} className="btn btn-secondary btn-sm">Annuler</button>
          <SubmitButton size="sm" pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
        </div>
      </form>
    </Modal>
  );
}
