import { Alert } from "@/components/ui/alert";
import type { FormState } from "@/app/actions/types";

/** Affiche le retour d'une server action (succès / erreur). */
export function FormMessage({ state }: { state: FormState }) {
  if (state.error) return <Alert variant="danger">{state.error}</Alert>;
  if (state.ok && state.message) return <Alert variant="success">{state.message}</Alert>;
  return null;
}
