import { authenticator } from "otplib";
import QRCode from "qrcode";
import { sha256, randomNumericCode } from "./crypto";
import { APP_NAME } from "./constants";

authenticator.options = { window: 1 }; // tolère ±1 fenêtre de 30s

export function generateTwoFactorSecret() {
  return authenticator.generateSecret();
}

export function otpauthUrl(email: string, secret: string) {
  return authenticator.keyuri(email, APP_NAME, secret);
}

export async function qrCodeDataUrl(otpauth: string) {
  return QRCode.toDataURL(otpauth, { margin: 1, width: 220 });
}

export function verifyTotp(secret: string, token: string) {
  try {
    return authenticator.verify({ token: token.replace(/\s/g, ""), secret });
  } catch {
    return false;
  }
}

/** Génère N codes de secours : version claire (à montrer une fois) + version hashée (à stocker). */
export function generateBackupCodes(count = 8) {
  const plain: string[] = [];
  for (let i = 0; i < count; i++) {
    plain.push(`${randomNumericCode(4)}-${randomNumericCode(4)}`);
  }
  const hashedJson = JSON.stringify(plain.map((c) => sha256(c)));
  return { plain, hashedJson };
}

/** Vérifie un code de secours ; renvoie le JSON mis à jour (code consommé retiré) ou null. */
export function consumeBackupCode(hashedJson: string | null, code: string): string | null {
  if (!hashedJson) return null;
  let hashes: string[];
  try {
    hashes = JSON.parse(hashedJson);
  } catch {
    return null;
  }
  const h = sha256(code.trim());
  if (!hashes.includes(h)) return null;
  return JSON.stringify(hashes.filter((x) => x !== h));
}
