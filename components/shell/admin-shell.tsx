"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardCheck, Building2, Users, CreditCard,
  Menu, LogOut, ArrowLeft, ShieldCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn, fullName } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Demandes d'inscription", icon: ClipboardCheck, badgeKey: "pending" as const },
  { href: "/admin/companies", label: "Entreprises", icon: Building2 },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
];

export function AdminShell({
  user,
  pendingCount,
  children,
}: {
  user: { firstName: string; lastName: string; email: string; avatarUrl: string | null };
  pendingCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const Sidebar = () => (
    <div className="flex h-full flex-col bg-[#0f172a] text-slate-300">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[#8b5cf6]">
          <ShieldCheck className="size-5 text-white" />
        </span>
        <span className="font-bold text-white">BusinessOS <span className="text-[#a5b4fc]">Admin</span></span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 pt-2">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href) ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}>
            <item.icon className="size-[18px]" />
            <span className="flex-1">{item.label}</span>
            {item.badgeKey === "pending" && pendingCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1.5 text-[0.65rem] font-bold text-white">{pendingCount}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link href="/app" className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white">
          <ArrowLeft className="size-4" /> Retour à mon espace
        </Link>
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <Avatar firstName={user.firstName} lastName={user.lastName} src={user.avatarUrl} size={32} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">{fullName(user.firstName, user.lastName)}</span>
            <span className="block truncate text-xs text-slate-400">Super Administrateur</span>
          </span>
          <form action={logoutAction}>
            <button type="submit" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Déconnexion">
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <aside className="hidden w-[270px] shrink-0 lg:block">
        <div className="sticky top-0 h-screen"><Sidebar /></div>
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[270px] shadow-xl"><Sidebar /></div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 backdrop-blur sm:px-6 lg:hidden">
          <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <Menu className="size-5" />
          </button>
          <span className="font-semibold">Espace Super Admin</span>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
