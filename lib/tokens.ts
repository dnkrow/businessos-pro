import { prisma } from "./db";
import { randomToken, randomNumericCode, sha256 } from "./crypto";
import { sendEmail, sendSms } from "./mailer";
import { APP_NAME, VERIFICATION_CODE_TTL_MIN, PASSWORD_RESET_TTL_MIN } from "./constants";
import { getAppUrl } from "./app-url";

const appUrl = getAppUrl;

type TokenType = "EMAIL" | "PHONE" | "PASSWORD_RESET";

async function createToken(userId: string, type: TokenType, rawValue: string, ttlMin: number) {
  // Invalide les anciens tokens non consommés du même type
  await prisma.verificationToken.updateMany({
    where: { userId, type, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  return prisma.verificationToken.create({
    data: {
      userId,
      type,
      codeHash: sha256(rawValue),
      expiresAt: new Date(Date.now() + ttlMin * 60_000),
    },
  });
}

// ───────────────────────────────── Email

export async function sendEmailVerification(userId: string, email: string) {
  const raw = randomToken(24);
  const token = await createToken(userId, "EMAIL", raw, VERIFICATION_CODE_TTL_MIN * 4);
  const link = `${appUrl()}/verify-email?token=${token.id}.${raw}`;
  await sendEmail({
    to: email,
    subject: `${APP_NAME} — Vérifiez votre adresse email`,
    body: "Confirmez votre adresse email pour activer votre compte.",
    link,
  });
}

// ───────────────────────────────── Téléphone

export async function sendPhoneVerification(userId: string, phone: string) {
  const code = randomNumericCode(6);
  await createToken(userId, "PHONE", code, VERIFICATION_CODE_TTL_MIN);
  await sendSms({
    to: phone,
    subject: `${APP_NAME}`,
    body: `Votre code de vérification ${APP_NAME} est : ${code}`,
    code,
  });
}

export async function verifyPhoneCode(userId: string, code: string): Promise<boolean> {
  const token = await prisma.verificationToken.findFirst({
    where: { userId, type: "PHONE", consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!token || token.codeHash !== sha256(code)) return false;
  await prisma.verificationToken.update({
    where: { id: token.id },
    data: { consumedAt: new Date() },
  });
  return true;
}

// ───────────────────────────────── Réinitialisation mot de passe

export async function sendPasswordReset(userId: string, email: string) {
  const raw = randomToken(24);
  const token = await createToken(userId, "PASSWORD_RESET", raw, PASSWORD_RESET_TTL_MIN);
  const link = `${appUrl()}/reset-password?token=${token.id}.${raw}`;
  await sendEmail({
    to: email,
    subject: `${APP_NAME} — Réinitialisation de votre mot de passe`,
    body: "Vous avez demandé à réinitialiser votre mot de passe. Ce lien expire dans 30 minutes.",
    link,
  });
}

// ───────────────────────────────── Consommation des tokens de lien

/** Valide un token de lien au format `id.raw`. Renvoie l'userId si valide. */
export async function consumeLinkToken(
  type: "EMAIL" | "PASSWORD_RESET",
  composite: string,
): Promise<string | null> {
  const [id, raw] = composite.split(".");
  if (!id || !raw) return null;
  const token = await prisma.verificationToken.findUnique({ where: { id } });
  if (
    !token ||
    token.type !== type ||
    token.consumedAt ||
    token.expiresAt < new Date() ||
    token.codeHash !== sha256(raw)
  ) {
    return null;
  }
  await prisma.verificationToken.update({
    where: { id: token.id },
    data: { consumedAt: new Date() },
  });
  return token.userId;
}
