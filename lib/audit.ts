import { prisma } from "./db";

type AuditArgs = {
  action: string;
  userId?: string | null;
  companyId?: string | null;
  actorLabel?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
};

/** Journalise une action importante (journal d'audit). */
export async function logAudit(args: AuditArgs) {
  try {
    await prisma.auditLog.create({
      data: {
        action: args.action,
        userId: args.userId ?? null,
        companyId: args.companyId ?? null,
        actorLabel: args.actorLabel ?? null,
        targetType: args.targetType ?? null,
        targetId: args.targetId ?? null,
        metadata: args.metadata ? JSON.stringify(args.metadata) : null,
        ipAddress: args.ipAddress ?? null,
      },
    });
  } catch (e) {
    // Le journal d'audit ne doit jamais casser l'action métier.
    // eslint-disable-next-line no-console
    console.error("logAudit error", e);
  }
}

/** Libellés lisibles des actions auditées. */
export const AUDIT_LABELS: Record<string, string> = {
  "auth.register": "Création de compte",
  "auth.login": "Connexion",
  "auth.logout": "Déconnexion",
  "auth.password_reset_requested": "Demande de réinitialisation du mot de passe",
  "auth.password_reset": "Réinitialisation du mot de passe",
  "auth.email_verified": "Adresse email vérifiée",
  "auth.phone_verified": "Numéro de téléphone vérifié",
  "auth.2fa_enabled": "Double authentification activée",
  "auth.2fa_disabled": "Double authentification désactivée",
  "auth.session_revoked": "Appareil déconnecté",
  "auth.suspicious_login": "Connexion suspecte détectée",
  "company.created": "Entreprise créée",
  "company.updated": "Entreprise modifiée",
  "company.approved": "Entreprise validée",
  "company.rejected": "Entreprise refusée",
  "company.info_requested": "Informations complémentaires demandées",
  "company.suspended": "Entreprise suspendue",
  "company.reactivated": "Entreprise réactivée",
  "employee.invited": "Employé invité",
  "employee.invitation_revoked": "Invitation annulée",
  "employee.role_changed": "Rôle modifié",
  "employee.disabled": "Employé désactivé",
  "employee.enabled": "Employé réactivé",
  "employee.removed": "Employé retiré",
  "role.created": "Rôle créé",
  "role.updated": "Rôle modifié",
  "role.deleted": "Rôle supprimé",
  "establishment.created": "Établissement créé",
  "establishment.updated": "Établissement modifié",
  "establishment.deleted": "Établissement supprimé",
  "establishment.toggled": "Établissement activé/désactivé",
  "document.uploaded": "Document ajouté",
  "user.suspended": "Utilisateur suspendu",
  "user.disabled": "Utilisateur désactivé",
  "user.reactivated": "Utilisateur réactivé",
};

export function auditLabel(action: string) {
  return AUDIT_LABELS[action] ?? action;
}
