// Enregistre une vidéo de démonstration de BusinessOS Pro en pilotant le site en ligne.
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.DEMO_URL || "https://businessos-pro.vercel.app";
const OUT_DIR = process.argv[2] || "./.demo-video";
fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function smoothScroll(page, to, dur = 1200) {
  await page.evaluate(
    ([target, duration]) =>
      new Promise((resolve) => {
        const start = window.scrollY;
        const change = target - start;
        const t0 = performance.now();
        function step(now) {
          const p = Math.min(1, (now - t0) / duration);
          const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
          window.scrollTo(0, start + change * ease);
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      }),
    [to, dur],
  );
}

async function fillDemo(page, label) {
  // Clique le bouton "compte de démo" qui pré-remplit, puis se connecte
  await page.locator("button", { hasText: label }).first().click();
  await sleep(900);
  await page.getByRole("button", { name: "Se connecter" }).click();
}

const run = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT_DIR, size: { width: 1440, height: 900 } },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout?.(20000);

  // 1) Landing
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await sleep(2200);
  await smoothScroll(page, 700, 1400);
  await sleep(1600);
  await smoothScroll(page, 1500, 1400);
  await sleep(1600);
  await smoothScroll(page, 0, 1000);
  await sleep(1000);

  // 2) Connexion Super Admin
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await sleep(1500);
  await fillDemo(page, "Super Administrateur");
  await page.waitForURL("**/admin**", { timeout: 25000 }).catch(() => {});
  await page.waitForLoadState("networkidle");
  await sleep(2200);

  // 3) Tableau de bord admin
  await smoothScroll(page, 600, 1400);
  await sleep(1600);
  await smoothScroll(page, 0, 900);
  await sleep(900);

  // 4) Demandes d'inscription → valider une entreprise
  await page.goto(BASE + "/admin/requests", { waitUntil: "networkidle" });
  await sleep(2200);
  await smoothScroll(page, 500, 1200);
  await sleep(1600);
  try {
    const valider = page.getByRole("button", { name: /Valider/i }).first();
    if (await valider.count()) {
      await valider.click();
      await page.waitForLoadState("networkidle");
      await sleep(2200);
    }
  } catch {}

  // 5) Déconnexion
  try {
    await page.locator('button[aria-label="Déconnexion"]').first().click();
    await page.waitForURL("**/login**", { timeout: 15000 }).catch(() => {});
  } catch {
    await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  }
  await sleep(1500);

  // 6) Connexion Dirigeante (entreprise validée)
  await fillDemo(page, "entreprise validée");
  await page.waitForURL("**/app**", { timeout: 25000 }).catch(() => {});
  await page.waitForLoadState("networkidle");
  await sleep(2200);

  // 7) Employés
  await page.goto(BASE + "/app/employees", { waitUntil: "networkidle" });
  await sleep(2200);
  await smoothScroll(page, 500, 1200);
  await sleep(1800);
  await smoothScroll(page, 0, 800);

  // 8) Rôles
  await page.goto(BASE + "/app/roles", { waitUntil: "networkidle" });
  await sleep(2400);

  // 9) Sécurité
  await page.goto(BASE + "/app/security", { waitUntil: "networkidle" });
  await sleep(2200);
  await smoothScroll(page, 600, 1400);
  await sleep(2000);
  await smoothScroll(page, 0, 800);
  await sleep(1000);

  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const tmp = await video.path();
    const dest = path.join(OUT_DIR, "demo-raw.webm");
    fs.copyFileSync(tmp, dest);
    console.log("VIDEO_RAW=" + dest);
  } else {
    console.log("NO_VIDEO");
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
