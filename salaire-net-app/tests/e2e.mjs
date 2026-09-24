// D1 : scénario e2e fin — même couverture via le harnais partagé.
import { lireLigne, ouvrirCalculateur, remplirBulletin } from './helpers.mjs';
import { BULLETIN_ATTENDUS } from './bulletin-ref.mjs';

const { browser, page } = await ouvrirCalculateur();

// Défauts au chargement (générés depuis baremes.ts) : brut = SMIG 2026,
// panier/transport 500, CIMR 0 %, 0 charge, AMO oui.
const netMois = await page.textContent('#net-mois');
const netAn = await page.textContent('#net-an');
const badge = await page.textContent('#badge-tranche');
console.log('net-mois:', netMois);
console.log('net-an:', netAn);
console.log('badge:', badge);

// Cas SMIG: brut 3000 → warning visible
await page.fill('#brut', '3000');
await page.waitForTimeout(300);
const warns1 = await page.textContent('#warnings');
console.log('warnings brut=3000:', warns1);
if (!warns1.includes('SMIG')) throw new Error('Warning SMIG absent');

// Cas CIMR 10% → warning fiscal
await page.fill('#brut', '8000');
await page.selectOption('#cimr', '10');
await page.waitForTimeout(300);
const warns2 = await page.textContent('#warnings');
console.log('warnings cimr=10:', warns2);
if (!warns2.includes('6 %')) throw new Error('Warning CIMR >6% absent');

// Cas bulletin réel (fixture partagée) → CIMR attendue
await remplirBulletin(page);
await page.waitForTimeout(300);
const cimrMensuel = (await lireLigne(page, 'CIMR')).mensuel;
console.log('CIMR mensuelle:', cimrMensuel);
const attendu = String(BULLETIN_ATTENDUS.cimr).replace('.', ',');
if (!cimrMensuel.replace(/\s/g, '').includes(attendu)) {
  throw new Error(`CIMR attendue ${attendu}, obtenu: ${cimrMensuel}`);
}

// Retour valeurs de référence + screenshot
await page.selectOption('#cimr', '6');
await page.selectOption('#charges', '2');
await page.waitForTimeout(300);
await page.screenshot({ path: 'e2e.png', fullPage: true });
console.log('screenshot: e2e.png OK');

await browser.close();
console.log('E2E OK');
