"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireActiveCompany } from "@/lib/guards";
import { assertCan } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { establishmentSchema, fieldErrors } from "@/lib/validation";
import type { FormState } from "./types";

function payload(formData: FormData) {
  return {
    name: formData.get("name"),
    type: formData.get("type") || "OTHER",
    address: formData.get("address") || "",
    city: formData.get("city") || "",
    postalCode: formData.get("postalCode") || "",
    country: formData.get("country") || "",
    phone: formData.get("phone") || "",
    email: formData.get("email") || "",
  };
}

export async function createEstablishmentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "establishments.manage");
  const parsed = establishmentSchema.safeParse(payload(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const est = await prisma.establishment.create({
    data: {
      companyId: ctx.company.id,
      name: d.name,
      type: d.type,
      address: d.address || null,
      city: d.city || null,
      postalCode: d.postalCode || null,
      country: d.country || null,
      phone: d.phone || null,
      email: d.email || null,
    },
  });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "establishment.created", targetType: "establishment", targetId: est.id, metadata: { name: d.name } });
  revalidatePath("/app/establishments");
  return { ok: true, message: `Établissement « ${d.name} » créé.` };
}

export async function updateEstablishmentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "establishments.manage");
  const id = String(formData.get("establishmentId") || "");
  const est = await prisma.establishment.findFirst({ where: { id, companyId: ctx.company.id } });
  if (!est) return { ok: false, error: "Établissement introuvable." };

  const parsed = establishmentSchema.safeParse(payload(formData));
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;

  await prisma.establishment.update({
    where: { id },
    data: {
      name: d.name, type: d.type,
      address: d.address || null, city: d.city || null, postalCode: d.postalCode || null,
      country: d.country || null, phone: d.phone || null, email: d.email || null,
    },
  });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "establishment.updated", targetType: "establishment", targetId: id, metadata: { name: d.name } });
  revalidatePath("/app/establishments");
  return { ok: true, message: "Établissement mis à jour." };
}

export async function toggleEstablishmentAction(formData: FormData) {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "establishments.manage");
  const id = String(formData.get("establishmentId") || "");
  const est = await prisma.establishment.findFirst({ where: { id, companyId: ctx.company.id } });
  if (!est) return;
  await prisma.establishment.update({ where: { id }, data: { isActive: !est.isActive } });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "establishment.toggled", targetType: "establishment", targetId: id, metadata: { name: est.name, active: !est.isActive } });
  revalidatePath("/app/establishments");
}

export async function deleteEstablishmentAction(formData: FormData) {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "establishments.manage");
  const id = String(formData.get("establishmentId") || "");
  const est = await prisma.establishment.findFirst({ where: { id, companyId: ctx.company.id } });
  if (!est) return;
  await prisma.establishment.delete({ where: { id } });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "establishment.deleted", metadata: { name: est.name } });
  revalidatePath("/app/establishments");
}
