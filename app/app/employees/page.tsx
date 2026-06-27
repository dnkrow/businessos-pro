import { Users, Mail, Clock, X } from "lucide-react";
import { requireActiveCompany, requirePermission } from "@/lib/guards";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MembershipStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty";
import { buttonClass } from "@/components/ui/button";
import { revokeInvitationAction } from "@/app/actions/employees";
import { fullName, formatDate } from "@/lib/utils";
import { InviteModal } from "./invite-modal";
import { RoleSelect } from "./role-select";
import { EmployeeActions } from "./employee-actions";

export default async function EmployeesPage() {
  const { user, ctx } = await requireActiveCompany();
  requirePermission(ctx, "employees.view");

  const canManage = can(ctx, "employees.manage");
  const canPerms = can(ctx, "employees.permissions");
  const companyId = ctx.company.id;

  const [memberships, roles, invitations] = await Promise.all([
    prisma.membership.findMany({
      where: { companyId },
      include: { user: true, role: true },
      orderBy: [{ isOwner: "desc" }, { createdAt: "asc" }],
    }),
    prisma.role.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
    prisma.invitation.findMany({
      where: { companyId, status: "PENDING" },
      include: { role: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const roleOptions = roles.map((r) => ({ id: r.id, name: r.name }));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Employés"
        description="Gérez les membres de votre entreprise, leurs rôles et leurs invitations."
        action={canManage ? <InviteModal roles={roleOptions} /> : undefined}
      />

      <Card>
        <CardHeader
          title="Membres"
          subtitle={`${memberships.length} membre${memberships.length > 1 ? "s" : ""} dans votre entreprise`}
        />
        <CardBody className="p-0">
          {memberships.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                icon={<Users className="size-6" />}
                title="Aucun employé"
                description="Invitez vos premiers collaborateurs pour commencer."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    <th className="px-5 py-3">Membre</th>
                    <th className="px-5 py-3">Poste</th>
                    <th className="px-5 py-3">Rôle</th>
                    <th className="px-5 py-3">Statut</th>
                    {canManage && <th className="px-5 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {memberships.map((m) => {
                    const name = fullName(m.user.firstName, m.user.lastName);
                    const isSelf = m.userId === user.id;
                    const showActions = canManage && !m.isOwner && !isSelf;
                    const showRoleSelect = canPerms && !m.isOwner;
                    return (
                      <tr key={m.id} className="align-middle">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              firstName={m.user.firstName}
                              lastName={m.user.lastName}
                              src={m.user.avatarUrl}
                              size={36}
                            />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-[var(--foreground)]">
                                {name}
                                {isSelf && <span className="ml-1 text-xs font-normal text-[var(--muted)]">(vous)</span>}
                              </p>
                              <p className="truncate text-xs text-[var(--muted)]">{m.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[var(--muted)]">{m.jobTitle || "—"}</td>
                        <td className="px-5 py-3">
                          {m.isOwner ? (
                            <Badge tone="success">Propriétaire</Badge>
                          ) : showRoleSelect ? (
                            <RoleSelect membershipId={m.id} currentRoleId={m.roleId} roles={roleOptions} />
                          ) : m.role ? (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                              style={{ backgroundColor: `${m.role.color}1a`, color: m.role.color }}
                            >
                              <span className="size-1.5 rounded-full" style={{ backgroundColor: m.role.color }} />
                              {m.role.name}
                            </span>
                          ) : (
                            <span className="text-xs text-[var(--muted)]">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {m.isOwner ? (
                            <MembershipStatusBadge status="ACTIVE" />
                          ) : (
                            <MembershipStatusBadge status={m.status} />
                          )}
                        </td>
                        {canManage && (
                          <td className="px-5 py-3 text-right">
                            {showActions ? (
                              <EmployeeActions
                                membershipId={m.id}
                                isActive={m.status === "ACTIVE"}
                                name={name}
                              />
                            ) : (
                              <span className="text-xs text-[var(--muted-2)]">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {canManage && (
        <Card className="mt-6">
          <CardHeader
            title="Invitations en attente"
            subtitle="Personnes invitées qui n'ont pas encore rejoint l'entreprise"
          />
          <CardBody className="p-0">
            {invitations.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState
                  icon={<Mail className="size-6" />}
                  title="Aucune invitation en attente"
                  description="Les invitations envoyées apparaîtront ici jusqu'à leur acceptation."
                />
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {invitations.map((inv) => (
                  <li key={inv.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]">
                      <Mail className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--foreground)]">{inv.email}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                        {inv.role && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
                            style={{ backgroundColor: `${inv.role.color}1a`, color: inv.role.color }}
                          >
                            {inv.role.name}
                          </span>
                        )}
                        <span>Invité le {formatDate(inv.createdAt)}</span>
                        {inv.expiresAt && (
                          <span className="inline-flex items-center gap-1 text-[var(--warning)]">
                            <Clock className="size-3" />
                            Expire le {formatDate(inv.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <form action={revokeInvitationAction} className="shrink-0">
                      <input type="hidden" name="invitationId" value={inv.id} />
                      <button type="submit" className={buttonClass("ghost", "sm")}>
                        <X className="size-3.5" />
                        Annuler
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
