// D1 : check responsive multi-largeurs via le harnais partagé.
import { ouvrirCalculateur } from './helpers.mjs';

const widths = [320, 480, 700, 1024];
for (const width of widths) {
  const { browser, page } = await ouvrirCalculateur(width, 800);
  const check = await page.evaluate(() => {
    const strongs = [...document.querySelectorAll('.net-main strong, .net-alt strong')];
    return {
      pageOverflow: document.documentElement.scrollWidth,
      netsClipped: strongs.map((el) => ({
        text: el.textContent.trim(),
        clipped: el.scrollWidth > el.clientWidth + 1,
      })),
    };
  });
  console.log(width, 'px → scrollWidth:', check.pageOverflow, '| nets:', JSON.stringify(check.netsClipped));
  await browser.close();
  if (check.pageOverflow > width + 1) throw new Error(`Débordement page à ${width}px`);
  for (const n of check.netsClipped) {
    if (n.clipped) throw new Error(`Montant rogné à ${width}px : ${n.text}`);
  }
}

const { browser, page } = await ouvrirCalculateur(320, 568);
const scrollable = await page.evaluate(() => {
  const el = document.querySelector('.table-scroll');
  return { canScroll: el.scrollWidth > el.clientWidth, tabbable: el.tabIndex === 0 };
});
console.log('table-scroll 320px:', JSON.stringify(scrollable));
if (!scrollable.canScroll) throw new Error('.table-scroll ne défile pas à 320px');
if (!scrollable.tabbable) throw new Error('.table-scroll non atteignable au clavier');
await page.screenshot({ path: 'e2e-mobile.png', fullPage: true });
console.log('screenshot: e2e-mobile.png OK');
await browser.close();
console.log('RESPONSIVE OK');
