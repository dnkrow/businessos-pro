# BusinessOS Pro — Module 1

**Le système d'exploitation de votre entreprise.** Plateforme SaaS multi-entreprises (multi-tenant) : authentification sécurisée, validation manuelle des entreprises, gestion des employés et des rôles, établissements multiples, sécurité avancée et espace Super Administrateur.

> **Module 1** du projet BusinessOS Pro — application de démonstration **entièrement fonctionnelle**, prête à déployer.

🔗 **Démo en ligne :** _(à compléter après le déploiement Vercel)_

---

## ✨ Fonctionnalités (Module 1)

<table>
<tr><td>

**👤 Authentification**
- Création de compte, connexion, déconnexion
- Mot de passe oublié + réinitialisation
- Vérification de l'email (lien)
- Vérification du téléphone (code SMS)
- Double authentification (2FA / TOTP) + codes de secours

</td><td>

**🏢 Entreprises**
- Créer une nouvelle entreprise **ou** en ajouter une existante
- Profil complet (nom, adresse, activité, logo, langue, devise…)
- **Validation manuelle** avant tout accès (valider / refuser / demander des infos)
- Notification + déblocage automatique de l'accès

</td></tr>
<tr><td>

**👥 Équipes & rôles**
- Inviter des employés (lien d'invitation)
- Rôles **personnalisables** + permissions fines
- Changer de rôle, désactiver, réactiver, retirer

**🏬 Établissements**
- Siège, entrepôt, magasin, restaurant, bureau…

</td><td>

**🔒 Sécurité**
- Historique des connexions
- Appareils connectés (sessions révocables)
- Journal d'audit des actions
- Détection des connexions suspectes

**🛡️ Super Admin**
- Demandes, entreprises, utilisateurs, abonnements, statistiques

</td></tr>
</table>

---

## 🧱 Stack technique

| Domaine | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions, RSC) |
| UI | React 19, Tailwind CSS v4, design system maison |
| Base de données | PostgreSQL via Prisma ORM |
| Auth | Sessions opaques en base (cookie httpOnly), bcrypt, TOTP (otplib) |
| Validation | Zod |
| Hébergement | Vercel (recommandé) |
| Langue | 100 % français |

Architecture **multi-tenant** : un utilisateur peut appartenir à plusieurs entreprises, chacune avec ses rôles, permissions et établissements.

---

## 🚀 Déploiement sur Vercel (≈ 3 minutes)

> Le projet est conçu pour être **prêt à l'emploi** : le premier déploiement crée le schéma de base de données **et** injecte automatiquement les données de démonstration.

1. **Importer le dépôt** : sur [vercel.com/new](https://vercel.com/new), sélectionnez ce dépôt GitHub. Vercel détecte Next.js automatiquement.
2. **Ajouter une base PostgreSQL** : dans le projet Vercel → onglet **Storage** → **Create Database** → **Neon (Postgres)**. L'intégration définit automatiquement la variable `DATABASE_URL`.
3. **Déployer** : lancez le déploiement. Le build exécute `prisma db push` (création des tables) puis le seed (données de démo).

C'est tout. Aucune autre variable n'est obligatoire (l'URL publique et le compte Super Admin ont des valeurs par défaut). Variables optionnelles : voir [`.env.example`](.env.example).

Une fois connecté à GitHub, **chaque `git push` redéploie automatiquement**.

---

## 💻 Démarrage en local

Nécessite une base PostgreSQL (une URL [Neon](https://neon.tech) gratuite convient très bien).

```bash
cp .env.example .env      # renseignez DATABASE_URL
npm install
npm run db:reset          # crée les tables + données de démo
npm run dev               # http://localhost:3000
```

### 🔑 Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| **Super Administrateur** | `admin@businessos.pro` | `Admin1234!` |
| Dirigeante (entreprise **validée**) | `marie@belleassiette.fr` | `Demo1234!` |
| Dirigeant (entreprise **en attente**) | `paul@technova.io` | `Demo1234!` |
| Dirigeante (**informations demandées**) | `nadia@atlas-log.com` | `Demo1234!` |

> 📨 **Mode démo** : les emails et SMS ne sont pas réellement envoyés. Tous les codes de vérification et liens (email, invitation, réinitialisation) sont consultables sur **`/dev/inbox`**.

▶️ Scénario de démonstration pas à pas : voir [`DEMO.md`](DEMO.md).

---

## 📂 Organisation du code

```
app/
  (auth)/            Pages publiques : login, register, mot de passe oublié/réinit
  app/               Espace entreprise (tableau de bord, employés, rôles,
                     établissements, entreprise, abonnement, sécurité, compte, notifications)
  admin/             Espace Super Admin (demandes, entreprises, utilisateurs, abonnements)
  actions/           Server Actions (auth, company, employees, roles, establishments, admin…)
  onboarding/ pending/ invitations/ verify-*  Flux d'entrée
  dev/inbox/         Boîte de réception simulée (démo)
components/
  ui/                Kit de composants (Button, Field, Card, Badge, Modal…)
  forms/             Helpers de formulaires (ActionModal, ConfirmSubmit…)
  shell/             Layouts applicatif et admin
lib/                 Cœur métier : db, session, rbac, auth, tokens, 2FA, audit, constants…
prisma/              schema.prisma + seed.ts
```

---

## ✅ Périmètre livré vs ⚠️ à prévoir

**Livré et fonctionnel** : tout le périmètre du Module 1 (authentification complète + 2FA, création & validation manuelle des entreprises, employés & rôles personnalisables, établissements, sécurité/audit/appareils, espace Super Admin, abonnements en consultation).

**⚠️ À brancher pour une mise en production réelle** (volontairement simulé en démo) :

| Élément | État actuel | Pour la production |
|---|---|---|
| Envoi d'emails | Simulé → `/dev/inbox` | Brancher Resend / Postmark / SendGrid |
| Envoi de SMS | Simulé → `/dev/inbox` | Brancher Twilio / Vonage |
| Upload de logo / documents | Champ URL (texte) | Brancher Vercel Blob / S3 |
| Paiement des abonnements | Consultation uniquement | Brancher Stripe (le modèle de données est prêt) |
| Emails transactionnels stylés | Texte simple | Gabarits HTML (React Email) |
| Tests automatisés | — | Suite Vitest / Playwright |

Ces points sont **isolés derrière des fonctions dédiées** (`lib/mailer.ts`, etc.) : les brancher ne touche pas au reste de l'application.

---

## 🔭 Suite du projet

BusinessOS Pro est conçu pour être développé **module par module**. Le Module 1 pose les fondations (identité, entreprises, équipes, sécurité, permissions) que les modules suivants — facturation, CRM, RH, stocks… — réutiliseront directement.
