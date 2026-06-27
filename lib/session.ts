import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { randomToken, sha256 } from "./crypto";
import { SESSION_DURATION_DAYS } from "./constants";
import type { RequestContext } from "./request-context";

export const SESSION_COOKIE = "bos_session";

type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  locale: string;
  status: string;
  isSuperAdmin: boolean;
  emailVerifiedAt: Date | null;
  phone: string | null;
  phoneVerifiedAt: Date | null;
  twoFactorEnabled: boolean;
};

/** Crée une session en base et pose le cookie (à appeler dans une server action / route handler). */
export async function createSession(userId: string, ctx: RequestContext) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: sha256(token),
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
      deviceLabel: ctx.deviceLabel,
      browser: ctx.browser,
      os: ctx.os,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Renvoie l'utilisateur connecté (ou null) à partir du cookie de session. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (session.user.status === "DISABLED") return null;

  // Met à jour la dernière activité (au plus une fois par minute).
  if (Date.now() - session.lastActiveAt.getTime() > 60_000) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    });
  }

  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    avatarUrl: u.avatarUrl,
    locale: u.locale,
    status: u.status,
    isSuperAdmin: u.isSuperAdmin,
    emailVerifiedAt: u.emailVerifiedAt,
    phone: u.phone,
    phoneVerifiedAt: u.phoneVerifiedAt,
    twoFactorEnabled: u.twoFactorEnabled,
  };
}

/** Identifiant de la session courante (pour marquer « cet appareil-ci »). */
export async function getCurrentSessionId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    select: { id: true },
  });
  return session?.id ?? null;
}

/** Déconnexion : révoque la session courante et supprime le cookie. */
export async function destroyCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session
      .updateMany({
        where: { tokenHash: sha256(token), revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => {});
  }
  store.delete(SESSION_COOKIE);
}

/** Révoque toutes les sessions d'un utilisateur (ex : après reset mot de passe). */
export async function revokeAllSessions(userId: string, exceptId?: string) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null, ...(exceptId ? { id: { not: exceptId } } : {}) },
    data: { revokedAt: new Date() },
  });
}
