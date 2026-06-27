"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { getCurrentSessionId } from "@/lib/session";
import { logAudit } from "@/lib/audit";

/** Déconnecte un appareil (révoque une session). */
export async function revokeSessionAction(formData: FormData) {
  const user = await requireUser();
  const sessionId = String(formData.get("sessionId") || "");
  const current = await getCurrentSessionId();

  const session = await prisma.session.findFirst({ where: { id: sessionId, userId: user.id } });
  if (!session) return;

  await prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
  await logAudit({
    userId: user.id, action: "auth.session_revoked",
    metadata: { device: session.deviceLabel, current: sessionId === current },
  });
  revalidatePath("/app/security");
}

/** Déconnecte tous les autres appareils. */
export async function revokeOtherSessionsAction() {
  const user = await requireUser();
  const current = await getCurrentSessionId();
  await prisma.session.updateMany({
    where: { userId: user.id, revokedAt: null, ...(current ? { id: { not: current } } : {}) },
    data: { revokedAt: new Date() },
  });
  await logAudit({ userId: user.id, action: "auth.session_revoked", metadata: { scope: "all_others" } });
  revalidatePath("/app/security");
}
