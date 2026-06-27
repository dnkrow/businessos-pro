import bcrypt from "bcryptjs";

const ROUNDS = 10;

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/** Évaluation simple de robustesse (0-4) pour le feedback UI. */
export function passwordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(4, score);
  const labels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];
  return { score, label: labels[score] };
}
