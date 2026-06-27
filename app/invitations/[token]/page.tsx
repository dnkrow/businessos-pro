import Link from "next/link";
import { Briefcase, MailX } from "lucide-react";
import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/crypto";
import { Logo } from "@/components/ui/logo";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CompanyLogo } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";
import { AcceptForm } from "./accept-form";

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invitation = await prisma.invitation.findFirst({
    where: { tokenHash: sha256(token), status: "PENDING", expiresAt: { gt: new Date() } },
    include: { company: true, role: true },
  });

  if (!invitation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <Logo />
        <div className="mt-8 w-full max-w-md">
          <div className="card px-6 py-8 text-center sm:px-8">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--danger-soft)]">
              <MailX className="size-7 text-[var(--danger)]" />
            </div>
            <h1 className="mt-5 text-lg font-bold">Invitation invalide ou expirée</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Ce lien d&apos;invitation n&apos;est plus valide. Demandez à votre administrateur de
              vous renvoyer une invitation.
            </p>
            <Link href="/login" className={buttonClass("primary", "default", "mt-6 w-full")}>
              Aller à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: invitation.email } });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md">
        <div className="card px-6 py-7 sm:px-8">
          <div className="text-center">
            <CompanyLogo
              name={invitation.company.legalName}
              src={invitation.company.logoUrl}
              size={56}
              className="mx-auto"
            />
            <h1 className="mt-4 text-lg font-bold tracking-tight">
              Vous êtes invité(e) à rejoindre {invitation.company.legalName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {invitation.role && (
                <Badge tone="primary" dot>
                  {invitation.role.name}
                </Badge>
              )}
              {invitation.jobTitle && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
                  <Briefcase className="size-3.5" />
                  {invitation.jobTitle}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            <AcceptForm
              token={token}
              email={invitation.email}
              hasAccount={Boolean(existing)}
            />
          </div>

          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            En rejoignant, vous acceptez les conditions d&apos;utilisation de BusinessOS Pro.
          </p>
        </div>
      </div>
    </div>
  );
}
