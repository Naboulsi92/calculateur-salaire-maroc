// D1 : harnais e2e partagé — les scénarios deviennent des adapters fins.
import { chromium } from '@playwright/test';
import { BULLETIN_ENTREES, PREVIEW_URL } from './bulletin-ref.mjs';

/** Ouvre le calculateur à une taille donnée, retourne { browser, page }. */
export async function ouvrirCalculateur(width = 1280, height = 800) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width, height });
  await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  return { browser, page };
}

/** Remplit le formulaire avec le bulletin de référence. */
export async function remplirBulletin(page) {
  await page.fill('#brut', String(BULLETIN_ENTREES.brutBase));
  await page.fill('#embauche', BULLETIN_ENTREES.dateEmbauche);
  await page.fill('#panier', String(BULLETIN_ENTREES.panier));
  await page.fill('#transport', String(BULLETIN_ENTREES.transport));
  await page.selectOption('#cimr', String(BULLETIN_ENTREES.tauxCimr));
}

/** Lit { taux, mensuel } d'une ligne du tableau par son libellé exact. */
export async function lireLigne(page, nom) {
  return page.$$eval(
    '#lignes tr',
    (trs, n) => {
      const tr = [...trs].find((t) => t.children[0].textContent.trim() === n);
      if (!tr) throw new Error(`Ligne introuvable: ${n}`);
      return { taux: tr.children[1].textContent, mensuel: tr.children[2].textContent };
    },
    nom,
  );
}
