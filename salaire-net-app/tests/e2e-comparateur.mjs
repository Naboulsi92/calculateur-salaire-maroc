// I4 : e2e du comparateur — page dédiée, chips d'années, bandeau projet,
// maillage home ↔ comparateur, responsive. Mêmes conventions que e2e.mjs
// (harnais Playwright sur le serveur de preview :4173).
import { chromium } from '@playwright/test';
import { PREVIEW_URL } from './bulletin-ref.mjs';

const URL_COMPARATEUR = new URL('salaire-net-2027.html', PREVIEW_URL).href;
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => s.replace(/[\s.]/g, '');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// 1) Chargement + métadonnées stampées
await page.goto(URL_COMPARATEUR, { waitUntil: 'domcontentloaded' });
await attendre(300);
const titre = await page.title();
console.log('titre:', titre);
if (!titre.includes('Salaire net 2027 vs 2026')) throw new Error('Title comparateur inattendu');

// 2) Bandeau « projet non voté »
const banner = await page.textContent('.banner-projet');
if (!banner.includes('non voté')) throw new Error('Bandeau projet absent');
console.log('banner-projet OK');

// 3) Chips : 2027–2031, 2027 active, 2031 « cible »
const chips = await page.$$eval('.chip', (els) =>
  els.map((e) => ({ t: e.textContent.trim(), on: e.classList.contains('on') })),
);
console.log('chips:', JSON.stringify(chips));
if (chips.length !== 5) throw new Error('5 chips attendues (2027–2031)');
if (chips[0].t !== '2027' || !chips[0].on) throw new Error('Chip 2027 non active par défaut');
if (chips[chips.length - 1].t !== '2031 · cible') throw new Error('Chip cible 2031 absente');

// 4) Nets par défaut (brut 10 000 + panier/transport 500 = défauts de l'app) :
//    SBI 10 000, gains 11 000 → 2026 : 9 903,64 · 2027 : 10 346,35 · écart +442,71
const netA = norm(await page.textContent('#net-a'));
const netB = norm(await page.textContent('#net-b'));
const ecart = await page.textContent('#net-ecart');
console.log('nets:', netA, '|', netB, '| écart', ecart);
if (netA !== '9903,64MAD' || netB !== '10346,35MAD') throw new Error(`Nets inattendus: ${netA} / ${netB}`);
if (ecart !== '+442,71') throw new Error(`Écart attendu +442,71, obtenu: ${ecart}`);
if (!(await page.locator('#net-ecart.pos').count())) throw new Error('Écart non coloré en positif');

// 5) Badges : IR 30 % → 10 % + FP plafonné 2027
const badges = norm(await page.textContent('#badges'));
if (!badges.includes('IR2026·30%') || !badges.includes('IR2027·10%')) {
  throw new Error(`Badges IR inattendus: ${badges}`);
}
if (!badges.includes('FPplafonné2027')) throw new Error('Badge FP plafonné 2027 absent');
console.log('badges OK');

// 6) Lignes du bulletin comparé : FP positif 2 500,00 → 2 916,67 ; net +442,71
const rows = await page.$$eval('#lignes tr', (trs) =>
  trs.map((tr) => [...tr.children].map((td) => td.textContent.trim())),
);
const fp = rows.find((r) => r[0].startsWith('Frais professionnels'));
if (norm(fp[1]) !== '2500,00' || norm(fp[2]) !== '2916,67') {
  throw new Error(`FP attendu 2 500,00 → 2 916,67, obtenu: ${fp[1]} / ${fp[2]}`);
}
if (!fp[0].includes('25 % → 45 %')) throw new Error('Taux FP absent du libellé');
const netRow = rows.find((r) => r[0] === 'Net à payer');
if (norm(netRow[1]) !== '9903,64' || norm(netRow[2]) !== '10346,35') {
  throw new Error(`Ligne net inattendue: ${netRow[1]} / ${netRow[2]}`);
}
// Cellule d'écart = MAD + sous-ligne (% · annuel) → startsWith sur le MAD.
if (!netRow[3].startsWith('+442,71')) throw new Error(`Écart net inattendu: ${netRow[3]}`);
console.log('lignes bulletin OK');

// 7) Chip 2028 : stamp bascule, écart identique (+442,71 à brut 10 000)
await page.getByRole('button', { name: '2028', exact: true }).click();
await attendre(200);
const stamp = await page.textContent('#stamp-annee');
if (stamp !== 'PLF 2028') throw new Error(`Stamp attendu « PLF 2028 », obtenu: ${stamp}`);
const ecart28 = await page.textContent('#net-ecart');
if (ecart28 !== '+442,71') throw new Error(`Écart 2028 inattendu: ${ecart28}`);
console.log('chip 2028 OK');

// 8) Brut 8 000 en 2027 : SNI 4 633,73 < 5 000 → IR 0 (exonération 60 000) ;
//    2026 : SNI 5 550,40 → IR 276,75 → écart +276,75 (CNSS plafonnée en base 6 000)
await page.getByRole('button', { name: '2027', exact: true }).click();
await page.fill('#brut', '8000');
await attendre(200);
const ecart8000 = await page.textContent('#net-ecart');
if (ecart8000 !== '+276,75') throw new Error(`Écart brut 8 000 attendu +276,75, obtenu: ${ecart8000}`);
console.log('brut 8 000 OK');

// 9) Capture + retour aux valeurs de référence
await page.fill('#brut', '10000');
await attendre(200);
await page.screenshot({ path: 'e2e-comparateur.png', fullPage: true });
console.log('screenshot: e2e-comparateur.png OK');

// 10) Maillage home ↔ comparateur : bandeau visible + footer, clic → page dédiée
await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
await attendre(300);
const bandeauHref = await page.locator('a.bandeau').getAttribute('href');
if (bandeauHref !== '/salaire-net-2027.html') throw new Error(`Bandeau href inattendu: ${bandeauHref}`);
if (!(await page.locator('footer.foot a[href="/salaire-net-2027.html"]').count())) {
  throw new Error('Lien footer home → comparateur absent');
}
await page.locator('a.bandeau').click();
await page.waitForURL('**/salaire-net-2027.html');
if (!(await page.locator('footer.foot a[href="/"]').count())) {
  throw new Error('Lien retour comparateur → home absent');
}
console.log('maillage OK');

// 11) Responsive du comparateur : aucun débordement, nets non rognés
for (const width of [320, 480, 700, 1024]) {
  const p = await browser.newPage({ viewport: { width, height: 800 } });
  await p.goto(URL_COMPARATEUR, { waitUntil: 'domcontentloaded' });
  await attendre(300);
  const check = await p.evaluate(() => {
    const strongs = [...document.querySelectorAll('.net-alt strong, .net-ecart strong')];
    return {
      overflow: document.documentElement.scrollWidth,
      clipped: strongs.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent.trim()),
    };
  });
  console.log(width, 'px →', JSON.stringify(check));
  if (check.overflow > width + 1) throw new Error(`Débordement comparateur à ${width}px`);
  if (check.clipped.length) throw new Error(`Montant rogné à ${width}px : ${check.clipped.join(', ')}`);
  await p.close();
}

// 12) Table scrollable + atteignable au clavier à 320px
const p320 = await browser.newPage({ viewport: { width: 320, height: 568 } });
await p320.goto(URL_COMPARATEUR, { waitUntil: 'domcontentloaded' });
await attendre(300);
const scrollable = await p320.evaluate(() => {
  const el = document.querySelector('.table-scroll');
  return { canScroll: el.scrollWidth > el.clientWidth, tabbable: el.tabIndex === 0 };
});
console.log('table-scroll 320px:', JSON.stringify(scrollable));
if (!scrollable.canScroll) throw new Error('.table-scroll ne défile pas à 320px');
if (!scrollable.tabbable) throw new Error('.table-scroll non atteignable au clavier');
await p320.screenshot({ path: 'e2e-comparateur-mobile.png', fullPage: true });
console.log('screenshot: e2e-comparateur-mobile.png OK');
await p320.close();

await browser.close();
console.log('E2E COMPARATEUR OK');
