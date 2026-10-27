// D3 : source unique des métadonnées site/SEO.
// `npm run seo` propage vers index.html + salaire-net-2027.html (head, JSON-LD,
// FAQ, footer), public/robots.txt et public/sitemap.xml. Ne dupliquer aucune de
// ces valeurs ailleurs : éditer ici, puis `npm run seo`.

/** Domaine canonique (production Cloudflare Pages). */
export const SITE_URL = 'https://calculateur-salaire-maroc.naboulsi-riyad.workers.dev';

/** Millésime fiscal affiché et fraîcheur signalée aux moteurs. */
export const ANNEE = 2026;
/** I3/D12 — millésime cible du comparateur (PLF 2027, projet n° 60-26). */
export const ANNEE_CIBLE = 2027;

/** Dernière mise à jour éditoriale (lastmod sitemap + dateModified JSON-LD). */
export const DATE_MAJ = '2026-10-27';

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

// ---------------------------------------------------------------------------
// I3 — page comparateur (D12–D15) : métadonnées, FAQ 2027 et maillage.
// ---------------------------------------------------------------------------

/** FAQ dédiée 2027 (D14) : visible (.qa) ET graphe FAQPage — même source. */
export const FAQ_COMPARATEUR = [
  {
    q: "Qu'est-ce qui change pour le salaire net en 2027 ?",
    a: "Le PLF 2027 relève l'exonération d'IR de 40 000 à 60 000 DH/an, décale les tranches 10 % et 20 % vers le haut, supprime la tranche 30 % et porte les frais professionnels à 45 % (plafond 35 000 DH/an) dès le 1er janvier 2027.",
  },
  {
    q: 'Quel est le barème IR mensuel 2027 ?',
    a: 'Dérivé du barème annuel (÷ 12) : 0–5 000 DH 0 % ; 5 000,01–6 666,67 DH 10 % (déduction 500) ; 6 666,68–8 333,33 DH 20 % (1 166,67) ; 8 333,34–15 000 DH 34 % (2 333,33) ; au-delà de 15 000 DH 37 % (2 783,33).',
  },
  {
    q: 'Le PLF 2027 est-il voté ?',
    a: "Non : c'est un projet de loi (n° 60-26) déposé le 20/10/2026. Vote attendu d'ici mi-décembre 2026, publication au Bulletin officiel fin décembre. Les données restent indicatives jusqu'à la promulgation.",
  },
  {
    q: 'Combien vais-je gagner en 2027 ?',
    a: "Le gain est plafonné à environ +500 MAD/mois (le plafond des frais professionnels limite l'avantage au-delà). L'IR devient nul jusqu'à environ 8 375 MAD de brut mensuel. Saisissez votre profil dans le comparateur pour votre cas exact.",
  },
];

/** Métadonnées de la page comparateur (slug D12, indexation immédiate D13). */
export const PAGE_COMPARATEUR = {
  slug: 'salaire-net-2027.html',
  titre: `Salaire net ${ANNEE_CIBLE} vs ${ANNEE} au Maroc — comparateur IR PLF ${ANNEE_CIBLE}`,
  description: `Comparez votre salaire net ${ANNEE_CIBLE} vs ${ANNEE} au Maroc : barèmes IR du PLF ${ANNEE_CIBLE}, exonération 60 000 DH, écart mensuel et annuel ligne à ligne. Gratuit.`,
  ogDescription: `Votre net ${ANNEE_CIBLE} vs ${ANNEE}, ligne à ligne : barèmes IR du PLF ${ANNEE_CIBLE}, frais professionnels 45 %, écart mensuel et annuel.`,
  ogImage: 'og-comparateur-1200x630.png',
  nomApp: `Comparateur Salaire Net ${ANNEE_CIBLE} vs ${ANNEE} (PLF ${ANNEE_CIBLE})`,
  faq: FAQ_COMPARATEUR,
};

/** Métadonnées de la page principale (simulateur, millésime ANNEE). */
export const PAGE_HOME = {
  slug: '',
  titre: `Calcul Salaire Brut Net Maroc ${ANNEE} – Simulateur IR`,
  description: `Simulez votre salaire net au Maroc en ${ANNEE} : brut → net mensuel et annuel, IR, CNSS, AMO, CIMR. Calculateur gratuit, 100 % local.`,
  ogDescription: `Brut → net, IR, CNSS, AMO, CIMR : simulation gratuite, règles ${ANNEE}.`,
  ogImage: 'og-calculateur-1200x630.png',
  nomApp: `Calculateur Salaire Brut/Net Maroc ${ANNEE}`,
  faq: FAQ,
};

/** D4/T4 — maillage : lien visible home → comparateur (footer stampé). */
export const LIEN_COMPARATEUR = {
  href: `/${PAGE_COMPARATEUR.slug}`,
  label: `Salaire net ${ANNEE_CIBLE} vs ${ANNEE} — comparateur (PLF ${ANNEE_CIBLE})`,
};

/** D24 — bandeau d'entrée visible vers le comparateur (home, au-dessus du formulaire).
 * Exemple chiffré = vecteur moteur validé par golden test (brut 10 000 → +442,71). */
export const BANDEAU_COMPARATEUR = {
  badge: `PLF ${ANNEE_CIBLE}`,
  pitch: `Comparez votre net ${ANNEE_CIBLE} vs ${ANNEE}`,
  exemple: 'brut 10 000 → +442,71 MAD/mois',
};

/** Pied de page du comparateur : disclaimer projet + retour simulateur. */
export const COMPARATEUR_FOOTER = {
  disclaimer: `Barèmes : PLF ${ANNEE_CIBLE} n° 60-26 (art. 247-XXXXVII, 59-I CGI) — projet, non voté`,
  lienRetour: { href: '/', label: `← Simulateur ${ANNEE}` },
  texteLegal: { label: 'CGI/DGI', url: 'https://www.tax.gov.ma' },
};

/** D26 — bandeau « projet non voté » du comparateur (région SEO:PROJET).
 * Bascule D19 : à la promulgation, éditer ici (actif: false + texte LF) puis
 * `npm run seo` — le stamp suit, pas de mécanisme parallèle. */
export const BANDEAU_PROJET = {
  titre: 'Projet de loi non voté au 27/10/2026',
  detail:
    "vote attendu d'ici mi-décembre 2026, publication au Bulletin officiel fin décembre. Barèmes du PLF (art. 247-XXXXVII & 59-I CGI) : indicatifs, susceptibles d'amendements.",
};

/** Références légales du pied de page. */
export const REFS_TEXTES = 'CGI/DGI · LF 60-24 · LF 50-25 · NC DGI 737 · Déc. 2.25.983 (BO 7469)';

/** Portails du pied de page. */
export const PORTAILS = [
  { nom: 'CNSS', url: 'https://www.cnss.ma' },
  { nom: 'DamanCom', url: 'https://damancom.ma' },
  { nom: 'CIMR', url: 'https://www.cimr.ma' },
];
