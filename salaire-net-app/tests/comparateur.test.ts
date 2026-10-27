// Tests I2 — modèle de lignes du bulletin comparé (C1 : asserté ici, rendu ailleurs).
// FP affiché POSITIF (déduction fiscale, T3) · écart coloré uniquement IR/Net (T3) ·
// écart-net = −(écart-IR) par construction (CNSS/AMO/gains identiques entre millésimes).
import { describe, expect, it } from 'vitest';
import { calcMensuel, lignesComparateur, round2, type Inputs } from '../src/calcul';
import { entreesLignes, profil } from './profil';

const r26 = calcMensuel(profil(10000, { annee: 2026 }));
const r27 = calcMensuel(profil(10000, { annee: 2027 }));
const lignes = lignesComparateur(r26, r27, entreesLignes);
const parId = Object.fromEntries(lignes.map((l) => [l.id, l]));

describe('lignesComparateur — structure (C1/I2)', () => {
  it('13 lignes, mêmes ids que lignesPaie, dans l’ordre', () => {
    expect(lignes.map((l) => l.id)).toEqual([
      'brut-majore', 'prime-anc', 'sbi', 'total-gains', 'fp', 'cnss', 'amo',
      'cimr', 'sni', 'ir-brut', 'famille', 'ir-net', 'net',
    ]);
  });

  it('FP affiché en positif, taux 25 % → 45 % dans le libellé', () => {
    const fp = parId['fp']!;
    expect(fp.a).toBe(2500);
    expect(fp.b).toBe(2916.67);
    expect(fp.labelTaux).toBe(' · 25 % → 45 %');
    expect(fp.colore).toBe(false);
  });

  it('l’écart n’est coloré que sur IR brut, IR net, Net', () => {
    expect(lignes.filter((l) => l.colore).map((l) => l.id)).toEqual(['ir-brut', 'ir-net', 'net']);
  });

  it('bulletin 10 000 : IR −601,56 → −158,85, net 8 903,64 → 9 346,35', () => {
    expect(parId['ir-brut']).toMatchObject({ a: -601.56, b: -158.85 });
    expect(parId['net']).toMatchObject({ a: 8903.64, b: 9346.35 });
    expect(round2(parId['net']!.b - parId['net']!.a)).toBe(442.71);
    expect(round2(parId['ir-brut']!.b - parId['ir-brut']!.a)).toBe(442.71);
  });

  it('lignes accentuées : SBI, SNI, IR net, Net', () => {
    expect(lignes.filter((l) => l.accent).map((l) => l.id)).toEqual(['sbi', 'sni', 'ir-net', 'net']);
  });

  it('seules fp, sni, ir-brut, ir-net, net bougent entre millésimes (mêmes entrées)', () => {
    const quiBougent = lignes.filter((l) => round2(l.b - l.a) !== 0).map((l) => l.id);
    expect(quiBougent).toEqual(['fp', 'sni', 'ir-brut', 'ir-net', 'net']);
  });

  it('écart mensuel + % + écart annuel ligne à ligne (Spec §1, revue code)', () => {
    // IR brut : −601,56 → −158,85 → écart +442,71 soit +73,59 % de |2026|.
    const ir = parId['ir-brut']!;
    expect(ir.ecart).toBe(442.71);
    expect(ir.ecartPct).toBe(73.59);
    expect(ir.ecartAnnuel).toBe(5312.52); // 442,71 × 12
    expect(ir.ecartAnnuelPct).toBe(73.59); // même base relative (× 12 des deux côtés)

    // FP : 2 500 → 2 916,67 (plafond) → +416,67 soit +16,67 % ; annuel +5 000,04.
    const fp = parId['fp']!;
    expect(fp.ecart).toBe(416.67);
    expect(fp.ecartPct).toBe(16.67);
    expect(fp.ecartAnnuel).toBe(5000.04);
    expect(fp.ecartAnnuelPct).toBe(16.67);

    // Net : +442,71 soit ≈ +4,97 % du net 2026 ; annuel +5 312,52 (+4,97 %).
    const net = parId['net']!;
    expect(net.ecart).toBe(442.71);
    expect(net.ecartPct).toBe(4.97);
    expect(net.ecartAnnuel).toBe(5312.52);
    expect(net.ecartAnnuelPct).toBe(4.97);

    // CNSS identique : écart 0 → % null (convention : pas de % sans écart).
    expect(parId['cnss']!.ecart).toBe(0);
    expect(parId['cnss']!.ecartPct).toBeNull();
    expect(parId['cnss']!.ecartAnnuel).toBe(0);
    expect(parId['cnss']!.ecartAnnuelPct).toBeNull();
  });

  it('déduction famille : non annualisée, écart nul entre millésimes', () => {
    const a = calcMensuel(profil(10000, { annee: 2026, nbCharges: 3 }));
    const b = calcMensuel(profil(10000, { annee: 2027, nbCharges: 3 }));
    const fam = lignesComparateur(a, b, { ...entreesLignes, nbCharges: 3 }).find((l) => l.id === 'famille')!;
    expect(fam.annuelA).toBeNull();
    expect(fam.annuelB).toBeNull();
    expect(fam.ecartAnnuel).toBeNull(); // non annualisée → pas d'écart annuel
    expect(fam.b - fam.a).toBe(0);
    expect(fam.b).toBe(150); // 3 × 50
  });

  it('taux dans le libellé : CNSS 4,48 % · IR 30 % → 10 % · AMO/CIMR conditionnels', () => {
    expect(parId['cnss']!.labelTaux).toBe(' · 4,48 %');
    expect(parId['ir-brut']!.labelTaux).toBe(' · 30 % → 10 %');
    expect(parId['amo']!.labelTaux).toBe(' · 2,26 %');
    expect(parId['cimr']!.labelTaux).toBeUndefined();
    const avecCimr = lignesComparateur(
      calcMensuel(profil(10000, { annee: 2026, tauxCimr: 6 })),
      calcMensuel(profil(10000, { annee: 2027, tauxCimr: 6 })),
      { ...entreesLignes, tauxCimr: 6 },
    );
    expect(avecCimr.find((l) => l.id === 'cimr')!.labelTaux).toBe(' · 6 %');
  });

  it('AMO désactivée : pas de taux, valeurs nulles des deux côtés', () => {
    const l = lignesComparateur(
      calcMensuel(profil(10000, { annee: 2026, amoOui: false })),
      calcMensuel(profil(10000, { annee: 2027, amoOui: false })),
      { ...entreesLignes, amoOui: false },
    ).find((x) => x.id === 'amo')!;
    expect(l.labelTaux).toBeUndefined();
    expect(l.a).toBe(0);
    expect(l.b).toBe(0);
  });
});
