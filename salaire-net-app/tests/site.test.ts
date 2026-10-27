import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ANNEE,
  ANNEE_CIBLE,
  BANDEAU_COMPARATEUR,
  BANDEAU_PROJET,
  COMPARATEUR_FOOTER,
  DATE_MAJ,
  FAQ,
  LIEN_COMPARATEUR,
  PAGE_COMPARATEUR,
  PAGE_HOME,
  PORTAILS,
  REFS_TEXTES,
  SITE_URL,
} from '../scripts/site.mjs';

const RACINE_APP = join(import.meta.dirname, '..');

/** Le JSON-LD servi doit être parsable : aucun commentaire HTML dans le
 * <script> (bug audit production : marqueurs SEO à l'intérieur du script). */
describe('JSON-LD servi — parsable par les moteurs (audit production)', () => {
  for (const [nom, page] of [
    ['index.html', PAGE_HOME],
    ['salaire-net-2027.html', PAGE_COMPARATEUR],
  ] as const) {
    it(`${nom} : graphe WebApplication + FAQPage (${page.faq.length} questions)`, () => {
      const html = readFileSync(join(RACINE_APP, nom), 'utf8');
      const bloc = html.match(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
      );
      expect(bloc, 'bloc JSON-LD présent').not.toBeNull();
      const graphe = JSON.parse(bloc![1]); // lève si commentaire HTML dedans
      expect(graphe['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual([
        'WebApplication',
        'FAQPage',
      ]);
      const faq = graphe['@graph'].find((n: { '@type': string }) => n['@type'] === 'FAQPage');
      expect(faq.mainEntity).toHaveLength(page.faq.length);
    });
  }
});

describe('site — source unique SEO (D3)', () => {
  it('URL et dates valides', () => {
    expect(SITE_URL.startsWith('https://')).toBe(true);
    expect(Number.isInteger(ANNEE)).toBe(true);
    expect(ANNEE_CIBLE).toBe(ANNEE + 1);
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

describe('comparateur — source unique SEO page 2 (D12–D15)', () => {
  it('slug dédié + titre à mot-clé + OG propre', () => {
    expect(PAGE_COMPARATEUR.slug).toBe('salaire-net-2027.html');
    expect(PAGE_COMPARATEUR.titre).toContain(`Salaire net ${ANNEE_CIBLE} vs ${ANNEE}`);
    expect(PAGE_COMPARATEUR.titre).toContain('PLF');
    expect(PAGE_COMPARATEUR.description.length).toBeGreaterThanOrEqual(50);
    expect(PAGE_COMPARATEUR.ogImage).toBe('og-comparateur-1200x630.png');
    expect(PAGE_COMPARATEUR.nomApp).toContain('Comparateur');
  });

  it('FAQ 2027 : 4 questions-réponses non vides (body + JSON-LD)', () => {
    expect(PAGE_COMPARATEUR.faq).toHaveLength(4);
    for (const { q, a } of PAGE_COMPARATEUR.faq) {
      expect(q.length).toBeGreaterThan(10);
      expect(a.length).toBeGreaterThan(20);
    }
  });

  it('statut projet assumé dans les contenus (PLF non voté)', () => {
    const tout = [
      PAGE_COMPARATEUR.description,
      ...PAGE_COMPARATEUR.faq.map(({ a }) => a),
      COMPARATEUR_FOOTER.disclaimer,
    ].join(' ');
    expect(tout).toContain('PLF');
    expect(tout).toContain('non voté');
  });

  it('maillage croisé home ↔ comparateur (D4)', () => {
    expect(LIEN_COMPARATEUR.href).toBe(`/${PAGE_COMPARATEUR.slug}`);
    expect(LIEN_COMPARATEUR.label).toContain('comparateur');
    expect(COMPARATEUR_FOOTER.lienRetour.href).toBe('/');
    expect(COMPARATEUR_FOOTER.lienRetour.label).toContain('Simulateur');
  });

  it('bandeau visible home → comparateur (D24) : même cible que le maillage', () => {
    expect(BANDEAU_COMPARATEUR.badge).toBe(`PLF ${ANNEE_CIBLE}`);
    expect(BANDEAU_COMPARATEUR.pitch).toContain(String(ANNEE_CIBLE));
    expect(BANDEAU_COMPARATEUR.exemple).toMatch(/^brut [\d\s]+ → \+[\d,]+ MAD\/mois$/);
  });

  it('OG images distinctes par page', () => {
    expect(PAGE_HOME.ogImage).toBe('og-calculateur-1200x630.png');
    expect(PAGE_HOME.ogImage).not.toBe(PAGE_COMPARATEUR.ogImage);
    expect(PAGE_HOME.faq).toBe(FAQ);
  });

  it('bandeau projet stampé (D26) : actif, daté, source unique de la bascule D19', () => {
    expect(BANDEAU_PROJET.titre).toContain('non voté');
    expect(BANDEAU_PROJET.titre).toContain('2026'); // daté (fr : 27/10/2026)
    expect(BANDEAU_PROJET.detail).toContain('Bulletin officiel');
    expect(BANDEAU_PROJET.detail).toContain('PLF');
  });
});
