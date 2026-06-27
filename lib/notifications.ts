import { prisma } from "./db";

type NotifyArgs = {
  userId: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
  title: string;
  body?: string;
  link?: string;
};

export async function notify({ userId, type = "INFO", title, body, link }: NotifyArgs) {
  return prisma.notification.create({
    data: { userId, type, title, body, link },
  });
}

/** Notifie tous les Super Administrateurs (ex : nouvelle demande d'entreprise). */
export async function notifySuperAdmins(args: Omit<NotifyArgs, "userId">) {
  const admins = await prisma.user.findMany({
    where: { isSuperAdmin: true },
    select: { id: true },
  });
  await Promise.all(admins.map((a) => notify({ ...args, userId: a.id })));
}
