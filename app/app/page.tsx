import Link from "next/link";
import { Users, MapPin, ShieldCheck, CreditCard, Mail, ArrowRight, Activity, MailWarning } from "lucide-react";
import { requireActiveCompany } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { can } from "@/lib/rbac";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { auditLabel } from "@/lib/audit";
import { PLAN_META } from "@/lib/constants";
import { timeAgo, fullName } from "@/lib/utils";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { user, ctx } = await requireActiveCompany();
  const sp = await searchParams;
  const companyId = ctx.company.id;

  const [employees, establishments, roles, pendingInvites, subscription, activity] = await Promise.all([
    prisma.membership.count({ where: { companyId, status: { not: "DISABLED" } } }),
    prisma.establishment.count({ where: { companyId, isActive: true } }),
    prisma.role.count({ where: { companyId } }),
    prisma.invitation.count({ where: { companyId, status: "PENDING" } }),
    prisma.subscription.findUnique({ where: { companyId } }),
    prisma.auditLog.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const plan = subscription ? PLAN_META[subscription.plan] : null;

  const quickActions = [
    { href: "/app/employees", label: "Inviter un employé", icon: Users, show: can(ctx, "employees.manage") },
    { href: "/app/establishments", label: "Ajouter un établissement", icon: MapPin, show: can(ctx, "establishments.manage") },
    { href: "/app/roles", label: "Gérer les rôles", icon: ShieldCheck, show: can(ctx, "roles.manage") },
    { href: "/app/company", label: "Modifier l'entreprise", icon: CreditCard, show: can(ctx, "company.edit") },
  ].filter((a) => a.show);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={`Bonjour ${user.firstName} 👋`}
        description={`Voici un aperçu de ${ctx.company.tradeName || ctx.company.legalName}.`}
      />

      {sp.denied === "1" && (
        <Alert variant="danger" className="mb-4">Vous n'avez pas la permission d'accéder à cette section.</Alert>
      )}

      {!user.emailVerifiedAt && (
        <Alert variant="warning" className="mb-4" title="Vérifiez votre adresse email">
          <div className="flex flex-wrap items-center gap-2">
            <span>Confirmez votre email pour sécuriser votre compte.</span>
            <Link href="/app/account" className="font-semibold underline">Vérifier maintenant</Link>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Employés" value={employees} icon={<Users className="size-5" />} tone="primary" />
        <StatCard label="Établissements" value={establishments} icon={<MapPin className="size-5" />} tone="info" />
        <StatCard label="Rôles" value={roles} icon={<ShieldCheck className="size-5" />} tone="success" />
        <StatCard label="Abonnement" value={plan?.label ?? "—"} icon={<CreditCard className="size-5" />} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Activité récente" subtitle="Les dernières actions importantes de votre entreprise" action={<Activity className="size-4 text-[var(--muted-2)]" />} />
          <CardBody className="p-0">
            {activity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[var(--muted)]">Aucune activité pour le moment.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {activity.map((log) => (
                  <li key={log.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--surface-2)]">
                      <Activity className="size-4 text-[var(--muted)]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{auditLabel(log.action)}</p>
                      <p className="truncate text-xs text-[var(--muted)]">{log.actorLabel ?? "Système"}</p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--muted-2)]">{timeAgo(log.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Actions rapides" />
            <CardBody className="space-y-1.5">
              {quickActions.length === 0 && <p className="text-sm text-[var(--muted)]">Aucune action disponible avec votre rôle.</p>}
              {quickActions.map((a) => (
                <Link key={a.href} href={a.href} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium hover:bg-[var(--surface-2)]">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary-hover)]"><a.icon className="size-4" /></span>
                  <span className="flex-1">{a.label}</span>
                  <ArrowRight className="size-4 text-[var(--muted-2)]" />
                </Link>
              ))}
            </CardBody>
          </Card>

          {pendingInvites > 0 && can(ctx, "employees.view") && (
            <Card>
              <CardBody className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--warning-soft)] text-[#b26a04]"><MailWarning className="size-5" /></span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{pendingInvites} invitation{pendingInvites > 1 ? "s" : ""} en attente</p>
                  <Link href="/app/employees" className="text-xs font-medium text-[var(--primary)] hover:underline">Voir les employés</Link>
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Votre rôle" />
            <CardBody>
              <div className="flex items-center gap-2">
                {ctx.role && <Badge tone="primary" dot>{ctx.role.name}</Badge>}
                {ctx.membership.isOwner && <Badge tone="success">Propriétaire</Badge>}
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{fullName(user.firstName, user.lastName)} — {ctx.membership.jobTitle ?? "—"}</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
