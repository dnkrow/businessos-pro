"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireActiveCompany, requireUser } from "@/lib/guards";
import { assertCan } from "@/lib/rbac";
import { getRequestContext } from "@/lib/request-context";
import { randomToken, sha256 } from "@/lib/crypto";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { sendEmail } from "@/lib/mailer";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { inviteSchema, fieldErrors } from "@/lib/validation";
import { INVITATION_TTL_DAYS, APP_NAME } from "@/lib/constants";
import { getAppUrl } from "@/lib/app-url";
import type { FormState } from "./types";

const appUrl = getAppUrl;

export async function inviteEmployeeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "employees.manage");

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    firstName: formData.get("firstName") || "",
    lastName: formData.get("lastName") || "",
    jobTitle: formData.get("jobTitle") || "",
    roleId: formData.get("roleId"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const role = await prisma.role.findFirst({ where: { id: d.roleId, companyId: ctx.company.id } });
  if (!role) return { ok: false, fieldErrors: { roleId: "Rôle invalide." } };

  // Déjà membre ?
  const existingUser = await prisma.user.findUnique({ where: { email: d.email } });
  if (existingUser) {
    const member = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: existingUser.id, companyId: ctx.company.id } },
    });
    if (member) return { ok: false, fieldErrors: { email: "Cette personne fait déjà partie de l'entreprise." } };
  }

  const raw = randomToken(20);
  await prisma.invitation.create({
    data: {
      companyId: ctx.company.id,
      email: d.email,
      firstName: d.firstName || null,
      lastName: d.lastName || null,
      jobTitle: d.jobTitle || null,
      roleId: role.id,
      tokenHash: sha256(raw),
      invitedById: user.id,
      expiresAt: new Date(Date.now() + INVITATION_TTL_DAYS * 864e5),
    },
  });

  const link = `${appUrl()}/invitations/${raw}`;
  await sendEmail({
    to: d.email,
    subject: `${APP_NAME} — Invitation à rejoindre ${ctx.company.legalName}`,
    body: `${user.firstName} ${user.lastName} vous invite à rejoindre ${ctx.company.legalName} en tant que ${role.name}.`,
    link,
  });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "employee.invited", actorLabel: `${user.firstName} ${user.lastName}`, targetType: "invitation", metadata: { email: d.email, role: role.name } });

  revalidatePath("/app/employees");
  return { ok: true, message: `Invitation envoyée à ${d.email} (démo : /dev/inbox).` };
}

export async function revokeInvitationAction(formData: FormData) {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "employees.manage");
  const id = String(formData.get("invitationId") || "");
  const inv = await prisma.invitation.findFirst({ where: { id, companyId: ctx.company.id } });
  if (inv) {
    await prisma.invitation.update({ where: { id }, data: { status: "REVOKED" } });
    await logAudit({ userId: user.id, companyId: ctx.company.id, action: "employee.invitation_revoked", metadata: { email: inv.email } });
  }
  revalidatePath("/app/employees");
}

export async function changeEmployeeRoleAction(formData: FormData) {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "employees.permissions");
  const membershipId = String(formData.get("membershipId") || "");
  const roleId = String(formData.get("roleId") || "");

  const membership = await prisma.membership.findFirst({ where: { id: membershipId, companyId: ctx.company.id }, include: { user: true } });
  const role = await prisma.role.findFirst({ where: { id: roleId, companyId: ctx.company.id } });
  if (!membership || membership.isOwner || !role) {
    revalidatePath("/app/employees");
    return;
  }
  await prisma.membership.update({ where: { id: membershipId }, data: { roleId } });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "employee.role_changed", targetType: "user", targetId: membership.userId, metadata: { role: role.name, employee: membership.user.email } });
  await notify({ userId: membership.userId, type: "INFO", title: "Votre rôle a changé", body: `Votre rôle dans ${ctx.company.legalName} est désormais « ${role.name} ».` });
  revalidatePath("/app/employees");
}

export async function toggleEmployeeAction(formData: FormData) {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "employees.manage");
  const membershipId = String(formData.get("membershipId") || "");

  const membership = await prisma.membership.findFirst({ where: { id: membershipId, companyId: ctx.company.id }, include: { user: true } });
  if (!membership || membership.isOwner || membership.userId === user.id) {
    revalidatePath("/app/employees");
    return;
  }
  const next = membership.status === "DISABLED" ? "ACTIVE" : "DISABLED";
  await prisma.membership.update({ where: { id: membershipId }, data: { status: next } });
  await logAudit({
    userId: user.id, companyId: ctx.company.id,
    action: next === "DISABLED" ? "employee.disabled" : "employee.enabled",
    targetType: "user", targetId: membership.userId, metadata: { employee: membership.user.email },
  });
  await notify({
    userId: membership.userId,
    type: next === "DISABLED" ? "WARNING" : "SUCCESS",
    title: next === "DISABLED" ? "Accès désactivé" : "Accès réactivé",
    body: `Votre accès à ${ctx.company.legalName} a été ${next === "DISABLED" ? "désactivé" : "réactivé"}.`,
  });
  revalidatePath("/app/employees");
}

export async function removeEmployeeAction(formData: FormData) {
  const { user, ctx } = await requireActiveCompany();
  assertCan(ctx, "employees.manage");
  const membershipId = String(formData.get("membershipId") || "");
  const membership = await prisma.membership.findFirst({ where: { id: membershipId, companyId: ctx.company.id }, include: { user: true } });
  if (!membership || membership.isOwner || membership.userId === user.id) {
    revalidatePath("/app/employees");
    return;
  }
  await prisma.membership.delete({ where: { id: membershipId } });
  await logAudit({ userId: user.id, companyId: ctx.company.id, action: "employee.removed", targetType: "user", targetId: membership.userId, metadata: { employee: membership.user.email } });
  revalidatePath("/app/employees");
}

// ───────────────────────────── Acceptation d'invitation

export async function acceptInvitationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();

  const invitation = await prisma.invitation.findFirst({
    where: { tokenHash: sha256(raw), status: "PENDING", expiresAt: { gt: new Date() } },
    include: { company: true, role: true },
  });
  if (!invitation) return { ok: false, error: "Cette invitation est invalide, expirée ou déjà utilisée." };

  let user = await prisma.user.findUnique({ where: { email: invitation.email } });
  const ctx = await getRequestContext();

  if (!user) {
    if (password.length < 8 || !firstName || !lastName) {
      return { ok: false, error: "Veuillez renseigner votre nom et un mot de passe d'au moins 8 caractères." };
    }
    user = await prisma.user.create({
      data: {
        email: invitation.email,
        passwordHash: await hashPassword(password),
        firstName: firstName || invitation.firstName || "Nouvel",
        lastName: lastName || invitation.lastName || "Employé",
        emailVerifiedAt: new Date(), // l'email est implicitement vérifié par l'invitation
      },
    });
  }

  await prisma.membership.upsert({
    where: { userId_companyId: { userId: user.id, companyId: invitation.companyId } },
    update: { status: "ACTIVE", roleId: invitation.roleId, jobTitle: invitation.jobTitle },
    create: { userId: user.id, companyId: invitation.companyId, roleId: invitation.roleId, jobTitle: invitation.jobTitle, status: "ACTIVE" },
  });
  await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "ACCEPTED", acceptedAt: new Date() } });
  await logAudit({ userId: user.id, companyId: invitation.companyId, action: "employee.enabled", actorLabel: `${user.firstName} ${user.lastName}`, metadata: { joined: invitation.company.legalName } });
  await notify({ userId: invitation.invitedById, type: "SUCCESS", title: "Invitation acceptée", body: `${invitation.email} a rejoint ${invitation.company.legalName}.` });

  await createSession(user.id, ctx);
  redirect("/app");
}
