// D3 : source unique SEO — `npm run seo` (câblé dans `npm run build`).
// Tout est RÉGÉNÉRÉ depuis scripts/site.mjs : aucune valeur SEO n'existe
// ailleurs. Idempotent : relançable sans risque (les régions sont remplacées,
// jamais les valeurs). I3 : stamping des pages (home, comparateur, F6 8000, F6 10000).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { insideRoot, region } from './regions.mjs';
import {
  BANDEAU_COMPARATEUR,
  BANDEAU_PROJET,
  CF_WEB_ANALYTICS_TOKEN,
  COMPARATEUR_FOOTER,
  DATE_MAJ,
  FOOT_8000,
  FOOT_10000,
  GOOGLE_SITE_VERIFICATION,
  LIEN_404_COMPARATEUR,
  LIEN_404_HOME,
  LIEN_COMPARATEUR,
  PAGE_8000,
  PAGE_10000,
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

/** URL publique d'une page (chemin vide = racine ; sans extension, cf. site.mjs). */
const urlDe = (page) => (page.chemin ? `${SITE_URL}/${page.chemin}` : `${SITE_URL}/`);

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
          url: page.chemin ? urlDe(page) : SITE_URL,
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

const footer8000 = `        <span>${FOOT_8000.maillage.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join(' · ')}</span>
        <span>Textes : ${externe(FOOT_8000.textes.url, esc(FOOT_8000.textes.label))} · ${esc(FOOT_8000.textes.refs)}</span>
        <span>Portails : ${PORTAILS.map((p) => `${externe(p.url, esc(p.nom))}`).join(' · ')}</span>
        <span>Barèmes vérifiés le ${esc(FOOT_8000.dateVerification)}</span>`;

const footer10000 = `        <span>${FOOT_10000.maillage.map((l) => `<a href="${l.href}">${esc(l.label)}</a>`).join(' · ')}</span>
        <span>Textes : ${externe(FOOT_10000.textes.url, esc(FOOT_10000.textes.label))} · ${esc(FOOT_10000.textes.refs)}</span>
        <span>Portails : ${PORTAILS.map((p) => `${externe(p.url, esc(p.nom))}`).join(' · ')}</span>
        <span>Barèmes vérifiés le ${esc(FOOT_10000.dateVerification)}</span>`;

// -- D24 : bandeau d'entrée visible vers le comparateur (home uniquement).
// Marqueur SEO + verbe d'action dans une pastille CTA : le lien doit se lire
// comme un bouton menant à une autre page (feedback utilisateur 02/11).
const bandeauComp = `      <a class="bandeau" href="${LIEN_COMPARATEUR.href}">
        <span class="badge-nouveau">${esc(BANDEAU_COMPARATEUR.badge)}</span>
        <span class="bandeau-texte"><b>${esc(BANDEAU_COMPARATEUR.pitch)}</b><small>${esc(BANDEAU_COMPARATEUR.exemple)}</small></span>
        <span class="bandeau-cta">${esc(BANDEAU_COMPARATEUR.cta)}<span class="bandeau-fleche" aria-hidden="true">→</span></span>
      </a>`;

// -- D26 : bandeau « projet non voté » du comparateur (source site.mjs, D19).
const bandeauProjet = `        ⚠️ <b>${esc(BANDEAU_PROJET.titre)}</b> — ${esc(BANDEAU_PROJET.detail)}`;

// -- Analytics / Search Console : snippets conditionnels (site.mjs), présents
// sur les pages + 404.html (le trafic des URL cassées reste utile à voir).
const beacon = CF_WEB_ANALYTICS_TOKEN
  ? `    <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon='{"token": "${CF_WEB_ANALYTICS_TOKEN}"}'></script>\n`
  : '';

const gscMeta = GOOGLE_SITE_VERIFICATION
  ? `    <meta name="google-site-verification" content="${GOOGLE_SITE_VERIFICATION}" />\n`
  : '';

/** Insère `snippet` après la balise `after` (idempotent : toute insertion
 * précédente entre `after` et le commentaire ANCHOR:NAME est remplacée). */
function inject(path, after, snippet, name) {
  const full = insideRoot(path);
  const text = readFileSync(full, 'utf8');
  if (!text.includes(after)) {
    throw new Error(`${path} : balise d'ancrage introuvable (${after})`);
  }
  const escAfter = after.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  // `<head>` est ancré en fin de ligne : sinon le motif matche aussi `</head>`.
  const esc = after === '<head>' ? `${escAfter}[ \\t]*(?=\\r?\\n)` : escAfter;
  const re = new RegExp(
    `${esc}(?:[ \\t]*\\r?\\n[ \\t]*<!--\\s*ANCHOR:${name}:START\\s*-->[\\s\\S]*?<!--\\s*ANCHOR:${name}:END\\s*-->)?`,
    '',
  );
  const tagged = snippet.trimEnd()
    ? `\n<!-- ANCHOR:${name}:START -->\n${snippet.trimEnd()}\n<!-- ANCHOR:${name}:END -->`
    : '';
  writeFileSync(full, text.replace(re, () => after + tagged));
}

// -- 404 : mêmes liens que la page, régénérés depuis site.mjs (pas de drift).
const footer404 = `        <a class="lien primaire" href="${PAGE_HOME.chemin ? `/${PAGE_HOME.chemin}` : '/'}">${esc(LIEN_404_HOME)}</a>
        <a class="lien" href="/${PAGE_COMPARATEUR.chemin}">${esc(LIEN_404_COMPARATEUR)}</a>`;

// -- robots.txt / sitemap.xml : fichiers entièrement générés (4 URL).
const robots = `User-agent: *
Allow: /
Sitemap: ${SITE_URL}/sitemap.xml
`;
const URLS_SITEMAP = [
  { loc: `${SITE_URL}/`, changefreq: 'yearly', priority: '1.0' },
  { loc: urlDe(PAGE_COMPARATEUR), changefreq: 'monthly', priority: '0.9' },
  { loc: urlDe(PAGE_8000), changefreq: 'monthly', priority: '0.7' },
  { loc: urlDe(PAGE_10000), changefreq: 'monthly', priority: '0.7' },
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

// -- Stamping : régions HEAD/FAQ/FOOTER sur les pages, footer spécifique par page.
region('index.html', 'HEAD', headPage(PAGE_HOME));
region('index.html', 'FAQ-BODY', faqBody(PAGE_HOME.faq));
region('index.html', 'FAQ-JSONLD', jsonLd(PAGE_HOME));
region('index.html', 'FOOTER', footerHome);
region('index.html', 'BANDEAU', bandeauComp);
region(PAGE_COMPARATEUR.fichier, 'HEAD', headPage(PAGE_COMPARATEUR));
region(PAGE_COMPARATEUR.fichier, 'FAQ-BODY', faqBody(PAGE_COMPARATEUR.faq));
region(PAGE_COMPARATEUR.fichier, 'FAQ-JSONLD', jsonLd(PAGE_COMPARATEUR));
region(PAGE_COMPARATEUR.fichier, 'PROJET', bandeauProjet);
region(PAGE_COMPARATEUR.fichier, 'FOOTER', footerComp);
region(PAGE_8000.fichier, 'HEAD', headPage(PAGE_8000));
region(PAGE_8000.fichier, 'FAQ-BODY', faqBody(PAGE_8000.faq));
region(PAGE_8000.fichier, 'FAQ-JSONLD', jsonLd(PAGE_8000));
region(PAGE_8000.fichier, 'FOOTER', footer8000);
region(PAGE_10000.fichier, 'HEAD', headPage(PAGE_10000));
region(PAGE_10000.fichier, 'FAQ-BODY', faqBody(PAGE_10000.faq));
region(PAGE_10000.fichier, 'FAQ-JSONLD', jsonLd(PAGE_10000));
region(PAGE_10000.fichier, 'FOOTER', footer10000);
region('404.html', 'FOOTER', footer404);
writeFileSync(insideRoot('public/robots.txt'), robots);
writeFileSync(insideRoot('public/sitemap.xml'), sitemap);

// -- Analytics : balise beacon (les 5 pages) + meta/fichier de vérification GSC.
for (const f of ['index.html', PAGE_COMPARATEUR.fichier, PAGE_8000.fichier, PAGE_10000.fichier, '404.html']) {
  inject(f, '</head>', beacon, 'BEACON');
  inject(f, '<head>', gscMeta, 'GSC');
}
if (GOOGLE_SITE_VERIFICATION) {
  mkdirSync(join(ROOT, 'public'), { recursive: true });
  writeFileSync(
    insideRoot(`public/google${GOOGLE_SITE_VERIFICATION}.html`),
    `google-site-verification: google${GOOGLE_SITE_VERIFICATION}.html`,
  );
}

console.log(
  `SEO OK : index.html + ${PAGE_COMPARATEUR.fichier} + ${PAGE_8000.fichier} + ${PAGE_10000.fichier}, robots.txt, sitemap.xml (4 URL) régénérés depuis scripts/site.mjs` +
    (CF_WEB_ANALYTICS_TOKEN ? ' · Cloudflare Web Analytics actif' : ' · Web Analytics inactif (token vide)') +
    (GOOGLE_SITE_VERIFICATION ? ' · vérification Search Console active' : ''),
);
