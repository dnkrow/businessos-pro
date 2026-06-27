import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, MapPin, Briefcase, MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import { Alert } from "@/components/ui/alert";
import { CompanyLogo, Avatar } from "@/components/ui/avatar";
import { CompanyStatusBadge } from "@/components/ui/status-badge";
import { buttonClass } from "@/components/ui/button";
import { fullName, formatDate } from "@/lib/utils";

export default async function PendingPage() {
  const user = await requireUser();

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { company: { include: { owner: true } } },
    orderBy: { createdAt: "desc" },
  });

  const company = membership?.company;
  if (!company) redirect("/onboarding");
  if (company.status === "APPROVED") redirect("/app");

  const canEdit = company.status === "REJECTED" || company.status === "INFO_REQUESTED";

  const messages =
    company.status === "INFO_REQUESTED"
      ? await prisma.companyReviewMessage.findMany({
          where: { companyId: company.id },
          orderBy: { createdAt: "asc" },
          include: { author: true },
        })
      : [];

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-xl space-y-5">
        {company.status === "PENDING" && (
          <div className="card px-6 py-8 text-center sm:px-8">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--warning-soft)]">
              <Clock className="size-7 text-[var(--warning)]" />
            </div>
            <h1 className="mt-5 text-xl font-bold tracking-tight">
              Votre demande est en cours d&apos;examen
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              L&apos;équipe BusinessOS Pro vérifie actuellement les informations de votre
              entreprise. Vous recevrez une notification dès que votre accès sera validé.
            </p>
          </div>
        )}

        {company.status === "INFO_REQUESTED" && (
          <div className="space-y-4">
            <Alert variant="warning" title="Informations complémentaires demandées">
              Notre équipe a besoin de précisions avant de valider votre entreprise. Consultez les
              messages ci-dessous, puis modifiez votre demande si nécessaire.
            </Alert>

            <div className="card">
              <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-3 text-sm font-semibold">
                <MessageSquare className="size-4 text-[var(--muted)]" />
                Échanges avec l&apos;équipe
              </div>
              <ul className="divide-y divide-[var(--border)]">
                {messages.map((m) => {
                  const fromAdmin = m.authorRole === "SUPER_ADMIN";
                  const authorName = fromAdmin
                    ? "Équipe BusinessOS Pro"
                    : fullName(m.author.firstName, m.author.lastName);
                  return (
                    <li key={m.id} className="flex gap-3 px-5 py-4">
                      <Avatar
                        firstName={fromAdmin ? "B" : m.author.firstName}
                        lastName={fromAdmin ? "P" : m.author.lastName}
                        src={fromAdmin ? null : m.author.avatarUrl}
                        size={34}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                          <span className="text-sm font-semibold text-[var(--foreground)]">
                            {authorName}
                          </span>
                          <span className="text-xs text-[var(--muted)]">
                            {formatDate(m.createdAt, true)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted)]">
                          {m.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {company.status === "REJECTED" && (
          <Alert variant="danger" title="Inscription refusée">
            {company.rejectionReason ||
              "Votre demande n'a pas pu être validée. Vous pouvez modifier vos informations et la soumettre à nouveau."}
          </Alert>
        )}

        {/* Récapitulatif de l'entreprise */}
        <div className="card flex items-center gap-4 px-5 py-4">
          <CompanyLogo name={company.legalName} src={company.logoUrl} size={48} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold text-[var(--foreground)]">
                {company.legalName}
              </h2>
              <CompanyStatusBadge status={company.status} />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
              {company.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {company.city}
                  {company.country ? `, ${company.country}` : ""}
                </span>
              )}
              {company.activity && (
                <span className="flex items-center gap-1">
                  <Briefcase className="size-3.5" />
                  {company.activity}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {canEdit ? (
            <Link href="/onboarding" className={buttonClass("primary", "default")}>
              Modifier ma demande
            </Link>
          ) : (
            <span className="text-xs text-[var(--muted)]">
              Soumise le {formatDate(company.createdAt)}.
            </span>
          )}
          <form action={logoutAction}>
            <button type="submit" className={buttonClass("ghost", "default")}>
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
