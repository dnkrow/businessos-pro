import { Mail, MessageSquare, ExternalLink, Inbox } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty";
import { timeAgo } from "@/lib/utils";

// Toujours rendu à la demande (jamais pré-généré au build).
export const dynamic = "force-dynamic";

export default async function DevInboxPage() {
  const messages = await prisma.outboundMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <PageHeader
        title="Boîte de réception (démo)"
        description="En environnement de démonstration, les e-mails et SMS ne sont pas réellement envoyés : ils sont capturés ici. C'est l'endroit où récupérer vos codes de vérification et vos liens (validation d'e-mail, invitations, réinitialisation de mot de passe…)."
      />

      <div className="mt-6">
        <Alert variant="info" title="Environnement de démonstration">
          Cette page n'existerait pas en production. Elle simule la réception des messages
          sortants pour faciliter les tests.
        </Alert>
      </div>

      {messages.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Inbox className="h-10 w-10" />}
            title="Aucun message"
            description="Les e-mails et SMS générés par l'application apparaîtront ici dès qu'une action en déclenchera l'envoi."
          />
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {messages.map((message) => {
            const isEmail = message.channel === "EMAIL";
            return (
              <li key={message.id} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={isEmail ? "primary" : "info"} dot>
                      <span className="inline-flex items-center gap-1.5">
                        {isEmail ? (
                          <Mail className="h-3.5 w-3.5" />
                        ) : (
                          <MessageSquare className="h-3.5 w-3.5" />
                        )}
                        {isEmail ? "E-mail" : "SMS"}
                      </span>
                    </Badge>
                    <span className="text-sm text-[var(--muted)]">
                      à <span className="font-medium text-[var(--foreground)]">{message.to}</span>
                    </span>
                  </div>
                  <time className="text-xs text-[var(--muted)]" dateTime={message.createdAt.toISOString()}>
                    {timeAgo(message.createdAt)}
                  </time>
                </div>

                {message.subject && (
                  <h3 className="mt-3 text-base font-semibold text-[var(--foreground)]">
                    {message.subject}
                  </h3>
                )}

                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
                  {message.body}
                </p>

                {message.code && (
                  <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                      Code de vérification
                    </p>
                    <p className="mt-1 select-all font-mono text-2xl font-bold tracking-[0.3em] text-[var(--foreground)]">
                      {message.code}
                    </p>
                  </div>
                )}

                {message.link && (
                  <div className="mt-4">
                    <a
                      href={message.link}
                      className="inline-flex items-center gap-2 break-all rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] px-4 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:brightness-95"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      {message.link}
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
