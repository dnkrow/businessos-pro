"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { requireUser, requireActiveCompany } from "@/lib/guards";
import { createSystemRoles, createTrialSubscription } from "@/lib/company";
import { getRequestContext } from "@/lib/request-context";
import { logAudit } from "@/lib/audit";
import { notifySuperAdmins, notify } from "@/lib/notifications";
import { assertCan, ACTIVE_COMPANY_COOKIE } from "@/lib/rbac";
import { companySchema, fieldErrors } from "@/lib/validation";
import { APP_NAME } from "@/lib/constants";
import type { FormState } from "./types";

export async function createCompanyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = companySchema.safeParse({
    registrationType: formData.get("registrationType") || "NEW",
    legalName: formData.get("legalName"),
    tradeName: formData.get("tradeName") || "",
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website") || "",
    activity: formData.get("activity"),
    logoUrl: formData.get("logoUrl") || "",
    locale: formData.get("locale") || "fr",
    currency: formData.get("currency") || "EUR",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error), error: "Veuillez corriger les champs en rouge." };
  }
  const d = parsed.data;
  const ctx = await getRequestContext();

  const company = await prisma.company.create({
    data: {
      legalName: d.legalName,
      tradeName: d.tradeName || null,
      registrationType: d.registrationType,
      address: d.address,
      city: d.city,
      postalCode: d.postalCode,
      country: d.country,
      phone: d.phone,
      email: d.email,
      website: d.website || null,
      activity: d.activity,
      logoUrl: d.logoUrl || null,
      locale: d.locale,
      currency: d.currency,
      status: "PENDING",
      ownerId: user.id,
    },
  });

  await createSystemRoles(company.id);
  const adminRole = await prisma.role.findFirst({ where: { companyId: company.id, name: "Administrateur" } });
  await prisma.membership.create({
    data: { userId: user.id, companyId: company.id, roleId: adminRole?.id, isOwner: true, jobTitle: "Dirigeant", status: "ACTIVE" },
  });
  await createTrialSubscription(company.id);

  await logAudit({ userId: user.id, companyId: company.id, action: "company.created", actorLabel: `${user.firstName} ${user.lastName}`, ipAddress: ctx.ipAddress, metadata: { legalName: d.legalName, type: d.registrationType } });
  await notifySuperAdmins({
    type: "INFO",
    title: "Nouvelle demande d'inscription",
    body: `${d.legalName} attend une validation.`,
    link: "/admin/requests",
  });
  await notify({ userId: user.id, type: "INFO", title: "Demande envoyée", body: `Votre entreprise « ${d.legalName} » a été soumise pour validation par l'équipe ${APP_NAME}.` });

  const store = await cookies();
  store.set(ACTIVE_COMPANY_COOKIE, company.id, { path: "/", httpOnly: false });

  redirect("/pending");
}

export async function updateCompanyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "company.edit");

  const parsed = companySchema.safeParse({
    registrationType: ctx.company.status === "APPROVED" ? "NEW" : "NEW",
    legalName: formData.get("legalName"),
    tradeName: formData.get("tradeName") || "",
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website") || "",
    activity: formData.get("activity"),
    logoUrl: formData.get("logoUrl") || "",
    locale: formData.get("locale") || "fr",
    currency: formData.get("currency") || "EUR",
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;

  await prisma.company.update({
    where: { id: ctx.company.id },
    data: {
      legalName: d.legalName,
      tradeName: d.tradeName || null,
      address: d.address,
      city: d.city,
      postalCode: d.postalCode,
      country: d.country,
      phone: d.phone,
      email: d.email,
      website: d.website || null,
      activity: d.activity,
      logoUrl: d.logoUrl || null,
      locale: d.locale,
      currency: d.currency,
    },
  });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "company.updated", actorLabel: `${user.firstName} ${user.lastName}` });
  revalidatePath("/app/company");
  return { ok: true, message: "Informations de l'entreprise mises à jour." };
}

export async function switchCompanyAction(formData: FormData) {
  const companyId = String(formData.get("companyId") || "");
  await requireUser();
  const store = await cookies();
  store.set(ACTIVE_COMPANY_COOKIE, companyId, { path: "/", httpOnly: false });
  redirect("/app");
}
