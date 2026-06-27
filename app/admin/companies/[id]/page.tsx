import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Users,
  MapPin,
  FileText,
  MessagesSquare,
  CreditCard,
  Building2,
  ClipboardCheck,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { setCompanyStatusAction } from "@/app/actions/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { CompanyLogo, Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CompanyStatusBadge,
  MembershipStatusBadge,
  SubscriptionStatusBadge,
} from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty";
import { buttonClass } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import { fullName, formatDate, formatMoney } from "@/lib/utils";
import { PLAN_META, ESTABLISHMENT_TYPE_META, type EstablishmentType } from "@/lib/constants";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-[var(--muted)]">{label}</dt>
      <dd className="text-right text-sm font-medium text-[var(--foreground)]">{value || "—"}</dd>
    </div>
  );
}

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSuperAdmin();
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      owner: true,
      reviewedBy: true,
      subscription: true,
      documents: { orderBy: { createdAt: "desc" } },
      establishments: { orderBy: { createdAt: "asc" } },
      memberships: { include: { user: true, role: true }, orderBy: { createdAt: "asc" } },
      reviewMessages: { include: { author: true }, orderBy: { createdAt: "asc" } },
      _count: { select: { memberships: true, establishments: true } },
    },
  });

  if (!company) notFound();

  const plan = company.subscription ? PLAN_META[company.subscription.plan] : null;

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/companies"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="size-4" /> Retour aux entreprises
      </Link>

      <PageHeader
        title={company.legalName}
        description={company.tradeName || undefined}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <CompanyStatusBadge status={company.status} />
            {company.status === "APPROVED" && (
              <form action={setCompanyStatusAction}>
                <input type="hidden" name="companyId" value={company.id} />
                <input type="hidden" name="action" value="suspend" />
                <ConfirmSubmit confirm={`Suspendre « ${company.legalName} » ? L'accès à l'application sera bloqué.`}>
                  Suspendre
                </ConfirmSubmit>
              </form>
            )}
            {company.status === "SUSPENDED" && (
              <form action={setCompanyStatusAction}>
                <input type="hidden" name="companyId" value={company.id} />
                <input type="hidden" name="action" value="reactivate" />
                <ConfirmSubmit
                  confirm={`Réactiver « ${company.legalName} » ?`}
                  variant="primary"
                >
                  Réactiver
                </ConfirmSubmit>
              </form>
            )}
            {(company.status === "PENDING" || company.status === "INFO_REQUESTED") && (
              <Link href="/admin/requests" className={buttonClass("primary", "sm")}>
                <ClipboardCheck className="size-4" /> Traiter la demande
              </Link>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identité */}
        <Card className="lg:col-span-2">
          <CardHeader title="Identité de l'entreprise" action={<Building2 className="size-4 text-[var(--muted-2)]" />} />
          <CardBody>
            <div className="mb-4 flex items-center gap-3">
              <CompanyLogo name={company.legalName} src={company.logoUrl} size={48} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--foreground)]">{company.legalName}</p>
                {company.tradeName && (
                  <p className="truncate text-sm text-[var(--muted)]">{company.tradeName}</p>
                )}
              </div>
            </div>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <div className="divide-y divide-[var(--border)]">
                <InfoRow label="Type d'inscription" value={company.registrationType === "NEW" ? "Nouvelle entreprise" : "Entreprise existante"} />
                <InfoRow label="Activité" value={company.activity} />
                <InfoRow label="Adresse" value={company.address} />
                <InfoRow label="Ville" value={company.city} />
                <InfoRow label="Code postal" value={company.postalCode} />
                <InfoRow label="Pays" value={company.country} />
              </div>
              <div className="divide-y divide-[var(--border)]">
                <InfoRow label="Téléphone" value={company.phone} />
                <InfoRow label="Email" value={company.email} />
                <InfoRow
                  label="Site web"
                  value={
                    company.website ? (
                      <a href={company.website} target="_blank" rel="noreferrer" className="text-[var(--primary)] hover:underline">
                        {company.website}
                      </a>
                    ) : null
                  }
                />
                <InfoRow label="Langue" value={company.locale?.toUpperCase()} />
                <InfoRow label="Devise" value={company.currency} />
                <InfoRow label="Créée le" value={formatDate(company.createdAt, true)} />
              </div>
            </dl>

            {company.reviewedAt && (
              <p className="mt-4 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                Traitée le {formatDate(company.reviewedAt, true)}
                {company.reviewedBy
                  ? ` par ${fullName(company.reviewedBy.firstName, company.reviewedBy.lastName)}`
                  : ""}
                .
              </p>
            )}
            {company.rejectionReason && (
              <p className="mt-2 text-xs text-[var(--danger)]">Motif : {company.rejectionReason}</p>
            )}
          </CardBody>
        </Card>

        {/* Dirigeant + Abonnement */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Dirigeant" />
            <CardBody className="flex items-center gap-3">
              <Avatar firstName={company.owner.firstName} lastName={company.owner.lastName} src={company.owner.avatarUrl} size={44} />
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {fullName(company.owner.firstName, company.owner.lastName)}
                </p>
                <p className="truncate text-sm text-[var(--muted)]">{company.owner.email}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Abonnement" action={<CreditCard className="size-4 text-[var(--muted-2)]" />} />
            <CardBody>
              {company.subscription ? (
                <dl className="divide-y divide-[var(--border)]">
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-sm text-[var(--muted)]">Plan</dt>
                    <dd>
                      <Badge tone="primary">{plan?.label ?? company.subscription.plan}</Badge>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <dt className="text-sm text-[var(--muted)]">Statut</dt>
                    <dd>
                      <SubscriptionStatusBadge status={company.subscription.status} />
                    </dd>
                  </div>
                  <InfoRow label="Sièges" value={company.subscription.seats} />
                  <InfoRow
                    label="Prix"
                    value={`${formatMoney(company.subscription.priceMonthly, company.subscription.currency)} /mois`}
                  />
                  <InfoRow label="Renouvellement" value={formatDate(company.subscription.currentPeriodEnd)} />
                </dl>
              ) : (
                <p className="text-sm text-[var(--muted)]">Aucun abonnement.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Équipe */}
        <Card className="overflow-hidden p-0">
          <CardHeader
            title={`Équipe (${company._count.memberships})`}
            action={<Users className="size-4 text-[var(--muted-2)]" />}
          />
          {company.memberships.length === 0 ? (
            <EmptyState icon={<Users className="size-6" />} title="Aucun membre" />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {company.memberships.map((m) => (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar firstName={m.user.firstName} lastName={m.user.lastName} src={m.user.avatarUrl} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {fullName(m.user.firstName, m.user.lastName)}
                      {m.isOwner && <span className="ml-1.5 text-xs text-[var(--muted-2)]">(Propriétaire)</span>}
                    </p>
                    <p className="truncate text-xs text-[var(--muted)]">{m.user.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {m.role && (
                      <Badge tone="neutral">{m.role.name}</Badge>
                    )}
                    <MembershipStatusBadge status={m.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Établissements */}
        <Card className="overflow-hidden p-0">
          <CardHeader
            title={`Établissements (${company._count.establishments})`}
            action={<MapPin className="size-4 text-[var(--muted-2)]" />}
          />
          {company.establishments.length === 0 ? (
            <EmptyState icon={<MapPin className="size-6" />} title="Aucun établissement" />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {company.establishments.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--muted)]">
                    <MapPin className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.name}</p>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {ESTABLISHMENT_TYPE_META[e.type as EstablishmentType]?.label ?? e.type}
                      {e.city ? ` · ${e.city}` : ""}
                    </p>
                  </div>
                  <Badge tone={e.isActive ? "success" : "neutral"}>
                    {e.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Documents */}
        <Card className="overflow-hidden p-0">
          <CardHeader
            title={`Documents (${company.documents.length})`}
            action={<FileText className="size-4 text-[var(--muted-2)]" />}
          />
          {company.documents.length === 0 ? (
            <EmptyState icon={<FileText className="size-6" />} title="Aucun document" />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {company.documents.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--muted)]">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.name}</p>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {d.fileName}
                      {d.sizeBytes ? ` · ${(d.sizeBytes / 1024).toFixed(0)} Ko` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--muted-2)]">{formatDate(d.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Échanges */}
        <Card className="overflow-hidden p-0">
          <CardHeader
            title="Échanges de validation"
            action={<MessagesSquare className="size-4 text-[var(--muted-2)]" />}
          />
          {company.reviewMessages.length === 0 ? (
            <EmptyState icon={<MessagesSquare className="size-6" />} title="Aucun échange" />
          ) : (
            <ul className="space-y-3 px-5 py-4">
              {company.reviewMessages.map((msg) => (
                <li
                  key={msg.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--foreground)]">
                      {msg.authorRole === "SUPER_ADMIN"
                        ? "Super Admin"
                        : fullName(msg.author?.firstName, msg.author?.lastName)}
                    </span>
                    <span className="text-xs text-[var(--muted-2)]">{formatDate(msg.createdAt, true)}</span>
                  </div>
                  <p className="text-sm text-[var(--muted)]">{msg.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
