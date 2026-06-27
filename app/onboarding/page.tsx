import { requireUser } from "@/lib/guards";
import { Logo } from "@/components/ui/logo";
import { CompanyForm } from "./company-form";

export default async function OnboardingPage() {
  await requireUser();

  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Créez votre entreprise</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Renseignez les informations de votre entreprise. Une fois validées par notre équipe,
            vous accéderez à votre espace de gestion.
          </p>
        </div>

        <div className="card mt-8 px-6 py-7 sm:px-8">
          <CompanyForm />
        </div>
      </div>
    </div>
  );
}
