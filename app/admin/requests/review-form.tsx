"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, MessageSquareWarning, XCircle, Loader2 } from "lucide-react";
import { reviewCompanyAction } from "@/app/actions/admin";
import { initialFormState } from "@/app/actions/types";
import { FormMessage } from "@/components/forms/form-message";
import { Field, Textarea } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";

type Decision = "APPROVE" | "INFO" | "REJECT";

function DecisionButton({
  decision,
  variant,
  icon,
  label,
  confirm,
}: {
  decision: Decision;
  variant: "primary" | "secondary" | "danger";
  icon: React.ReactNode;
  label: string;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="decision"
      value={decision}
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={buttonClass(variant, "default", "disabled:opacity-60")}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : icon}
      {label}
    </button>
  );
}

export function ReviewForm({ companyId }: { companyId: string }) {
  const [state, action] = useActionState(reviewCompanyAction, initialFormState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="companyId" value={companyId} />

      <FormMessage state={state} />

      <Field
        label="Message à l'entreprise"
        error={state.fieldErrors?.message}
        hint="Requis pour une demande d'informations ou un refus motivé."
      >
        <Textarea
          name="message"
          rows={3}
          placeholder="Précisez les informations manquantes ou le motif du refus…"
          defaultValue={state.values?.message ?? ""}
        />
      </Field>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <DecisionButton
          decision="APPROVE"
          variant="primary"
          icon={<CheckCircle2 className="size-4" />}
          label="Valider l'entreprise"
        />
        <DecisionButton
          decision="INFO"
          variant="secondary"
          icon={<MessageSquareWarning className="size-4" />}
          label="Demander des informations"
        />
        <DecisionButton
          decision="REJECT"
          variant="danger"
          icon={<XCircle className="size-4" />}
          label="Refuser"
          confirm="Refuser définitivement cette inscription ? L'entreprise en sera notifiée."
        />
      </div>
    </form>
  );
}
