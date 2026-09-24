// D1 : fixture bulletin de référence unique — importée par les tests
// unitaires (vitest) comme par les scénarios e2e (Playwright).

/** Entrées du bulletin réel : brut 21337.72, embauche 04/07/2022. */
export const BULLETIN_ENTREES = {
  brutBase: 21337.72,
  dateEmbauche: '2022-07-04',
  panier: 500,
  transport: 500,
  amoOui: true,
  tauxCimr: 6,
  nbCharges: 0,
};

/** Attendus calculés (règles standard) + date figée pour l'ancienneté. */
export const BULLETIN_ATTENDUS = {
  refDateISO: '2026-09-24T00:00:00',
  tauxAncPct: 5,
  brutMajore: 22404.61,
  cimr: 1344.28,
};

/** URL du serveur de prévisualisation pour les scénarios e2e. */
export const PREVIEW_URL = 'http://localhost:4173/';
