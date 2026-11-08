// Build 1/7 (ticket 09) — chiffres de /salaire-net-8000 sortis du moteur,
// JAMAIS de la main. Câblé AVANT `npm run seo` dans `npm run build` :
//   1) calcMensuel / format / baremes chargés via l'API Vite (SSR) — la page
//      statique et l'app partagent EXACTEMENT le même moteur et les mêmes
//      formatters (D2) ;
//   2) brutPourNet = dichotomie sur calcMensuel (motif du plateau v3 : lo=0,
//      hi=600 000, 90 itérations, round2) ;
//   3) oracles du ticket 09 (04/11/2026) re-vérifiés à ≤ 0,02 MAD : toute
//      divergence STOPPE le build avant toute écriture (changement LF
//      suspecté → griller, ne pas « coller à la main ») ;
//   4) régions CHIFFRES:* de salaire-net-8000.html stampées (tuiles, bulletin
//      inversé, bandeau 2027, table de vérification).
import { createServer } from 'vite';
import { region } from './regions.mjs';
import { PAGE_8000 } from './site.mjs';

const FICHIER = 'salaire-net-8000.html';
const TOL = 0.02; // MAD — tolérance ticket 09

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const { calcMensuel, round2 } = await vite.ssrLoadModule('/src/calcul.ts');
  const { montant, court } = await vite.ssrLoadModule('/src/format.ts');
  const { CNSS, AMO } = await vite.ssrLoadModule('/src/baremes.ts');

  /** Profil courant (oracle ticket 09) : panier 500 + transport 500, AMO,
   * sans CIMR ni personne à charge, sans ancienneté. */
  const PROFIL = {
    dateEmbauche: '',
    panier: 500,
    transport: 500,
    amoOui: true,
    tauxCimr: 0,
    nbCharges: 0,
  };
  const netPour = (brutBase, annee) =>
    calcMensuel({ ...PROFIL, brutBase, annee }).net;
  const brutPourNet = (vise) => {
    let lo = 0;
    let hi = 600000;
    for (let i = 0; i < 90; i++) {
      const m = (lo + hi) / 2;
      if (netPour(m) < vise) lo = m;
      else hi = m;
    }
    return round2((lo + hi) / 2);
  };

  /** Assertion d'oracle : divergeance > TOL = build mort, rien n'est stampé. */
  const proche = (calcule, oracle, label) => {
    if (Math.abs(calcule - oracle) > TOL) {
      throw new Error(
        `Oracle divergent ${label} : moteur ${calcule} vs oracle ${oracle} (tolérance ${TOL} MAD) — STOP, griller avant d'écrire la page.`,
      );
    }
  };

  // ---------------------------------------------------------------------------
  // 1) Oracles (ticket 09, 04/11/2026)
  // ---------------------------------------------------------------------------
  const brut = brutPourNet(8000);
  proche(brut, 7671.06, 'net 8 000 ⇒ brut de base');
  const r = calcMensuel({ ...PROFIL, brutBase: brut });
  proche(r.net, 8000, 'contrôle net(brut)');
  proche(r.totalGains, 8671.06, 'Total gains');
  proche(r.irNet, 228.89, 'IR net');
  if (r.trancheIndex !== 2 || Math.abs(r.tauxIR - 0.2) > 1e-9) {
    throw new Error(`Tranche attendue T3 · 20 %, obtenu ${r.trancheLabel} — STOP.`);
  }
  proche(r.annual.net, 96000, 'net annuel');
  const rDirect = calcMensuel({ ...PROFIL, brutBase: 8000 });
  proche(rDirect.net, 8273.65, 'brut 8 000 ⇒ net 2026');
  proche(rDirect.irNet, 276.75, 'IR au brut 8 000');
  proche(rDirect.annual.net, 99283.8, 'net annuel au brut 8 000');
  const r27 = calcMensuel({ ...PROFIL, brutBase: 8000, annee: 2027 });
  proche(r27.net, 8550.4, 'brut 8 000 ⇒ net 2027');
  proche(r27.irNet, 0, 'IR 2027 au brut 8 000');
  const ecart27 = round2(r27.net - rDirect.net);
  proche(ecart27, 276.75, 'écart 2027');

  /** Table de vérification brut → net autour de 8 000 (oracles nets + annuels). */
  const PLANCHE = [
    [7000, 7424.03, 89088.36],
    [7500, 7857.69, 94292.28],
    [8000, 8273.65, 99283.8],
    [8500, 8689.61, 104275.32],
    [9000, 9105.57, 109266.84],
    [10000, 9903.64, 118843.68],
  ];
  const resVerif = PLANCHE.map(([brutRef, netOracle, anOracle]) => {
    const rr = calcMensuel({ ...PROFIL, brutBase: brutRef });
    proche(rr.net, netOracle, `table net au brut ${brutRef}`);
    proche(rr.annual.net, anOracle, `table net annuel au brut ${brutRef}`);
    return rr;
  });
  if (resVerif[2].net !== rDirect.net) {
    throw new Error('Ligne forte 8 000 : cohérence entre table et carte réponse rompue.');
  }

  // ---------------------------------------------------------------------------
  // 2) Fanion « tout le texte chiffré vient du moteur » : ogDescription et la
  //    FAQ 1 portent le brut dérivé ; l'assertion meurt si on les a éditées
  //    sans re-dérivage (site.mjs reste aligné sur le moteur).
  // ---------------------------------------------------------------------------
  const norm = (s) => s.replace(/[\s─]/g, '');
  if (!norm(PAGE_8000.ogDescription).includes(norm(montant(brut)))) {
    throw new Error(
      `ogDescription de PAGE_8000 ne porte pas le brut dérivé (${montant(brut)}) — aligner scripts/site.mjs sur le moteur.`,
    );
  }
  const faq1 = PAGE_8000.faq[0];
  if (!faq1 || !norm(faq1.a).includes(norm(montant(brut)))) {
    throw new Error(
      `FAQ 8000 (réponse 1) ne porte pas le brut dérivé (${montant(brut)}) — aligner scripts/site.mjs sur le moteur.`,
    );
  }

  // ---------------------------------------------------------------------------
  // 3) Stamping des régions CHIFFRES:* — labels verbatim du lexique calcul.ts
  //    ('Total gains (SBI + panier + transport)', 'Net à payer', groupes
  //    'Retenues salariales' puis 'Impôt' — vue « à l'envers » du ticket 09).
  // ---------------------------------------------------------------------------
  const tranche = r.trancheLabel.split('·')[0].trim(); // 'T3'
  const txIR = `${court(r.tauxIR * 100)} %`;
  const txCNSS = `${court(CNSS.taux * 100)} %`;
  const txAMO = `${court(AMO.taux * 100)} %`;
  const minus = (n) => (n === 0 ? montant(0) : `−${montant(Math.abs(n))}`);

  region(
    FICHIER,
    'TUILES',
    [
      '          <div class="nets">',
      '            <div class="net-main">',
      '              <span>Net voulu</span>',
      `              <strong class="mono"><span class="n" data-n="8000">${montant(8000)}</span><span class="mad">MAD</span></strong>`,
      '            </div>',
      '            <div class="net-alt">',
      '              <span>Brut de base trouvé</span>',
      `              <strong class="mono"><span class="n" data-n="${brut}">${montant(brut)}</span><span class="mad">MAD</span></strong>`,
      '            </div>',
      '            <div class="net-ecart">',
      '              <span>Net annuel</span>',
      `              <strong class="mono"><span class="n" data-n="${Math.round(r.annual.net)}">${montant(r.annual.net)}</span><span class="mad">MAD</span></strong>`,
      '              <small>8 000,00 × 12, profil courant</small>',
      '            </div>',
      '          </div>',
      '          <div class="badges">',
      `            <span class="badge">${tranche} · ${txIR}</span>`,
      '            <span class="badge ghost">Panier 500 + transport 500</span>',
      '            <span class="badge ghost">AMO · sans CIMR · 0 charge</span>',
      '          </div>',
    ].join('\n'),
    'CHIFFRES',
  );

  region(
    FICHIER,
    'BULLETIN',
    [
      `                <tr><td>Total gains (SBI + panier + transport)</td><td class="num mono">—</td><td class="num mono">${montant(r.totalGains)}</td><td class="num mono">${montant(r.annual.totalGains)}</td></tr>`,
      `                <tr class="groupe"><td colspan="4">Retenues salariales</td></tr>`,
      `                <tr><td>CNSS</td><td class="num mono">${txCNSS}</td><td class="num mono">${minus(r.cnss)}</td><td class="num mono">${minus(r.annual.cnss)}</td></tr>`,
      `                <tr><td>AMO</td><td class="num mono">${txAMO}</td><td class="num mono">${minus(r.amo)}</td><td class="num mono">${minus(r.annual.amo)}</td></tr>`,
      `                <tr class="groupe"><td colspan="4">Impôt</td></tr>`,
      `                <tr><td>IR net (tranche ${tranche})</td><td class="num mono">${txIR}</td><td class="num mono">${minus(r.irNet)}</td><td class="num mono">${minus(r.annual.irNet)}</td></tr>`,
      `                <tr class="net-row"><td>Net à payer</td><td class="num mono">—</td><td class="num mono">${montant(r.net)}</td><td class="num mono">${montant(r.annual.net)}</td></tr>`,
    ].join('\n'),
    'CHIFFRES',
  );

  region(
    FICHIER,
    'BANDEAU-2027',
    [
      '        <a class="bandeau" href="/salaire-net-2027">',
      '          <span class="badge-nouveau">PLF 2027</span>',
      `          <span class="bandeau-texte"><b>Et si vous attendez 2027 ?</b><small>Brut 8 000 → net ${montant(rDirect.net)} en 2026, ${montant(r27.net)} en 2027 (+${montant(ecart27)}/mois, IR à zéro)</small></span>`,
      '          <span class="bandeau-cta">Comparer<span class="bandeau-fleche" aria-hidden="true">→</span></span>',
      '        </a>',
    ].join('\n'),
    'CHIFFRES',
  );

  region(
    FICHIER,
    'VERIF',
    PLANCHE.map(([brutRef], i) => {
      const rr = resVerif[i];
      const ouvrant = brutRef === 8000 ? '<tr class="strong">' : '<tr>';
      return `${ouvrant}<td>${montant(brutRef)}</td><td class="num mono">${montant(rr.irNet)}</td><td class="num mono">${montant(rr.net)}</td><td class="num mono">${montant(rr.annual.net)}</td><td class="num mono">${court(rr.tauxIR * 100)} %</td></tr>`;
    }).join('\n'),
    'CHIFFRES',
  );

  console.log(
    `CHIFFRES OK : oracles ≤ ${TOL} MAD (brut ${montant(brut)} pour net 8 000, écart 2027 +${montant(ecart27)}) · 4 régions stampées dans ${FICHIER}`,
  );
} finally {
  await vite.close();
}
