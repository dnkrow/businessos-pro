import "server-only";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getCurrentUser } from "./session";
import { resolveActiveCompany, type ActiveContext, can } from "./rbac";
import type { PermissionKey } from "./constants";

/** Exige un utilisateur connecté, sinon redirige vers /login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Exige un Super Administrateur BusinessOS Pro. */
export async function requireSuperAdmin() {
  const user = await requireUser();
  if (!user.isSuperAdmin) redirect("/app");
  return user;
}

/**
 * Détermine où envoyer l'utilisateur après authentification :
 * - super admin sans entreprise → /admin
 * - entreprise validée → /app
 * - entreprise en attente/refusée → /pending
 * - aucune entreprise → /onboarding
 */
export async function resolveLandingRoute(userId: string): Promise<string> {
  const ctx = await resolveActiveCompany(userId);
  if (ctx) return "/app";

  const anyMembership = await prisma.membership.findFirst({ where: { userId } });
  if (anyMembership) return "/pending";

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.isSuperAdmin) return "/admin";

  return "/onboarding";
}

/**
 * Exige une entreprise active validée. Sinon redirige selon l'état.
 */
export async function requireActiveCompany(): Promise<{
  user: Awaited<ReturnType<typeof requireUser>>;
  ctx: ActiveContext;
}> {
  const user = await requireUser();
  const ctx = await resolveActiveCompany(user.id);
  if (ctx) return { user, ctx };

  const anyMembership = await prisma.membership.findFirst({ where: { userId: user.id } });
  if (anyMembership) redirect("/pending");
  redirect("/onboarding");
}

/** Garde de permission au niveau d'une page (renvoie un booléen pour affichage conditionnel). */
export function requirePermission(ctx: ActiveContext, permission: PermissionKey) {
  if (!can(ctx, permission)) {
    redirect("/app?denied=1");
  }
}
