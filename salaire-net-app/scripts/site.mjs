// D3 : source unique des métadonnées site/SEO.
// `npm run seo` propage vers index.html (head, JSON-LD, FAQ, footer),
// public/robots.txt et public/sitemap.xml. Ne dupliquer aucune de ces
// valeurs ailleurs : éditer ici, puis `npm run seo`.

/** Domaine canonique (TODO: remplacer par le domaine réel). */
export const SITE_URL = 'https://www.exemple.ma';

/** Millésime fiscal affiché et fraîcheur signalée aux moteurs. */
export const ANNEE = 2026;
export const DATE_MAJ = '2026-01-01';

/** Questions visibles (.qa) ET graphe FAQPage : même source, pas de drift. */
export const FAQ = [
  {
    q: 'Comment calculer le salaire net au Maroc en 2026 ?',
    a: 'Net = total des gains (brut + ancienneté + panier + transport) − CNSS − AMO − CIMR − IR. Saisissez votre brut mensuel dans le simulateur.',
  },
  {
    q: 'Quels sont les taux CNSS et AMO en 2026 ?',
    a: 'Part salariale : CNSS 4,48 % plafonnée à 6 000 MAD/mois, AMO 2,26 % sans plafond.',
  },
  {
    q: "Comment est calculé l'IR sur salaire au Maroc en 2026 ?",
    a: "L'IR s'applique par 6 tranches (0 % à 37 %) sur le net imposable, après frais professionnels et déduction de 600 MAD par personne à charge (plafond 3 600 MAD).",
  },
];

/** Références légales du pied de page. */
export const REFS_TEXTES = 'CGI/DGI · LF 60-24 · LF 50-25 · NC DGI 737 · Déc. 2.25.983 (BO 7469)';

/** Portails du pied de page. */
export const PORTAILS = [
  { nom: 'CNSS', url: 'https://www.cnss.ma' },
  { nom: 'DamanCom', url: 'https://damancom.ma' },
  { nom: 'CIMR', url: 'https://www.cimr.ma' },
];
