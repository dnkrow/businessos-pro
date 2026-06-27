import Link from "next/link";
import { Building2 } from "lucide-react";
import { requireSuperAdmin } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { CompanyLogo } from "@/components/ui/avatar";
import { CompanyStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty";
import { buttonClass } from "@/components/ui/button";
import { cn, fullName } from "@/lib/utils";
import { COMPANY_STATUS_META, PLAN_META, type CompanyStatus } from "@/lib/constants";

const FILTERS: { value: CompanyStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "PENDING", label: "En attente" },
  { value: "INFO_REQUESTED", label: "Infos demandées" },
  { value: "APPROVED", label: "Validées" },
  { value: "SUSPENDED", label: "Suspendues" },
  { value: "REJECTED", label: "Refusées" },
];

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireSuperAdmin();
  const sp = await searchParams;
  const status =
    sp.status && sp.status in COMPANY_STATUS_META ? (sp.status as CompanyStatus) : undefined;

  const companies = await prisma.company.findMany({
    where: status ? { status } : undefined,
    include: {
      owner: true,
      subscription: true,
      _count: { select: { memberships: true, establishments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Entreprises"
        description="Toutes les entreprises inscrites sur la plateforme."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = f.value === "all" ? !status : status === f.value;
          return (
            <Link
              key={f.value}
              href={f.value === "all" ? "/admin/companies" : `/admin/companies?status=${f.value}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-hover)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-2)]",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <Card className="overflow-hidden p-0">
        {companies.length === 0 ? (
          <EmptyState
            icon={<Building2 className="size-6" />}
            title="Aucune entreprise"
            description="Aucune entreprise ne correspond à ce filtre."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
                  <th className="px-5 py-3">Entreprise</th>
                  <th className="px-5 py-3">Dirigeant</th>
                  <th className="px-5 py-3">Activité</th>
                  <th className="px-5 py-3 text-center">Membres</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {companies.map((c) => {
                  const plan = c.subscription ? PLAN_META[c.subscription.plan] : null;
                  return (
                    <tr key={c.id} className="hover:bg-[var(--surface-2)]/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <CompanyLogo name={c.legalName} src={c.logoUrl} size={38} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[var(--foreground)]">
                              {c.legalName}
                            </p>
                            <p className="truncate text-xs text-[var(--muted)]">
                              {c.city || c.country || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-[var(--foreground)]">
                          {fullName(c.owner.firstName, c.owner.lastName)}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{c.owner.email}</p>
                      </td>
                      <td className="px-5 py-3 text-[var(--muted)]">{c.activity || "—"}</td>
                      <td className="px-5 py-3 text-center font-medium">
                        {c._count.memberships}
                      </td>
                      <td className="px-5 py-3 text-[var(--muted)]">{plan?.label ?? "—"}</td>
                      <td className="px-5 py-3">
                        <CompanyStatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/companies/${c.id}`}
                          className={buttonClass("secondary", "sm")}
                        >
                          Détails
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
