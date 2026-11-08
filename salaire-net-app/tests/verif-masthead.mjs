// Vérification homogénéité des en-têtes home/comparateur + sélecteur (02/11).
// Fait partie du harnais e2e : le sélecteur et la structure du masthead sont
// désormais une garantie visuelle, pas un détail du moment.
import { chromium } from '@playwright/test';
import { PREVIEW_URL } from './bulletin-ref.mjs';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function mesure(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // L'eyebrake d'accueil contient « LF <année> » injecté par le JS : sans ce
  // délai, la mesure prend l'eyebrake vide → hauteur d'en-tête fausse (4 px).
  await page.waitForFunction(
    () => !document.querySelector('#lf-annee') || document.querySelector('#lf-annee').textContent.trim().length > 2,
    null,
    { timeout: 5000 },
  );
  // Le tampon (« 6 tranches », « PLF 2027 ») est rempli par le JS : la
  // hauteur du masthead ne se stabilise qu'après. On attend la stabilisation
  // (sinon la première mesure capture un état transitoire, ±3 px).
  let stable = 0;
  let dernier = 0;
  for (let i = 0; i < 20 && stable < 3; i++) {
    await page.waitForTimeout(100);
    const h = await page.evaluate(() =>
      Math.round(document.querySelector('.masthead').getBoundingClientRect().height));
    stable = h === dernier ? stable + 1 : 0;
    dernier = h;
  }
  return page.evaluate(() => {
    const pills = [...document.querySelectorAll('.seg-nav a')].map((a) =>
      Math.round(a.getBoundingClientRect().width),
    );
    const droite = Math.round(document.querySelector('.masthead-droite').getBoundingClientRect().width);
    const mast = Math.round(document.querySelector('.masthead').getBoundingClientRect().height);
    const courant = document.querySelector('.seg-nav a[aria-current="page"]')?.textContent.trim();
    // Le sélecteur doit coller au bord droit de la page (aligné avec le
    // tampon), demande utilisateur 02/11.
    const nav = document.querySelector('.seg-nav').getBoundingClientRect();
    const stamp = document.querySelector('.stamp').getBoundingClientRect();
    const aligneDroite = Math.abs(stamp.right - nav.right) <= 2;
    return { pills, droite, mast, courant, aligneDroite };
  });
}

const home = await mesure(PREVIEW_URL);
const comp = await mesure(new URL('salaire-net-2027', PREVIEW_URL).href);
// Build 1/7 (ticket 09) : la page F6 rejoint la garantie visuelle. Guide :
// aucun de ses outils n'est « courant » (le sélecteur ne marque jamais la
// page hébergée) — vérifié en fin de script.
const p8000 = await mesure(new URL('salaire-net-8000', PREVIEW_URL).href);

const memesPills = home.pills[0] === home.pills[1] && comp.pills[0] === comp.pills[1] && p8000.pills[0] === p8000.pills[1];
const memePaire = home.pills.join() === comp.pills.join() && comp.pills.join() === p8000.pills.join();
if (!memesPills) throw new Error(`pills inégales home=${home.pills} comp=${comp.pills} 8000=${p8000.pills}`);
if (!memePaire) throw new Error(`paire de pills différente entre pages: home=${home.pills} comp=${comp.pills} 8000=${p8000.pills}`);
if (home.droite !== comp.droite || home.droite !== p8000.droite) throw new Error(`colonne droite hétérogène: home=${home.droite} comp=${comp.droite} 8000=${p8000.droite}`);
// Tolérance 1 px : « LF » est injecté par le JS (id=lf-annee), la première
// mesure domcontentloaded peut donc voir l'eyebrake home avant remplissage.
if (Math.abs(home.mast - comp.mast) > 1) throw new Error(`hauteur d'en-tête hétérogène: home=${home.mast} comp=${comp.mast}`);
if (Math.abs(home.mast - p8000.mast) > 1) throw new Error(`hauteur d'en-tête hétérogène: home=${home.mast} 8000=${p8000.mast}`);
if (!home.courant || !comp.courant || home.courant === comp.courant)
  throw new Error(`onglet actif manquant ou identique: home="${home.courant}" comp="${comp.courant}"`);
if (p8000.courant)
  throw new Error(`le guide 8000 ne doit pas marquer d'onglet courant: "${p8000.courant}"`);

// Le texte du plus long libellé ne doit jamais être coupé (172px ≥ intrinsic).
const deborde = await page.evaluate(() => {
  const a = document.querySelector('.seg-nav a');
  return a.scrollWidth > a.clientWidth + 1;
});
if (deborde) throw new Error('libellé de pill tronqué');
if (!home.aligneDroite || !comp.aligneDroite || !p8000.aligneDroite)
  throw new Error(`sélecteur non aligné avec le tampon: home=${home.aligneDroite} comp=${comp.aligneDroite} 8000=${p8000.aligneDroite}`);

await browser.close();
console.log('MASTHEAD OK', JSON.stringify({ home, comp, p8000 }));
