import { Users, Check, X, ShieldCheck } from "lucide-react";
import { requireSuperAdmin } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { setUserStatusAction } from "@/app/actions/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserStatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import { fullName } from "@/lib/utils";

function VerifBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ${
        ok
          ? "bg-[var(--success-soft)] text-[#0f8a63]"
          : "bg-[var(--surface-2)] text-[var(--muted-2)]"
      }`}
      title={ok ? `${label} vérifié` : `${label} non vérifié`}
    >
      {ok ? <Check className="size-3" /> : <X className="size-3" />}
      {label}
    </span>
  );
}

export default async function AdminUsersPage() {
  const admin = await requireSuperAdmin();

  const users = await prisma.user.findMany({
    include: { _count: { select: { memberships: true, ownedCompanies: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Utilisateurs"
        description="Tous les comptes utilisateurs de la plateforme."
      />

      <Card className="overflow-hidden p-0">
        {users.length === 0 ? (
          <EmptyState icon={<Users className="size-6" />} title="Aucun utilisateur" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
                  <th className="px-5 py-3">Utilisateur</th>
                  <th className="px-5 py-3">Téléphone</th>
                  <th className="px-5 py-3">Rôle plateforme</th>
                  <th className="px-5 py-3 text-center">Entreprises</th>
                  <th className="px-5 py-3">Vérifié</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((u) => {
                  const isSelf = u.id === admin.id;
                  const locked = u.isSuperAdmin || isSelf;
                  return (
                    <tr key={u.id} className="hover:bg-[var(--surface-2)]/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar firstName={u.firstName} lastName={u.lastName} src={u.avatarUrl} size={36} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[var(--foreground)]">
                              {fullName(u.firstName, u.lastName)}
                            </p>
                            <p className="truncate text-xs text-[var(--muted)]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[var(--muted)]">{u.phone || "—"}</td>
                      <td className="px-5 py-3">
                        {u.isSuperAdmin ? (
                          <Badge tone="primary" dot>
                            <ShieldCheck className="size-3" /> Super Admin
                          </Badge>
                        ) : (
                          <Badge tone="neutral">Utilisateur</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center font-medium">{u._count.memberships}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <VerifBadge ok={!!u.emailVerifiedAt} label="Email" />
                          <VerifBadge ok={!!u.phoneVerifiedAt} label="Tél." />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <UserStatusBadge status={u.status} />
                      </td>
                      <td className="px-5 py-3">
                        {locked ? (
                          <span className="block text-right text-xs text-[var(--muted-2)]">—</span>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {u.status === "ACTIVE" && (
                              <>
                                <form action={setUserStatusAction}>
                                  <input type="hidden" name="userId" value={u.id} />
                                  <input type="hidden" name="action" value="suspend" />
                                  <ConfirmSubmit
                                    confirm={`Suspendre le compte de ${fullName(u.firstName, u.lastName)} ?`}
                                    variant="secondary"
                                  >
                                    Suspendre
                                  </ConfirmSubmit>
                                </form>
                                <form action={setUserStatusAction}>
                                  <input type="hidden" name="userId" value={u.id} />
                                  <input type="hidden" name="action" value="disable" />
                                  <ConfirmSubmit
                                    confirm={`Désactiver le compte de ${fullName(u.firstName, u.lastName)} ? Ses sessions seront révoquées.`}
                                  >
                                    Désactiver
                                  </ConfirmSubmit>
                                </form>
                              </>
                            )}
                            {(u.status === "SUSPENDED" || u.status === "DISABLED") && (
                              <form action={setUserStatusAction}>
                                <input type="hidden" name="userId" value={u.id} />
                                <input type="hidden" name="action" value="reactivate" />
                                <ConfirmSubmit
                                  confirm={`Réactiver le compte de ${fullName(u.firstName, u.lastName)} ?`}
                                  variant="primary"
                                >
                                  Réactiver
                                </ConfirmSubmit>
                              </form>
                            )}
                          </div>
                        )}
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
