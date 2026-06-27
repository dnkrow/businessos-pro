"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShieldCheck, Building2, MapPin, CreditCard,
  Lock, UserCog, Bell, Menu, X, ChevronsUpDown, LogOut, Check,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Avatar, CompanyLogo } from "@/components/ui/avatar";
import { cn, fullName } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { switchCompanyAction } from "@/app/actions/company";

type NavItem = { href: string; label: string; icon: React.ElementType; permission?: string };

const NAV: NavItem[] = [
  { href: "/app", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/app/employees", label: "Employés", icon: Users, permission: "employees.view" },
  { href: "/app/roles", label: "Rôles & permissions", icon: ShieldCheck, permission: "roles.view" },
  { href: "/app/establishments", label: "Établissements", icon: MapPin, permission: "establishments.view" },
  { href: "/app/company", label: "Entreprise", icon: Building2, permission: "company.view" },
  { href: "/app/subscription", label: "Abonnement", icon: CreditCard, permission: "subscription.view" },
];

const PERSONAL_NAV: NavItem[] = [
  { href: "/app/security", label: "Sécurité", icon: Lock },
  { href: "/app/account", label: "Mon compte", icon: UserCog },
];

type Company = { id: string; legalName: string; tradeName: string | null; logoUrl: string | null };

export function AppShell({
  user,
  company,
  role,
  memberships,
  permissions,
  isOwner,
  unread,
  children,
}: {
  user: { firstName: string; lastName: string; email: string; avatarUrl: string | null; isSuperAdmin: boolean };
  company: Company;
  role: { name: string; color: string } | null;
  memberships: Company[];
  permissions: string[];
  isOwner: boolean;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const allowed = (item: NavItem) => !item.permission || isOwner || permissions.includes(item.permission);
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  const NavLinks = () => (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      <p className="px-3 pb-1 pt-2 text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--muted-2)]">Entreprise</p>
      {NAV.filter(allowed).map((item) => (
        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive(item.href) ? "bg-[var(--primary-soft)] text-[var(--primary-hover)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
          )}>
          <item.icon className="size-[18px]" />
          {item.label}
        </Link>
      ))}
      <p className="px-3 pb-1 pt-4 text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--muted-2)]">Personnel</p>
      {PERSONAL_NAV.map((item) => (
        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isActive(item.href) ? "bg-[var(--primary-soft)] text-[var(--primary-hover)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
          )}>
          <item.icon className="size-[18px]" />
          {item.label}
        </Link>
      ))}
      {user.isSuperAdmin && (
        <Link href="/admin" onClick={() => setMobileOpen(false)}
          className="mt-3 flex items-center gap-3 rounded-lg border border-dashed border-[var(--border-strong)] px-3 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)]">
          <ShieldCheck className="size-[18px]" />
          Espace Super Admin
        </Link>
      )}
    </nav>
  );

  const SidebarInner = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-[var(--border)] px-5"><Logo /></div>
      <div className="px-3 py-3"><CompanySwitcher company={company} memberships={memberships} /></div>
      <NavLinks />
      <div className="border-t border-[var(--border)] p-3"><UserMenu user={user} role={role} /></div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden w-[270px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)] lg:block">
        <div className="sticky top-0 h-screen"><SidebarInner /></div>
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[270px] bg-[var(--surface)] shadow-xl"><SidebarInner /></div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 backdrop-blur sm:px-6">
          <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Menu">
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--muted)]">
            {company.tradeName || company.legalName}
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/app/notifications" className="relative rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]" aria-label="Notifications">
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[0.6rem] font-bold text-white">{unread}</span>
              )}
            </Link>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function CompanySwitcher({ company, memberships }: { company: Company; memberships: Company[] }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-left hover:bg-[var(--surface-2)]">
        <CompanyLogo name={company.legalName} src={company.logoUrl} size={32} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{company.tradeName || company.legalName}</span>
          <span className="block truncate text-xs text-[var(--muted)]">{memberships.length} entreprise{memberships.length > 1 ? "s" : ""}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-[var(--muted-2)]" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-lg)]">
          {memberships.map((m) => (
            <form key={m.id} action={switchCompanyAction}>
              <input type="hidden" name="companyId" value={m.id} />
              <button type="submit" className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-[var(--surface-2)]">
                <CompanyLogo name={m.legalName} src={m.logoUrl} size={26} />
                <span className="min-w-0 flex-1 truncate">{m.tradeName || m.legalName}</span>
                {m.id === company.id && <Check className="size-4 text-[var(--primary)]" />}
              </button>
            </form>
          ))}
          <Link href="/onboarding" className="mt-1 block rounded-lg px-2 py-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary-soft)]">+ Ajouter une entreprise</Link>
        </div>
      )}
    </div>
  );
}

function UserMenu({ user, role }: { user: { firstName: string; lastName: string; email: string; avatarUrl: string | null }; role: { name: string; color: string } | null }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-[var(--surface-2)]">
        <Avatar firstName={user.firstName} lastName={user.lastName} src={user.avatarUrl} size={34} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{fullName(user.firstName, user.lastName)}</span>
          <span className="block truncate text-xs text-[var(--muted)]">{role ? role.name : user.email}</span>
        </span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1.5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-lg)]">
          <Link href="/app/account" className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-2)]">Mon compte</Link>
          <Link href="/app/security" className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-2)]">Sécurité</Link>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--danger)] hover:bg-[var(--danger-soft)]">
              <LogOut className="size-4" /> Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
