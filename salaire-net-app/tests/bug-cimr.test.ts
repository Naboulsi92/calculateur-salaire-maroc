import { describe, expect, it } from 'vitest';
import { calcMensuel } from '../src/calcul';
import { BULLETIN_ATTENDUS, BULLETIN_ENTREES } from './bulletin-ref.mjs';

// Bug remonté: CIMR calculée sur SBI au lieu du brut majoré.
// Fixture partagée (D1) : brut 21337.72, embauche 04/07/2022 (→ 5%),
// brut majoré ≈ 22404.61 → CIMR attendue 1344.28 (bulletin réel).
const refDate = new Date(BULLETIN_ATTENDUS.refDateISO);

describe('Bug CIMR — assiette = brut majoré', () => {
  it('CIMR = brut majoré × taux, indépendante des primes non-imposables', () => {
    const r = calcMensuel({ ...BULLETIN_ENTREES, refDate });
    expect(r.anciennete.tauxPct).toBe(BULLETIN_ATTENDUS.tauxAncPct);
    expect(r.brutMajore).toBeCloseTo(BULLETIN_ATTENDUS.brutMajore, 1);
    expect(r.cimr).toBeCloseTo(BULLETIN_ATTENDUS.cimr, 2);
  });

  it('CIMR avec transport 500 seul → même assiette brut majoré', () => {
    const r = calcMensuel({ ...BULLETIN_ENTREES, panier: 0, refDate });
    expect(r.cimr).toBeCloseTo(BULLETIN_ATTENDUS.cimr, 2);
  });
});
