import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { PermissionKey } from "./constants";

export const ACTIVE_COMPANY_COOKIE = "bos_company";

export function parsePermissions(json: string | null | undefined): PermissionKey[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? (arr as PermissionKey[]) : [];
  } catch {
    return [];
  }
}

export type ActiveContext = {
  membership: {
    id: string;
    isOwner: boolean;
    status: string;
    jobTitle: string | null;
  };
  company: {
    id: string;
    legalName: string;
    tradeName: string | null;
    logoUrl: string | null;
    status: string;
    currency: string;
    locale: string;
  };
  role: { id: string; name: string; color: string } | null;
  permissions: PermissionKey[];
};

/** Toutes les adhésions de l'utilisateur (entreprises dont il est membre). */
export async function getMemberships(userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    include: { company: true, role: true },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Résout l'entreprise « active » :
 * - parmi les entreprises VALIDÉES où le membre est ACTIF
 * - sélection mémorisée via cookie, sinon première dispo.
 */
export async function resolveActiveCompany(userId: string): Promise<ActiveContext | null> {
  const memberships = await prisma.membership.findMany({
    where: { userId, status: "ACTIVE", company: { status: "APPROVED" } },
    include: { company: true, role: true },
    orderBy: { createdAt: "asc" },
  });
  if (memberships.length === 0) return null;

  const store = await cookies();
  const wanted = store.get(ACTIVE_COMPANY_COOKIE)?.value;
  const chosen = memberships.find((m) => m.companyId === wanted) ?? memberships[0];

  const permissions = chosen.isOwner
    ? // Le propriétaire a toutes les permissions
      (await import("./constants")).ALL_PERMISSIONS
    : parsePermissions(chosen.role?.permissions);

  return {
    membership: {
      id: chosen.id,
      isOwner: chosen.isOwner,
      status: chosen.status,
      jobTitle: chosen.jobTitle,
    },
    company: {
      id: chosen.company.id,
      legalName: chosen.company.legalName,
      tradeName: chosen.company.tradeName,
      logoUrl: chosen.company.logoUrl,
      status: chosen.company.status,
      currency: chosen.company.currency,
      locale: chosen.company.locale,
    },
    role: chosen.role
      ? { id: chosen.role.id, name: chosen.role.name, color: chosen.role.color }
      : null,
    permissions,
  };
}

export function can(ctx: ActiveContext | null, permission: PermissionKey): boolean {
  if (!ctx) return false;
  if (ctx.membership.isOwner) return true;
  return ctx.permissions.includes(permission);
}

/** Variante stricte : lève une erreur si la permission manque (pour les actions). */
export function assertCan(ctx: ActiveContext | null, permission: PermissionKey) {
  if (!can(ctx, permission)) {
    throw new Error("Permission refusée : vous n'avez pas accès à cette action.");
  }
}
