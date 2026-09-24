import { describe, expect, it } from 'vitest';
import { calcMensuel } from '../src/calcul';
import { BULLETIN_ATTENDUS, BULLETIN_ENTREES } from './bulletin-ref.mjs';

// Bulletin réel: brut 21337.72, prime anc. 1066.89 (5%), panier 500,
// transport 500, Total Gain 23404.61, CNSS 268.80, CIMR 1344.28,
// FP 2918.67 (standard 35000/12 = 2916.67, écart 2.00 à clarifier),
// SNI 17872.86, 1 charge, IR 4287.96, Net 17503.57.
// Le moteur doit retrouver ces valeurs aux règles standard près.
describe('Bulletin réel — panier/transport versés, exclus des bases', () => {
  const inp = {
    ...BULLETIN_ENTREES,
    amoOui: false,
    nbCharges: 1,
    refDate: new Date(BULLETIN_ATTENDUS.refDateISO),
  };

  it('bases sur brut majoré, exonérées hors bases', () => {
    const r = calcMensuel(inp);
    expect(r.primeAnc).toBeCloseTo(1066.89, 2);
    expect(r.brutMajore).toBeCloseTo(22404.61, 2);
    expect(r.sbi).toBeCloseTo(22404.61, 2);
    expect(r.totalGains).toBeCloseTo(23404.61, 2);
    expect(r.cnss).toBeCloseTo(268.8, 2);
    expect(r.cimr).toBeCloseTo(1344.28, 2);
    expect(r.tauxFP).toBe(0.25);
    expect(r.tauxIR).toBe(0.37);
  });

  it('chaîne SNI → IR → Net (règles standard)', () => {
    const r = calcMensuel(inp);
    expect(r.fp).toBeCloseTo(2916.67, 2);
    expect(r.sni).toBeCloseTo(17874.86, 2);
    expect(r.irBrut).toBeCloseTo(4330.37, 2);
    expect(r.familleDed).toBeCloseTo(50, 2); // foyer 2026 : 600/an/pers.
    expect(r.irNet).toBeCloseTo(4280.37, 2);
    // Net = Total gains − cotisations − IR (pas SBI − ...)
    expect(r.net).toBeCloseTo(17511.16, 2);
  });
});
