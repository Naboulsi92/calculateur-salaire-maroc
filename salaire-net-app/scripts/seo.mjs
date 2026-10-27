// D3 : source unique SEO — `npm run seo` (câblé dans `npm run build`).
// Tout est RÉGÉNÉRÉ depuis scripts/site.mjs : aucune valeur SEO n'existe
// ailleurs. Idempotent : relançable sans risque (les régions sont remplacées,
// jamais les valeurs). I3 : stamping des 2 pages (home + comparateur).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BANDEAU_COMPARATEUR,
  BANDEAU_PROJET,
  COMPARATEUR_FOOTER,
  DATE_MAJ,
  LIEN_COMPARATEUR,
  PAGE_COMPARATEUR,
  PAGE_HOME,
  PORTAILS,
  REFS_TEXTES,
  SITE_URL,
} from './site.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Lien externe : ouvre dans un nouvel onglet, sans referrer (D29). */
const externe = (url, label) =>
  `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;

/** URL canonique d'une page (slug vide = racine). */
const urlDe = (page) => (page.slug ? `${SITE_URL}/${page.slug}` : `${SITE_URL}/`);

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
function headPage(page) {
  const url = urlDe(page);
  const img = `${SITE_URL}/${page.ogImage}`;
  return `    <title>${page.titre}</title>
    <meta name="description" content="${page.description}" />
    <!-- Domaine : source unique scripts/site.mjs (commande npm run seo) -->
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta name="theme-color" content="#0e6b4a" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="fr_MA" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${page.titre}" />
    <meta property="og:description" content="${page.ogDescription}" />
    <meta property="og:image" content="${img}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${page.titre}" />
    <meta name="twitter:description" content="${page.ogDescription}" />
    <meta name="twitter:image" content="${img}" />`;
}

// -- FAQ corps (visible) — même source que le JSON-LD.
const faqBody = (faq) =>
  faq
    .map(
      ({ q, a }) => `      <div class="qa">
        <h3>${esc(q)}</h3>
        <p>${esc(a)}</p>
      </div>`,
    )
    .join('\n');

// -- JSON-LD : WebApplication + FAQPage issus de la même source. Les marqueurs
// SEO:FAQ-JSONLD entourent le <script> COMPLET : jamais de commentaire HTML
// dans le JSON servi (sinon Google ne peut pas parser le graphe).
const jsonLd = (page) =>
  `    <script type="application/ld+json">\n${JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: page.nomApp,
          url: page.slug ? urlDe(page) : SITE_URL,
          inLanguage: 'fr',
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web',
          isAccessibleForFree: true,
          dateModified: DATE_MAJ,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'MAD' },
        },
        {
          '@type': 'FAQPage',
          mainEntity: page.faq.map(({ q, a }) => ({
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
    .join('\n')}\n    </script>`;

// -- Footers : maillage croisé (D4) + textes/portails de la même source.
// Liens externes en nouvel onglet (D29), liens internes (maillage) inchangés.
const footerHome = `      <span><a href="${LIEN_COMPARATEUR.href}">${esc(LIEN_COMPARATEUR.label)}</a></span>
      <span>Textes : ${externe('https://www.tax.gov.ma', 'CGI/DGI')} · ${esc(REFS_TEXTES.replace('CGI/DGI · ', ''))}</span>
      <span>Portails : ${PORTAILS.map((p) => `${externe(p.url, esc(p.nom))}`).join(' · ')}</span>`;

const footerComp = `      <span>${esc(COMPARATEUR_FOOTER.disclaimer)}</span>
      <span><a href="${COMPARATEUR_FOOTER.lienRetour.href}">${esc(COMPARATEUR_FOOTER.lienRetour.label)}</a> · Textes : ${externe(COMPARATEUR_FOOTER.texteLegal.url, esc(COMPARATEUR_FOOTER.texteLegal.label))}</span>`;

// -- D24 : bandeau d'entrée visible vers le comparateur (home uniquement).
const bandeauComp = `      <a class="bandeau" href="${LIEN_COMPARATEUR.href}">
        <span class="badge-nouveau">${esc(BANDEAU_COMPARATEUR.badge)}</span>
        <span class="bandeau-texte"><b>${esc(BANDEAU_COMPARATEUR.pitch)}</b> — ${esc(BANDEAU_COMPARATEUR.exemple)}</span>
        <span class="bandeau-fleche" aria-hidden="true">→</span>
      </a>`;

// -- D26 : bandeau « projet non voté » du comparateur (source site.mjs, D19).
const bandeauProjet = `        ⚠️ <b>${esc(BANDEAU_PROJET.titre)}</b> — ${esc(BANDEAU_PROJET.detail)}`;

// -- robots.txt / sitemap.xml : fichiers entièrement générés (2 URL).
const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;
const URLS_SITEMAP = [
  { loc: `${SITE_URL}/`, changefreq: 'yearly', priority: '1.0' },
  { loc: urlDe(PAGE_COMPARATEUR), changefreq: 'monthly', priority: '0.9' },
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${URLS_SITEMAP.map(
  (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${DATE_MAJ}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
).join('\n')}
</urlset>
`;

// -- Stamping : mêmes 4 régions sur les 2 pages, footer spécifique par page.
region('index.html', 'HEAD', headPage(PAGE_HOME));
region('index.html', 'FAQ-BODY', faqBody(PAGE_HOME.faq));
region('index.html', 'FAQ-JSONLD', jsonLd(PAGE_HOME));
region('index.html', 'FOOTER', footerHome);
region('index.html', 'BANDEAU', bandeauComp);
region(PAGE_COMPARATEUR.slug, 'HEAD', headPage(PAGE_COMPARATEUR));
region(PAGE_COMPARATEUR.slug, 'FAQ-BODY', faqBody(PAGE_COMPARATEUR.faq));
region(PAGE_COMPARATEUR.slug, 'FAQ-JSONLD', jsonLd(PAGE_COMPARATEUR));
region(PAGE_COMPARATEUR.slug, 'PROJET', bandeauProjet);
region(PAGE_COMPARATEUR.slug, 'FOOTER', footerComp);
writeFileSync(insideRoot('public/robots.txt'), robots);
writeFileSync(insideRoot('public/sitemap.xml'), sitemap);

console.log(
  `SEO OK : index.html + ${PAGE_COMPARATEUR.slug}, robots.txt, sitemap.xml (2 URL) régénérés depuis scripts/site.mjs`,
);
