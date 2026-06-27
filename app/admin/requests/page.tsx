import {
  Inbox,
  User,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Globe,
  Flag,
  Languages,
  Coins,
  CalendarDays,
  FileText,
  MessagesSquare,
  Users,
  Building,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { CompanyLogo } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CompanyStatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/utils";
import { ReviewForm } from "./review-form";

function formatBytes(bytes: number | null | undefined) {
  if (bytes == null) return "Taille inconnue";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--muted)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-[var(--muted)]">{label}</p>
        <div className="text-sm font-medium text-[var(--foreground)] break-words">{children}</div>
      </div>
    </div>
  );
}

export default async function AdminRequestsPage() {
  await requireSuperAdmin();

  const companies = await prisma.company.findMany({
    where: { status: { in: ["PENDING", "INFO_REQUESTED"] } },
    include: {
      owner: true,
      documents: true,
      reviewMessages: { include: { author: true }, orderBy: { createdAt: "asc" } },
      _count: { select: { memberships: true, establishments: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Demandes d'inscription"
        description="Validez ou refusez les entreprises avant leur accès à la plateforme."
      />

      {companies.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Inbox className="size-6" />}
            title="Aucune demande en attente"
            description="Toutes les inscriptions ont été traitées. Les nouvelles demandes apparaîtront ici."
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {companies.map((company) => (
            <Card key={company.id} className="overflow-hidden">
              {/* En-tête */}
              <div className="flex flex-col gap-4 border-b border-[var(--border)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <CompanyLogo name={company.legalName} src={company.logoUrl} size={48} />
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">
                      {company.legalName}
                    </h2>
                    {company.tradeName && company.tradeName !== company.legalName && (
                      <p className="text-sm text-[var(--muted)]">{company.tradeName}</p>
                    )}
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" /> {company._count.memberships} membre
                        {company._count.memberships > 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Building className="size-3.5" /> {company._count.establishments}{" "}
                        établissement{company._count.establishments > 1 ? "s" : ""}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <CompanyStatusBadge status={company.status} />
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow icon={<User className="size-4" />} label="Dirigeant">
                  {company.owner.firstName} {company.owner.lastName}
                  <span className="block text-xs font-normal text-[var(--muted)]">
                    {company.owner.email}
                  </span>
                </DetailRow>
                <DetailRow icon={<Briefcase className="size-4" />} label="Activité">
                  {company.activity || "—"}
                </DetailRow>
                <DetailRow icon={<MapPin className="size-4" />} label="Adresse">
                  {[
                    company.address,
                    [company.postalCode, company.city].filter(Boolean).join(" "),
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </DetailRow>
                <DetailRow icon={<Phone className="size-4" />} label="Téléphone">
                  {company.phone || "—"}
                </DetailRow>
                <DetailRow icon={<Mail className="size-4" />} label="Email">
                  {company.email || "—"}
                </DetailRow>
                <DetailRow icon={<Globe className="size-4" />} label="Site web">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </DetailRow>
                <DetailRow icon={<Flag className="size-4" />} label="Pays">
                  {company.country || "—"}
                </DetailRow>
                <DetailRow icon={<Languages className="size-4" />} label="Langue">
                  {company.locale || "—"}
                </DetailRow>
                <DetailRow icon={<Coins className="size-4" />} label="Devise">
                  {company.currency || "—"}
                </DetailRow>
                <DetailRow icon={<CalendarDays className="size-4" />} label="Soumise le">
                  {formatDate(company.createdAt, true)}
                </DetailRow>
                <DetailRow icon={<Building className="size-4" />} label="Type d'enregistrement">
                  {company.registrationType === "NEW"
                    ? "Nouvelle entreprise"
                    : company.registrationType === "EXISTING"
                      ? "Entreprise existante"
                      : company.registrationType || "—"}
                </DetailRow>
              </div>

              {/* Documents */}
              <div className="border-t border-[var(--border)] px-5 py-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                  <FileText className="size-4 text-[var(--muted)]" /> Documents justificatifs
                </h3>
                {company.documents.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">Aucun document fourni.</p>
                ) : (
                  <ul className="space-y-2">
                    {company.documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-4 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText className="size-4 shrink-0 text-[var(--muted)]" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--foreground)]">
                              {doc.name}
                            </p>
                            <p className="truncate text-xs text-[var(--muted)]">
                              {doc.fileName} • {formatBytes(doc.sizeBytes)}
                            </p>
                          </div>
                        </div>
                        <Badge tone="warning">À vérifier</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Échanges */}
              {company.reviewMessages.length > 0 && (
                <div className="border-t border-[var(--border)] px-5 py-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                    <MessagesSquare className="size-4 text-[var(--muted)]" /> Échanges
                  </h3>
                  <ul className="space-y-3">
                    {company.reviewMessages.map((msg) => {
                      const isAdmin = msg.authorRole === "SUPER_ADMIN";
                      const authorName = isAdmin
                        ? "Équipe BusinessOS Pro"
                        : `${company.owner.firstName} ${company.owner.lastName}`;
                      return (
                        <li
                          key={msg.id}
                          className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                              {authorName}
                              {isAdmin && <Badge tone="primary">Admin</Badge>}
                            </span>
                            <span className="text-xs text-[var(--muted)]">
                              {formatDate(msg.createdAt, true)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm text-[var(--foreground)]">
                            {msg.body}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Décision */}
              <div className="border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-5">
                <ReviewForm companyId={company.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
