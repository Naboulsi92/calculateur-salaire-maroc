// Barèmes officiels Maroc — IR 2025 / FP / CNSS / AMO / CIMR / Famille / SMIG
// Source de vérité: Calcul.md v1.0

export interface TrancheIR {
  du: number;
  au: number; // Infinity pour la dernière
  taux: number; // 0.10 = 10%
  deduction: number;
  label: string;
}

export const IR_MENSUEL: TrancheIR[] = [
  { du: 0, au: 3333.33, taux: 0, deduction: 0, label: 'T1 · 0%' },
  { du: 3333.34, au: 5000.0, taux: 0.1, deduction: 333.33, label: 'T2 · 10%' },
  { du: 5000.01, au: 6666.67, taux: 0.2, deduction: 833.33, label: 'T3 · 20%' },
  { du: 6666.68, au: 8333.33, taux: 0.3, deduction: 1500.0, label: 'T4 · 30%' },
  { du: 8333.34, au: 15000.0, taux: 0.34, deduction: 1833.33, label: 'T5 · 34%' },
  { du: 15000.01, au: Infinity, taux: 0.37, deduction: 2283.33, label: 'T6 · 37%' },
];

export const IR_ANNUEL: TrancheIR[] = [
  { du: 0, au: 40000, taux: 0, deduction: 0, label: 'T1 · 0%' },
  { du: 40001, au: 60000, taux: 0.1, deduction: 4000, label: 'T2 · 10%' },
  { du: 60001, au: 80000, taux: 0.2, deduction: 10000, label: 'T3 · 20%' },
  { du: 80001, au: 100000, taux: 0.3, deduction: 18000, label: 'T4 · 30%' },
  { du: 100001, au: 180000, taux: 0.34, deduction: 22000, label: 'T5 · 34%' },
  { du: 180001, au: Infinity, taux: 0.37, deduction: 27400, label: 'T6 · 37%' },
];

export const FP = {
  seuilAnnuel: 78000,
  seuilMensuel: 6500,
  tauxBas: 0.35,
  plafBasMensuel: 2500, // 30 000 / 12
  plafBasAnnuel: 30000,
  tauxHaut: 0.25,
  plafHautMensuel: 35000 / 12, // 2916.666...
  plafHautAnnuel: 35000,
} as const;

export const CNSS = { taux: 0.0448, plafond: 6000 } as const;
export const AMO = { taux: 0.0226 } as const;

export const TAUX_CIMR_LIST = [
  0, 3, 3.75, 4.5, 5.25, 6, 7, 7.5, 8, 8.5, 9, 9.5, 10,
] as const;
// Assiette CIMR = brut majoré (avant déduction panier/transport) — bulletin réel.
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
export const ANNEE_BAREME_IR = 2026;

/** Valeurs de saisie par défaut (politique : brut = SMIG). */
export const DEFAUT_PANIER = 500;
export const DEFAUT_TRANSPORT = 500;

export function findTranche(sni: number, bareme: TrancheIR[]): TrancheIR {
  const t = bareme.find((tr) => sni >= tr.du && sni <= tr.au);
  return t ?? bareme[bareme.length - 1];
}
