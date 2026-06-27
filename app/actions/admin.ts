"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/guards";
import { getRequestContext } from "@/lib/request-context";
import { logAudit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { revokeAllSessions } from "@/lib/session";
import { reviewSchema, fieldErrors } from "@/lib/validation";
import { APP_NAME } from "@/lib/constants";
import type { FormState } from "./types";

// ───────────────────────────── Validation des entreprises

export async function reviewCompanyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireSuperAdmin();
  const parsed = reviewSchema.safeParse({
    companyId: formData.get("companyId"),
    decision: formData.get("decision"),
    message: formData.get("message") || "",
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  const { companyId, decision, message } = parsed.data;

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return { ok: false, error: "Entreprise introuvable." };

  const ctx = await getRequestContext();
  const owner = { userId: company.ownerId };

  if (decision === "APPROVE") {
    await prisma.company.update({
      where: { id: companyId },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewedById: admin.id, rejectionReason: null },
    });
    await logAudit({ userId: admin.id, companyId, action: "company.approved", actorLabel: "Super Admin", ipAddress: ctx.ipAddress, metadata: { legalName: company.legalName } });
    await notify({ ...owner, type: "SUCCESS", title: "Entreprise validée 🎉", body: `Votre entreprise « ${company.legalName} » a été validée. Vous avez désormais accès à ${APP_NAME}.`, link: "/app" });
    revalidatePath("/admin/requests");
    revalidatePath("/admin/companies");
    return { ok: true, message: `${company.legalName} a été validée.` };
  }

  if (decision === "REJECT") {
    await prisma.company.update({
      where: { id: companyId },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewedById: admin.id, rejectionReason: message || null },
    });
    if (message) {
      await prisma.companyReviewMessage.create({ data: { companyId, authorId: admin.id, authorRole: "SUPER_ADMIN", body: message } });
    }
    await logAudit({ userId: admin.id, companyId, action: "company.rejected", actorLabel: "Super Admin", ipAddress: ctx.ipAddress, metadata: { legalName: company.legalName, reason: message } });
    await notify({ ...owner, type: "DANGER", title: "Inscription refusée", body: `Votre demande pour « ${company.legalName} » a été refusée.${message ? " Motif : " + message : ""}`, link: "/pending" });
    revalidatePath("/admin/requests");
    return { ok: true, message: `${company.legalName} a été refusée.` };
  }

  // INFO : demande d'informations complémentaires
  if (!message) return { ok: false, fieldErrors: { message: "Précisez les informations demandées." } };
  await prisma.company.update({
    where: { id: companyId },
    data: { status: "INFO_REQUESTED", reviewedById: admin.id },
  });
  await prisma.companyReviewMessage.create({ data: { companyId, authorId: admin.id, authorRole: "SUPER_ADMIN", body: message } });
  await logAudit({ userId: admin.id, companyId, action: "company.info_requested", actorLabel: "Super Admin", ipAddress: ctx.ipAddress, metadata: { legalName: company.legalName } });
  await notify({ ...owner, type: "WARNING", title: "Informations complémentaires demandées", body: `L'équipe ${APP_NAME} a besoin d'informations pour « ${company.legalName} ».`, link: "/pending" });
  revalidatePath("/admin/requests");
  return { ok: true, message: "Demande d'informations envoyée à l'entreprise." };
}

export async function setCompanyStatusAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  const companyId = String(formData.get("companyId") || "");
  const action = String(formData.get("action") || ""); // suspend | reactivate
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return;

  if (action === "suspend") {
    await prisma.company.update({ where: { id: companyId }, data: { status: "SUSPENDED" } });
    await logAudit({ userId: admin.id, companyId, action: "company.suspended", actorLabel: "Super Admin", metadata: { legalName: company.legalName } });
    await notify({ userId: company.ownerId, type: "DANGER", title: "Entreprise suspendue", body: `L'accès de « ${company.legalName} » à ${APP_NAME} a été suspendu.` });
  } else {
    await prisma.company.update({ where: { id: companyId }, data: { status: "APPROVED" } });
    await logAudit({ userId: admin.id, companyId, action: "company.reactivated", actorLabel: "Super Admin", metadata: { legalName: company.legalName } });
    await notify({ userId: company.ownerId, type: "SUCCESS", title: "Entreprise réactivée", body: `L'accès de « ${company.legalName} » a été rétabli.`, link: "/app" });
  }
  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${companyId}`);
}

// ───────────────────────────── Gestion des utilisateurs

export async function setUserStatusAction(formData: FormData) {
  const admin = await requireSuperAdmin();
  const userId = String(formData.get("userId") || "");
  const action = String(formData.get("action") || ""); // suspend | disable | reactivate
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.isSuperAdmin || target.id === admin.id) {
    revalidatePath("/admin/users");
    return;
  }

  const map: Record<string, { status: string; audit: string; title: string; tone: "WARNING" | "DANGER" | "SUCCESS" }> = {
    suspend: { status: "SUSPENDED", audit: "user.suspended", title: "Compte suspendu", tone: "WARNING" },
    disable: { status: "DISABLED", audit: "user.disabled", title: "Compte désactivé", tone: "DANGER" },
    reactivate: { status: "ACTIVE", audit: "user.reactivated", title: "Compte réactivé", tone: "SUCCESS" },
  };
  const op = map[action];
  if (!op) return;

  await prisma.user.update({ where: { id: userId }, data: { status: op.status } });
  if (op.status !== "ACTIVE") await revokeAllSessions(userId);
  await logAudit({ userId: admin.id, action: op.audit, actorLabel: "Super Admin", targetType: "user", targetId: userId, metadata: { email: target.email } });
  await notify({ userId, type: op.tone, title: op.title, body: `Votre compte ${APP_NAME} a été ${op.status === "ACTIVE" ? "réactivé" : op.status === "SUSPENDED" ? "suspendu" : "désactivé"}.` });
  revalidatePath("/admin/users");
}
