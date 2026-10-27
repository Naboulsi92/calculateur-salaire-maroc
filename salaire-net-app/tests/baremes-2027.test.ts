// Golden tests — registre multi-années 2026–2031 (I1, décisions D16–D17).
// Source des vecteurs : tableaux du PLF 2027 n° 60-26 (vérifiés en croisant
// le projet de loi et les sources DGI).
// Politique (D16) : exact au centime sur NOS sorties moteur recomputées
// indépendamment ; vecteurs externes (presse/simulateurs) avec tolérance ±3 MAD.
// 2028–2030 : déductions DÉRIVÉES (bornes + taux confirmés) — à re-vérifier au
// vote / publication BO (jalons T7, D18). D11 : alias de compatibilité figés.
import { describe, expect, it } from 'vitest';
import { calcMensuel, fraisPro, impotTranche, round2 } from '../src/calcul';
import { profil } from './profil';
import {
  ANNEES_BAREMES,
  ANNEE_BAREME_IR,
  ANNEE_COURANTE,
  BAREMES,
  FP,
  IR_ANNUEL,
  IR_MENSUEL,
  derniereAnneeEnVigueur,
  getBareme,
} from '../src/baremes';

// ---------------------------------------------------------------------------
// D8–D11 — registre, statuts, alias
// ---------------------------------------------------------------------------

describe('Registre multi-années (D8–D11)', () => {
  it('statuts : 2026 en vigueur, 2027–2031 projet (PLF non voté)', () => {
    expect(BAREMES[2026]!.statut).toBe('en-vigueur');
    for (const annee of [2027, 2028, 2029, 2030, 2031]) {
      expect(BAREMES[annee]!.statut, `statut ${annee}`).toBe('projet');
    }
  });

  it('millésimes couverts 2026–2031, défaut = dernière en-vigueur (D10)', () => {
    expect(ANNEES_BAREMES).toEqual([2026, 2027, 2028, 2029, 2030, 2031]);
    expect(derniereAnneeEnVigueur()).toBe(2026);
    expect(ANNEE_COURANTE).toBe(2026);
    expect(ANNEE_BAREME_IR).toBe(2026);
  });

  it('getBareme refuse un millésime hors registre', () => {
    expect(() => getBareme(2025)).toThrow();
    expect(() => getBareme(2032)).toThrow();
  });

  it('alias D11 : IR pointe vers 2026, FP hérité 2026 inchangé', () => {
    expect(IR_MENSUEL).toBe(BAREMES[2026]!.irMensuel);
    expect(IR_ANNUEL).toBe(BAREMES[2026]!.irAnnuel);
    expect(FP.seuilAnnuel).toBe(78000);
    expect(FP.seuilMensuel).toBe(6500);
    expect(FP.tauxBas).toBe(0.35);
    expect(FP.plafBasMensuel).toBe(2500);
    expect(FP.plafBasAnnuel).toBe(30000);
    expect(FP.tauxHaut).toBe(0.25);
    expect(FP.plafHautMensuel).toBe(35000 / 12);
    expect(FP.plafHautAnnuel).toBe(35000);
  });
});

// ---------------------------------------------------------------------------
// D16 — vecteurs exacts au centime (sorties moteur recomputées indépendamment)
// ---------------------------------------------------------------------------

describe('Golden exact — bulletin comparé brut 10 000 (D16)', () => {
  const r26 = calcMensuel(profil(10000, { annee: 2026 }));
  const r27 = calcMensuel(profil(10000, { annee: 2027 }));

  it('IR 2026 = 601,56 · SNI 7 005,20', () => {
    expect(r26.sbi).toBe(10000);
    expect(r26.fp).toBe(2500); // 25 % (SBI an 120 000 > 78 000)
    expect(r26.sni).toBe(7005.2);
    expect(r26.irBrut).toBe(601.56); // 7005.20 × 30 % − 1500
  });

  it('IR 2027 = 158,85 · FP 45 % plafonné · SNI 6 588,53', () => {
    expect(r27.fp).toBe(2916.67); // 45 % plafonné à 35 000/12
    expect(r27.fpPlafonne).toBe(true);
    expect(r27.sni).toBe(6588.53);
    expect(r27.irBrut).toBe(158.85); // 6588.53 × 10 % − 500
  });

  it('écart IR −442,71 · écart net +442,71', () => {
    expect(round2(r27.irBrut - r26.irBrut)).toBe(-442.71);
    expect(round2(r27.net - r26.net)).toBe(442.71);
    expect(r27.net).toBe(9346.35);
    expect(r26.net).toBe(8903.64);
  });
});

describe('Golden exact — barèmes annuels table par table (plan §3.1)', () => {
  // { annee: { rni: ir attendu } } — points en pleine tranche
  const vecteursAnnuel: Record<number, Record<number, number>> = {
    2027: { 70000: 1000, 90000: 4000, 150000: 23000, 200000: 40600 },
    // 2028–2030 : dérivées (D17) — à re-vérifier au vote / BO
    2028: { 80000: 2000, 150000: 16500, 250000: 47500 },
    2029: { 100000: 4000, 150000: 11000, 250000: 38500 },
    2030: { 100000: 4000, 175000: 14000, 250000: 34000 },
    2031: { 100000: 4000, 300000: 39000, 600000: 109000 },
  };
  for (const [annee, vecteurs] of Object.entries(vecteursAnnuel)) {
    it(`barème annuel ${annee}${Number(annee) >= 2028 && annee !== '2031' ? ' (dérivées, D17)' : ''}`, () => {
      for (const [sni, ir] of Object.entries(vecteurs)) {
        expect(impotTranche(Number(sni), getBareme(Number(annee)).irAnnuel).brut, `RNI ${sni}`).toBe(ir);
      }
    });
  }
});

describe('Golden exact — barèmes mensuels table par table (plan §3.2)', () => {
  const vecteursMensuel: Record<number, Record<number, number>> = {
    2027: { 6000: 100, 8000: 433.33, 12000: 1746.67, 20000: 4616.67 },
    // 2028–2030 : dérivées (D17) — à re-vérifier au vote / BO
    2028: { 7000: 200, 12000: 1250, 20000: 3650 },
    2029: { 8000: 300, 12000: 816.67, 20000: 2916.67 },
    2030: { 8000: 300, 15000: 1250, 20000: 2583.33 },
    2031: { 8000: 300, 30000: 4250, 50000: 9083.33 },
  };
  for (const [annee, vecteurs] of Object.entries(vecteursMensuel)) {
    it(`barème mensuel ${annee}${Number(annee) >= 2028 && annee !== '2031' ? ' (dérivées, D17)' : ''}`, () => {
      for (const [sni, ir] of Object.entries(vecteurs)) {
        expect(impotTranche(Number(sni), getBareme(Number(annee)).irMensuel).brut, `SNI ${sni}`).toBe(ir);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Frontières de tranches (D16) — du−ε / du / au / au+ε sur tous les millésimes
// ---------------------------------------------------------------------------

describe('Frontières de tranches — tous barèmes, tous millésimes (D16)', () => {
  const EPS = 0.01;

  it('mensuel : au / au+ε chevauchent le bord, IR continu (±0,02)', () => {
    for (const annee of ANNEES_BAREMES) {
      const b = getBareme(annee);
      for (let i = 1; i < b.irMensuel.length; i++) {
        const au = b.irMensuel[i - 1]!.au;
        expect(impotTranche(au, b.irMensuel).index, `${annee} IR(au=${au})`).toBe(i - 1);
        expect(impotTranche(au + EPS, b.irMensuel).index, `${annee} IR(au+ε)`).toBe(i);
        const irAu = impotTranche(au, b.irMensuel).brut;
        const irApres = impotTranche(au + EPS, b.irMensuel).brut;
        expect(Math.abs(irApres - irAu), `${annee} continuité à ${au}`).toBeLessThanOrEqual(0.02);
      }
    }
  });

  it('annuel : au / du bornent la tranche, saut = taux de la nouvelle tranche', () => {
    for (const annee of ANNEES_BAREMES) {
      const b = getBareme(annee);
      for (let i = 1; i < b.irAnnuel.length; i++) {
        const au = b.irAnnuel[i - 1]!.au;
        const du = b.irAnnuel[i]!.du;
        expect(impotTranche(au, b.irAnnuel).index, `${annee} IR(au=${au})`).toBe(i - 1);
        expect(impotTranche(du, b.irAnnuel).index, `${annee} IR(du=${du})`).toBe(i);
        const irAu = impotTranche(au, b.irAnnuel).brut;
        const irDu = impotTranche(du, b.irAnnuel).brut;
        // barème marginal cohérent : IR progresse du taux unitaire sur 1 DH
        expect(Math.abs(irDu - irAu - b.irAnnuel[i]!.taux), `${annee} saut à ${au}`).toBeLessThanOrEqual(0.02);
      }
    }
  });

  it('déductions cohérentes : ded(n+1) = ded(n) + au(n)·(τ(n+1)−τ(n))', () => {
    for (const annee of ANNEES_BAREMES) {
      const b = getBareme(annee);
      for (const bareme of [b.irMensuel, b.irAnnuel]) {
        for (let i = 1; i < bareme.length; i++) {
          const prev = bareme[i - 1]!;
          const attendu = prev.deduction + prev.au * (bareme[i]!.taux - prev.taux);
          expect(
            Math.abs(bareme[i]!.deduction - attendu),
            `${annee} ded T${i + 1} (${bareme === b.irMensuel ? 'mensuel' : 'annuel'})`,
          ).toBeLessThanOrEqual(0.02);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Cohérence mensuel × 12 = annuel (D16) — un point par tranche
// ---------------------------------------------------------------------------

describe('Mensuel × 12 ≈ annuel — tous millésimes (D16)', () => {
  it('IR(SNI×12, annuel) = 12 × IR(SNI, mensuel) à ±0,10', () => {
    for (const annee of ANNEES_BAREMES) {
      const b = getBareme(annee);
      for (let i = 0; i < b.irMensuel.length; i++) {
        const t = b.irMensuel[i]!;
        const x =
          t.au === Infinity
            ? b.irMensuel[i - 1]!.au * 1.5 // dernière : 1,5 × borne précédente
            : t.du + (t.au - t.du) / 2; // milieu de tranche
        const irM = impotTranche(x, b.irMensuel).brut;
        const irA = impotTranche(round2(x * 12), b.irAnnuel).brut;
        expect(Math.abs(irA - irM * 12), `${annee} SNI ${x} (T${i + 1})`).toBeLessThanOrEqual(0.1);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// FP générique (D9) + plafond (D16)
// ---------------------------------------------------------------------------

describe('Frais professionnels par millésime (D9, D16)', () => {
  it('2026 : deux paliers 35 %/25 %, plafonds 2 500 / 2 916,67', () => {
    const fp26 = BAREMES[2026]!.fp;
    expect(fraisPro(5000, fp26)).toMatchObject({ fp: 1750, fpPlafonne: false, taux: 0.35 });
    expect(fraisPro(6500, fp26)).toMatchObject({ fp: 2275, fpPlafonne: false, taux: 0.35 }); // SBI an = 78 000 pile
    expect(fraisPro(6501, fp26)).toMatchObject({ fp: 1625.25, fpPlafonne: false, taux: 0.25 }); // bascule 25 %
    expect(fraisPro(20000, fp26)).toMatchObject({ fp: 2916.67, fpPlafonne: true, taux: 0.25 });
  });

  it('2027–2031 : 45 % uniforme, plafond 35 000/an atteint à SBI ≈ 6 481,48', () => {
    for (const annee of [2027, 2028, 2029, 2030, 2031]) {
      const fp = BAREMES[annee]!.fp;
      expect(fraisPro(5000, fp), `${annee}`).toMatchObject({ fp: 2250, fpPlafonne: false, taux: 0.45 });
      // 6 481,48 × 45 % = 2 916,666 < plafond → non plafonné (arrondi affiché identique)
      expect(fraisPro(6481.48, fp), `${annee} juste sous le plafond`).toMatchObject({
        fp: 2916.67,
        fpPlafonne: false,
      });
      // 6 481,49 × 45 % > plafond → plafonné
      expect(fraisPro(6481.49, fp), `${annee} plafond atteint`).toMatchObject({
        fp: 2916.67,
        fpPlafonne: true,
      });
    }
  });

  it('flag fp-plafonne émis par le moteur en 2027', () => {
    const r = calcMensuel(profil(10000, { annee: 2027 }));
    expect(r.avertissements).toContainEqual({ code: 'fp-plafonne' });
  });
});

// ---------------------------------------------------------------------------
// Vecteurs externes (D16) — presse/simulateurs, tolérance ±3 MAD
// ---------------------------------------------------------------------------

describe('Vecteurs externes ±3 MAD (D16)', () => {
  it('brut 10 000 : IR 2026 ≈ 602 · IR 2027 ≈ 159 · écart ≈ +443', () => {
    const r26 = calcMensuel(profil(10000, { annee: 2026 }));
    const r27 = calcMensuel(profil(10000, { annee: 2027 }));
    expect(Math.abs(r26.irBrut - 602)).toBeLessThanOrEqual(3);
    expect(Math.abs(r27.irBrut - 159)).toBeLessThanOrEqual(3);
    expect(Math.abs((r27.net - r26.net) - 443)).toBeLessThanOrEqual(3);
  });

  it('gain plafonné ≈ +500/mois dès ≈ 12 000 brut (FP plafonné des deux côtés)', () => {
    for (const brut of [12000, 15000, 20000]) {
      const r26 = calcMensuel(profil(brut, { annee: 2026 }));
      const r27 = calcMensuel(profil(brut, { annee: 2027 }));
      expect(Math.abs((r27.irBrut - r26.irBrut) + 500), `brut ${brut}`).toBeLessThanOrEqual(3);
    }
  });

  it('IR nul 2027 jusqu’à ≈ 8 375 brut (vs ≈ 5 720 en 2026)', () => {
    expect(calcMensuel(profil(8300, { annee: 2027 })).irBrut).toBe(0);
    expect(calcMensuel(profil(8375, { annee: 2027 })).irBrut).toBeLessThanOrEqual(3);
    expect(calcMensuel(profil(5700, { annee: 2026 })).irBrut).toBe(0);
    expect(calcMensuel(profil(5750, { annee: 2026 })).irBrut).toBeLessThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// Relation structurelle : écart-net = −(écart-IR) (CNSS/AMO identiques entre années)
// ---------------------------------------------------------------------------

describe('Écart net = − écart IR (D16)', () => {
  for (const brut of [3000, 8000, 12000, 20000, 30000]) {
    it(`brut ${brut}`, () => {
      const r26 = calcMensuel(profil(brut, { annee: 2026 }));
      const r27 = calcMensuel(profil(brut, { annee: 2027 }));
      expect(r27.net - r26.net).toBeCloseTo(r26.irNet - r27.irNet, 2);
    });
  }
});

// ---------------------------------------------------------------------------
// D10 — statut exposé par le moteur, défaut = année en vigueur
// ---------------------------------------------------------------------------

describe('Statut et défaut d’année (D10)', () => {
  it('sans annee → 2026 en-vigueur ; annee: 2027 → projet', () => {
    const defaut = calcMensuel(profil(10000));
    expect(defaut.annee).toBe(2026);
    expect(defaut.statut).toBe('en-vigueur');
    const r27 = calcMensuel(profil(10000, { annee: 2027 }));
    expect(r27.annee).toBe(2027);
    expect(r27.statut).toBe('projet');
  });
});
