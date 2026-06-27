// Catalogue central des valeurs « enum » (SQLite n'a pas d'enums Prisma)
// et des référentiels métier (permissions, rôles, plans, pays, devises...).

export const APP_NAME = "BusinessOS Pro";

// ───────────────────────────────────────────── Statuts

export const COMPANY_STATUS = {
  PENDING: "PENDING",
  INFO_REQUESTED: "INFO_REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;
export type CompanyStatus = keyof typeof COMPANY_STATUS;

export const COMPANY_STATUS_META: Record<
  CompanyStatus,
  { label: string; tone: "neutral" | "warning" | "success" | "danger" | "info" }
> = {
  PENDING: { label: "En attente de validation", tone: "warning" },
  INFO_REQUESTED: { label: "Informations demandées", tone: "info" },
  APPROVED: { label: "Validée", tone: "success" },
  REJECTED: { label: "Refusée", tone: "danger" },
  SUSPENDED: { label: "Suspendue", tone: "danger" },
};

export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DISABLED: "DISABLED",
} as const;
export type UserStatus = keyof typeof USER_STATUS;

export const USER_STATUS_META: Record<
  UserStatus,
  { label: string; tone: "success" | "warning" | "danger" }
> = {
  ACTIVE: { label: "Actif", tone: "success" },
  SUSPENDED: { label: "Suspendu", tone: "warning" },
  DISABLED: { label: "Désactivé", tone: "danger" },
};

export const MEMBERSHIP_STATUS = {
  INVITED: "INVITED",
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;
export type MembershipStatus = keyof typeof MEMBERSHIP_STATUS;

export const MEMBERSHIP_STATUS_META: Record<
  MembershipStatus,
  { label: string; tone: "success" | "warning" | "danger" }
> = {
  INVITED: { label: "Invitation envoyée", tone: "warning" },
  ACTIVE: { label: "Actif", tone: "success" },
  DISABLED: { label: "Désactivé", tone: "danger" },
};

export const INVITATION_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REVOKED: "REVOKED",
  EXPIRED: "EXPIRED",
} as const;

// ───────────────────────────────────────────── Permissions (RBAC)

export type PermissionKey =
  | "company.view"
  | "company.edit"
  | "employees.view"
  | "employees.manage"
  | "employees.permissions"
  | "roles.view"
  | "roles.manage"
  | "establishments.view"
  | "establishments.manage"
  | "security.view"
  | "subscription.view"
  | "subscription.manage";

export const PERMISSION_GROUPS: {
  group: string;
  permissions: { key: PermissionKey; label: string; description: string }[];
}[] = [
  {
    group: "Entreprise",
    permissions: [
      { key: "company.view", label: "Voir l'entreprise", description: "Consulter les informations de l'entreprise" },
      { key: "company.edit", label: "Modifier l'entreprise", description: "Éditer le profil, le logo, les coordonnées" },
    ],
  },
  {
    group: "Employés",
    permissions: [
      { key: "employees.view", label: "Voir les employés", description: "Consulter la liste des employés" },
      { key: "employees.manage", label: "Gérer les employés", description: "Inviter, désactiver, modifier les employés" },
      { key: "employees.permissions", label: "Gérer les permissions", description: "Changer le rôle et les permissions des employés" },
    ],
  },
  {
    group: "Rôles",
    permissions: [
      { key: "roles.view", label: "Voir les rôles", description: "Consulter les rôles et permissions" },
      { key: "roles.manage", label: "Gérer les rôles", description: "Créer, modifier et supprimer des rôles personnalisés" },
    ],
  },
  {
    group: "Établissements",
    permissions: [
      { key: "establishments.view", label: "Voir les établissements", description: "Consulter les établissements" },
      { key: "establishments.manage", label: "Gérer les établissements", description: "Créer, modifier, activer/désactiver" },
    ],
  },
  {
    group: "Sécurité",
    permissions: [
      { key: "security.view", label: "Voir la sécurité", description: "Consulter les journaux d'audit de l'entreprise" },
    ],
  },
  {
    group: "Abonnement",
    permissions: [
      { key: "subscription.view", label: "Voir l'abonnement", description: "Consulter le plan et la facturation" },
      { key: "subscription.manage", label: "Gérer l'abonnement", description: "Changer de plan, gérer les sièges" },
    ],
  },
];

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key),
);

export const PERMISSION_LABELS: Record<PermissionKey, string> = Object.fromEntries(
  PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => [p.key, p.label])),
) as Record<PermissionKey, string>;

// ───────────────────────────────────────────── Modèles de rôles (par entreprise)

export const SYSTEM_ROLE_TEMPLATES: {
  name: string;
  description: string;
  color: string;
  permissions: PermissionKey[];
  isDefault?: boolean;
}[] = [
  {
    name: "Administrateur",
    description: "Accès complet à toutes les fonctionnalités de l'entreprise",
    color: "#6366f1",
    permissions: [...ALL_PERMISSIONS],
  },
  {
    name: "Directeur",
    description: "Gestion opérationnelle complète, sans la facturation",
    color: "#0ea5e9",
    permissions: [
      "company.view",
      "company.edit",
      "employees.view",
      "employees.manage",
      "employees.permissions",
      "roles.view",
      "establishments.view",
      "establishments.manage",
      "security.view",
      "subscription.view",
    ],
  },
  {
    name: "Manager",
    description: "Encadrement des équipes et des établissements",
    color: "#10b981",
    permissions: [
      "company.view",
      "employees.view",
      "employees.manage",
      "roles.view",
      "establishments.view",
      "establishments.manage",
    ],
  },
  {
    name: "Employé",
    description: "Accès de base à l'espace de l'entreprise",
    color: "#64748b",
    permissions: ["company.view", "establishments.view"],
    isDefault: true,
  },
];

// ───────────────────────────────────────────── Établissements

export const ESTABLISHMENT_TYPES = {
  HEADQUARTERS: "HEADQUARTERS",
  WAREHOUSE: "WAREHOUSE",
  STORE: "STORE",
  RESTAURANT: "RESTAURANT",
  OFFICE: "OFFICE",
  OTHER: "OTHER",
} as const;
export type EstablishmentType = keyof typeof ESTABLISHMENT_TYPES;

export const ESTABLISHMENT_TYPE_META: Record<
  EstablishmentType,
  { label: string; icon: string }
> = {
  HEADQUARTERS: { label: "Siège social", icon: "Building2" },
  WAREHOUSE: { label: "Entrepôt", icon: "Warehouse" },
  STORE: { label: "Magasin", icon: "Store" },
  RESTAURANT: { label: "Restaurant", icon: "UtensilsCrossed" },
  OFFICE: { label: "Bureau", icon: "Briefcase" },
  OTHER: { label: "Autre", icon: "MapPin" },
};

// ───────────────────────────────────────────── Abonnements

export const PLAN_META: Record<
  string,
  { label: string; priceMonthly: number; seats: number; features: string[] }
> = {
  TRIAL: { label: "Essai", priceMonthly: 0, seats: 5, features: ["14 jours d'essai", "5 utilisateurs", "1 établissement"] },
  STARTER: { label: "Starter", priceMonthly: 2900, seats: 10, features: ["10 utilisateurs", "3 établissements", "Support email"] },
  PRO: { label: "Pro", priceMonthly: 7900, seats: 50, features: ["50 utilisateurs", "Établissements illimités", "Support prioritaire", "Audit avancé"] },
  ENTERPRISE: { label: "Entreprise", priceMonthly: 19900, seats: 1000, features: ["Utilisateurs illimités", "SSO", "SLA dédié", "Account manager"] },
};

export const SUBSCRIPTION_STATUS_META: Record<
  string,
  { label: string; tone: "success" | "warning" | "danger" | "info" }
> = {
  TRIALING: { label: "Période d'essai", tone: "info" },
  ACTIVE: { label: "Actif", tone: "success" },
  PAST_DUE: { label: "Paiement en retard", tone: "warning" },
  CANCELED: { label: "Annulé", tone: "danger" },
};

// ───────────────────────────────────────────── Référentiels (pays, devises, langues, activités)

export const COUNTRIES = [
  "France", "Belgique", "Suisse", "Luxembourg", "Canada", "Maroc", "Tunisie",
  "Algérie", "Sénégal", "Côte d'Ivoire", "Allemagne", "Espagne", "Italie",
  "Portugal", "Royaume-Uni", "Pays-Bas", "États-Unis", "Autre",
];

export const CURRENCIES = [
  { code: "EUR", label: "Euro (€)", symbol: "€" },
  { code: "USD", label: "Dollar US ($)", symbol: "$" },
  { code: "GBP", label: "Livre sterling (£)", symbol: "£" },
  { code: "CHF", label: "Franc suisse (CHF)", symbol: "CHF" },
  { code: "CAD", label: "Dollar canadien (CA$)", symbol: "CA$" },
  { code: "MAD", label: "Dirham marocain (DH)", symbol: "DH" },
  { code: "XOF", label: "Franc CFA (FCFA)", symbol: "FCFA" },
];

export const LOCALES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
];

export const ACTIVITIES = [
  "Commerce de détail", "Restauration", "Hôtellerie", "BTP / Construction",
  "Services informatiques", "Conseil", "Santé", "Industrie", "Logistique / Transport",
  "Immobilier", "Finance / Assurance", "Éducation / Formation", "Artisanat",
  "Agriculture", "E-commerce", "Marketing / Communication", "Autre",
];

// ───────────────────────────────────────────── Sécurité

export const SESSION_DURATION_DAYS = 30;
export const VERIFICATION_CODE_TTL_MIN = 15;
export const PASSWORD_RESET_TTL_MIN = 30;
export const INVITATION_TTL_DAYS = 7;
export const MAX_FAILED_LOGINS_WINDOW = 5; // tentatives échouées avant marquage « suspect »
export const FAILED_LOGIN_WINDOW_MIN = 15;
