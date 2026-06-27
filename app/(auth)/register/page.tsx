import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Créer un compte</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Commencez gratuitement en quelques secondes.</p>
      </div>
      <RegisterForm />
    </div>
  );
}
