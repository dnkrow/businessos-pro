import { prisma } from "./db";

type SendArgs = {
  to: string;
  subject?: string;
  body: string;
  link?: string;
  code?: string;
};

/**
 * Mode démo : aucun email/SMS réel n'est envoyé.
 * Les messages sont (1) affichés dans la console serveur et
 * (2) stockés en base pour consultation dans /dev/inbox.
 * En production, remplacer par un vrai provider (Resend, Postmark, Twilio...).
 */
export async function sendEmail(args: SendArgs) {
  return record("EMAIL", args);
}

export async function sendSms(args: SendArgs) {
  return record("SMS", args);
}

async function record(channel: "EMAIL" | "SMS", { to, subject, body, link, code }: SendArgs) {
  // eslint-disable-next-line no-console
  console.log(
    `\n📨 [${channel}] → ${to}\n   ${subject ?? ""}\n   ${body}` +
      (code ? `\n   CODE: ${code}` : "") +
      (link ? `\n   LIEN: ${link}` : "") +
      "\n",
  );
  await prisma.outboundMessage.create({
    data: { channel, to, subject, body, link, code },
  });
}
