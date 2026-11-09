// Build 2/7 (ticket 10) — e2e de /salaire-net-10000, mêmes conventions que
// e2e-salaire8000.mjs (Playwright sur le serveur de preview :4173) : tuiles
// et bulletin issus du moteur (stamping build vérifié ici via le rendu),
// maillage ADR §4, responsive 1440/390 (équation au-dessus du fold mobile,
// zéro scroll horizontal, CTA ≥ 44 px), console sans erreur.
import { chromium } from '@playwright/test';
import { PREVIEW_URL } from './bulletin-ref.mjs';
import { capture } from './helpers.mjs';

const URL_10000 = new URL('salaire-net-10000', PREVIEW_URL).href;
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => s.replace(/[\s.,]/g, '');
/** Réplique du formatter montant() (format.ts, fr-FR 2 déc.) pour la comparaison
 * avec data-n — le data-n est la valeur brute, l'affichage est formaté. */
const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Console propre (desktop + mobile) : tout message d'erreur = échec en fin.
// Bruit d'infrastructure connu, filtré : le beacon Cloudflare RUM ne passe le
// CORS qu'au domaine de prod — en preview localhost ses réponses OPTIONS
// sont rejetées (Access-Control-Allow-Origin: http://localhost). Ce n'est pas
// un défaut de la page : ce motif précis est filtré, tout le reste est bloquant.
const estBruit = (m) =>
  m.includes('cloudflareinsights.com/cdn-cgi/rum') &&
  (m.includes('CORS') || m.includes('ERR_FAILED'));
const erreurs = [];
const echecs = []; // URLs des requêtes réseau échouées (corrélation du bruit RUM)
page.on('console', (m) => {
  if (m.type() === 'error' && !estBruit(m.text())) erreurs.push(m.text());
});
page.on('pageerror', (e) => erreurs.push(String(e)));
page.on('requestfailed', (r) => echecs.push(r.url()));

// 1) Chargement + métadonnées stampées
await page.goto(URL_10000, { waitUntil: 'domcontentloaded' });
await attendre(400); // count-up 280 ms fini
const titre = await page.title();
console.log('titre:', titre);
if (!titre.includes('Salaire net 10 000 MAD')) throw new Error('Title 10000 inattendu');
const canon = await page.getAttribute('link[rel="canonical"]', 'href');
if (canon !== 'https://calculateur-salaire.ma/salaire-net-10000') {
  throw new Error(`Canonical inattendu : ${canon}`);
}
const ogImg = await page.getAttribute('meta[property="og:image"]', 'content');
if (!ogImg || !ogImg.includes('og-salaire-net-10000-1200x630.png')) {
  throw new Error(`og:image absente ou fausse : ${ogImg}`);
}

// 2) Tuiles : count-up terminé = montant affiché = cible data-n (moteur).
const tuiles = await page.evaluate(() =>
  [...document.querySelectorAll('.nets .n[data-n]')].map((el) => ({
    cible: el.dataset.n,
    affiche: el.textContent.trim(),
  })),
);
console.log('tuiles:', JSON.stringify(tuiles));
if (tuiles.length !== 3) throw new Error('3 tuiles attendues (net, brut trouvé, net annuel)');
for (const t of tuiles) {
  const attendu = fmt(Number(t.cible));
  if (norm(t.affiche) !== norm(attendu)) {
    throw new Error(`Count-up non fini : affiché « ${t.affiche} » vs attendu « ${attendu} » (data-n ${t.cible})`);
  }
}
// Oracles du ticket 10 : data-n EXACT des 3 tuiles (l'annuel est la valeur
// BRUTE 119999.88 — sans Math.round, sinon fmt(Number(data-n)) casse).
const cibles = tuiles.map((t) => Number(t.cible));
if (cibles[0] !== 10000 || cibles[1] !== 10126.92 || cibles[2] !== 119999.88) {
  throw new Error(`Tuiles incohérentes : data-n ${tuiles.map((t) => t.cible).join(' / ')}`);
}

// 3) Bulletin inversé : libellés verbatim (moteur + lexique), équation inversée.
const bulletin = await page.textContent('.card.slip');
for (const verbatim of [
  'Total gains (SBI + panier + transport)',
  'Retenues salariales',
  'Impôt',
  'Net à payer',
]) {
  if (!bulletin.includes(verbatim)) throw new Error(`Libellé bulletin manquant : ${verbatim}`);
}
if (!bulletin.includes('déduction fiscale')) throw new Error('Note FP absente (lexique)');
// Particularité ticket 10 : clé de lecture INVERSÉE (brut de base > net voulu).
if (!bulletin.includes('dépasse')) throw new Error('Note équation inversée absente (ticket 10)');

// 4) Badge tranche + bandeau PLF 2027 (maillage sortant, ADR §4).
const badges = await page.textContent('.badges');
if (!/T4 · [\d\s,]+ %/.test(badges)) throw new Error(`Badge tranche inattendu : ${badges}`);
await page.waitForSelector('.bandeau[href="/salaire-net-2027"]');

// 5) Table de vérification : 6 lignes brut → net, ligne forte 10 000.
const lignesTable = await page.$$eval(
  'section[aria-labelledby="t-verif"] tbody tr',
  (tr) => tr.length,
);
if (lignesTable !== 6) {
  throw new Error(`Table de vérification : 6 lignes attendues, ${lignesTable} trouvées`);
}
const forte = await page.$eval(
  'section[aria-labelledby="t-verif"] tbody tr.strong td',
  (td) => td.textContent,
);
if (norm(String(forte)) !== norm('10 000,00')) {
  throw new Error(`Ligne forte table attendue 10 000, trouvée « ${forte} »`);
}

// 6) Capture desktop (avant le clic qui quitte la page).
await capture(page, 'e2e-10000-desktop-1440.png');

// 7) Maillage : guide sœur 8000 présent, puis clic bandeau → comparateur.
const lienSoeur = await page.getAttribute('a[href="/salaire-net-8000"]', 'href');
if (lienSoeur !== '/salaire-net-8000') throw new Error('Lien guide sœur 8000 manquant');
await page.click('.bandeau[href="/salaire-net-2027"]');
await attendre(300);
if (!page.url().includes('salaire-net-2027')) {
  throw new Error(`Clic bandeau a mené à ${page.url()}`);
}
console.log('maillage bandeau →', page.url());

// 8) Responsive mobile 390 : équation + tuiles au-dessus du fold, zéro
//    scroll horizontal, CTA bandeau ≥ 44 px.
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
mob.on('console', (m) => {
  if (m.type() === 'error' && !estBruit(m.text())) erreurs.push(m.text());
});
mob.on('pageerror', (e) => erreurs.push(String(e)));
mob.on('requestfailed', (r) => echecs.push(r.url()));
await mob.goto(URL_10000, { waitUntil: 'domcontentloaded' });
await attendre(400);
const check = await mob.evaluate(() => {
  const tuilesRect = document.querySelector('.nets').getBoundingClientRect();
  const eq = document.querySelector('.note-eq')?.getBoundingClientRect();
  const scrolls = [...document.querySelectorAll('[data-hide-an]')].map((sc) => ({
    dehors: sc.scrollWidth - sc.clientWidth,
  }));
  const cta = [...document.querySelectorAll('.bandeau-cta')].map((el) =>
    el.getBoundingClientRect().height,
  );
  const colAnnuelleCachee = getComputedStyle(
    document.querySelector('[data-hide-an] tr:nth-child(2) td:nth-child(4)') ?? {},
  ).display === 'none';
  return {
    overflow: document.documentElement.scrollWidth,
    tuilesFold: tuilesRect.bottom <= window.innerHeight && tuilesRect.top >= 0,
    eqFold: eq ? eq.bottom <= window.innerHeight : null,
    scrolls,
    ctaMin: Math.round(Math.min(...cta)),
    colAnnuelleCachee,
  };
});
console.log('mobile 390:', JSON.stringify(check));
if (check.overflow > 390 + 1) throw new Error(`Débordement page mobile : ${check.overflow}px`);
if (!check.tuilesFold) throw new Error('Tuiles hors du fold mobile 390');
if (check.eqFold === false) throw new Error('Équation hors du fold mobile 390');
if (check.scrolls.some((t) => t.dehors > 1)) {
  throw new Error(`Scroll horizontal table : ${JSON.stringify(check.scrolls)}`);
}
if (check.colAnnuelleCachee !== true) throw new Error('Colonne Annuel non masquée < 640 px');
if (check.ctaMin < 44) throw new Error(`CTA bandeau < 44 px : ${check.ctaMin}px`);
await capture(mob, 'e2e-10000-mobile-390.png');

if (erreurs.length) {
  // Corrélation bruit : « Failed to load resource: net::ERR_FAILED » nu n'a
  // pas d'URL dans le message — on le franchit SEULEMENT si tous les échecs
  // réseau observés sont des requêtes du beacon RUM Cloudflare (preview localhost).
  const beaconSeulement = echecs.length > 0 && echecs.every((u) => u.includes('cloudflareinsights.com'));
  const finales =
    beaconSeulement
      ? erreurs.filter(
          (m) => !(m.includes('Failed to load resource') && m.includes('net::ERR_FAILED')),
        )
      : erreurs;
  if (finales.length) {
    throw new Error(`Erreurs console (${finales.length}) : ${finales.join(' | ')}`);
  }
}
await page.close();
await mob.close();
await browser.close();
console.log('e2e 10000 OK : tuiles moteur (data-n bruts), bulletin verbatim, maillage, 1440/390, console 0 erreur');
