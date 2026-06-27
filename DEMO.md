# 🎬 Script de démonstration — BusinessOS Pro (Module 1)

Scénario clé en main pour une **vidéo de présentation** (~6 min) ou une **démo en visio**.
Il déroule, dans l'ordre, **toutes** les fonctionnalités demandées dans le cahier des charges.

> 💡 Conseil : ouvrez l'onglet `/dev/inbox` dans un second onglet — c'est là qu'apparaissent les codes et liens (emails/SMS simulés).

---

## 0. Préparation (avant de filmer)
- Ouvrir l'application (URL Vercel ou `localhost:3000`).
- Avoir sous la main les comptes de démo (voir plus bas).
- Onglet 1 : l'application. Onglet 2 : `/dev/inbox`.

---

## 1. La vitrine (30 s)
1. Page d'accueil → présenter le positionnement : *« le système d'exploitation de l'entreprise »*.
2. Faire défiler : authentification sécurisée, validation des entreprises, employés & rôles, établissements, sécurité, espace Super Admin.

**À dire :** « Tout le Module 1 est là et fonctionnel. Je vais vous montrer le parcours complet, de l'inscription à l'administration. »

---

## 2. Inscription + vérifications (1 min) — *Authentification*
1. **Créer un compte** → renseigner prénom, nom, email, téléphone, mot de passe (montrer l'indicateur de robustesse).
2. Arrivée sur l'écran **« Sécurisez votre compte »** :
   - Aller sur `/dev/inbox` → ouvrir l'email de vérification → cliquer le lien → **email vérifié** ✅.
   - Revenir, demander le **code SMS** → le récupérer dans `/dev/inbox` → saisir → **téléphone vérifié** ✅.

**À dire :** « Email et téléphone sont vérifiés. En production, ce sont de vrais emails/SMS — ici ils sont centralisés dans une boîte de démo. »

---

## 3. Création d'entreprise (1 min) — *Création d'entreprise*
1. Continuer → **« Créez votre entreprise »**.
2. Choisir **Créer une nouvelle entreprise** (ou *ajouter une existante*).
3. Remplir : nom, nom commercial, adresse, ville, code postal, pays, téléphone, email, activité, langue, devise.
4. **Soumettre pour validation** → arrivée sur l'écran **« demande en cours d'examen »**.

**À dire :** « Point important de votre cahier des charges : aucune entreprise n'accède à la plateforme sans validation manuelle de votre équipe. »

---

## 4. Validation par le Super Admin (1 min 30) — *LE moment fort*
1. Se déconnecter → se reconnecter en **Super Administrateur** (`admin@businessos.pro`).
2. **Espace Super Admin** → **Demandes d'inscription**.
3. Ouvrir la nouvelle demande : montrer toutes les infos, les documents « à vérifier », le fil d'échanges.
4. Montrer les 3 actions : **Valider**, **Demander des informations**, **Refuser**.
   - D'abord **Demander des informations** (ex : « merci de fournir un Kbis récent ») → l'entreprise passe en *Informations demandées*.
   - Puis **Valider** une autre entreprise → elle disparaît de la file.

**À dire :** « Votre équipe garde le contrôle total : valider, refuser, ou demander des compléments avec un message. L'entreprise est notifiée à chaque étape. »

---

## 5. L'entreprise accède à la plateforme (30 s)
1. Se reconnecter avec le compte dirigeant qui vient d'être validé → l'accès est **débloqué**, arrivée sur le **tableau de bord**.

**À dire :** « Dès la validation, le dirigeant reçoit une notification et accède à son espace. »

---

## 6. Gestion des équipes & rôles (1 min) — *Employés / Rôles*
> Utiliser le compte déjà riche **`marie@belleassiette.fr`** (entreprise validée avec 5 employés).
1. **Employés** : montrer la liste, **inviter un employé** (l'invitation arrive dans `/dev/inbox`), changer un rôle, désactiver/réactiver un employé.
2. **Rôles & permissions** : montrer les rôles système (Administrateur, Directeur, Manager, Employé) puis **créer un rôle personnalisé** en cochant des permissions précises.

**À dire :** « Les rôles sont entièrement personnalisables, avec des permissions fines — exactement ce que vous demandiez. »

---

## 7. Établissements (20 s) — *Établissements*
1. **Établissements** → montrer siège / restaurant / entrepôt → **ajouter un établissement** (type : magasin, restaurant…).

---

## 8. Sécurité (40 s) — *Sécurité*
1. **Sécurité** : 
   - **Activer la 2FA** → scanner le QR code (appli d'authentification) → montrer les codes de secours.
   - **Appareils connectés** (révocables) + **historique des connexions** (avec une tentative marquée *suspecte*) + **journal d'audit**.

**À dire :** « 2FA, gestion des appareils, journal d'audit, détection des connexions suspectes : la sécurité est de niveau entreprise. »

---

## 9. Vue d'ensemble Super Admin (30 s) — *Super Administrateur*
1. Retour **Espace Super Admin** : **statistiques globales**, **toutes les entreprises** (suspendre / réactiver), **tous les utilisateurs** (suspendre / désactiver), **abonnements**.

**À dire :** « Et vous gardez une vue complète sur toute la plateforme : entreprises, utilisateurs, abonnements et statistiques. »

---

## 10. Conclusion (15 s)
**À dire :** « Voilà le Module 1, complet et fonctionnel. Tout est construit sur des fondations réutilisables — authentification, permissions, multi-entreprises — prêtes à accueillir les modules suivants. Je reste à votre disposition pour en discuter. »

---

## 🔑 Comptes de démonstration
| Rôle | Email | Mot de passe |
|---|---|---|
| Super Administrateur | `admin@businessos.pro` | `Admin1234!` |
| Dirigeante (validée, données riches) | `marie@belleassiette.fr` | `Demo1234!` |
| Dirigeant (en attente) | `paul@technova.io` | `Demo1234!` |
| Dirigeante (infos demandées) | `nadia@atlas-log.com` | `Demo1234!` |

## ⏱️ Minutage indicatif
Vitrine 0:30 · Inscription 1:00 · Entreprise 1:00 · **Validation 1:30** · Accès 0:30 · Équipes/Rôles 1:00 · Établissements 0:20 · Sécurité 0:40 · Super Admin 0:30 · Conclusion 0:15 → **≈ 6 min 45**
