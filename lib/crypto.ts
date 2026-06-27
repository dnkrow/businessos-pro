import crypto from "crypto";

/** Token opaque aléatoire (sessions, liens email, invitations). */
export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

/** Code numérique à 6 chiffres (vérification téléphone, 2FA de secours). */
export function randomNumericCode(length = 6) {
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(length, "0");
}

/** Hash SHA-256 (pour stocker tokens/codes sans les exposer en clair). */
export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Comparaison en temps constant. */
export function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
