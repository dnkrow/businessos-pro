import { requireSuperAdmin } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/shell/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireSuperAdmin();
  const pendingCount = await prisma.company.count({
    where: { status: { in: ["PENDING", "INFO_REQUESTED"] } },
  });

  return (
    <AdminShell
      user={{
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        avatarUrl: admin.avatarUrl,
      }}
      pendingCount={pendingCount}
    >
      {children}
    </AdminShell>
  );
}
