import { describe, expect, it } from 'vitest';
import { ANNEE, DATE_MAJ, FAQ, PORTAILS, REFS_TEXTES, SITE_URL } from '../scripts/site.mjs';

describe('site — source unique SEO (D3)', () => {
  it('URL et dates valides', () => {
    expect(SITE_URL.startsWith('https://')).toBe(true);
    expect(Number.isInteger(ANNEE)).toBe(true);
    expect(DATE_MAJ).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('FAQ : 3 questions-réponses non vides (body + JSON-LD)', () => {
    expect(FAQ).toHaveLength(3);
    for (const { q, a } of FAQ) {
      expect(q.length).toBeGreaterThan(10);
      expect(a.length).toBeGreaterThan(20);
    }
  });

  it('références et portails renseignés', () => {
    expect(REFS_TEXTES.length).toBeGreaterThan(10);
    expect(PORTAILS.length).toBeGreaterThan(0);
    for (const p of PORTAILS) {
      expect(p.url.startsWith('https://')).toBe(true);
    }
  });
});
