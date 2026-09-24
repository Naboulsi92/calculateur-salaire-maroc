// D2 : tout le formatage français en un seul module (source unique).
// fr-MA monétaire pour les montants MAD, fr-FR pour décimaux et libellés.

const frMAD = new Intl.NumberFormat('fr-MA', {
  style: 'currency',
  currency: 'MAD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fr2 = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const frCourtFmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

const frEntierFmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** Montant MAD (6.941,02 MAD — groupement fr-MA). */
export function mad(n: number): string {
  return frMAD.format(n);
}

/** Montant 2 décimales sans devise (cellules du tableau). */
export function montant(n: number): string {
  return fr2.format(n);
}

/** Taux en points avec signe % (25,00 %). */
export function pct(n: number): string {
  return `${fr2.format(n)} %`;
}

/** Forme courte : 6 — 4,48 — 6 000 (libellés, options). */
export function court(n: number): string {
  return frCourtFmt.format(n);
}

/** Entier groupé : 3 600 (aides, libellés). */
export function entier(n: number): string {
  return frEntierFmt.format(n);
}
