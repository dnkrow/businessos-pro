import { Plus, Users, ShieldCheck } from "lucide-react";
import { requireActiveCompany, requirePermission } from "@/lib/guards";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import {
  PERMISSION_LABELS,
  ALL_PERMISSIONS,
  type PermissionKey,
} from "@/lib/constants";
import { RoleModal } from "./role-modal";
import { DeleteRole } from "./delete-role";

function parsePermissions(raw: string): PermissionKey[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((p): p is PermissionKey => typeof p === "string");
  } catch {
    return [];
  }
}

export default async function RolesPage() {
  const { ctx } = await requireActiveCompany();
  requirePermission(ctx, "roles.view");
  const canManage = can(ctx, "roles.manage");

  const roles = await prisma.role.findMany({
    where: { companyId: ctx.company.id },
    include: { _count: { select: { memberships: true } } },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Rôles & permissions"
        description="Définissez des rôles personnalisés et leurs permissions."
        action={
          canManage ? (
            <RoleModal
              mode="create"
              trigger={
                <Button>
                  <Plus className="size-4" />
                  Créer un rôle
                </Button>
              }
            />
          ) : undefined
        }
      />

      {roles.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="size-6" />}
          title="Aucun rôle"
          description="Créez votre premier rôle personnalisé pour structurer les permissions de votre équipe."
          action={
            canManage ? (
              <RoleModal
                mode="create"
                trigger={
                  <Button>
                    <Plus className="size-4" />
                    Créer un rôle
                  </Button>
                }
              />
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => {
            const perms = parsePermissions(role.permissions);
            const hasAll = ALL_PERMISSIONS.every((p) => perms.includes(p));
            const memberCount = role._count.memberships;

            return (
              <div key={role.id} className="card flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 size-3 shrink-0 rounded-full ring-2 ring-[var(--surface)]"
                    style={{ backgroundColor: role.color }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-[var(--foreground)]">
                        {role.name}
                      </h3>
                      {role.isSystem && <Badge tone="neutral">Système</Badge>}
                      {role.isDefault && <Badge tone="primary">Par défaut</Badge>}
                    </div>
                    {role.description && (
                      <p className="mt-1 text-sm text-[var(--muted)]">{role.description}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <Users className="size-3.5" />
                  <span>
                    {memberCount} membre{memberCount > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mt-4 flex-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
                    Permissions
                  </p>
                  {perms.length === 0 ? (
                    <p className="text-xs text-[var(--muted)]">Aucune permission accordée.</p>
                  ) : hasAll ? (
                    <Badge tone="success">Toutes les permissions</Badge>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {perms.map((p) => (
                        <Badge key={p} tone="neutral">
                          {PERMISSION_LABELS[p] ?? p}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {canManage && (
                  <div className="mt-4 flex items-center justify-end gap-1 border-t border-[var(--border)] pt-3">
                    <RoleModal
                      mode="edit"
                      role={{
                        id: role.id,
                        name: role.name,
                        description: role.description,
                        color: role.color,
                        isSystem: role.isSystem,
                        permissions: perms,
                      }}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Modifier
                        </Button>
                      }
                    />
                    {!role.isSystem && <DeleteRole roleId={role.id} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
