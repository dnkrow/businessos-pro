import { requireActiveCompany, requirePermission } from "@/lib/guards";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { CompanyLogo } from "@/components/ui/avatar";
import { CompanyStatusBadge } from "@/components/ui/status-badge";
import { CompanyForm } from "./company-form";

const REGISTRATION_LABELS: Record<string, string> = {
  NEW: "Nouvelle entreprise",
  EXISTING: "Entreprise existante",
};

function ReadField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-2)]">{label}</dt>
      <dd className="mt-0.5 text-sm text-[var(--foreground)]">{value || "—"}</dd>
    </div>
  );
}

export default async function CompanyPage() {
  const { ctx } = await requireActiveCompany();
  requirePermission(ctx, "company.view");
  const canEdit = can(ctx, "company.edit");

  const company = await prisma.company.findUnique({ where: { id: ctx.company.id } });
  if (!company) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Entreprise"
        description="Consultez et gérez les informations de votre entreprise."
      />

      <Card className="mb-6">
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <CompanyLogo name={company.legalName} src={company.logoUrl} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {company.tradeName || company.legalName}
              </h2>
              <CompanyStatusBadge status={company.status} />
            </div>
            {company.tradeName && (
              <p className="text-sm text-[var(--muted)]">{company.legalName}</p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
              {company.activity && <span>{company.activity}</span>}
              <span className="text-[var(--muted-2)]">•</span>
              <span>{REGISTRATION_LABELS[company.registrationType] ?? company.registrationType}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {canEdit ? (
        <CompanyForm company={company} />
      ) : (
        <Card>
          <CardHeader title="Informations" subtitle="Détails de l'entreprise (lecture seule)." />
          <CardBody>
            <dl className="grid gap-5 sm:grid-cols-2">
              <ReadField label="Raison sociale" value={company.legalName} />
              <ReadField label="Nom commercial" value={company.tradeName} />
              <ReadField label="Adresse" value={company.address} />
              <ReadField label="Ville" value={[company.postalCode, company.city].filter(Boolean).join(" ")} />
              <ReadField label="Pays" value={company.country} />
              <ReadField label="Activité" value={company.activity} />
              <ReadField label="Téléphone" value={company.phone} />
              <ReadField label="Email" value={company.email} />
              <ReadField label="Site web" value={company.website} />
              <ReadField label="Devise" value={company.currency} />
              <ReadField label="Langue" value={company.locale} />
            </dl>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
