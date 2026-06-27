import Link from "next/link";
import { Bell, CheckCheck, Check } from "lucide-react";
import { requireActiveCompany } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { timeAgo, cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/actions/notifications";

const DOT_TONE: Record<string, string> = {
  INFO: "bg-[var(--primary)]",
  SUCCESS: "bg-[var(--success)]",
  WARNING: "bg-[var(--warning)]",
  DANGER: "bg-[var(--danger)]",
};

export default async function NotificationsPage() {
  const { user } = await requireActiveCompany();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Notifications"
        description="Suivez les alertes et événements liés à votre compte et votre entreprise."
        action={
          hasUnread ? (
            <form action={markAllNotificationsReadAction}>
              <SubmitButton variant="secondary" size="sm" pendingLabel="Mise à jour…">
                <CheckCheck className="size-4" />
                Tout marquer comme lu
              </SubmitButton>
            </form>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Bell className="size-6" />}
            title="Aucune notification"
            description="Vous n'avez pas encore reçu de notification. Elles apparaîtront ici."
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notif) => {
            const dot = DOT_TONE[notif.type] ?? DOT_TONE.INFO;
            return (
              <li
                key={notif.id}
                className={cn(
                  "card flex items-start gap-3 px-4 py-3.5 transition-colors",
                  notif.read ? "bg-[var(--surface-2)] opacity-80" : "bg-[var(--surface)]",
                )}
              >
                <span className="relative mt-1.5 flex shrink-0">
                  <span className={cn("size-2.5 rounded-full", dot)} />
                  {!notif.read && (
                    <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[var(--primary)] ring-2 ring-[var(--surface)]" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    {notif.link ? (
                      <Link
                        href={notif.link}
                        className="font-semibold text-[var(--foreground)] hover:text-[var(--primary)] hover:underline"
                      >
                        {notif.title}
                      </Link>
                    ) : (
                      <p className="font-semibold text-[var(--foreground)]">{notif.title}</p>
                    )}
                    <span className="shrink-0 text-xs text-[var(--muted-2)]">{timeAgo(notif.createdAt)}</span>
                  </div>
                  {notif.body && <p className="mt-0.5 text-sm text-[var(--muted)]">{notif.body}</p>}
                </div>

                {!notif.read && (
                  <form action={markNotificationReadAction} className="shrink-0">
                    <input type="hidden" name="notificationId" value={notif.id} />
                    <SubmitButton variant="ghost" size="sm" pendingLabel="…">
                      <Check className="size-3.5" />
                      <span className="sr-only sm:not-sr-only">Marquer comme lu</span>
                    </SubmitButton>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
