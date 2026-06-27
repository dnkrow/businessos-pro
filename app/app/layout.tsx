import { requireActiveCompany } from "@/lib/guards";
import { getMemberships } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/shell/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, ctx } = await requireActiveCompany();
  const memberships = await getMemberships(user.id);
  const unread = await prisma.notification.count({ where: { userId: user.id, read: false } });

  const companyList = memberships
    .filter((m) => m.status === "ACTIVE" && m.company.status === "APPROVED")
    .map((m) => ({
      id: m.company.id,
      legalName: m.company.legalName,
      tradeName: m.company.tradeName,
      logoUrl: m.company.logoUrl,
    }));

  return (
    <AppShell
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isSuperAdmin: user.isSuperAdmin,
      }}
      company={ctx.company}
      role={ctx.role}
      memberships={companyList}
      permissions={ctx.permissions}
      isOwner={ctx.membership.isOwner}
      unread={unread}
    >
      {children}
    </AppShell>
  );
}
