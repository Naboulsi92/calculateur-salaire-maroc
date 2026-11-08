// Vérif ponctuelle (non commitée) : sélecteur 2026 / 2027+ — clic, 320 px.
import { chromium } from '@playwright/test';
import { PREVIEW_URL } from './bulletin-ref.mjs';

const browser = await chromium.launch();

// 320 px : la nav doit tenir sans débordement, cibles ≥ 44 px.
const page = await browser.newPage({ viewport: { width: 320, height: 800 } });
for (const [url, nom] of [
  [PREVIEW_URL, 'home'],
  [new URL('salaire-net-2027', PREVIEW_URL).href, 'comparateur'],
  [new URL('salaire-net-8000', PREVIEW_URL).href, '8000'],
]) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(250);
  const r = await page.evaluate(() => {
    const nav = document.querySelector('.seg-nav');
    const liens = [...nav.querySelectorAll('a')];
    return {
      scrollWidth: document.documentElement.scrollWidth,
      navDepasse: nav.scrollWidth > nav.clientWidth,
      pillLaPlusLarge: Math.round(Math.max(...liens.map((a) => a.getBoundingClientRect().width))),
      cibles44: liens.every((a) => a.getBoundingClientRect().height >= 44),
      courant: liens.find((a) => a.getAttribute('aria-current'))?.textContent.trim(),
    };
  });
  console.log(nom, JSON.stringify(r));
  if (r.scrollWidth > 320) throw new Error(`${nom}: débordement horizontal à 320 px`);
}

// Clic via la pill, dans les deux sens.
const d = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await d.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
await d.click('.seg-nav a[href="/salaire-net-2027"]');
await d.waitForURL('**/salaire-net-2027');
console.log('clic home → comparateur: OK');
await d.click('.seg-nav a[href="/"]');
await d.waitForURL((u) => u.pathname === '/');
console.log('clic comparateur → home: OK');

await browser.close();
console.log('SEG NAV OK');
