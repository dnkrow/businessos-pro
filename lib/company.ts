import { prisma } from "./db";
import { SYSTEM_ROLE_TEMPLATES } from "./constants";

/** Crée les rôles système (Administrateur, Directeur, Manager, Employé) pour une entreprise. */
export async function createSystemRoles(companyId: string) {
  let defaultRoleId: string | null = null;
  for (const tpl of SYSTEM_ROLE_TEMPLATES) {
    const role = await prisma.role.create({
      data: {
        companyId,
        name: tpl.name,
        description: tpl.description,
        color: tpl.color,
        permissions: JSON.stringify(tpl.permissions),
        isSystem: true,
        isDefault: tpl.isDefault ?? false,
      },
    });
    if (tpl.isDefault) defaultRoleId = role.id;
  }
  return defaultRoleId;
}

/** Crée un abonnement d'essai par défaut. */
export async function createTrialSubscription(companyId: string) {
  return prisma.subscription.create({
    data: {
      companyId,
      plan: "TRIAL",
      status: "TRIALING",
      seats: 5,
      priceMonthly: 0,
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
}
