// Moteur de calcul pur — conforme à Calcul.md v1.0
// Ordre strict: anc. → SBI → FP/CNSS/AMO/CIMR → SNI → IR → Net
// Arrondi: round2 + clamp ≥ 0 après chaque ligne (paie réelle).

import {
  AMO,
  ANNEE_COURANTE,
  CIMR_SEUIL_FISCAL,
  CNSS,
  FAMILLE,
  SMIG_MENSUEL,
  findTranche,
  findTrancheFP,
  getBareme,
  type StatutBareme,
  type TrancheFP,
  type TrancheIR,
} from './baremes';
import { court } from './format';

export interface Inputs {
  brutBase: number;
  dateEmbauche: string; // YYYY-MM-DD, '' = pas d'ancienneté
  panier: number;
  transport: number;
  amoOui: boolean;
  tauxCimr: number; // % ex: 6 = 6%
  nbCharges: number; // 0..6
  refDate?: Date; // défaut today (injectable pour tests)
  annee?: number; // millésime IR+FP ; défaut = dernière année 'en-vigueur' (D10)
}

export interface Anciennete {
  ans: number;
  mois: number;
  taux: number; // 0..0.25
  tauxPct: number;
  libelle: string;
}

// ---------------------------------------------------------------------------
// C5 : avertissements codés — le moteur émet des codes + paramètres,
// l'adapter (main.ts) formate le français. Les tests assertent les codes,
// le libellé reste libre.
// ---------------------------------------------------------------------------

export type Avertissement =
  | { code: 'smig'; seuil: number }
  | { code: 'cimr-fiscal'; taux: number }
  | { code: 'fp-plafonne' };

export interface Resultat {
  // mensuel (arrondi 2 déc.)
  primeAnc: number;
  brutMajore: number;
  sbi: number;
  totalGains: number;
  fp: number;
  fpPlafonne: boolean;
  cnss: number;
  amo: number;
  cimr: number;
  sni: number;
  irBrut: number;
  familleDed: number;
  irNet: number;
  net: number;
  trancheLabel: string;
  trancheIndex: number;
  tauxFP: number; // taux nominal FP appliqué (0.35/0.25 en 2026 · 0.45 en 2027+)
  tauxIR: number; // 0..0.37 — taux nominal de la tranche appliquée
  annee: number; // millésime des barèmes appliqués
  statut: StatutBareme; // 'en-vigueur' | 'projet' — badge UI (D10)
  // annuel = mensuel * 12
  annual: Record<
    | 'brutMajore'
    | 'sbi'
    | 'totalGains'
    | 'fp'
    | 'cnss'
    | 'amo'
    | 'cimr'
    | 'sni'
    | 'irBrut'
    | 'irNet'
    | 'net'
    | 'primeAnc',
    number
  >;
  irAnnuelControle: number;
  anciennete: Anciennete;
  avertissements: Avertissement[];
}

export function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function pos2(n: number): number {
  return Math.max(0, round2(n));
}

export function getTauxAnciennete(anneesRevolues: number): number {  if (anneesRevolues < 2) return 0;
  if (anneesRevolues < 5) return 0.05;
  if (anneesRevolues < 12) return 0.1;
  if (anneesRevolues < 20) return 0.15;
  if (anneesRevolues < 25) return 0.2;
  return 0.25;
}

export function getAnciennete(dateEmbauche: string, ref: Date = new Date()): Anciennete {  if (!dateEmbauche) {
    return { ans: 0, mois: 0, taux: 0, tauxPct: 0, libelle: 'Sans ancienneté' };
  }
  const emb = new Date(dateEmbauche + 'T00:00:00');
  if (Number.isNaN(emb.getTime()) || emb > ref) {
    return { ans: 0, mois: 0, taux: 0, tauxPct: 0, libelle: 'Date invalide' };
  }
  let ans = ref.getFullYear() - emb.getFullYear();
  let mois = ref.getMonth() - emb.getMonth();
  if (ref.getDate() < emb.getDate()) mois -= 1;
  if (mois < 0) {
    ans -= 1;
    mois += 12;
  }
  if (ans < 0) ans = 0;
  const taux = getTauxAnciennete(ans);
  return {
    ans,
    mois,
    taux,
    tauxPct: Math.round(taux * 100),
    libelle: `${ans} an${ans > 1 ? 's' : ''} ${mois} mois → ${Math.round(taux * 100)}%`,
  };
}

// ---------------------------------------------------------------------------
// C4 : l'impôt par tranche (recherche + formule + métadonnées) vit ici.
// Les deux chemins (mensuel, contrôle annuel) appellent ce module :
// le barème 2027 atterrira dans les données, pas dans des branches.
// ---------------------------------------------------------------------------

export interface ImpotTranche {
  /** IR brut arrondi (0 en tranche à 0 %). */
  brut: number;
  tranche: TrancheIR;
  index: number;
}

export function impotTranche(sni: number, bareme: TrancheIR[]): ImpotTranche {
  const tranche = findTranche(sni, bareme);
  return {
    brut: tranche.taux === 0 ? 0 : pos2(sni * tranche.taux - tranche.deduction),
    tranche,
    index: bareme.indexOf(tranche),
  };
}

// ---------------------------------------------------------------------------
// C3 : les assiettes (bases) se décident UNE fois, ici. Règle issue du
// bulletin réel : panier/transport = indemnités non imposables, exclues de
// TOUTES les bases (FP/CNSS/AMO/CIMR/SNI), versées dans le net via les gains.
// Les deux bugs de production vivaient dans des choix de base dispersés.
// ---------------------------------------------------------------------------

export interface Assiettes {
  /** Base imposable et cotisable = brut majoré. */
  imposable: number;
  /** Gains versés = imposable + panier + transport. */
  gains: number;
}

export function assiettes(brutMajore: number, panier: number, transport: number): Assiettes {
  const imposable = pos2(brutMajore);
  return { imposable, gains: pos2(brutMajore + panier + transport) };
}

// ---------------------------------------------------------------------------
// D9 : FP générique par tranches — un seul moteur pour tous les millésimes
// (2026 : deux paliers 35 %/25 % avec seuil 78 000 ; 2027+ : 45 % uniforme,
// plafond 35 000/an). La tranche FP n'est pas une retenue : c'est la déduction
// fiscale qui abaisse le SNI (affichage positif dans le comparateur, T3).
// ---------------------------------------------------------------------------

export interface ResultatFP {
  fp: number;
  fpPlafonne: boolean;
  taux: number;
}

export function fraisPro(sbi: number, tranches: TrancheFP[]): ResultatFP {
  const tranche = findTrancheFP(sbi * 12, tranches);
  const brutFp = sbi * tranche.taux;
  const plafondMensuel = tranche.plafondAnnuel / 12;
  return {
    fp: pos2(Math.min(brutFp, plafondMensuel)),
    fpPlafonne: brutFp >= plafondMensuel,
    taux: tranche.taux,
  };
}

export function calcMensuel(inp: Inputs): Resultat {
  const annee = inp.annee ?? ANNEE_COURANTE;
  const bareme = getBareme(annee);
  const ref = inp.refDate ?? new Date();
  const brutBase = Math.max(0, inp.brutBase || 0);
  const panier = Math.max(0, inp.panier || 0);
  const transport = Math.max(0, inp.transport || 0);
  const nbCharges = Math.min(FAMILLE.maxPersonnes, Math.max(0, Math.floor(inp.nbCharges || 0)));
  const tauxCimr = Math.min(100, Math.max(0, inp.tauxCimr || 0));

  const anciennete = getAnciennete(inp.dateEmbauche, ref);
  const avertissements: Avertissement[] = [];

  const primeAnc = pos2(brutBase * anciennete.taux);
  const brutMajore = pos2(brutBase + primeAnc);
  const { imposable: sbi, gains: totalGains } = assiettes(brutMajore, panier, transport);

  // FP — D9 : tranches génériques du millésime
  const { fp, fpPlafonne, taux: tauxFP } = fraisPro(sbi, bareme.fp);

  const cnss = pos2(Math.min(sbi, CNSS.plafond) * CNSS.taux);
  const amo = inp.amoOui ? pos2(sbi * AMO.taux) : 0;
  // Assiette CIMR = brut majoré (avant déduction panier/transport) — bulletin réel.
  // La cotisation reste déductible du SNI et prélevée du net.
  const cimr = pos2(brutMajore * (tauxCimr / 100));

  const sni = pos2(sbi - fp - cnss - amo - cimr);

  const { brut: irBrut, tranche, index: trancheIndex } = impotTranche(sni, bareme.irMensuel);

  const familleDed = pos2(Math.min(nbCharges * FAMILLE.parPersonneMois, FAMILLE.plafondMois));
  const irNet = pos2(irBrut - familleDed);

  // Net = total des gains − cotisations − IR (les exonérées sont versées).
  const net = pos2(totalGains - cnss - amo - cimr - irNet);

  // Contrôle annuel IR (barème annuel sur SNI annualisé)
  const sniAn = round2(sni * 12);
  const { brut: irAnnuelControle } = impotTranche(sniAn, bareme.irAnnuel);

  const annual = {
    primeAnc: pos2(primeAnc * 12),
    brutMajore: pos2(brutMajore * 12),
    sbi: pos2(sbi * 12),
    totalGains: pos2(totalGains * 12),
    fp: pos2(fp * 12),
    cnss: pos2(cnss * 12),
    amo: pos2(amo * 12),
    cimr: pos2(cimr * 12),
    sni: sniAn,
    irBrut: pos2(irBrut * 12),
    irNet: pos2(irNet * 12),
    net: pos2(net * 12),
  };

  if (brutBase > 0 && brutBase < SMIG_MENSUEL) {
    avertissements.push({ code: 'smig', seuil: SMIG_MENSUEL });
  }
  if (tauxCimr > CIMR_SEUIL_FISCAL) {
    avertissements.push({ code: 'cimr-fiscal', taux: tauxCimr });
  }
  if (fpPlafonne) {
    avertissements.push({ code: 'fp-plafonne' });
  }

  return {
    primeAnc,
    brutMajore,
    sbi,
    totalGains,
    fp,
    fpPlafonne,
    cnss,
    amo,
    cimr,
    sni,
    irBrut,
    familleDed,
    irNet,
    net,
    trancheLabel: tranche.label,
    trancheIndex,
    tauxFP,
    tauxIR: tranche.taux,
    annee: bareme.annee,
    statut: bareme.statut,
    annual,
    irAnnuelControle,
    anciennete,
    avertissements,
  };
}

// ---------------------------------------------------------------------------
// C1 : modèle de lignes du bulletin. Tout le savoir de présentation
// (ordre, libellés, taux affichés, annualisable ou non) vit ici, derrière
// l'interface — main.ts ne fait que rendre (adapter), les tests assertent ici.
// ---------------------------------------------------------------------------

export interface LignePaie {
  id: string;
  label: string;
  /** Taux nominal en points (ex. 25, 4.48). Absent = pas de taux (« — »). */
  tauxPct?: number;
  mensuel: number;
  /** Montant annuel, null si non annualisable (ex. déduction famille). */
  annuel: number | null;
  /** Ligne mise en évidence. */
  accent?: boolean;
}

export interface EntreesLignes {
  tauxCimr: number;
  amoOui: boolean;
  nbCharges: number;
}

/** Montants de retenue : signe négatif, avec normalisation du -0. */
const retenue = (n: number): number => (n === 0 ? 0 : -n);

export function lignesPaie(r: Resultat, e: EntreesLignes): LignePaie[] {
  return [
    { id: 'brut-majore', label: 'Brut majoré (base + ancienneté)', mensuel: r.brutMajore, annuel: r.annual.brutMajore },
    { id: 'prime-anc', label: 'Prime ancienneté', mensuel: r.primeAnc, annuel: r.annual.primeAnc },
    { id: 'sbi', label: 'SBI = brut majoré (base imposable)', mensuel: r.sbi, annuel: r.annual.sbi, accent: true },
    { id: 'total-gains', label: 'Total gains (SBI + panier + transport)', mensuel: r.totalGains, annuel: r.annual.totalGains },
    { id: 'fp', label: 'Frais professionnels', tauxPct: r.tauxFP * 100, mensuel: retenue(r.fp), annuel: retenue(r.annual.fp) },
    { id: 'cnss', label: `CNSS (plaf. ${court(CNSS.plafond)})`, tauxPct: CNSS.taux * 100, mensuel: retenue(r.cnss), annuel: retenue(r.annual.cnss) },
    { id: 'amo', label: 'AMO', tauxPct: e.amoOui ? AMO.taux * 100 : undefined, mensuel: retenue(r.amo), annuel: retenue(r.annual.amo) },
    { id: 'cimr', label: 'CIMR', tauxPct: e.tauxCimr, mensuel: retenue(r.cimr), annuel: retenue(r.annual.cimr) },
    { id: 'sni', label: 'SNI (assiette IR)', mensuel: r.sni, annuel: r.annual.sni, accent: true },
    { id: 'ir-brut', label: 'IR brut', tauxPct: r.tauxIR * 100, mensuel: retenue(r.irBrut), annuel: retenue(r.annual.irBrut) },
    { id: 'famille', label: `Déduction famille (${e.nbCharges} pers.)`, mensuel: r.familleDed, annuel: null },
    { id: 'ir-net', label: 'IR net', mensuel: retenue(r.irNet), annuel: retenue(r.annual.irNet), accent: true },
    { id: 'net', label: 'Net à payer', mensuel: r.net, annuel: r.annual.net, accent: true },
  ];
}

// ---------------------------------------------------------------------------
// I2 — modèle de lignes du bulletin COMPARÉ (2 millésimes + écart). Même
// principe que lignesPaie (C1) : le savoir de présentation vit ici, la page
// ne fait que rendre. FP affiché POSITIF (déduction fiscale qui abaisse l'IR,
// pas une retenue — décision T3) ; l'écart n'est coloré que sur IR brut /
// IR net / Net (colore) — FP/SNI restent neutres.
// ---------------------------------------------------------------------------

export interface LigneComparateur {
  id: string;
  label: string;
  /** Suffixe de taux du libellé : ' · 25 %' ou ' · 25 % → 45 %' si le millésime change. */
  labelTaux?: string;
  /** Millésime de référence (2026) — mensuel. */
  a: number;
  /** Millésime comparé — mensuel. */
  b: number;
  annuelA: number | null;
  annuelB: number | null;
  /** Écart mensuel b − a (round2). */
  ecart: number;
  /** Écart en % de |a| (même signe que l'écart MAD) — null si a = 0 ou écart nul. */
  ecartPct: number | null;
  /** Écart annuel ligne à ligne — null si non annualisable (famille). */
  ecartAnnuel: number | null;
  /** Écart annuel en % de |a| annuel — null si non annualisable ou écart nul. */
  ecartAnnuelPct: number | null;
  /** Colore l'écart (IR brut, IR net, Net à payer). */
  colore: boolean;
  /** Ligne mise en évidence (sous-totaux, net). */
  accent?: boolean;
}

/** Écart + % relatif (signe = signe de l'écart, base = |a|). */
const ecartDe = (x: number, y: number): { ecart: number; pct: number | null } => {
  const d = round2(y - x);
  return { ecart: d, pct: d === 0 || x === 0 ? null : round2((d / Math.abs(x)) * 100) };
};

export function lignesComparateur(a: Resultat, b: Resultat, e: EntreesLignes): LigneComparateur[] {
  const suffixe = (ta: number | undefined, tb: number | undefined): string | undefined => {
    if (ta === undefined && tb === undefined) return undefined;
    return ta === tb ? ` · ${court(ta!)} %` : ` · ${court(ta!)} % → ${court(tb!)} %`;
  };
  const lignes = [
    { id: 'brut-majore', label: 'Brut majoré (base + ancienneté)', a: a.brutMajore, b: b.brutMajore, annuelA: a.annual.brutMajore, annuelB: b.annual.brutMajore, colore: false },
    { id: 'prime-anc', label: 'Prime ancienneté', a: a.primeAnc, b: b.primeAnc, annuelA: a.annual.primeAnc, annuelB: b.annual.primeAnc, colore: false },
    { id: 'sbi', label: 'SBI = brut majoré (base imposable)', a: a.sbi, b: b.sbi, annuelA: a.annual.sbi, annuelB: b.annual.sbi, colore: false, accent: true },
    { id: 'total-gains', label: 'Total gains (SBI + panier + transport)', a: a.totalGains, b: b.totalGains, annuelA: a.annual.totalGains, annuelB: b.annual.totalGains, colore: false },
    { id: 'fp', label: 'Frais professionnels (déduction fiscale)', labelTaux: suffixe(a.tauxFP * 100, b.tauxFP * 100), a: a.fp, b: b.fp, annuelA: a.annual.fp, annuelB: b.annual.fp, colore: false },
    { id: 'cnss', label: `CNSS (plaf. ${court(CNSS.plafond)})`, labelTaux: ` · ${court(CNSS.taux * 100)} %`, a: retenue(a.cnss), b: retenue(b.cnss), annuelA: retenue(a.annual.cnss), annuelB: retenue(b.annual.cnss), colore: false },
    { id: 'amo', label: 'AMO', labelTaux: e.amoOui ? ` · ${court(AMO.taux * 100)} %` : undefined, a: retenue(a.amo), b: retenue(b.amo), annuelA: retenue(a.annual.amo), annuelB: retenue(b.annual.amo), colore: false },
    { id: 'cimr', label: 'CIMR', labelTaux: e.tauxCimr > 0 ? ` · ${court(e.tauxCimr)} %` : undefined, a: retenue(a.cimr), b: retenue(b.cimr), annuelA: retenue(a.annual.cimr), annuelB: retenue(b.annual.cimr), colore: false },
    { id: 'sni', label: 'SNI (assiette IR)', a: a.sni, b: b.sni, annuelA: a.annual.sni, annuelB: b.annual.sni, colore: false, accent: true },
    { id: 'ir-brut', label: 'IR brut', labelTaux: suffixe(a.tauxIR * 100, b.tauxIR * 100), a: retenue(a.irBrut), b: retenue(b.irBrut), annuelA: retenue(a.annual.irBrut), annuelB: retenue(b.annual.irBrut), colore: true },
    { id: 'famille', label: `Déduction famille (${e.nbCharges} pers.)`, a: a.familleDed, b: b.familleDed, annuelA: null, annuelB: null, colore: false },
    { id: 'ir-net', label: 'IR net', a: retenue(a.irNet), b: retenue(b.irNet), annuelA: retenue(a.annual.irNet), annuelB: retenue(b.annual.irNet), colore: true, accent: true },
    { id: 'net', label: 'Net à payer', a: a.net, b: b.net, annuelA: a.annual.net, annuelB: b.annual.net, colore: true, accent: true },
  ];
  return lignes.map((l) => {
    const m = ecartDe(l.a, l.b);
    const ann =
      l.annuelA !== null && l.annuelB !== null ? ecartDe(l.annuelA, l.annuelB) : null;
    return {
      ...l,
      ecart: m.ecart,
      ecartPct: m.pct,
      ecartAnnuel: ann?.ecart ?? null,
      ecartAnnuelPct: ann?.pct ?? null,
    };
  });
}
