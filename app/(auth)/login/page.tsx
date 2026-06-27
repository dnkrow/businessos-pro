import { LoginForm } from "./login-form";
import { DemoAccounts } from "@/components/demo-accounts";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const sp = await searchParams;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Accédez à votre espace BusinessOS Pro.</p>
      </div>
      <LoginForm reset={sp.reset === "1"} />
      <DemoAccounts />
    </div>
  );
}
