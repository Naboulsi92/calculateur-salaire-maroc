// Barèmes officiels Maroc — REGISTRE MULTI-ANNÉES (D8–D10).
// Chaque année porte IR (mensuel + annuel) + FP ; CNSS / AMO / CIMR / Famille /
// SMIG restent des constantes partagées — le partage EST la garantie d'invariance.
// Source de vérité : plan.md §3 (PLF 2027 n° 60-26, vérifié en T1) + Calcul.md v1.0.
// Statuts : 2026 'en-vigueur' · 2027–2031 'projet' (PLF non voté au 27/10/2026) — D10.

export interface TrancheIR {
  du: number;
  au: number; // Infinity pour la dernière
  taux: number; // 0.10 = 10%
  deduction: number;
  label: string;
}

/** D9 — FP générique par tranches (marche pour 2026 ET 2027+ sans branche). */
export interface TrancheFP {
  /** SBI annuel au-dessous duquel la tranche s'applique ; null = tranche terminale. */
  seuilAnnuel: number | null;
  taux: number;
  /** Plafond annuel de la déduction (MAD). */
  plafondAnnuel: number;
}

/** D10 — statut législatif par millésime. */
export type StatutBareme = 'en-vigueur' | 'projet';

export interface BaremeAnnuel {
  annee: number;
  statut: StatutBareme;
  irMensuel: TrancheIR[];
  irAnnuel: TrancheIR[];
  fp: TrancheFP[];
}

// ---------------------------------------------------------------------------
// Registre 2026–2031 (plan.md §3.1–§3.3). Barème mensuel = annuel ÷ 12 :
// aucun « barème mensuel officiel » n'existe (plan.md §2 / artefact T1 §5).
// ---------------------------------------------------------------------------

export const BAREMES: Readonly<Record<number, BaremeAnnuel>> = {
  2026: {
    annee: 2026,
    statut: 'en-vigueur',
    irMensuel: [
      { du: 0, au: 3333.33, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 3333.34, au: 5000.0, taux: 0.1, deduction: 333.33, label: 'T2 · 10%' },
      { du: 5000.01, au: 6666.67, taux: 0.2, deduction: 833.33, label: 'T3 · 20%' },
      { du: 6666.68, au: 8333.33, taux: 0.3, deduction: 1500.0, label: 'T4 · 30%' },
      { du: 8333.34, au: 15000.0, taux: 0.34, deduction: 1833.33, label: 'T5 · 34%' },
      { du: 15000.01, au: Infinity, taux: 0.37, deduction: 2283.33, label: 'T6 · 37%' },
    ],
    irAnnuel: [
      { du: 0, au: 40000, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 40001, au: 60000, taux: 0.1, deduction: 4000, label: 'T2 · 10%' },
      { du: 60001, au: 80000, taux: 0.2, deduction: 10000, label: 'T3 · 20%' },
      { du: 80001, au: 100000, taux: 0.3, deduction: 18000, label: 'T4 · 30%' },
      { du: 100001, au: 180000, taux: 0.34, deduction: 22000, label: 'T5 · 34%' },
      { du: 180001, au: Infinity, taux: 0.37, deduction: 27400, label: 'T6 · 37%' },
    ],
    fp: [
      { seuilAnnuel: 78000, taux: 0.35, plafondAnnuel: 30000 },
      { seuilAnnuel: null, taux: 0.25, plafondAnnuel: 35000 },
    ],
  },

  // PLF 2027 (projet n° 60-26, art. 247-XXXXVII-1° & 59-I) — T1 très haute confiance.
  2027: {
    annee: 2027,
    statut: 'projet',
    irMensuel: [
      { du: 0, au: 5000.0, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 5000.01, au: 6666.67, taux: 0.1, deduction: 500.0, label: 'T2 · 10%' },
      { du: 6666.68, au: 8333.33, taux: 0.2, deduction: 1166.67, label: 'T3 · 20%' },
      { du: 8333.34, au: 15000.0, taux: 0.34, deduction: 2333.33, label: 'T4 · 34%' },
      { du: 15000.01, au: Infinity, taux: 0.37, deduction: 2783.33, label: 'T5 · 37%' },
    ],
    irAnnuel: [
      { du: 0, au: 60000, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 60001, au: 80000, taux: 0.1, deduction: 6000, label: 'T2 · 10%' },
      { du: 80001, au: 100000, taux: 0.2, deduction: 14000, label: 'T3 · 20%' },
      { du: 100001, au: 180000, taux: 0.34, deduction: 28000, label: 'T4 · 34%' },
      { du: 180001, au: Infinity, taux: 0.37, deduction: 33400, label: 'T5 · 37%' },
    ],
    fp: [{ seuilAnnuel: null, taux: 0.45, plafondAnnuel: 35000 }],
  },

  // D17 — 2028–2030 : bornes confirmées (art. 247-XXXXVII-2°/3°/4°), déductions
  // dérivées — à re-vérifier au vote / publication BO (jalons T7, D18).
  2028: {
    annee: 2028,
    statut: 'projet',
    irMensuel: [
      { du: 0, au: 5000.0, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 5000.01, au: 8333.33, taux: 0.1, deduction: 500.0, label: 'T2 · 10%' },
      { du: 8333.34, au: 16666.67, taux: 0.25, deduction: 1750.0, label: 'T3 · 25%' },
      { du: 16666.68, au: Infinity, taux: 0.37, deduction: 3750.0, label: 'T4 · 37%' },
    ],
    irAnnuel: [
      { du: 0, au: 60000, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 60001, au: 100000, taux: 0.1, deduction: 6000, label: 'T2 · 10%' },
      { du: 100001, au: 200000, taux: 0.25, deduction: 21000, label: 'T3 · 25%' },
      { du: 200001, au: Infinity, taux: 0.37, deduction: 45000, label: 'T4 · 37%' },
    ],
    fp: [{ seuilAnnuel: null, taux: 0.45, plafondAnnuel: 35000 }],
  },

  2029: {
    annee: 2029,
    statut: 'projet',
    irMensuel: [
      { du: 0, au: 5000.0, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 5000.01, au: 10833.33, taux: 0.1, deduction: 500.0, label: 'T2 · 10%' },
      { du: 10833.34, au: 16666.67, taux: 0.2, deduction: 1583.33, label: 'T3 · 20%' },
      { du: 16666.68, au: Infinity, taux: 0.35, deduction: 4083.33, label: 'T4 · 35%' },
    ],
    irAnnuel: [
      { du: 0, au: 60000, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 60001, au: 130000, taux: 0.1, deduction: 6000, label: 'T2 · 10%' },
      { du: 130001, au: 200000, taux: 0.2, deduction: 19000, label: 'T3 · 20%' },
      { du: 200001, au: Infinity, taux: 0.35, deduction: 49000, label: 'T4 · 35%' },
    ],
    fp: [{ seuilAnnuel: null, taux: 0.45, plafondAnnuel: 35000 }],
  },

  2030: {
    annee: 2030,
    statut: 'projet',
    irMensuel: [
      { du: 0, au: 5000.0, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 5000.01, au: 12500.0, taux: 0.1, deduction: 500.0, label: 'T2 · 10%' },
      { du: 12500.01, au: 16666.67, taux: 0.2, deduction: 1750.0, label: 'T3 · 20%' },
      { du: 16666.68, au: Infinity, taux: 0.3, deduction: 3416.67, label: 'T4 · 30%' },
    ],
    irAnnuel: [
      { du: 0, au: 60000, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 60001, au: 150000, taux: 0.1, deduction: 6000, label: 'T2 · 10%' },
      { du: 150001, au: 200000, taux: 0.2, deduction: 21000, label: 'T3 · 20%' },
      { du: 200001, au: Infinity, taux: 0.3, deduction: 41000, label: 'T4 · 30%' },
    ],
    fp: [{ seuilAnnuel: null, taux: 0.45, plafondAnnuel: 35000 }],
  },

  // Cible définitive (art. 73-I CGI réécrit) — T1 très haute confiance.
  2031: {
    annee: 2031,
    statut: 'projet',
    irMensuel: [
      { du: 0, au: 5000.0, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 5000.01, au: 12500.0, taux: 0.1, deduction: 500.0, label: 'T2 · 10%' },
      { du: 12500.01, au: 41666.67, taux: 0.2, deduction: 1750.0, label: 'T3 · 20%' },
      { du: 41666.68, au: Infinity, taux: 0.3, deduction: 5916.67, label: 'T4 · 30%' },
    ],
    irAnnuel: [
      { du: 0, au: 60000, taux: 0, deduction: 0, label: 'T1 · 0%' },
      { du: 60001, au: 150000, taux: 0.1, deduction: 6000, label: 'T2 · 10%' },
      { du: 150001, au: 500000, taux: 0.2, deduction: 21000, label: 'T3 · 20%' },
      { du: 500001, au: Infinity, taux: 0.3, deduction: 71000, label: 'T4 · 30%' },
    ],
    fp: [{ seuilAnnuel: null, taux: 0.45, plafondAnnuel: 35000 }],
  },
};

/** Millésimes couverts, croissants (chips UI, tests). */
export const ANNEES_BAREMES: readonly number[] = Object.keys(BAREMES)
  .map(Number)
  .sort((a, b) => a - b);

/** D10 — défaut = dernière année 'en-vigueur' (2026 tant que le PLF n'est pas au BO). */
export function derniereAnneeEnVigueur(): number {
  for (let i = ANNEES_BAREMES.length - 1; i >= 0; i--) {
    const annee = ANNEES_BAREMES[i]!;
    if (BAREMES[annee]!.statut === 'en-vigueur') return annee;
  }
  throw new Error('Aucun barème en vigueur dans le registre');
}

export function getBareme(annee: number): BaremeAnnuel {
  const b = BAREMES[annee];
  if (!b) {
    throw new Error(
      `Pas de barème pour ${annee} (millésimes couverts : ${ANNEES_BAREMES.join(', ')})`,
    );
  }
  return b;
}

/** D9 — tranche FP applicable : la première dont le seuil annuel n'est pas dépassé. */
export function findTrancheFP(sbiAnnuel: number, tranches: TrancheFP[]): TrancheFP {
  const t = tranches.find((tr) => tr.seuilAnnuel === null || sbiAnnuel <= tr.seuilAnnuel);
  return t ?? tranches[tranches.length - 1]!;
}

// ---------------------------------------------------------------------------
// D11 — alias de compatibilité : zéro rupture pour calcul.ts / main.ts / tests.
// IR : année courante du registre. FP : forme héritée 2026, gelée (la seule
// année qui a ce régime 35 %/25 %) — le registre fait désormais foi.
// ---------------------------------------------------------------------------

/** Année par défaut du moteur = dernière 'en-vigueur' (D10). */
export const ANNEE_COURANTE: number = derniereAnneeEnVigueur();

export const IR_MENSUEL: TrancheIR[] = BAREMES[ANNEE_COURANTE]!.irMensuel;
export const IR_ANNUEL: TrancheIR[] = BAREMES[ANNEE_COURANTE]!.irAnnuel;

const FP_2026 = BAREMES[2026]!.fp;
const FP26_T0 = FP_2026[0]!;
const FP26_T1 = FP_2026[1]!;
export const FP = {
  // 2026 tranche 0 : le seuil existe toujours (78 000) ; typé nullable car les
  // tranches 2027+ n'en ont plus (seuilAnnuel: null).
  seuilAnnuel: FP26_T0.seuilAnnuel!,
  seuilMensuel: FP26_T0.seuilAnnuel! / 12, // 6 500 (dérivé, règle ÷12 uniforme)
  tauxBas: FP26_T0.taux,
  plafBasMensuel: FP26_T0.plafondAnnuel / 12, // 2 500
  plafBasAnnuel: FP26_T0.plafondAnnuel, // 30 000
  tauxHaut: FP26_T1.taux,
  plafHautMensuel: FP26_T1.plafondAnnuel / 12, // 2 916.666...
  plafHautAnnuel: FP26_T1.plafondAnnuel, // 35 000
};

export const CNSS = { taux: 0.0448, plafond: 6000 } as const;
export const AMO = { taux: 0.0226 } as const;

export const TAUX_CIMR_LIST = [
  0, 3, 3.75, 4.5, 5.25, 6, 7, 7.5, 8, 8.5, 9, 9.5, 10,
] as const;
// Assiettes CIMR = brut majoré (avant déduction panier/transport) — bulletin réel.
// La cotisation reste déductible du SNI et prélevée du net.

export const CIMR_SEUIL_FISCAL = 6; // % — warning au-delà, sans bloquer

export const FAMILLE = {
  parPersonneAn: 600,
  plafondAn: 3600,
  maxPersonnes: 6,
  // mensuel dérivé exact (600/12), plafonné
  parPersonneMois: 600 / 12,
  plafondMois: 300,
} as const;

export const SMIG_MENSUEL = 3422.72;
export const SMIG_HORAIRE = 17.92;
export const SMIG_ANNEE = 2026;

/** Millésimes d'affichage (LF vs barème IR : indépendants dans la réalité). */
export const ANNEE_LF = 2026;
export const ANNEE_BAREME_IR = ANNEE_COURANTE;

/** Valeurs de saisie par défaut (politique : brut = SMIG). */
export const DEFAUT_PANIER = 500;
export const DEFAUT_TRANSPORT = 500;

export function findTranche(sni: number, bareme: TrancheIR[]): TrancheIR {
  const t = bareme.find((tr) => sni >= tr.du && sni <= tr.au);
  return t ?? bareme[bareme.length - 1]!;
}
