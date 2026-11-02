// D1 : fixture bulletin de rÃ©fÃ©rence unique â€” importÃ©e par les tests
// unitaires (vitest) comme par les scÃ©narios e2e (Playwright).

/** EntrÃ©es du bulletin rÃ©el : brut 21337.72, embauche 04/07/2022. */
export const BULLETIN_ENTREES = {
  brutBase: 21337.72,
  dateEmbauche: '2022-07-04',
  panier: 500,
  transport: 500,
  amoOui: true,
  tauxCimr: 6,
  nbCharges: 0,
};

/** Attendus calculÃ©s (rÃ¨gles standard) + date figÃ©e pour l'anciennetÃ©. */
export const BULLETIN_ATTENDUS = {
  refDateISO: '2026-09-24T00:00:00',
  tauxAncPct: 5,
  brutMajore: 22404.61,
  cimr: 1344.28,
};

/** URL du serveur de prÃ©visualisation pour les scÃ©narios e2e. */
export const PREVIEW_URL = process.env.PREVIEW_URL || 'http://localhost:4173/';
