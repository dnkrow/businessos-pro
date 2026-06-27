import {
  ShieldCheck,
  Monitor,
  Smartphone,
  LogOut,
  History,
  ScrollText,
  ShieldAlert,
} from "lucide-react";
import { requireActiveCompany } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { getCurrentSessionId } from "@/lib/session";
import { auditLabel } from "@/lib/audit";
import { formatDate, timeAgo } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty";
import { Field, Input } from "@/components/ui/field";
import { ActionModal } from "@/components/forms/action-modal";
import { ConfirmSubmit } from "@/components/forms/confirm-submit";
import { disableTwoFactorAction } from "@/app/actions/account";
import { revokeSessionAction, revokeOtherSessionsAction } from "@/app/actions/security";
import { TwoFactorSetup } from "./two-factor-setup";

const LOGIN_REASONS: Record<string, string> = {
  BAD_PASSWORD: "Mot de passe incorrect",
  UNKNOWN_USER: "Email inconnu",
  "2FA_FAILED": "2FA échouée",
  ACCOUNT_DISABLED: "Compte désactivé",
};

export default async function SecurityPage() {
  const { user } = await requireActiveCompany();
  const currentSessionId = await getCurrentSessionId();

  const [sessions, loginEvents, audit] = await Promise.all([
    prisma.session.findMany({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastActiveAt: "desc" },
    }),
    prisma.loginEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.auditLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Sécurité"
        description="Protégez votre compte : double authentification, appareils connectés et historique d'activité."
      />

      {/* ───────────── Double authentification ───────────── */}
      <Card>
        <CardHeader
          title="Double authentification (2FA)"
          subtitle="Exigez un code à usage unique en plus de votre mot de passe."
        />
        <CardBody>
          {user.twoFactorEnabled ? (
            <div className="space-y-4">
              <Alert variant="success" title="Double authentification activée">
                Votre compte est protégé par un second facteur. Vous devrez fournir un code à chaque connexion.
              </Alert>
              <ActionModal
                trigger={
                  <button className="btn btn-danger btn-sm">
                    <ShieldAlert className="size-4" />
                    Désactiver la 2FA
                  </button>
                }
                title="Désactiver la double authentification"
                description="Confirmez votre mot de passe pour retirer cette protection."
                action={disableTwoFactorAction}
                submitLabel="Désactiver"
                pendingLabel="Désactivation…"
              >
                {(state) => (
                  <Field label="Mot de passe" htmlFor="2fa-password" error={state.fieldErrors?.password} required>
                    <Input id="2fa-password" name="password" type="password" autoComplete="current-password" />
                  </Field>
                )}
              </ActionModal>
            </div>
          ) : (
            <TwoFactorSetup />
          )}
        </CardBody>
      </Card>

      {/* ───────────── Appareils connectés ───────────── */}
      <Card>
        <CardHeader
          title="Appareils connectés"
          subtitle="Sessions actuellement ouvertes sur votre compte."
          action={
            sessions.length > 1 ? (
              <form action={revokeOtherSessionsAction}>
                <ConfirmSubmit
                  confirm="Déconnecter tous les autres appareils ?"
                  variant="secondary"
                  size="sm"
                >
                  <LogOut className="size-3.5" />
                  Déconnecter les autres
                </ConfirmSubmit>
              </form>
            ) : undefined
          }
        />
        <CardBody className="p-0">
          {sessions.length === 0 ? (
            <EmptyState
              icon={<Monitor className="size-6" />}
              title="Aucune session active"
              description="Aucun appareil n'est actuellement connecté à votre compte."
            />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {sessions.map((session) => {
                const isCurrent = session.id === currentSessionId;
                const isMobile = /mobile|android|iphone|ipad/i.test(session.userAgent ?? "");
                const DeviceIcon = isMobile ? Smartphone : Monitor;
                return (
                  <li key={session.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]">
                        <DeviceIcon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-[var(--foreground)]">
                            {session.deviceLabel || "Appareil inconnu"}
                          </p>
                          {isCurrent && (
                            <Badge tone="primary" dot>
                              Cet appareil
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                          {[session.browser, session.os].filter(Boolean).join(" · ") || "Navigateur inconnu"}
                          {session.ipAddress ? ` · ${session.ipAddress}` : ""}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted-2)]">
                          Dernière activité {timeAgo(session.lastActiveAt)}
                        </p>
                      </div>
                    </div>
                    {!isCurrent && (
                      <form action={revokeSessionAction} className="shrink-0">
                        <input type="hidden" name="sessionId" value={session.id} />
                        <ConfirmSubmit confirm="Déconnecter cet appareil ?" variant="ghost" size="sm">
                          Déconnecter
                        </ConfirmSubmit>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      {/* ───────────── Historique des connexions ───────────── */}
      <Card>
        <CardHeader
          title="Historique des connexions"
          subtitle="Les 15 dernières tentatives de connexion à votre compte."
        />
        <CardBody className="p-0">
          {loginEvents.length === 0 ? (
            <EmptyState icon={<History className="size-6" />} title="Aucune connexion enregistrée" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-2)]">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Résultat</th>
                    <th className="px-5 py-3 font-medium">Adresse IP</th>
                    <th className="px-5 py-3 font-medium">Appareil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {loginEvents.map((event) => (
                    <tr key={event.id} className="text-[var(--foreground)]">
                      <td className="whitespace-nowrap px-5 py-3 text-[var(--muted)]">
                        {formatDate(event.createdAt, true)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {event.success ? (
                            <Badge tone="success">Réussie</Badge>
                          ) : (
                            <Badge tone="danger">
                              {(event.reason && LOGIN_REASONS[event.reason]) || "Échouée"}
                            </Badge>
                          )}
                          {event.suspicious && <Badge tone="warning">Suspect</Badge>}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[var(--muted)]">
                        {event.ipAddress || "—"}
                      </td>
                      <td className="max-w-[260px] truncate px-5 py-3 text-[var(--muted)]" title={event.userAgent ?? ""}>
                        {event.userAgent || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ───────────── Journal des actions ───────────── */}
      <Card>
        <CardHeader
          title="Journal des actions"
          subtitle="Les 20 dernières actions effectuées avec votre compte."
        />
        <CardBody className="p-0">
          {audit.length === 0 ? (
            <EmptyState icon={<ScrollText className="size-6" />} title="Aucune action enregistrée" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-2)]">
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Quand</th>
                    <th className="px-5 py-3 font-medium">Adresse IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {audit.map((log) => (
                    <tr key={log.id} className="text-[var(--foreground)]">
                      <td className="px-5 py-3 font-medium">{auditLabel(log.action)}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-[var(--muted)]">{timeAgo(log.createdAt)}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-[var(--muted)]">{log.ipAddress || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
