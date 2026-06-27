/**
 * URL publique de l'application, pour générer des liens absolus
 * (vérification email, invitations, réinitialisation de mot de passe).
 * - APP_URL si défini explicitement
 * - sinon le domaine de production Vercel
 * - sinon l'URL du déploiement Vercel courant
 * - sinon localhost en développement
 */
export function getAppUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
