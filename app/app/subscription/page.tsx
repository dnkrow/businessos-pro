import { Check, CreditCard, Users, CalendarClock } from "lucide-react";
import { requireActiveCompany, requirePermission } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { SubscriptionStatusBadge } from "@/components/ui/status-badge";
import { PLAN_META } from "@/lib/constants";
import { formatMoney, formatDate } from "@/lib/utils";

export default async function SubscriptionPage() {
  const { ctx } = await requireActiveCompany();
  requirePermission(ctx, "subscription.view");

  const [sub, memberCount] = await Promise.all([
    prisma.subscription.findUnique({ where: { companyId: ctx.company.id } }),
    prisma.membership.count({ where: { companyId: ctx.company.id, status: { not: "DISABLED" } } }),
  ]);

  const currentPlan = sub ? PLAN_META[sub.plan] : null;
  const seats = sub?.seats ?? 0;
  const usagePct = seats > 0 ? Math.min(100, Math.round((memberCount / seats) * 100)) : 0;
  const overCapacity = seats > 0 && memberCount > seats;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Abonnement"
        description="Consultez votre plan, vos sièges et la facturation de votre entreprise."
      />

      <Alert variant="info" className="mb-6" title="Facturation de démonstration">
        Les paiements ne sont pas activés sur cette instance. Le changement de plan est purement
        illustratif.
      </Alert>

      {sub && currentPlan ? (
        <Card className="mb-6">
          <CardHeader
            title="Plan actuel"
            action={<SubscriptionStatusBadge status={sub.status} />}
          />
          <CardBody>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[var(--foreground)]">{currentPlan.label}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  <span className="text-lg font-semibold text-[var(--foreground)]">
                    {formatMoney(sub.priceMonthly, sub.currency)}
                  </span>{" "}
                  / mois
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <CalendarClock className="size-4 text-[var(--muted-2)]" />
                <span>Renouvellement le {formatDate(sub.currentPeriodEnd)}</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium text-[var(--foreground)]">
                  <Users className="size-4 text-[var(--muted-2)]" />
                  Sièges utilisés
                </span>
                <span className="text-[var(--muted)]">
                  {memberCount} / {seats}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${usagePct}%`,
                    backgroundColor: overCapacity ? "var(--danger)" : "var(--primary)",
                  }}
                />
              </div>
              {overCapacity && (
                <p className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                  Vous avez dépassé le nombre de sièges inclus dans votre plan.
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardBody className="flex items-center gap-3 text-sm text-[var(--muted)]">
            <CreditCard className="size-5 text-[var(--muted-2)]" />
            Aucun abonnement actif pour cette entreprise.
          </CardBody>
        </Card>
      )}

      <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Plans disponibles</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(PLAN_META).map(([key, plan]) => {
          const isCurrent = sub?.plan === key;
          return (
            <Card
              key={key}
              className={isCurrent ? "border-[var(--primary)] ring-1 ring-[var(--primary)]" : undefined}
            >
              <CardBody className="flex h-full flex-col">
                <div>
                  <h3 className="text-base font-semibold text-[var(--foreground)]">{plan.label}</h3>
                  <p className="mt-1">
                    <span className="text-xl font-bold text-[var(--foreground)]">
                      {formatMoney(plan.priceMonthly, sub?.currency ?? ctx.company.currency)}
                    </span>
                    <span className="text-sm text-[var(--muted)]"> / mois</span>
                  </p>
                </div>

                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[var(--muted)]">
                      <Check className="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  {isCurrent ? (
                    <button className="btn btn-secondary btn-sm w-full" disabled>
                      Plan actuel
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm w-full"
                      disabled
                      title="Bientôt disponible"
                    >
                      Choisir ce plan
                    </button>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
