import { prisma } from "../lib/db";
import { hashPassword } from "../lib/password";
import { createSystemRoles, createTrialSubscription } from "../lib/company";
import { PLAN_META } from "../lib/constants";

async function rolesByName(companyId: string) {
  const roles = await prisma.role.findMany({ where: { companyId } });
  return Object.fromEntries(roles.map((r) => [r.name, r]));
}

async function main() {
  // Idempotent : si des données existent déjà, on ne réinjecte pas (sûr en production).
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log(`ℹ️  ${existing} utilisateur(s) déjà présent(s) — seed ignoré.`);
    return;
  }
  const pw = await hashPassword("Demo1234!");

  // ───────── Super Administrateur BusinessOS Pro
  const superAdmin = await prisma.user.create({
    data: {
      email: process.env.SUPERADMIN_EMAIL ?? "admin@businessos.pro",
      passwordHash: await hashPassword(process.env.SUPERADMIN_PASSWORD ?? "Admin1234!"),
      firstName: "Super",
      lastName: "Admin",
      isSuperAdmin: true,
      emailVerifiedAt: new Date(),
      phone: "+33600000000",
      phoneVerifiedAt: new Date(),
    },
  });

  // ───────── Entreprise A : VALIDÉE (restaurant)
  const marie = await prisma.user.create({
    data: {
      email: "marie@belleassiette.fr",
      passwordHash: pw,
      firstName: "Marie",
      lastName: "Dubois",
      emailVerifiedAt: new Date(),
      phone: "+33611223344",
      phoneVerifiedAt: new Date(),
    },
  });

  const belle = await prisma.company.create({
    data: {
      legalName: "La Belle Assiette SARL",
      tradeName: "La Belle Assiette",
      registrationType: "NEW",
      address: "12 rue des Gourmets",
      city: "Lyon",
      postalCode: "69002",
      country: "France",
      phone: "+33478901234",
      email: "contact@belleassiette.fr",
      website: "https://belleassiette.fr",
      activity: "Restauration",
      locale: "fr",
      currency: "EUR",
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedById: superAdmin.id,
      ownerId: marie.id,
    },
  });
  await createSystemRoles(belle.id);
  const belleRoles = await rolesByName(belle.id);
  await prisma.membership.create({
    data: { userId: marie.id, companyId: belle.id, roleId: belleRoles["Administrateur"].id, isOwner: true, jobTitle: "Fondatrice & Gérante", status: "ACTIVE" },
  });
  await prisma.subscription.create({
    data: { companyId: belle.id, plan: "PRO", status: "ACTIVE", seats: PLAN_META.PRO.seats, priceMonthly: PLAN_META.PRO.priceMonthly, currentPeriodEnd: new Date(Date.now() + 20 * 864e5) },
  });

  // Employés de l'entreprise A
  const employees = [
    { email: "thomas@belleassiette.fr", firstName: "Thomas", lastName: "Martin", role: "Directeur", jobTitle: "Directeur de salle", status: "ACTIVE" },
    { email: "sophie@belleassiette.fr", firstName: "Sophie", lastName: "Bernard", role: "Manager", jobTitle: "Responsable cuisine", status: "ACTIVE" },
    { email: "lucas@belleassiette.fr", firstName: "Lucas", lastName: "Petit", role: "Employé", jobTitle: "Serveur", status: "ACTIVE" },
    { email: "emma@belleassiette.fr", firstName: "Emma", lastName: "Roux", role: "Employé", jobTitle: "Commis", status: "DISABLED" },
  ];
  for (const e of employees) {
    const u = await prisma.user.create({
      data: { email: e.email, passwordHash: pw, firstName: e.firstName, lastName: e.lastName, emailVerifiedAt: new Date() },
    });
    await prisma.membership.create({
      data: { userId: u.id, companyId: belle.id, roleId: belleRoles[e.role].id, jobTitle: e.jobTitle, status: e.status },
    });
  }
  // Invitation en attente
  await prisma.invitation.create({
    data: {
      companyId: belle.id, email: "nouveau@belleassiette.fr", firstName: "Léa", lastName: "Moreau",
      roleId: belleRoles["Employé"].id, jobTitle: "Serveuse", tokenHash: "demo-invite-hash-1",
      status: "PENDING", invitedById: marie.id, expiresAt: new Date(Date.now() + 7 * 864e5),
    },
  });

  // Établissements de l'entreprise A
  await prisma.establishment.createMany({
    data: [
      { companyId: belle.id, name: "Siège social", type: "HEADQUARTERS", address: "12 rue des Gourmets", city: "Lyon", postalCode: "69002", country: "France" },
      { companyId: belle.id, name: "Restaurant Presqu'île", type: "RESTAURANT", address: "5 place Bellecour", city: "Lyon", postalCode: "69002", country: "France" },
      { companyId: belle.id, name: "Cuisine centrale", type: "WAREHOUSE", address: "ZI Gerland", city: "Lyon", postalCode: "69007", country: "France", isActive: false },
    ],
  });

  // Journaux (audit, connexions) pour l'entreprise A
  await prisma.auditLog.createMany({
    data: [
      { userId: marie.id, companyId: belle.id, actorLabel: "Marie Dubois", action: "company.created", ipAddress: "78.192.10.4" },
      { userId: marie.id, companyId: belle.id, actorLabel: "Marie Dubois", action: "employee.invited", targetType: "user", metadata: JSON.stringify({ email: "thomas@belleassiette.fr" }), ipAddress: "78.192.10.4" },
      { userId: marie.id, companyId: belle.id, actorLabel: "Marie Dubois", action: "establishment.created", metadata: JSON.stringify({ name: "Restaurant Presqu'île" }), ipAddress: "78.192.10.4" },
    ],
  });
  await prisma.loginEvent.createMany({
    data: [
      { userId: marie.id, email: marie.email, success: true, reason: "OK", ipAddress: "78.192.10.4", userAgent: "Chrome sur Windows" },
      { userId: marie.id, email: marie.email, success: false, reason: "BAD_PASSWORD", ipAddress: "203.0.113.9", userAgent: "Firefox sur Linux", suspicious: true },
      { userId: marie.id, email: marie.email, success: true, reason: "OK", ipAddress: "78.192.10.4", userAgent: "Safari sur iOS" },
    ],
  });
  await prisma.session.create({
    data: { userId: marie.id, tokenHash: "demo-session-marie-other", ipAddress: "78.192.10.4", userAgent: "Safari sur iOS", deviceLabel: "Safari sur iOS", browser: "Safari", os: "iOS", expiresAt: new Date(Date.now() + 20 * 864e5), lastActiveAt: new Date(Date.now() - 36e5) },
  });

  // ───────── Entreprise B : EN ATTENTE de validation (services info)
  const paul = await prisma.user.create({
    data: { email: "paul@technova.io", passwordHash: pw, firstName: "Paul", lastName: "Lefebvre", emailVerifiedAt: new Date(), phone: "+33655667788", phoneVerifiedAt: new Date() },
  });
  const technova = await prisma.company.create({
    data: {
      legalName: "TechNova SAS", tradeName: "TechNova", registrationType: "NEW",
      address: "8 avenue de l'Innovation", city: "Paris", postalCode: "75009", country: "France",
      phone: "+33145678900", email: "hello@technova.io", website: "https://technova.io",
      activity: "Services informatiques", locale: "fr", currency: "EUR", status: "PENDING", ownerId: paul.id,
    },
  });
  await createSystemRoles(technova.id);
  const technovaRoles = await rolesByName(technova.id);
  await prisma.membership.create({
    data: { userId: paul.id, companyId: technova.id, roleId: technovaRoles["Administrateur"].id, isOwner: true, jobTitle: "CEO", status: "ACTIVE" },
  });
  await createTrialSubscription(technova.id);
  await prisma.companyDocument.create({
    data: { companyId: technova.id, name: "Extrait Kbis", fileName: "kbis-technova.pdf", mimeType: "application/pdf", sizeBytes: 248000, uploadedById: paul.id },
  });
  await prisma.auditLog.create({
    data: { userId: paul.id, companyId: technova.id, actorLabel: "Paul Lefebvre", action: "company.created", ipAddress: "91.160.22.7" },
  });

  // ───────── Entreprise C : INFORMATIONS DEMANDÉES (logistique)
  const nadia = await prisma.user.create({
    data: { email: "nadia@atlas-log.com", passwordHash: pw, firstName: "Nadia", lastName: "Benali", emailVerifiedAt: new Date() },
  });
  const atlas = await prisma.company.create({
    data: {
      legalName: "Atlas Logistics", tradeName: "Atlas", registrationType: "EXISTING",
      address: "ZA Les Portes", city: "Marseille", postalCode: "13015", country: "France",
      phone: "+33491020304", email: "contact@atlas-log.com", activity: "Logistique / Transport",
      locale: "fr", currency: "EUR", status: "INFO_REQUESTED", ownerId: nadia.id,
    },
  });
  await createSystemRoles(atlas.id);
  const atlasRoles = await rolesByName(atlas.id);
  await prisma.membership.create({
    data: { userId: nadia.id, companyId: atlas.id, roleId: atlasRoles["Administrateur"].id, isOwner: true, jobTitle: "Directrice", status: "ACTIVE" },
  });
  await createTrialSubscription(atlas.id);
  await prisma.companyReviewMessage.create({
    data: { companyId: atlas.id, authorId: superAdmin.id, authorRole: "SUPER_ADMIN", body: "Bonjour, merci de fournir un justificatif d'immatriculation (Kbis de moins de 3 mois) pour finaliser la validation de votre entreprise." },
  });

  // ───────── Notifications pour le Super Admin (demandes à traiter)
  await prisma.notification.createMany({
    data: [
      { userId: superAdmin.id, type: "INFO", title: "Nouvelle demande d'inscription", body: "TechNova SAS attend une validation.", link: "/admin/requests" },
      { userId: superAdmin.id, type: "INFO", title: "Nouvelle demande d'inscription", body: "Atlas Logistics attend une validation.", link: "/admin/requests" },
    ],
  });

  console.log("✅ Seed terminé.");
  console.log("   Super Admin : ", superAdmin.email, "/ Admin1234!");
  console.log("   Dirigeante validée : marie@belleassiette.fr / Demo1234!");
  console.log("   Dirigeant en attente : paul@technova.io / Demo1234!");
  console.log("   Dirigeante infos demandées : nadia@atlas-log.com / Demo1234!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
