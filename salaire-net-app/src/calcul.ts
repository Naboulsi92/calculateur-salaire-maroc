// Moteur de calcul pur — règles LF 2026 (brut → cotisations → IR → net)
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

  // (revue qualité 02/11) le « contrôle annuel IR » (barème annuel sur SNI
  // annualisé) est supprimé : jamais lu par l'UI ni les tests — dette payée.

  const annual = {
    primeAnc: pos2(primeAnc * 12),
    brutMajore: pos2(brutMajore * 12),
    sbi: pos2(sbi * 12),
    totalGains: pos2(totalGains * 12),
    fp: pos2(fp * 12),
    cnss: pos2(cnss * 12),
    amo: pos2(amo * 12),
    cimr: pos2(cimr * 12),
    sni: round2(sni * 12),
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
    anciennete,
    avertissements,
  };
}

// ---------------------------------------------------------------------------
// C1 : modèle de lignes du bulletin. Tout le savoir de présentation
// (ordre, libellés, taux affichés, annualisable ou non) vit ici, derrière
// l'interface — main.ts ne fait que rendre (adapter), les tests assertent ici.
// ---------------------------------------------------------------------------

/** Groupe de presentation : sous-entete emis avant la ligne marquee. */
export type Groupe = 'retenues' | 'ir';

/** Libelles des sous-entetes de groupes (rendu main.ts + comparateur.ts). */
export const GROUPE_LABELS: Record<Groupe, string> = {
  retenues: 'Retenues salariales (prélevées du net)',
  ir: "Calcul de l'IR (base imposable)",
};

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
  /** Sous-entête de groupe émis avant cette ligne (C1 : savoir ici, rendu là). */
  groupe?: Groupe;
}

export interface EntreesLignes {
  tauxCimr: number;
  amoOui: boolean;
  nbCharges: number;
}

/** Montants de retenue : signe négatif, avec normalisation du -0. */
const retenue = (n: number): number => (n === 0 ? 0 : -n);

// ---------------------------------------------------------------------------
// I2 — modèle de lignes du bulletin COMPARÉ (2 millésimes + écart). Même
// principe que lignesPaie (C1) : le savoir de présentation vit ici, la page
// ne fait que rendre. FP affiché POSITIF (déduction fiscale qui abaisse l'IR,
// pas une retenue — décision T3) ; l'écart n'est coloré que sur IR brut /
// IR net / Net (colore) — FP/SNI restent neutres.
//
// Table unifiée (revue qualité 02/11) : LIGNES_BULLETIN est l'UNE des deux
// tables (bulletin simple ET comparé) — ids, ordre, libellés, groupes, lignes
// accentuées et non-annualisables ont une source unique ; la divergence
// comparative (colore, labelTaux, ligne « net-annuel », signe retenu/négatif)
// reste déclarée par ligne. file() signe à la place de retenue() quand
// negate=true (idem dans les deux projections : les montants comparés de
// CNSS/AMO/CIMR/IR sont eux aussi négatifs).
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
  /** Sous-entête de groupe émis avant cette ligne (idem lignesPaie). */
  groupe?: Groupe;
}

/** Clés de Resultat["annual"] (dérivée du Record de l'interface). */
type AnnualKey = keyof Resultat['annual'];

interface DefLigne {
  id: string;
  label: string;
  /** true = prélevée du net : affichée en négatif (les deux tableaux). */
  negate?: boolean;
  accent?: boolean;
  groupe?: Groupe;
  /** false = non annualisable (déduction famille). */
  annualisable?: boolean;
  /** true colore l'écart dans le comparateur (IR/Net uniquement, T3). */
  colore?: boolean;
  /** mensuel = r.fp, mensuel comparé = a.fp → b.fp… */
  file: (r: Resultat) => number;
  /** annuel = r.annual.fp ; requis sauf si annualisable: false. */
  fileKey?: AnnualKey;
}

/** Source unique des 13 lignes communes (ordre d'affichage inclus). */
const LIGNES_BULLETIN: readonly DefLigne[] = [
  { id: 'brut-majore', label: 'Brut majoré (base + ancienneté)', fileKey: 'brutMajore', file: (r) => r.brutMajore },
  { id: 'prime-anc', label: 'Prime ancienneté', fileKey: 'primeAnc', file: (r) => r.primeAnc },
  { id: 'sbi', label: 'SBI = brut majoré (base imposable)', accent: true, fileKey: 'sbi', file: (r) => r.sbi },
  { id: 'total-gains', label: 'Total gains (SBI + panier + transport)', fileKey: 'totalGains', file: (r) => r.totalGains },
  { id: 'cnss', label: `CNSS (plaf. ${court(CNSS.plafond)})`, negate: true, groupe: 'retenues', fileKey: 'cnss', file: (r) => r.cnss },
  { id: 'amo', label: 'AMO', negate: true, fileKey: 'amo', file: (r) => r.amo },
  { id: 'cimr', label: 'CIMR', negate: true, fileKey: 'cimr', file: (r) => r.cimr },
  { id: 'fp', label: 'Frais professionnels (déduction fiscale)', groupe: 'ir', fileKey: 'fp', file: (r) => r.fp },
  { id: 'sni', label: 'SNI (assiette IR)', accent: true, fileKey: 'sni', file: (r) => r.sni },
  { id: 'ir-brut', label: 'IR brut', negate: true, colore: true, fileKey: 'irBrut', file: (r) => r.irBrut },
  { id: 'famille', label: 'Déduction famille', annualisable: false, file: (r) => r.familleDed },
  { id: 'ir-net', label: 'IR net', negate: true, accent: true, colore: true, fileKey: 'irNet', file: (r) => r.irNet },
  { id: 'net', label: 'Net à payer', accent: true, colore: true, fileKey: 'net', file: (r) => r.net },
];

/** Taux nominal (points) de la ligne, ou undefined = pas de taux affiché.
 * `comparateur` : CIMR 0 % = non-adhérent → aucun taux (convention d'affichage
 * propre à la page comparée, verrouillée par test). Le bulletin simple, lui,
 * affiche le taux choisi y compris 0. */
const tauxLigne = (
  id: string,
  r: Resultat,
  e: EntreesLignes,
  comparateur = false,
): number | undefined => {
  switch (id) {
    case 'cnss': return CNSS.taux * 100;
    case 'amo': return e.amoOui ? AMO.taux * 100 : undefined;
    case 'cimr': return comparateur && e.tauxCimr === 0 ? undefined : e.tauxCimr;
    case 'fp': return r.tauxFP * 100;
    case 'ir-brut': return r.tauxIR * 100;
    default: return undefined;
  }
};

/** Suffixe ' · 25 %' ou ' · 25 % → 45 %' (millésime changeant), undefined = aucun. */
const suffixeTaux = (ta: number | undefined, tb: number | undefined): string | undefined => {
  if (ta === undefined && tb === undefined) return undefined;
  return ta === tb ? ` · ${court(ta!)} %` : ` · ${court(ta!)} % → ${court(tb!)} %`;
};

export function lignesPaie(r: Resultat, e: EntreesLignes): LignePaie[] {
  // FP affiché POSITIF + « (déduction fiscale) » (décision T3, aligné sur le
  // comparateur) : abaisse l'IR, n'est pas prélevé du net — note explicative
  // sous la table (index.html). Ordre 02/11 : les 3 retenues prélevées du net
  // d'abord, puis le calcul de l'IR (FP → SNI → IR) — chaque bloc annoncé par
  // un sous-entête de groupe.
  return LIGNES_BULLETIN.map((d) => {
    const label = d.id === 'famille' ? `${d.label} (${e.nbCharges} pers.)` : d.label;
    const annuel =
      d.annualisable === false
        ? null
        : d.negate
          ? retenue(r.annual[d.fileKey!])
          : r.annual[d.fileKey!];
    return {
      id: d.id,
      label,
      tauxPct: tauxLigne(d.id, r, e),
      mensuel: d.negate ? retenue(d.file(r)) : d.file(r),
      annuel,
      accent: d.accent,
      groupe: d.groupe,
    };
  });
}

/** Écart + % relatif (signe = signe de l'écart, base = |a|). */
const ecartDe = (x: number, y: number): { ecart: number; pct: number | null } => {
  const d = round2(y - x);
  return { ecart: d, pct: d === 0 || x === 0 ? null : round2((d / Math.abs(x)) * 100) };
};

export function lignesComparateur(a: Resultat, b: Resultat, e: EntreesLignes): LigneComparateur[] {
  const lignes: Array<Omit<LigneComparateur, 'ecart' | 'ecartPct' | 'ecartAnnuel' | 'ecartAnnuelPct'>> =
    LIGNES_BULLETIN.map((d) => {
      const label = d.id === 'famille' ? `${d.label} (${e.nbCharges} pers.)` : d.label;
      const va = d.negate ? retenue(d.file(a)) : d.file(a);
      const vb = d.negate ? retenue(d.file(b)) : d.file(b);
      const annuelA = d.annualisable === false ? null : d.negate ? retenue(a.annual[d.fileKey!]) : a.annual[d.fileKey!];
      const annuelB = d.annualisable === false ? null : d.negate ? retenue(b.annual[d.fileKey!]) : b.annual[d.fileKey!];
      return {
        id: d.id,
        label,
        labelTaux: suffixeTaux(tauxLigne(d.id, a, e, true), tauxLigne(d.id, b, e, true)),
        a: va,
        b: vb,
        annuelA,
        annuelB,
        colore: d.colore === true,
        accent: d.accent,
        groupe: d.groupe,
      };
    });
  // Demande 02/11 : version annuelle du net dans le tableau — a/b y sont des
  // MONTANTS ANNUELS (× 12) ; ecartDe rend le même % que la ligne mensuelle.
  lignes.push({
    id: 'net-annuel',
    label: 'Net à payer annuel (× 12)',
    a: a.annual.net,
    b: b.annual.net,
    annuelA: null,
    annuelB: null,
    colore: true,
    accent: true,
  });
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
