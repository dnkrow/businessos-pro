import Link from "next/link";
import { Mail, Smartphone, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/guards";
import { Logo } from "@/components/ui/logo";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { buttonClass } from "@/components/ui/button";
import { EmailVerify, PhoneVerify } from "./verify-forms";

export default async function VerifyAccountPage() {
  const user = await requireUser();
  const emailVerified = Boolean(user.emailVerifiedAt);
  const phoneVerified = Boolean(user.phoneVerifiedAt);

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--primary-soft)]">
            <ShieldCheck className="size-7 text-[var(--primary)]" />
          </div>
          <h1 className="mt-5 text-xl font-bold tracking-tight">Sécurisez votre compte</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Vérifiez votre adresse email et votre numéro de téléphone pour protéger votre accès.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Mail className="size-4 text-[var(--muted)]" />
                  Adresse email
                </span>
              }
              subtitle={user.email}
            />
            <CardBody>
              <EmailVerify emailVerified={emailVerified} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Smartphone className="size-4 text-[var(--muted)]" />
                  Téléphone
                </span>
              }
              subtitle="Vérification par SMS"
            />
            <CardBody>
              <PhoneVerify phoneVerified={phoneVerified} phone={user.phone} />
            </CardBody>
          </Card>
        </div>

        <Link href="/onboarding" className={buttonClass("primary", "default", "mt-8 w-full")}>
          Continuer
        </Link>
        <p className="mt-3 text-center text-xs text-[var(--muted)]">
          Vous pourrez compléter ces vérifications plus tard depuis votre compte.
        </p>
      </div>
    </div>
  );
}
