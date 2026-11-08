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
  FAQ_8000,
  FOOT_8000,
  LIEN_COMPARATEUR,
  LIEN_SNE8000,
  PAGE_8000,
  PAGE_COMPARATEUR,
  PAGE_HOME,
  PORTAILS,
  REFS_TEXTES,
  SITE_URL,
} from '../scripts/site.mjs';
import { calcMensuel, lignesPaie } from '../src/calcul';

const RACINE_APP = join(import.meta.dirname, '..');

/** Le JSON-LD servi doit être parsable : aucun commentaire HTML dans le
 * <script> (bug audit production : marqueurs SEO à l'intérieur du script). */
describe('JSON-LD servi — parsable par les moteurs (audit production)', () => {
  for (const [nom, page] of [
    ['index.html', PAGE_HOME],
    ['salaire-net-2027.html', PAGE_COMPARATEUR],
    ['salaire-net-8000.html', PAGE_8000],
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

describe('F6 8000 — page « Bulletin renforcé » (ticket 09, build 1/7)', () => {
  const PAGE = 'salaire-net-8000.html';

  it('chemin public sans extension, titre mot-clé ≤ 59 car, OG image dédiée', () => {
    expect(PAGE_8000.chemin).toBe('salaire-net-8000');
    expect(PAGE_8000.fichier).toBe(PAGE);
    expect(PAGE_8000.titre).toContain('Salaire net 8 000 MAD');
    expect(PAGE_8000.titre).toContain('Maroc');
    expect(PAGE_8000.titre.length).toBeLessThanOrEqual(59);
    expect(PAGE_8000.description.length).toBeGreaterThanOrEqual(50);
    expect(PAGE_8000.ogImage).toBe('og-salaire-net-8000-1200x630.png');
    expect(
      new Set([PAGE_HOME.ogImage, PAGE_COMPARATEUR.ogImage, PAGE_8000.ogImage]).size,
    ).toBe(3);
    expect(PAGE_8000.nomApp).toContain('8 000');
  });

  it('FAQ F6 : 3 Q/R substantielles (double source body + JSON-LD)', () => {
    expect(FAQ_8000).toBe(PAGE_8000.faq); // même tableau : body et graphe ne peuvent diverger
    expect(PAGE_8000.faq.length).toBeGreaterThanOrEqual(3);
    for (const { q, a } of PAGE_8000.faq) {
      expect(q.length).toBeGreaterThan(10);
      expect(a.length).toBeGreaterThan(80); // anti one-liner (même plancher que les autres pages)
    }
  });

  it('lexique (CONTEXT.md) : « brut de base » partout, jamais « palier »', () => {
    const tout = [
      PAGE_8000.titre,
      PAGE_8000.description,
      PAGE_8000.ogDescription,
      ...FAQ_8000.map(({ q, a }) => `${q} ${a}`),
    ].join(' ');
    expect(tout).toContain('brut de base');
    expect(tout).not.toMatch(/palier/i);
  });

  it('régions CHIFFRES constituées : 3 count-up data-n, 4 régions présentes', () => {
    const html = readFileSync(join(RACINE_APP, PAGE), 'utf8');
    for (const reg of ['TUILES', 'BULLETIN', 'BANDEAU-2027', 'VERIF']) {
      expect(html).toContain(`CHIFFRES:${reg}:START`);
    }
    expect(html.match(/data-n="/g)).toHaveLength(3);
    expect(html).toContain('>Net à payer</td>');
  });

  it('maillage entrant (ADR §4) : home + comparateur pointent la page, retour outils', () => {
    expect(LIEN_SNE8000.href).toBe(`/${PAGE_8000.chemin}`);
    expect(LIEN_SNE8000.label).toContain('8 000');
    const home = readFileSync(join(RACINE_APP, 'index.html'), 'utf8');
    const comp = readFileSync(join(RACINE_APP, 'salaire-net-2027.html'), 'utf8');
    const page = readFileSync(join(RACINE_APP, PAGE), 'utf8');
    expect(home).toContain(`href="${LIEN_SNE8000.href}"`);
    expect(comp).toContain(`href="${LIEN_SNE8000.href}"`);
    // Sortants : bandeau PLF 2027 + retour simulateur (footer stampé).
    expect(page).toContain('href="/salaire-net-2027"');
    expect(page).toContain('href="/"');
  });

  it('sitemap + robots régénérés : 3 URL, lastmod = DATE_MAJ courant', () => {
    const sitemap = readFileSync(join(RACINE_APP, 'public', 'sitemap.xml'), 'utf8');
    expect(sitemap).toContain(`<lastmod>${DATE_MAJ}</lastmod>`);
    for (const loc of [
      `${SITE_URL}/`,
      `${SITE_URL}/${PAGE_COMPARATEUR.chemin}`,
      `${SITE_URL}/${PAGE_8000.chemin}`,
    ]) {
      expect(sitemap).toContain(`<loc>${loc}</loc>`);
    }
    const robots = readFileSync(join(RACINE_APP, 'public', 'robots.txt'), 'utf8');
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  it('footer F6 : date de vérification datée + maillage outils/textes', () => {
    expect(FOOT_8000.dateVerification).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(FOOT_8000.textes.label).toBe('CGI/DGI');
    expect(FOOT_8000.maillage.some((l) => l.href === '/salaire-net-2027')).toBe(true);
    expect(FOOT_8000.maillage.some((l) => l.href === '/')).toBe(true);
  });

  it('libellés du bulletin verbatim du moteur (LIGNES_BULLETIN via lignesPaie)', () => {
    const r = calcMensuel({
      brutBase: 8000,
      dateEmbauche: '',
      panier: 500,
      transport: 500,
      amoOui: true,
      tauxCimr: 0,
      nbCharges: 0,
    });
    const labels = lignesPaie(r, { tauxCimr: 0, amoOui: true, nbCharges: 0 }).map(
      (l) => l.label,
    );
    const html = readFileSync(join(RACINE_APP, PAGE), 'utf8');
    // Lignes à libellé moteur EXACT (source unique calcul.ts, LIGNES_BULLETIN).
    for (const verbatim of ['Total gains (SBI + panier + transport)', 'Net à payer']) {
      expect(labels, `moteur doit connaître « ${verbatim} »`).toContain(verbatim);
      expect(html, `page doit afficher verbatim « ${verbatim} »`).toContain(verbatim);
    }
    // IR : libellé moteur « IR net » + token de tranche du stub stampé.
    expect(html).toContain('IR net (tranche T3)');
    // Lexique : FP = déduction fiscale, jamais une retenue.
    expect(html).toContain('déduction fiscale');
    expect(html).not.toContain('retenue fiscale');
  });
});
