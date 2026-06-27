import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { resolveLandingRoute } from "@/lib/guards";
import { Logo } from "@/components/ui/logo";
import { ShieldCheck, Users, Building2 } from "lucide-react";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect(await resolveLandingRoute(user.id));

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau gauche : formulaire */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link href="/"><Logo /></Link>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-[400px] animate-in">{children}</div>
        </div>
        <p className="text-center text-xs text-[var(--muted-2)]">
          © {new Date().getFullYear()} BusinessOS Pro — Tous droits réservés
        </p>
      </div>

      {/* Panneau droit : présentation (desktop) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#8b5cf6] lg:flex lg:flex-col lg:justify-center lg:px-14 lg:text-white">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-10 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight">Le système d'exploitation de votre entreprise.</h2>
          <p className="mt-4 text-white/80">
            Centralisez l'authentification, vos équipes, vos rôles et vos établissements dans une plateforme unique et sécurisée.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: ShieldCheck, t: "Sécurité de niveau entreprise", d: "2FA, journal d'audit, gestion des appareils." },
              { icon: Users, t: "Gestion des équipes", d: "Rôles personnalisables et permissions fines." },
              { icon: Building2, t: "Multi-établissements", d: "Siège, magasins, entrepôts, restaurants…" },
            ].map((f) => (
              <li key={f.t} className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <f.icon className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold">{f.t}</span>
                  <span className="block text-sm text-white/75">{f.d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
