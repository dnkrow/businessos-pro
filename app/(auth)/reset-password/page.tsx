import Link from "next/link";
import { ResetForm } from "./reset-form";
import { Alert } from "@/components/ui/alert";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nouveau mot de passe</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Choisissez un mot de passe sécurisé.</p>
      </div>
      {token ? (
        <ResetForm token={token} />
      ) : (
        <div className="space-y-4">
          <Alert variant="danger">Lien invalide ou incomplet. Veuillez refaire une demande de réinitialisation.</Alert>
          <Link href="/forgot-password" className="font-semibold text-[var(--primary)] hover:underline">Refaire une demande</Link>
        </div>
      )}
    </div>
  );
}
