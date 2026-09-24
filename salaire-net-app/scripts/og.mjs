// Génère public/og-calculateur-1200x630.png via Chromium (Playwright).
// `npm run og` — relancer après changement de titre ou de millésime.
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ANNEE } from './site.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700&family=Inter:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet" />
<style>
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
</style></head>
<body>
  <div class="left">
    <p class="eyebrow">Bulletin de paie · Maroc · LF ${ANNEE}</p>
    <h1>Calculateur du Salaire Brut/Net Maroc</h1>
    <p class="sub">Simulateur IR ${ANNEE} · CNSS · AMO · CIMR — gratuit, 100 % local</p>
  </div>
  <div class="right">
    <p class="badge">IR ${ANNEE}</p>
    <p class="big">6 tranches</p>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: join(ROOT, 'public/og-calculateur-1200x630.png') });
await browser.close();
console.log('OG OK : public/og-calculateur-1200x630.png');
