// Simulation "client" complète sur le site EN LIGNE.
// Crée un compte, vérifie email + téléphone, crée une entreprise,
// la fait valider par le Super Admin, puis confirme l'accès débloqué.
// Lit les liens/codes via la table OutboundMessage (ce que le client voit dans /dev/inbox).
// Nettoie les données de test à la fin.
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.DEMO_URL || "https://businessos-pro.vercel.app";
const prisma = new PrismaClient();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ts = Date.now();
const USER = {
  firstName: "Camille",
  lastName: "Testeur",
  email: `qa.client.${ts}@demo.test`,
  phone: "+33612345678",
  password: "ClientTest1234!",
};
const COMPANY = {
  legalName: `QA Société ${ts}`,
  activity: "Restauration",
  address: "10 rue de la Démo",
  city: "Lyon",
  postalCode: "69001",
  phone: "+33478000000",
  email: `contact.${ts}@demo.test`,
};

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✅ PASS" : "❌ FAIL"} — ${name}${detail ? "  (" + detail + ")" : ""}`);
};

async function poll(fn, { tries = 20, delay = 1000 } = {}) {
  for (let i = 0; i < tries; i++) {
    const v = await fn();
    if (v) return v;
    await sleep(delay);
  }
  return null;
}

const run = async () => {
  const browser = await chromium.launch();
  const userCtx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const adminCtx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await userCtx.newPage();
  page.setDefaultTimeout(25000);

  try {
    // ── 1. Inscription
    await page.goto(BASE + "/register", { waitUntil: "networkidle" });
    await page.fill("#firstName", USER.firstName);
    await page.fill("#lastName", USER.lastName);
    await page.fill("#email", USER.email);
    await page.fill("#phone", USER.phone);
    await page.fill("#password", USER.password);
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await page.waitForURL("**/verify-account**", { timeout: 25000 }).catch(() => {});
    check("Inscription → redirige vers /verify-account", page.url().includes("/verify-account"), page.url());

    const dbUser = await poll(() => prisma.user.findUnique({ where: { email: USER.email } }));
    check("Utilisateur créé en base", !!dbUser, dbUser ? dbUser.id : "introuvable");

    // ── 2. Vérification email (récupère le lien comme dans /dev/inbox)
    const emailMsg = await poll(() =>
      prisma.outboundMessage.findFirst({
        where: { to: USER.email, channel: "EMAIL" },
        orderBy: { createdAt: "desc" },
      }),
    );
    check("Email de vérification envoyé (inbox)", !!emailMsg?.link, emailMsg?.link ? "lien présent" : "aucun");
    if (emailMsg?.link) {
      await page.goto(emailMsg.link, { waitUntil: "networkidle" });
      const verifiedText = await page.locator("body").innerText();
      check("Lien de vérification email → confirmé", /vérifiée/i.test(verifiedText), "page verify-email");
    }
    const afterEmail = await prisma.user.findUnique({ where: { email: USER.email } });
    check("emailVerifiedAt renseigné en base", !!afterEmail?.emailVerifiedAt);

    // ── 3. Vérification téléphone
    await page.goto(BASE + "/verify-account", { waitUntil: "networkidle" });
    // (re)remplir le téléphone et envoyer le code
    await page.fill("#phone", USER.phone);
    await page.getByRole("button", { name: /Envoyer le code/i }).click();
    await page.waitForLoadState("networkidle");
    await sleep(1500);
    const smsMsg = await poll(() =>
      prisma.outboundMessage.findFirst({
        where: { to: USER.phone, channel: "SMS" },
        orderBy: { createdAt: "desc" },
      }),
    );
    check("Code SMS envoyé (inbox)", !!smsMsg?.code, smsMsg?.code ? "code reçu" : "aucun");
    if (smsMsg?.code) {
      await page.fill("#code", smsMsg.code);
      await page.getByRole("button", { name: /Vérifier le numéro/i }).click();
      await page.waitForLoadState("networkidle");
      await sleep(1500);
      const afterPhone = await prisma.user.findUnique({ where: { email: USER.email } });
      check("phoneVerifiedAt renseigné en base", !!afterPhone?.phoneVerifiedAt);
    }

    // ── 4. Création d'entreprise
    await page.goto(BASE + "/onboarding", { waitUntil: "networkidle" });
    await page.fill("#legalName", COMPANY.legalName);
    await page.selectOption("#activity", COMPANY.activity);
    await page.fill("#address", COMPANY.address);
    await page.fill("#city", COMPANY.city);
    await page.fill("#postalCode", COMPANY.postalCode);
    await page.fill("#phone", COMPANY.phone);
    await page.fill("#email", COMPANY.email);
    await page.getByRole("button", { name: /Soumettre pour validation/i }).click();
    await page.waitForURL("**/pending**", { timeout: 25000 }).catch(() => {});
    check("Création entreprise → redirige vers /pending", page.url().includes("/pending"), page.url());
    const pendingText = await page.locator("body").innerText().catch(() => "");
    check("Écran d'attente affiché", /attente|examen|validation/i.test(pendingText));

    const dbCompany = await poll(() =>
      prisma.company.findFirst({ where: { legalName: COMPANY.legalName } }),
    );
    check("Entreprise créée en base (statut PENDING)", dbCompany?.status === "PENDING", dbCompany?.status);

    // ── 5. Le nouvel utilisateur n'a PAS encore accès à /app
    await page.goto(BASE + "/app", { waitUntil: "networkidle" });
    check("Accès /app bloqué avant validation (redirigé)", !page.url().endsWith("/app"), page.url());

    // ── 6. Super Admin valide l'entreprise
    const admin = await adminCtx.newPage();
    admin.setDefaultTimeout(25000);
    await admin.goto(BASE + "/login", { waitUntil: "networkidle" });
    await admin.fill("#email", "admin@businessos.pro");
    await admin.fill("#password", "Admin1234!");
    await admin.getByRole("button", { name: "Se connecter" }).click();
    await admin.waitForURL("**/admin**", { timeout: 25000 }).catch(() => {});
    check("Connexion Super Admin", admin.url().includes("/admin"), admin.url());

    await admin.goto(BASE + "/admin/requests", { waitUntil: "networkidle" });
    const seesCompany = await admin.getByText(COMPANY.legalName).first().isVisible().catch(() => false);
    check("Demande visible côté Super Admin", seesCompany);
    // valider : la demande la plus récente est la nôtre (ordre croissant → dernière)
    const validerButtons = admin.getByRole("button", { name: /Valider/i });
    const n = await validerButtons.count();
    if (n > 0) {
      await validerButtons.nth(n - 1).click();
      await admin.waitForLoadState("networkidle");
      await sleep(2000);
    }
    const dbApproved = await poll(() =>
      prisma.company
        .findFirst({ where: { legalName: COMPANY.legalName } })
        .then((c) => (c?.status === "APPROVED" ? c : null)),
    );
    check("Entreprise validée (statut APPROVED)", !!dbApproved, dbApproved?.status);

    // ── 7. L'utilisateur accède maintenant à la plateforme
    await page.goto(BASE + "/app", { waitUntil: "networkidle" });
    await sleep(1500);
    const appText = await page.locator("body").innerText().catch(() => "");
    const onApp = page.url().endsWith("/app") && /Bonjour|Tableau de bord|aperçu/i.test(appText);
    check("Accès /app débloqué après validation", onApp, page.url());

  } catch (e) {
    check("Exécution sans exception", false, e.message);
  } finally {
    await browser.close();
    // ── Nettoyage des données de test
    try {
      const c = await prisma.company.findFirst({ where: { legalName: COMPANY.legalName } });
      if (c) await prisma.company.delete({ where: { id: c.id } });
      const u = await prisma.user.findUnique({ where: { email: USER.email } });
      if (u) await prisma.user.delete({ where: { id: u.id } });
      await prisma.outboundMessage.deleteMany({ where: { to: { in: [USER.email, USER.phone] } } });
      console.log("🧹 Données de test supprimées.");
    } catch (e) {
      console.log("⚠️ Nettoyage partiel:", e.message);
    }
    await prisma.$disconnect();

    const passed = results.filter((r) => r.ok).length;
    console.log(`\n===== RÉSULTAT QA : ${passed}/${results.length} étapes réussies =====`);
    const failed = results.filter((r) => !r.ok);
    if (failed.length) {
      console.log("Échecs :");
      failed.forEach((f) => console.log("  - " + f.name + (f.detail ? " :: " + f.detail : "")));
      process.exitCode = 1;
    }
  }
};

run();
