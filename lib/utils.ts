import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCIES } from "./constants";

/** Fusion de classes Tailwind (pattern shadcn). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Initiales à partir d'un prénom / nom. */
export function initials(firstName?: string | null, lastName?: string | null) {
  const a = (firstName ?? "").trim()[0] ?? "";
  const b = (lastName ?? "").trim()[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

export function fullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Utilisateur";
}

/** Formatage d'un montant en centimes vers une devise. */
export function formatMoney(cents: number, currency = "EUR") {
  const meta = CURRENCIES.find((c) => c.code === currency);
  const value = (cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${value} ${meta?.symbol ?? currency}`;
}

/** Date lisible en français. */
export function formatDate(date: Date | string | null | undefined, withTime = false) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/** « il y a X minutes » simplifié. */
export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 30) return `il y a ${j} j`;
  return formatDate(d);
}

export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const visible = user.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
