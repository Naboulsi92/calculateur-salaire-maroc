// Génère public/og-*-1200x630.png via Chromium (Playwright) — 2 pages (I3).
// `npm run og` — relancer après changement de titre ou de millésime.
// Textes issus de scripts/site.mjs (source unique, D3) : ANNEE / ANNEE_CIBLE.
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ANNEE, ANNEE_CIBLE } from './site.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const CSS = `
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; font-family: Inter, Arial, sans-serif;
    background: #faf7f0; color: #1a2e28; display: flex; }
  .left { flex: 1; padding: 90px 0 90px 90px; display: flex; flex-direction: column; justify-content: center; }
  .eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 26px; letter-spacing: 4px;
    text-transform: uppercase; color: #0e6b4a; margin-bottom: 24px; }
  h1 { font-family: Fraunces, Georgia, serif; font-size: 104px; line-height: 1.02; letter-spacing: -1px; }
  .sub { font-size: 34px; color: #3d534c; margin-top: 28px; }
  .right { width: 380px; background: #0e6b4a; color: #faf7f0; display: flex;
    flex-direction: column; align-items: center; justify-content: center; gap: 18px; }
  .badge { font-family: 'IBM Plex Mono', monospace; font-size: 30px; letter-spacing: 3px; }
  .big { font-family: Fraunces, Georgia, serif; font-size: 64px; }
`;

const page = (left, right) => `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=Inter:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet" />
<style>${CSS}</style></head>
<body>
  <div class="left">
    <p class="eyebrow">${left.eyebrow}</p>
    <h1>${left.titre}</h1>
    <p class="sub">${left.sub}</p>
  </div>
  <div class="right">
${right.map((b) => `    <p class="${b.cls}">${b.text}</p>`).join('\n')}
  </div>
</body></html>`;

const IMAGES = [
  {
    nom: 'og-calculateur-1200x630.png',
    html: page(
      {
        eyebrow: `Bulletin de paie · Maroc · LF ${ANNEE}`,
        titre: 'Calculateur du Salaire Brut/Net Maroc',
        sub: `Simulateur IR ${ANNEE} · CNSS · AMO · CIMR — gratuit, 100 % local`,
      },
      [
        { cls: 'badge', text: `IR ${ANNEE}` },
        { cls: 'big', text: '6 tranches' },
      ],
    ),
  },
  {
    nom: 'og-comparateur-1200x630.png',
    html: page(
      {
        eyebrow: `Comparateur · Maroc · PLF ${ANNEE_CIBLE} (projet)`,
        titre: `Salaire net ${ANNEE_CIBLE} vs ${ANNEE}`,
        sub: `Barèmes IR du PLF ${ANNEE_CIBLE} · écart mensuel et annuel — gratuit, 100 % local`,
      },
      [
        { cls: 'badge', text: `${ANNEE} ↔ ${ANNEE_CIBLE}` },
        { cls: 'big', text: '+500' },
        { cls: 'badge', text: 'MAD/mois max' },
      ],
    ),
  },
];

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const img of IMAGES) {
  await tab.setContent(img.html, { waitUntil: 'networkidle' });
  await tab.screenshot({ path: join(ROOT, 'public', img.nom) });
}
await browser.close();
console.log(`OG OK : ${IMAGES.map((i) => `public/${i.nom}`).join(', ')}`);
