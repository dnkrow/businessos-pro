import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BusinessOS Pro — Le système d'exploitation de votre entreprise",
  description:
    "Plateforme SaaS de gestion d'entreprise : authentification sécurisée, gestion des employés, rôles et permissions, établissements multiples et espace d'administration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
