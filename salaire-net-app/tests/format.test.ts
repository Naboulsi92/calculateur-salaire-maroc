import { describe, expect, it } from 'vitest';
import { court, entier, mad, montant, pct } from '../src/format';

// Espaces variantes (insécable, insécable étroite) normalisées pour les asserts.
/** Normalise les variantes d'espaces pour des asserts robustes. */
const norm = (s: string): string => s.replace(/[   ]/g, ' ');

describe('format — source unique du français', () => {
  it('montant : 2 décimales groupées', () => {
    expect(norm(montant(8000))).toBe('8 000,00');
    expect(norm(montant(-268.8))).toBe('-268,80');
    expect(norm(montant(0))).toBe('0,00');
  });

  it('pct : taux en points avec signe %', () => {
    expect(norm(pct(25))).toBe('25,00 %');
    expect(norm(pct(4.48))).toBe('4,48 %');
  });

  it('court : sans zéros superflus, groupé', () => {
    expect(court(6)).toBe('6');
    expect(norm(court(3.75))).toBe('3,75');
    expect(norm(court(6000))).toBe('6 000');
  });

  it('entier : groupé sans décimales', () => {
    expect(norm(entier(3600))).toBe('3 600');
    expect(entier(600)).toBe('600');
  });

  it('mad : monétaire fr-MA (groupement par point)', () => {
    expect(norm(mad(3422.72))).toBe('3.422,72 MAD');
  });
});
