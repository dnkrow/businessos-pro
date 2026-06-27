import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  BadgeCheck,
  Users,
  Building2,
  KeyRound,
  Crown,
  ArrowRight,
  UserPlus,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { resolveLandingRoute } from "@/lib/guards";
import { Logo } from "@/components/ui/logo";
import { buttonClass } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Authentification sécurisée",
    description:
      "Double authentification (2FA), vérification de l'e-mail et du téléphone, mots de passe robustes et gestion fine des sessions.",
  },
  {
    icon: BadgeCheck,
    title: "Validation des entreprises",
    description:
      "Chaque entreprise est revue manuellement par notre équipe avant d'accéder à la plateforme, pour un écosystème de confiance.",
  },
  {
    icon: Users,
    title: "Employés & rôles personnalisables",
    description:
      "Invitez vos collaborateurs, créez des rôles sur mesure et attribuez des permissions précises à chaque membre.",
  },
  {
    icon: Building2,
    title: "Établissements multiples",
    description:
      "Gérez siège, entrepôts, boutiques et bureaux depuis un seul tableau de bord, où que se trouvent vos équipes.",
  },
  {
    icon: KeyRound,
    title: "Sécurité & traçabilité",
    description:
      "Journaux d'activité détaillés, suivi des appareils connectés et révocation des sessions en un clic.",
  },
  {
    icon: Crown,
    title: "Espace Super Admin",
    description:
      "Un poste de pilotage central pour superviser les entreprises, les utilisateurs et la conformité de la plateforme.",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Inscription",
    description:
      "Créez votre compte et renseignez les informations de votre entreprise en quelques minutes.",
  },
  {
    number: "2",
    title: "Validation par l'équipe",
    description:
      "Notre équipe vérifie votre dossier afin de garantir la sécurité et la fiabilité de la plateforme.",
  },
  {
    number: "3",
    title: "Accès à la plateforme",
    description:
      "Une fois validé, accédez à tout votre espace de gestion et invitez vos collaborateurs.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect(await resolveLandingRoute(user.id));

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      {/* En-tête */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Logo size={32} />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              Se connecter
            </Link>
            <Link href="/register" className={buttonClass("primary")}>
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Héro */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-black/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4" />
                La gestion d'entreprise, réinventée
              </span>
              <h1 className="mt-7 text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
                Le système d'exploitation de votre entreprise.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/85 sm:text-xl">
                Centralisez l'authentification, vos employés, vos rôles et vos établissements
                dans une plateforme unique, sécurisée et pensée pour les entreprises exigeantes.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-[#4f46e5] shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white/95"
                >
                  <UserPlus className="h-5 w-5" />
                  Créer un compte gratuitement
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/15"
                >
                  Se connecter
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Fonctionnalités */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Tout ce qu'il faut pour piloter votre activité
            </h2>
            <p className="mt-4 text-lg text-[var(--muted)]">
              Un socle complet et sécurisé pour gérer vos accès, vos équipes et vos sites.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card flex flex-col gap-4 p-6 transition-shadow hover:shadow-[var(--shadow-md)]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--muted)]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="border-y border-[var(--border)] bg-[var(--surface-2)]">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Comment ça marche
              </h2>
              <p className="mt-4 text-lg text-[var(--muted)]">
                Trois étapes simples pour démarrer en toute sérénité.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.number} className="relative flex flex-col items-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] text-xl font-bold text-white shadow-[var(--shadow-md)]">
                    {step.number}
                  </span>
                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[calc(50%+2.5rem)] top-7 hidden h-px w-[calc(100%-5rem)] bg-[var(--border)] md:block"
                    />
                  )}
                  <h3 className="mt-6 text-lg font-semibold text-[var(--foreground)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Appel à l'action final */}
        <section className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] px-8 py-14 text-center text-white shadow-[var(--shadow-lg)] sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Prêt à reprendre le contrôle ?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
                Rejoignez {APP_NAME} et offrez à votre entreprise une base solide, sécurisée
                et prête à grandir.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/90">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Mise en route en quelques minutes
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Aucune carte requise
                </span>
              </div>
              <div className="mt-9">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-semibold text-[#4f46e5] shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-white/95"
                >
                  Créer mon compte
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Pied de page */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <Logo size={28} />
          <p className="text-sm text-[var(--muted)]">
            © {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
          </p>
          <nav className="flex items-center gap-4 text-sm text-[var(--muted)]">
            <Link href="/login" className="transition-colors hover:text-[var(--foreground)]">
              Se connecter
            </Link>
            <Link href="/register" className="transition-colors hover:text-[var(--foreground)]">
              Créer un compte
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
