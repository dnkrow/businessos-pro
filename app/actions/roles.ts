"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireActiveCompany } from "@/lib/guards";
import { assertCan } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { roleSchema, fieldErrors } from "@/lib/validation";
import type { FormState } from "./types";

function parsePermissionsFromForm(formData: FormData): string[] {
  return formData.getAll("permissions").map(String);
}

export async function createRoleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "roles.manage");

  const parsed = roleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    color: formData.get("color") || "#6366f1",
    permissions: parsePermissionsFromForm(formData),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const exists = await prisma.role.findFirst({ where: { companyId: ctx.company.id, name: parsed.data.name } });
  if (exists) return { ok: false, fieldErrors: { name: "Un rôle porte déjà ce nom." } };

  const role = await prisma.role.create({
    data: {
      companyId: ctx.company.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      color: parsed.data.color,
      permissions: JSON.stringify(parsed.data.permissions),
      isSystem: false,
    },
  });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "role.created", targetType: "role", targetId: role.id, metadata: { name: role.name } });
  revalidatePath("/app/roles");
  return { ok: true, message: `Rôle « ${role.name} » créé.` };
}

export async function updateRoleAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "roles.manage");
  const roleId = String(formData.get("roleId") || "");

  const role = await prisma.role.findFirst({ where: { id: roleId, companyId: ctx.company.id } });
  if (!role) return { ok: false, error: "Rôle introuvable." };

  const parsed = roleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    color: formData.get("color") || role.color,
    permissions: parsePermissionsFromForm(formData),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  // Un rôle système garde son nom mais ses permissions restent personnalisables
  await prisma.role.update({
    where: { id: roleId },
    data: {
      name: role.isSystem ? role.name : parsed.data.name,
      description: parsed.data.description || null,
      color: parsed.data.color,
      permissions: JSON.stringify(parsed.data.permissions),
    },
  });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "role.updated", targetType: "role", targetId: roleId, metadata: { name: role.name } });
  revalidatePath("/app/roles");
  return { ok: true, message: `Rôle « ${role.name} » mis à jour.` };
}

export async function deleteRoleAction(formData: FormData) {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "roles.manage");
  const roleId = String(formData.get("roleId") || "");

  const role = await prisma.role.findFirst({ where: { id: roleId, companyId: ctx.company.id } });
  if (!role || role.isSystem) {
    revalidatePath("/app/roles");
    return;
  }
  // Réaffecte les membres au rôle par défaut avant suppression
  const defaultRole = await prisma.role.findFirst({ where: { companyId: ctx.company.id, isDefault: true } });
  await prisma.membership.updateMany({ where: { roleId }, data: { roleId: defaultRole?.id ?? null } });
  await prisma.role.delete({ where: { id: roleId } });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "role.deleted", metadata: { name: role.name } });
  revalidatePath("/app/roles");
}
