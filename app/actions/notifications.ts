"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";

export async function markNotificationReadAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("notificationId") || "");
  await prisma.notification.updateMany({ where: { id, userId: user.id }, data: { read: true } });
  revalidatePath("/app/notifications");
}

export async function markAllNotificationsReadAction() {
  const user = await requireUser();
  await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  revalidatePath("/app/notifications");
  revalidatePath("/admin");
}
