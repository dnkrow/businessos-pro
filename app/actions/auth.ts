"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroyCurrentSession, revokeAllSessions } from "@/lib/session";
import { getRequestContext } from "@/lib/request-context";
import { sendEmailVerification, sendPasswordReset, consumeLinkToken } from "@/lib/tokens";
import { verifyTotp, consumeBackupCode } from "@/lib/twofactor";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { resolveLandingRoute } from "@/lib/guards";
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
  fieldErrors,
} from "@/lib/validation";
import { MAX_FAILED_LOGINS_WINDOW, FAILED_LOGIN_WINDOW_MIN, APP_NAME } from "@/lib/constants";
import type { FormState } from "./types";

// ───────────────────────────────────────────── Inscription

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const data = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { ok: false, fieldErrors: { email: "Un compte existe déjà avec cette adresse email." } };
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: await hashPassword(data.password),
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
    },
  });

  const ctx = await getRequestContext();
  await sendEmailVerification(user.id, user.email);
  await logAudit({ userId: user.id, action: "auth.register", actorLabel: `${user.firstName} ${user.lastName}`, ipAddress: ctx.ipAddress });
  await prisma.loginEvent.create({ data: { userId: user.id, email: user.email, success: true, reason: "OK", ipAddress: ctx.ipAddress, userAgent: ctx.userAgent } });
  await createSession(user.id, ctx);

  redirect("/verify-account");
}

// ───────────────────────────────────────────── Connexion

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    twoFactorCode: formData.get("twoFactorCode") || "",
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const { email, password, twoFactorCode } = parsed.data;
  const ctx = await getRequestContext();
  const user = await prisma.user.findUnique({ where: { email } });

  const fail = async (reason: string, message: string, extra?: Partial<FormState>) => {
    // Détection de connexions suspectes : trop d'échecs récents
    const since = new Date(Date.now() - FAILED_LOGIN_WINDOW_MIN * 60_000);
    const recentFails = await prisma.loginEvent.count({
      where: { email, success: false, createdAt: { gt: since } },
    });
    const suspicious = recentFails + 1 >= MAX_FAILED_LOGINS_WINDOW;
    await prisma.loginEvent.create({
      data: { userId: user?.id ?? null, email, success: false, reason, ipAddress: ctx.ipAddress, userAgent: ctx.userAgent, suspicious },
    });
    if (suspicious && user) {
      await logAudit({ userId: user.id, action: "auth.suspicious_login", actorLabel: email, ipAddress: ctx.ipAddress });
      await notify({ userId: user.id, type: "DANGER", title: "Tentatives de connexion suspectes", body: `Plusieurs échecs de connexion détectés depuis ${ctx.ipAddress}.`, link: "/app/security" });
    }
    return {
      ok: false as const,
      error: message,
      values: { email },
      ...extra,
    };
  };

  if (!user) return fail("UNKNOWN_USER", "Email ou mot de passe incorrect.");
  if (user.status === "DISABLED") return fail("ACCOUNT_DISABLED", "Ce compte a été désactivé. Contactez le support.");
  if (user.status === "SUSPENDED") return fail("ACCOUNT_DISABLED", "Ce compte est suspendu. Contactez le support BusinessOS Pro.");

  const okPw = await verifyPassword(password, user.passwordHash);
  if (!okPw) return fail("BAD_PASSWORD", "Email ou mot de passe incorrect.");

  // Double authentification
  if (user.twoFactorEnabled) {
    if (!twoFactorCode) {
      return { ok: false, needs2fa: true, values: { email, password } };
    }
    const totpOk = verifyTotp(user.twoFactorSecret ?? "", twoFactorCode);
    let backupOk = false;
    if (!totpOk) {
      const updated = consumeBackupCode(user.twoFactorBackupCodes, twoFactorCode);
      if (updated) {
        backupOk = true;
        await prisma.user.update({ where: { id: user.id }, data: { twoFactorBackupCodes: updated } });
      }
    }
    if (!totpOk && !backupOk) {
      return fail("2FA_FAILED", "Code de double authentification invalide.", { needs2fa: true, values: { email, password } });
    }
  }

  await prisma.loginEvent.create({ data: { userId: user.id, email, success: true, reason: "OK", ipAddress: ctx.ipAddress, userAgent: ctx.userAgent } });
  await logAudit({ userId: user.id, action: "auth.login", actorLabel: `${user.firstName} ${user.lastName}`, ipAddress: ctx.ipAddress });
  await createSession(user.id, ctx);

  const dest = await resolveLandingRoute(user.id);
  redirect(dest);
}

// ───────────────────────────────────────────── Déconnexion

export async function logoutAction() {
  const ctx = await getRequestContext();
  const { getCurrentUser } = await import("@/lib/session");
  const u = await getCurrentUser();
  if (u) await logAudit({ userId: u.id, action: "auth.logout", actorLabel: `${u.firstName} ${u.lastName}`, ipAddress: ctx.ipAddress });
  await destroyCurrentSession();
  redirect("/login");
}

// ───────────────────────────────────────────── Mot de passe oublié

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    await sendPasswordReset(user.id, user.email);
    await logAudit({ userId: user.id, action: "auth.password_reset_requested", actorLabel: user.email });
  }
  // Pas d'énumération de comptes : toujours le même message
  return {
    ok: true,
    message: "Si un compte existe avec cette adresse, un email de réinitialisation vient d'être envoyé.",
  };
}

// ───────────────────────────────────────────── Réinitialisation

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const userId = await consumeLinkToken("PASSWORD_RESET", parsed.data.token);
  if (!userId) {
    return { ok: false, error: "Ce lien est invalide ou a expiré. Veuillez refaire une demande." };
  }
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });
  await revokeAllSessions(userId);
  await logAudit({ userId, action: "auth.password_reset" });
  redirect("/login?reset=1");
}

// ───────────────────────────────────────────── Vérification email (depuis la page)

export async function verifyEmailToken(token: string): Promise<"OK" | "INVALID"> {
  const userId = await consumeLinkToken("EMAIL", token);
  if (!userId) return "INVALID";
  await prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  await logAudit({ userId, action: "auth.email_verified" });
  await notify({ userId, type: "SUCCESS", title: "Email vérifié", body: `Votre adresse email est confirmée. Bienvenue sur ${APP_NAME}.` });
  return "OK";
}
