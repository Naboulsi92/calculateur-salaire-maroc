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

describe('contenu éditorial — enrichissement SEO 02/11', () => {
  const horsRegions = (html: string) =>
    html.replace(/<!-- SEO:[A-Z0-9-]+:START -->[\s\S]*?<!-- SEO:[A-Z0-9-]+:END -->/g, '');

  it('3 sections par page, HORS régions de stamping (survivent à npm run seo)', () => {
    const home = readFileSync(join(RACINE_APP, 'index.html'), 'utf8');
    const comp = readFileSync(join(RACINE_APP, 'salaire-net-2027.html'), 'utf8');
    for (const id of ['t-guide', 't-exemples', 't-2027-home']) {
      expect(home).toContain(`aria-labelledby="${id}"`);
    }
    for (const id of ['t-changements', 't-gains', 't-utilisation']) {
      expect(comp).toContain(`aria-labelledby="${id}"`);
    }
    expect(horsRegions(home).match(/card editorial/g)).toHaveLength(3);
    expect(horsRegions(comp).match(/card editorial/g)).toHaveLength(3);
  });
});

describe('site — source unique SEO (D3)', () => {
  it('URL et dates valides', () => {
    expect(SITE_URL.startsWith('https://')).toBe(true);
    expect(Number.isInteger(ANNEE)).toBe(true);
    expect(ANNEE_CIBLE).toBe(ANNEE + 1);
    expect(DATE_MAJ).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('FAQ : questions-réponses substantielles (body + JSON-LD)', () => {
    // Plancher, pas longueur exacte : la cohérence visible/JSON-LD est vérifiée
    // dynamiquement plus haut ; on ne veut pas casser ce test à chaque ajout.
    expect(FAQ.length).toBeGreaterThanOrEqual(4);
    for (const { q, a } of FAQ) {
      expect(q.length).toBeGreaterThan(10);
      expect(a.length).toBeGreaterThan(80); // anti one-liner (polish UX ③ 02/11)
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
  it('chemin public sans extension + fichier dist + titre à mot-clé + OG propre', () => {
    expect(PAGE_COMPARATEUR.chemin).toBe('salaire-net-2027');
    expect(PAGE_COMPARATEUR.fichier).toBe('salaire-net-2027.html');
    expect(PAGE_COMPARATEUR.titre).toContain(`Salaire net ${ANNEE_CIBLE} vs ${ANNEE}`);
    expect(PAGE_COMPARATEUR.titre).toContain('PLF');
    expect(PAGE_COMPARATEUR.description.length).toBeGreaterThanOrEqual(50);
    expect(PAGE_COMPARATEUR.ogImage).toBe('og-comparateur-1200x630.png');
    expect(PAGE_COMPARATEUR.nomApp).toContain('Comparateur');
  });

  it('FAQ 2027 : questions-réponses non vides (body + JSON-LD)', () => {
    // Plancher (même raison que la FAQ accueil : longueur = effet de bord, pas règle).
    expect(PAGE_COMPARATEUR.faq.length).toBeGreaterThanOrEqual(3);
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
    expect(LIEN_COMPARATEUR.href).toBe(`/${PAGE_COMPARATEUR.chemin}`);
    expect(LIEN_COMPARATEUR.label).toContain('comparateur');
    expect(COMPARATEUR_FOOTER.lienRetour.href).toBe('/');
    expect(COMPARATEUR_FOOTER.lienRetour.label).toContain('Simulateur');
  });

  it('bandeau visible home → comparateur (D24) : même cible que le maillage', () => {
    expect(BANDEAU_COMPARATEUR.badge).toBe(`PLF ${ANNEE_CIBLE}`);
    // Le pitch peut évoquer l'année ou le changement — l'intention doit rester lisible.
    expect(BANDEAU_COMPARATEUR.pitch).toMatch(/2027|changer/);
    expect(BANDEAU_COMPARATEUR.exemple).toMatch(/brut [\d\s]+ → \+[\d,]+ MAD\/mois$/);
    // Feedback 02/11 : le lien doit se lire comme un bouton → verbe d'action.
    expect(BANDEAU_COMPARATEUR.cta).toMatch(/[A-Za-zÀ-ÿ]/);
    const html = readFileSync(join(RACINE_APP, 'index.html'), 'utf8');
    expect(html).toContain('bandeau-cta');
    expect(html).toContain(BANDEAU_COMPARATEUR.cta);
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
