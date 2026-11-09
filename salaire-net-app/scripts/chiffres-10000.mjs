// Build 2/7 (ticket 10) — chiffres de /salaire-net-10000 sortis du moteur,
// JAMAIS de la main. Câblé AVANT `npm run seo` dans `npm run build` :
//   1) calcMensuel / format / baremes chargés via l'API Vite (SSR) — la page
//      statique et l'app partagent EXACTEMENT le même moteur et les mêmes
//      formatters (D2) ;
//   2) brutPourNet = dichotomie sur calcMensuel (motif du plateau v3 : lo=0,
//      hi=600 000, 90 itérations, round2) ;
//   3) oracles du ticket 10 (08/11/2026) re-vérifiés à ≤ 0,02 MAD : toute
//      divergence STOPPE le build avant toute écriture (changement LF
//      suspecté → griller, ne pas « coller à la main ») ;
//   4) régions CHIFFRES:* de salaire-net-10000.html stampées (tuiles, bulletin
//      inversé, bandeau 2027, table de vérification).
// Particularités page 10000 (ticket 10) :
//   - le brut de base trouvé (10 126,92) DÉPASSE le net voulu — retenues
//     (CNSS plafonnée + AMO + IR T4) ≈ 1 127 MAD > avantage panier/transport
//     1 000 MAD ; wording FAQ/note inversé vs page 8000 ;
//   - data-n annuel = valeur BRUTE du moteur (119999.88, SANS Math.round) —
//     le count-up e2e compare fmt(Number(data-n)) à l'affichage ;
//   - bandeau 2027 : PAS de mention « IR à zéro » à ce brut (IR 158,85),
//     écart mensuel ET annuel (+442,71/mois · +5 312,52/an = golden comparateur).
import { createServer } from 'vite';
import { region } from './regions.mjs';
import { PAGE_10000 } from './site.mjs';

const FICHIER = 'salaire-net-10000.html';
const TOL = 0.02; // MAD — tolérance ticket 10

const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

try {
  const { calcMensuel, round2 } = await vite.ssrLoadModule('/src/calcul.ts');
  const { montant, court } = await vite.ssrLoadModule('/src/format.ts');
  const { CNSS, AMO } = await vite.ssrLoadModule('/src/baremes.ts');

  /** Profil courant (oracle ticket 10) : panier 500 + transport 500, AMO,
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

  /** Assertion d'oracle : divergence > TOL = build mort, rien n'est stampé. */
  const proche = (calcule, oracle, label) => {
    if (Math.abs(calcule - oracle) > TOL) {
      throw new Error(
        `Oracle divergent ${label} : moteur ${calcule} vs oracle ${oracle} (tolérance ${TOL} MAD) — STOP, griller avant d'écrire la page.`,
      );
    }
  };

  // ---------------------------------------------------------------------------
  // 1) Oracles (ticket 10, 08/11/2026) — golden comparateur recoupé
  //    (+442,71/mois · +5 312,52/an au brut 10 000 en 2027).
  // ---------------------------------------------------------------------------
  const brut = brutPourNet(10000);
  proche(brut, 10126.92, 'net 10 000 ⇒ brut de base');
  const r = calcMensuel({ ...PROFIL, brutBase: brut });
  proche(r.net, 9999.99, 'contrôle net(brut)'); // centime dichotomie assumé (ticket 10)
  proche(r.totalGains, 11126.92, 'Total gains');
  proche(r.irNet, 629.26, 'IR net');
  if (r.trancheIndex !== 3 || Math.abs(r.tauxIR - 0.3) > 1e-9) {
    throw new Error(`Tranche attendue T4 · 30 %, obtenu ${r.trancheLabel} — STOP.`);
  }
  proche(r.annual.net, 119999.88, 'net annuel');
  const rDirect = calcMensuel({ ...PROFIL, brutBase: 10000 });
  proche(rDirect.net, 9903.64, 'brut 10 000 ⇒ net 2026');
  proche(rDirect.irNet, 601.56, 'IR au brut 10 000');
  proche(rDirect.annual.net, 118843.68, 'net annuel au brut 10 000');
  const r27 = calcMensuel({ ...PROFIL, brutBase: 10000, annee: 2027 });
  proche(r27.net, 10346.35, 'brut 10 000 ⇒ net 2027');
  proche(r27.irNet, 158.85, 'IR 2027 au brut 10 000');
  const ecart27 = round2(r27.net - rDirect.net);
  proche(ecart27, 442.71, 'écart 2027');
  const ecartAn27 = round2(r27.annual.net - rDirect.annual.net);
  proche(ecartAn27, 5312.52, 'écart annuel 2027');

  /** Table de vérification brut → net autour de 10 000 : double saut de
   * tranche T3→T4 (à 10 000) puis T4→T5 (à 12 000), oracles IR du ticket 10. */
  const PLANCHE = [
    [7500, 7857.69, 94292.28, 204.01],
    [8000, 8273.65, 99283.8, 276.75],
    [9000, 9105.57, 109266.84, 422.23],
    [10000, 9903.64, 118843.68, 601.56],
    [11000, 10662.82, 127953.84, 819.78],
    [12000, 11388.6, 136663.2, 1071.4],
  ];
  const resVerif = PLANCHE.map(([brutRef, netOracle, anOracle, irOracle]) => {
    const rr = calcMensuel({ ...PROFIL, brutBase: brutRef });
    proche(rr.net, netOracle, `table net au brut ${brutRef}`);
    proche(rr.annual.net, anOracle, `table net annuel au brut ${brutRef}`);
    proche(rr.irNet, irOracle, `table IR au brut ${brutRef}`);
    return rr;
  });
  if (resVerif[3].net !== rDirect.net) {
    throw new Error('Ligne forte 10 000 : cohérence entre table et carte réponse rompue.');
  }

  // ---------------------------------------------------------------------------
  // 2) Fanion « tout le texte chiffré vient du moteur » : ogDescription et la
  //    FAQ 1 portent le brut dérivé ; l'assertion meurt si on les a éditées
  //    sans re-dérivage (site.mjs reste aligné sur le moteur).
  // ---------------------------------------------------------------------------
  const norm = (s) => s.replace(/[\s─]/g, '');
  if (!norm(PAGE_10000.ogDescription).includes(norm(montant(brut)))) {
    throw new Error(
      `ogDescription de PAGE_10000 ne porte pas le brut dérivé (${montant(brut)}) — aligner scripts/site.mjs sur le moteur.`,
    );
  }
  const faq1 = PAGE_10000.faq[0];
  if (!faq1 || !norm(faq1.a).includes(norm(montant(brut)))) {
    throw new Error(
      `FAQ 10000 (réponse 1) ne porte pas le brut dérivé (${montant(brut)}) — aligner scripts/site.mjs sur le moteur.`,
    );
  }

  // ---------------------------------------------------------------------------
  // 3) Stamping des régions CHIFFRES:* — labels verbatim du lexique calcul.ts
  //    ('Total gains (SBI + panier + transport)', 'Net à payer', groupes
  //    'Retenues salariales' puis 'Impôt' — vue « à l'envers » clonée du
  //    gabarit page 8000, direction v1 ratifiée).
  // ---------------------------------------------------------------------------
  const tranche = r.trancheLabel.split('·')[0].trim(); // 'T4'
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
      `              <strong class="mono"><span class="n" data-n="10000">${montant(10000)}</span><span class="mad">MAD</span></strong>`,
      '            </div>',
      '            <div class="net-alt">',
      '              <span>Brut de base trouvé</span>',
      `              <strong class="mono"><span class="n" data-n="${brut}">${montant(brut)}</span><span class="mad">MAD</span></strong>`,
      '            </div>',
      '            <div class="net-ecart">',
      '              <span>Net annuel</span>',
      `              <strong class="mono"><span class="n" data-n="${r.annual.net}">${montant(r.annual.net)}</span><span class="mad">MAD</span></strong>`,
      '              <small>9 999,99 × 12, profil courant</small>',
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
      `          <span class="bandeau-texte"><b>Et si vous attendez 2027 ?</b><small>Brut 10 000 → net ${montant(rDirect.net)} en 2026, ${montant(r27.net)} en 2027 (+${montant(ecart27)}/mois · +${montant(ecartAn27)}/an)</small></span>`,
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
      const ouvrant = brutRef === 10000 ? '<tr class="strong">' : '<tr>';
      return `${ouvrant}<td>${montant(brutRef)}</td><td class="num mono">${montant(rr.irNet)}</td><td class="num mono">${montant(rr.net)}</td><td class="num mono">${montant(rr.annual.net)}</td><td class="num mono">${court(rr.tauxIR * 100)} %</td></tr>`;
    }).join('\n'),
    'CHIFFRES',
  );

  console.log(
    `CHIFFRES OK : oracles ≤ ${TOL} MAD (brut ${montant(brut)} pour net 10 000, écart 2027 +${montant(ecart27)} · +${montant(ecartAn27)}/an) · 4 régions stampées dans ${FICHIER}`,
  );
} finally {
  await vite.close();
}
