// D3 : source unique SEO — `npm run seo` (câblé dans `npm run build`).
// Tout est RÉGÉNÉRÉ depuis scripts/site.mjs : aucune valeur SEO n'existe
// ailleurs. Idempotent : relançable sans risque (les régions sont remplacées,
// jamais les valeurs).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ANNEE, DATE_MAJ, FAQ, PORTAILS, REFS_TEXTES, SITE_URL } from './site.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Garde-fou review : aucune écriture hors du projet, même si ROOT dérive. */
function insideRoot(path) {
  const full = join(ROOT, path);
  if (full !== ROOT && !full.startsWith(ROOT + sep)) {
    throw new Error(`Hors projet, écriture refusée : ${path}`);
  }
  return full;
}

function region(path, name, body) {
  const full = insideRoot(path);
  const text = readFileSync(full, 'utf8');
  const start = `<!-- SEO:${name}:START -->`;
  const end = `<!-- SEO:${name}:END -->`;
  if (!text.includes(start) || !text.includes(end)) {
    throw new Error(`${path} : région manquante SEO:${name}`);
  }
  writeFileSync(
    full,
    text.replace(new RegExp(`${start}[\\s\\S]*?${end}`, ''), `${start}\n${body}\n${end}`),
  );
}

// -- HEAD : title, description, canonical, robots, theme, OG (statiques pré-JS)
const head = `    <title>Calcul Salaire Brut Net Maroc ${ANNEE} – Simulateur IR</title>
    <meta name="description" content="Simulez votre salaire net au Maroc en ${ANNEE} : brut → net mensuel et annuel, IR, CNSS, AMO, CIMR. Calculateur gratuit, 100 % local." />
    <!-- Domaine : source unique scripts/site.mjs (commande npm run seo) -->
    <link rel="canonical" href="${SITE_URL}/" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta name="theme-color" content="#0e6b4a" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_MA" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:title" content="Calcul Salaire Brut Net Maroc ${ANNEE} – Simulateur IR" />
    <meta property="og:description" content="Brut → net, IR, CNSS, AMO, CIMR : simulation gratuite, règles ${ANNEE}." />
    <meta property="og:image" content="${SITE_URL}/og-calculateur-1200x630.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Calcul Salaire Brut Net Maroc ${ANNEE} – Simulateur IR" />
    <meta name="twitter:description" content="Brut → net, IR, CNSS, AMO, CIMR : simulation gratuite, règles ${ANNEE}." />
    <meta name="twitter:image" content="${SITE_URL}/og-calculateur-1200x630.png" />`;

// -- FAQ corps (visible) — même source que le JSON-LD.
const faqBody = FAQ.map(
  ({ q, a }) => `      <div class="qa">
        <h3>${esc(q)}</h3>
        <p>${esc(a)}</p>
      </div>`,
).join('\n');

// -- JSON-LD : WebApplication + FAQPage issus de la même source.
const jsonLd = JSON.stringify(
  {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: `Calculateur Salaire Brut/Net Maroc ${ANNEE}`,
        url: SITE_URL,
        inLanguage: 'fr',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        dateModified: DATE_MAJ,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'MAD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  },
  null,
  2,
)
  .split('\n')
  .map((l) => `    ${l}`)
  .join('\n');

// -- Footer : textes + portails issus de la même source.
const footer = `      <span>Textes : <a href="https://www.tax.gov.ma">CGI/DGI</a> · ${esc(REFS_TEXTES.replace('CGI/DGI · ', ''))}</span>
      <span>Portails : ${PORTAILS.map((p) => `<a href="${p.url}">${esc(p.nom)}</a>`).join(' · ')}</span>`;

// -- robots.txt / sitemap.xml : fichiers entièrement générés.
const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${DATE_MAJ}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

region('index.html', 'HEAD', head);
region('index.html', 'FAQ-BODY', faqBody);
region('index.html', 'FAQ-JSONLD', jsonLd);
region('index.html', 'FOOTER', footer);
writeFileSync(insideRoot('public/robots.txt'), robots);
writeFileSync(insideRoot('public/sitemap.xml'), sitemap);

console.log('SEO OK : index.html, robots.txt, sitemap.xml régénérés depuis scripts/site.mjs');
