"use client";

import * as React from "react";
import { ChevronDown, MousePointerClick } from "lucide-react";

const ACCOUNTS = [
  { label: "Super Administrateur", email: "admin@businessos.pro", password: "Admin1234!", tone: "text-[var(--primary-hover)]" },
  { label: "Dirigeante — entreprise validée", email: "marie@belleassiette.fr", password: "Demo1234!", tone: "text-[#0f8a63]" },
  { label: "Dirigeant — en attente de validation", email: "paul@technova.io", password: "Demo1234!", tone: "text-[#b26a04]" },
  { label: "Dirigeante — informations demandées", email: "nadia@atlas-log.com", password: "Demo1234!", tone: "text-[#0676a8]" },
];

export function DemoAccounts() {
  const [open, setOpen] = React.useState(true);

  const fill = (email: string, password: string) => {
    const e = document.getElementById("email") as HTMLInputElement | null;
    const p = document.getElementById("password") as HTMLInputElement | null;
    if (e) e.value = email;
    if (p) p.value = password;
    e?.focus();
  };

  return (
    <div className="mt-6 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-3">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <span className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
          <MousePointerClick className="size-3.5" /> Comptes de démonstration (cliquez pour remplir)
        </span>
        <ChevronDown className={`size-4 text-[var(--muted-2)] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-1">
          {ACCOUNTS.map((a) => (
            <button key={a.email} onClick={() => fill(a.email, a.password)}
              className="flex w-full items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-2 text-left text-xs hover:bg-white">
              <span>
                <span className={`block font-semibold ${a.tone}`}>{a.label}</span>
                <span className="block text-[var(--muted)]">{a.email}</span>
              </span>
              <span className="font-mono text-[var(--muted-2)]">{a.password}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
