import Link from "next/link";
import {
  Building2,
  Clock,
  CheckCircle2,
  Users,
  ArrowRight,
  Activity,
} from "lucide-react";
import { requireSuperAdmin } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { CompanyStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty";
import { buttonClass } from "@/components/ui/button";
import { COMPANY_STATUS_META, PLAN_META, type CompanyStatus } from "@/lib/constants";
import { auditLabel } from "@/lib/audit";
import { formatDate, timeAgo, formatMoney } from "@/lib/utils";

const STATUS_ORDER: CompanyStatus[] = [
  "PENDING",
  "INFO_REQUESTED",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
];

export default async function AdminDashboardPage() {
  await requireSuperAdmin();

  const [
    totalCompanies,
    companyByStatus,
    totalUsers,
    activeUsers,
    totalEstablishments,
    subscriptionByPlan,
    latestRequests,
    recentActivity,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.establishment.count(),
    prisma.subscription.groupBy({ by: ["plan"], _count: { _all: true } }),
    prisma.company.findMany({
      where: { status: { in: ["PENDING", "INFO_REQUESTED"] } },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const statusCount = (status: CompanyStatus) =>
    companyByStatus.find((s) => s.status === status)?._count._all ?? 0;

  const pendingCount = statusCount("PENDING") + statusCount("INFO_REQUESTED");
  const approvedCount = statusCount("APPROVED");

  const planCount = (plan: string) =>
    subscriptionByPlan.find((s) => s.plan === plan)?._count._all ?? 0;

  const maxStatus = Math.max(1, ...STATUS_ORDER.map((s) => statusCount(s)));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la plateforme BusinessOS Pro."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Entreprises"
          value={totalCompanies}
          icon={<Building2 className="size-5" />}
          tone="primary"
          hint={`${totalEstablishments} établissement${totalEstablishments > 1 ? "s" : ""}`}
        />
        <Link href="/admin/requests" className="block">
          <StatCard
            label="En attente"
            value={pendingCount}
            icon={<Clock className="size-5" />}
            tone="warning"
            hint="Voir les demandes"
          />
        </Link>
        <StatCard
          label="Validées"
          value={approvedCount}
          icon={<CheckCircle2 className="size-5" />}
          tone="success"
        />
        <StatCard
          label="Utilisateurs"
          value={totalUsers}
          icon={<Users className="size-5" />}
          tone="info"
          hint={`${activeUsers} actif${activeUsers > 1 ? "s" : ""}`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Répartition par statut */}
        <Card>
          <CardHeader title="Répartition des entreprises par statut" />
          <CardBody className="space-y-4">
            {STATUS_ORDER.map((status) => {
              const count = statusCount(status);
              const pct = Math.round((count / maxStatus) * 100);
              return (
                <div key={status}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <CompanyStatusBadge status={status} />
                    <span className="text-sm font-semibold text-[var(--foreground)]">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Abonnements par plan */}
        <Card>
          <CardHeader title="Abonnements par plan" />
          <CardBody className="space-y-3">
            {Object.entries(PLAN_META).map(([plan, meta]) => (
              <div
                key={plan}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--foreground)]">{meta.label}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {meta.priceMonthly === 0
                      ? "Gratuit"
                      : `${formatMoney(meta.priceMonthly, "EUR")} / mois`}
                  </p>
                </div>
                <span className="shrink-0 text-2xl font-bold tracking-tight text-[var(--foreground)]">
                  {planCount(plan)}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Dernières demandes */}
        <Card>
          <CardHeader
            title="Dernières demandes"
            action={
              <Link href="/admin/requests" className={buttonClass("ghost", "sm")}>
                Tout voir <ArrowRight className="size-4" />
              </Link>
            }
          />
          <CardBody className="p-0">
            {latestRequests.length === 0 ? (
              <EmptyState
                icon={<Clock className="size-6" />}
                title="Aucune demande en attente"
                description="Toutes les inscriptions ont été traitées."
              />
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {latestRequests.map((c) => (
                  <li key={c.id}>
                    <Link
                      href="/admin/requests"
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--surface-2)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--foreground)]">{c.legalName}</p>
                        <p className="truncate text-xs text-[var(--muted)]">
                          {[c.city, formatDate(c.createdAt)].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                      <CompanyStatusBadge status={c.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Activité récente plateforme */}
        <Card>
          <CardHeader title="Activité récente plateforme" />
          <CardBody className="p-0">
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={<Activity className="size-6" />}
                title="Aucune activité"
                description="Les actions importantes apparaîtront ici."
              />
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {recentActivity.map((log) => (
                  <li key={log.id} className="flex items-start gap-3 px-5 py-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--muted)]">
                      <Activity className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {auditLabel(log.action)}
                      </p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {[log.actorLabel, timeAgo(log.createdAt)].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
