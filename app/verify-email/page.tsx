import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyEmailToken } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/button";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const result = token ? await verifyEmailToken(token) : "INVALID";
  const ok = result === "OK";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <Logo />
      <div className="card mt-8 w-full max-w-md px-8 py-10 text-center">
        <div className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${ok ? "bg-[var(--success-soft)]" : "bg-[var(--danger-soft)]"}`}>
          {ok ? <CheckCircle2 className="size-7 text-[var(--success)]" /> : <XCircle className="size-7 text-[var(--danger)]" />}
        </div>
        <h1 className="mt-5 text-xl font-bold">{ok ? "Adresse email vérifiée" : "Lien invalide ou expiré"}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {ok
            ? "Merci ! Votre adresse email est confirmée. Vous pouvez continuer."
            : "Ce lien de vérification n'est plus valide. Vous pouvez en demander un nouveau depuis votre compte."}
        </p>
        <Link href={ok ? "/app" : "/login"} className={buttonClass("primary", "default", "mt-6 w-full")}>
          {ok ? "Continuer" : "Retour à la connexion"}
        </Link>
      </div>
    </div>
  );
}
