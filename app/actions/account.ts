"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { getRequestContext } from "@/lib/request-context";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendEmailVerification, sendPhoneVerification, verifyPhoneCode } from "@/lib/tokens";
import {
  generateTwoFactorSecret,
  otpauthUrl,
  qrCodeDataUrl,
  verifyTotp,
  generateBackupCodes,
} from "@/lib/twofactor";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { codeSchema, fieldErrors } from "@/lib/validation";
import type { FormState } from "./types";

// ───────────────────────────── Email

export async function resendEmailVerificationAction(): Promise<FormState> {
  const user = await requireUser();
  if (user.emailVerifiedAt) return { ok: true, message: "Votre email est déjà vérifié." };
  await sendEmailVerification(user.id, user.email);
  return { ok: true, message: "Email de vérification renvoyé. Consultez votre boîte de réception (démo : /dev/inbox)." };
}

// ───────────────────────────── Téléphone

export async function sendPhoneCodeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const phone = String(formData.get("phone") || user.phone || "").trim();
  if (!/^[+0-9 ().-]{6,20}$/.test(phone)) {
    return { ok: false, fieldErrors: { phone: "Numéro de téléphone invalide." } };
  }
  if (phone !== user.phone) {
    await prisma.user.update({ where: { id: user.id }, data: { phone, phoneVerifiedAt: null } });
  }
  await sendPhoneVerification(user.id, phone);
  return { ok: true, message: "Code envoyé par SMS (démo : /dev/inbox).", values: { phone } };
}

export async function verifyPhoneAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = codeSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const ok = await verifyPhoneCode(user.id, parsed.data.code);
  if (!ok) return { ok: false, error: "Code invalide ou expiré." };

  await prisma.user.update({ where: { id: user.id }, data: { phoneVerifiedAt: new Date() } });
  await logAudit({ userId: user.id, action: "auth.phone_verified" });
  await notify({ userId: user.id, type: "SUCCESS", title: "Téléphone vérifié", body: "Votre numéro de téléphone est confirmé." });
  revalidatePath("/app/account");
  revalidatePath("/verify-account");
  return { ok: true, message: "Numéro de téléphone vérifié avec succès." };
}

// ───────────────────────────── Double authentification

/** Prépare l'activation : génère/stocke un secret (non activé) et renvoie le QR. */
export async function startTwoFactorAction(): Promise<{ secret: string; otpauth: string; qr: string }> {
  const user = await requireUser();
  const secret = generateTwoFactorSecret();
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret } });
  const otpauth = otpauthUrl(user.email, secret);
  return { secret, otpauth, qr: await qrCodeDataUrl(otpauth) };
}

export async function confirmTwoFactorAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const code = String(formData.get("code") || "").trim();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser?.twoFactorSecret) return { ok: false, error: "Aucune configuration 2FA en cours. Rechargez la page." };
  if (!verifyTotp(dbUser.twoFactorSecret, code)) {
    return { ok: false, error: "Code invalide. Vérifiez l'heure de votre appareil et réessayez." };
  }
  const { plain, hashedJson } = generateBackupCodes();
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true, twoFactorBackupCodes: hashedJson },
  });
  await logAudit({ userId: user.id, action: "auth.2fa_enabled" });
  await notify({ userId: user.id, type: "SUCCESS", title: "Double authentification activée", body: "Votre compte est désormais protégé par la 2FA." });
  revalidatePath("/app/security");
  return { ok: true, message: "Double authentification activée.", values: { backupCodes: plain.join(" ") } };
}

export async function disableTwoFactorAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const password = String(formData.get("password") || "");
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { ok: false, error: "Utilisateur introuvable." };
  if (!(await verifyPassword(password, dbUser.passwordHash))) {
    return { ok: false, error: "Mot de passe incorrect." };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: null },
  });
  await logAudit({ userId: user.id, action: "auth.2fa_disabled" });
  revalidatePath("/app/security");
  return { ok: true, message: "Double authentification désactivée." };
}

// ───────────────────────────── Profil

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const locale = String(formData.get("locale") || "fr");
  if (!firstName || !lastName) {
    return { ok: false, fieldErrors: { firstName: !firstName ? "Prénom requis" : "", lastName: !lastName ? "Nom requis" : "" } };
  }
  await prisma.user.update({ where: { id: user.id }, data: { firstName, lastName, locale } });
  revalidatePath("/app/account");
  return { ok: true, message: "Profil mis à jour." };
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(formData.get("currentPassword") || "");
  const next = String(formData.get("newPassword") || "");
  if (next.length < 8) return { ok: false, fieldErrors: { newPassword: "Au moins 8 caractères." } };

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || !(await verifyPassword(current, dbUser.passwordHash))) {
    return { ok: false, fieldErrors: { currentPassword: "Mot de passe actuel incorrect." } };
  }
  const ctx = await getRequestContext();
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  await logAudit({ userId: user.id, action: "auth.password_reset", actorLabel: "Changement depuis le compte", ipAddress: ctx.ipAddress });
  return { ok: true, message: "Mot de passe modifié." };
}
