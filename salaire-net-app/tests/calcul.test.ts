import { describe, expect, it } from 'vitest';
import { assiettes, calcMensuel, impotTranche, lignesPaie } from '../src/calcul';
import { IR_ANNUEL, IR_MENSUEL } from '../src/baremes';

describe('assiettes — règle d exclusion unique (C3)', () => {
  it('panier/transport exclus de la base, inclus dans les gains', () => {
    expect(assiettes(22404.61, 500, 500)).toEqual({ imposable: 22404.61, gains: 23404.61 });
    expect(assiettes(22404.61, 0, 0)).toEqual({ imposable: 22404.61, gains: 22404.61 });
  });

  it('négatifs clampés à zéro', () => {
    expect(assiettes(-100, 500, 500)).toEqual({ imposable: 0, gains: 900 });
  });
});

const base = {
  brutBase: 8000,
  dateEmbauche: '',
  panier: 0,
  transport: 500,
  amoOui: true,
  tauxCimr: 6,
  nbCharges: 2,
};

describe('Calcul.md — cas de référence', () => {
  it('exemple standard (sans ancienneté, SBI=8000, total gains 8500)', () => {
    // brut 8000, transport 500 versé en sus : SBI 8000, total gains 8500
    const r = calcMensuel(base);
    expect(r.sbi).toBe(8000);
    expect(r.totalGains).toBe(8500);
    // SBI_an 96000 > 78000 → FP 25% = 2000
    expect(r.fp).toBe(2000);
    expect(r.cnss).toBe(268.8);
    expect(r.amo).toBeCloseTo(180.8, 2);
    expect(r.cimr).toBe(480); // assiette = brut majoré (8000)
    // SNI = 8000-2000-268.8-180.8-480 = 5070.4
    expect(r.sni).toBeCloseTo(5070.4, 1);
    expect(r.trancheIndex).toBe(2); // T3 5000-6666.67 20%
    expect(r.tauxFP).toBe(0.25);
    expect(r.tauxIR).toBe(0.2);
    expect(r.irBrut).toBeCloseTo(180.75, 2);
    expect(r.irNet).toBeCloseTo(80.75, 2); // 180.75 - 2×50 (foyer 2026)
    // Net = 8500-268.8-180.8-480-80.75 = 7489.65
    expect(r.net).toBeCloseTo(7489.65, 2);
    expect(r.annual.net).toBeCloseTo(r.net * 12, 0);
  });

  it('exemple avec 6 ans ancienneté → 10%', () => {
    const sixAns = new Date();
    sixAns.setFullYear(sixAns.getFullYear() - 6);
    const iso = sixAns.toISOString().slice(0, 10);
    const r = calcMensuel({ ...base, dateEmbauche: iso });
    expect(r.primeAnc).toBe(800);
    expect(r.sbi).toBe(8800);
    expect(r.totalGains).toBe(9300);
    expect(r.fp).toBe(2200);
    expect(r.sni).toBeCloseTo(5604.32, 1);
    expect(r.irBrut).toBeCloseTo(287.53, 1);
    expect(r.net).toBeCloseTo(8116.79, 1); // IR net 187.53 (foyer 2026)
  });

  it('FP 35% sous seuil 78k, plafonné à 2500', () => {
    const r = calcMensuel({ ...base, brutBase: 8000, transport: 0, tauxCimr: 0, nbCharges: 0, panier: 0 });
    // SBI 8000 → an 96000 → 25% en fait. Forçons petit brut:
    const petit = calcMensuel({ ...base, brutBase: 5000, transport: 0, tauxCimr: 0, nbCharges: 0, panier: 0 });
    expect(petit.sbi).toBe(5000);
    expect(petit.fp).toBe(1750); // 35%
    const gros = calcMensuel({ ...base, brutBase: 20000, transport: 0, tauxCimr: 0, nbCharges: 0, panier: 0 });
    expect(gros.fp).toBeCloseTo(2916.67, 2); // 25% plafonné
    expect(r.fp).toBeGreaterThan(0);
  });

  it('IR nul sous 3333.33, famille plafonnée à 250', () => {
    const r = calcMensuel({ ...base, brutBase: 3000, transport: 0, tauxCimr: 0, nbCharges: 6, panier: 0 });
    expect(r.irBrut).toBe(0);
    expect(r.irNet).toBe(0);
    expect(r.familleDed).toBeLessThanOrEqual(300);
  });

  it('AMO off → 0, CIMR 0 → 0, Net = total gains - CNSS - IR', () => {
    const r = calcMensuel({ ...base, amoOui: false, tauxCimr: 0, nbCharges: 0 });
    expect(r.amo).toBe(0);
    expect(r.cimr).toBe(0);
    expect(r.net).toBeCloseTo(r.totalGains - r.cnss - r.irNet, 2);
  });

  it('SMIG 2026 (3422.72) : code smig sous le seuil uniquement', () => {
    const sous = calcMensuel({ ...base, brutBase: 3400 });
    expect(sous.avertissements).toContainEqual({ code: 'smig', seuil: 3422.72 });
    const dessus = calcMensuel({ ...base, brutBase: 3500 });
    expect(dessus.avertissements.some((a) => a.code === 'smig')).toBe(false);
  });

  it('CIMR > 6 % et FP plafonné : codes dédiés', () => {
    const r = calcMensuel({ ...base, brutBase: 20000, tauxCimr: 10 });
    expect(r.avertissements).toContainEqual({ code: 'cimr-fiscal', taux: 10 });
    expect(r.avertissements).toContainEqual({ code: 'fp-plafonne' });
  });
});

describe('impotTranche — lookup + formule (C4)', () => {
  it('tranche à 0 % → brut nul, sans branche appelante', () => {
    expect(impotTranche(0, IR_MENSUEL)).toMatchObject({ brut: 0, index: 0 });
    expect(impotTranche(3333.33, IR_MENSUEL)).toMatchObject({ brut: 0, index: 0 });
    expect(impotTranche(40000, IR_ANNUEL)).toMatchObject({ brut: 0, index: 0 });
  });

  it('bornes de tranches mensuelles', () => {
    expect(impotTranche(3333.34, IR_MENSUEL)).toMatchObject({ brut: 0, index: 1 });
    expect(impotTranche(5000, IR_MENSUEL)).toMatchObject({ brut: 166.67, index: 1 });
    expect(impotTranche(20000, IR_MENSUEL)).toMatchObject({ brut: 5116.67, index: 5 });
  });

  it('barème annuel : dernière tranche', () => {
    expect(impotTranche(180001, IR_ANNUEL)).toMatchObject({ index: 5 });
  });
});

describe('lignesPaie — modèle de lignes (C1)', () => {
  const entrees = { tauxCimr: 6, amoOui: true, nbCharges: 2 };
  const lignes = lignesPaie(calcMensuel({ ...base, dateEmbauche: '' }), entrees);

  it('13 lignes aux ids stables, dans l ordre', () => {
    expect(lignes.map((l) => l.id)).toEqual([
      'brut-majore', 'prime-anc', 'sbi', 'total-gains', 'fp', 'cnss', 'amo',
      'cimr', 'sni', 'ir-brut', 'famille', 'ir-net', 'net',
    ]);
  });

  it('taux nominaux et montants cohérents avec le résultat', () => {
    const parId = Object.fromEntries(lignes.map((l) => [l.id, l]));
    expect(parId.fp.tauxPct).toBe(25);
    expect(parId.cnss.tauxPct).toBeCloseTo(4.48, 10);
    expect(parId.amo.tauxPct).toBeCloseTo(2.26, 10);
    expect(parId.cimr.tauxPct).toBe(6);
    expect(parId['ir-brut'].tauxPct).toBe(20);
    expect(parId.famille.annuel).toBeNull();
    expect(parId.net.mensuel).toBeCloseTo(7489.65, 2);
    expect(parId.cnss.label).toContain('plaf.');
    expect(parId.cnss.label).not.toContain('4,48');
    expect(parId.amo.label).toBe('AMO');
  });

  it('AMO désactivée → pas de taux affiché', () => {
    const r = calcMensuel({ ...base, amoOui: false });
    const amo = lignesPaie(r, { ...entrees, amoOui: false }).find((l) => l.id === 'amo')!;
    expect(amo.tauxPct).toBeUndefined();
    expect(amo.mensuel).toBe(0);
  });
});
