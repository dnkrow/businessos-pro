import { CreditCard, TrendingUp, CheckCircle2, Hourglass } from "lucide-react";
import { requireSuperAdmin } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { CompanyLogo } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SubscriptionStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty";
import { fullName, formatMoney, formatDate } from "@/lib/utils";
import { PLAN_META } from "@/lib/constants";

const PLAN_TONE: Record<string, "neutral" | "primary" | "success" | "info"> = {
  TRIAL: "info",
  STARTER: "neutral",
  PRO: "primary",
  ENTERPRISE: "success",
};

export default async function AdminSubscriptionsPage() {
  await requireSuperAdmin();

  const subs = await prisma.subscription.findMany({
    include: { company: { include: { owner: true } } },
    orderBy: { createdAt: "desc" },
  });

  const activeSubs = subs.filter((s) => s.status === "ACTIVE");
  const monthlyRevenue = activeSubs.reduce((sum, s) => sum + s.priceMonthly, 0);
  const trialingCount = subs.filter((s) => s.status === "TRIALING").length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Abonnements"
        description="Suivi des abonnements et du chiffre d'affaires récurrent."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Revenu mensuel"
          value={formatMoney(monthlyRevenue, "EUR")}
          icon={<TrendingUp className="size-5" />}
          tone="success"
          hint="Abonnements actifs"
        />
        <StatCard
          label="Abonnements actifs"
          value={activeSubs.length}
          icon={<CheckCircle2 className="size-5" />}
          tone="primary"
        />
        <StatCard
          label="En période d'essai"
          value={trialingCount}
          icon={<Hourglass className="size-5" />}
          tone="info"
        />
        <StatCard
          label="Total"
          value={subs.length}
          icon={<CreditCard className="size-5" />}
          tone="warning"
        />
      </div>

      <Card className="overflow-hidden p-0">
        {subs.length === 0 ? (
          <EmptyState icon={<CreditCard className="size-6" />} title="Aucun abonnement" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
                  <th className="px-5 py-3">Entreprise</th>
                  <th className="px-5 py-3">Dirigeant</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-center">Sièges</th>
                  <th className="px-5 py-3 text-right">Prix</th>
                  <th className="px-5 py-3 text-right">Renouvellement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {subs.map((s) => {
                  const plan = PLAN_META[s.plan];
                  return (
                    <tr key={s.id} className="hover:bg-[var(--surface-2)]/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <CompanyLogo name={s.company.legalName} src={s.company.logoUrl} size={36} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[var(--foreground)]">
                              {s.company.legalName}
                            </p>
                            <p className="truncate text-xs text-[var(--muted)]">
                              {s.company.city || s.company.country || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-[var(--foreground)]">
                          {fullName(s.company.owner.firstName, s.company.owner.lastName)}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{s.company.owner.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={PLAN_TONE[s.plan] ?? "neutral"}>
                          {plan?.label ?? s.plan}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <SubscriptionStatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3 text-center font-medium">{s.seats}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-medium text-[var(--foreground)]">
                          {formatMoney(s.priceMonthly, s.currency)}
                        </span>
                        <span className="text-xs text-[var(--muted)]"> /mois</span>
                      </td>
                      <td className="px-5 py-3 text-right text-[var(--muted)]">
                        {formatDate(s.currentPeriodEnd)}
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
