import { z } from "zod";
import {
  ALL_PERMISSIONS,
  COUNTRIES,
  CURRENCIES,
  LOCALES,
  ESTABLISHMENT_TYPES,
} from "./constants";

const email = z.string().trim().toLowerCase().email("Adresse email invalide");
const password = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(100, "Mot de passe trop long");
const phone = z
  .string()
  .trim()
  .regex(/^[+0-9 ().-]{6,20}$/, "Numéro de téléphone invalide");

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(60),
  lastName: z.string().trim().min(1, "Nom requis").max(60),
  email,
  phone: phone.optional().or(z.literal("")),
  password,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Mot de passe requis"),
  twoFactorCode: z.string().trim().optional(),
});

export const forgotSchema = z.object({ email });

export const resetSchema = z.object({
  token: z.string().min(10),
  password,
});

export const codeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Code à 6 chiffres requis"),
});

export const companySchema = z.object({
  registrationType: z.enum(["NEW", "EXISTING"]),
  legalName: z.string().trim().min(1, "Nom de l'entreprise requis").max(120),
  tradeName: z.string().trim().max(120).optional().or(z.literal("")),
  address: z.string().trim().min(1, "Adresse requise").max(200),
  city: z.string().trim().min(1, "Ville requise").max(100),
  postalCode: z.string().trim().min(1, "Code postal requis").max(20),
  country: z.enum(COUNTRIES as [string, ...string[]]),
  phone,
  email,
  website: z
    .string()
    .trim()
    .url("URL invalide (ex : https://exemple.com)")
    .optional()
    .or(z.literal("")),
  activity: z.string().trim().min(1, "Activité requise"),
  logoUrl: z.string().trim().optional().or(z.literal("")),
  locale: z.enum(LOCALES.map((l) => l.code) as [string, ...string[]]),
  currency: z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]]),
});
export type CompanyInput = z.infer<typeof companySchema>;

export const inviteSchema = z.object({
  email,
  firstName: z.string().trim().max(60).optional().or(z.literal("")),
  lastName: z.string().trim().max(60).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(80).optional().or(z.literal("")),
  roleId: z.string().min(1, "Rôle requis"),
});

export const roleSchema = z.object({
  name: z.string().trim().min(1, "Nom du rôle requis").max(50),
  description: z.string().trim().max(200).optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur invalide").default("#6366f1"),
  permissions: z
    .array(z.enum(ALL_PERMISSIONS as [string, ...string[]]))
    .default([]),
});

export const establishmentSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(120),
  type: z.enum(Object.keys(ESTABLISHMENT_TYPES) as [string, ...string[]]),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  postalCode: z.string().trim().max(20).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Email invalide").optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  companyId: z.string().min(1),
  decision: z.enum(["APPROVE", "REJECT", "INFO"]),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

/** Helper : transforme une erreur Zod en map { champ: message }. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
