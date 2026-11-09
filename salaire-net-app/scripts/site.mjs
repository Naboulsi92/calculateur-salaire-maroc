// D3 : source unique des métadonnées site/SEO.
// `npm run seo` propage vers index.html + salaire-net-2027.html (head, JSON-LD,
// FAQ, footer), public/robots.txt et public/sitemap.xml. Ne dupliquer aucune de
// ces valeurs ailleurs : éditer ici, puis `npm run seo`.

/** Domaine canonique (production Cloudflare Workers, custom domain). */
export const SITE_URL = 'https://calculateur-salaire.ma';

/** Cloudflare Web Analytics : token du site (dashboard → Analytics & Insights
 *  → Setup Web Analytics). Vider la chaîne = script non injecté. */
export const CF_WEB_ANALYTICS_TOKEN = '459376a51ea04058a85d25dc9b758bb9';

/** Fichier HTML de vérification Google Search Console (Property = Domain
 *  sc calculateur-salaire.ma, méthode HTML file). Vider = fichier non généré. */
export const GOOGLE_SITE_VERIFICATION = '';

/** Libellés des liens de 404.html (région SEO:FOOTER). */
export const LIEN_404_HOME = '← Simulateur 2026';
export const LIEN_404_COMPARATEUR = 'Comparateur 2027 vs 2026';

/** Millésime fiscal affiché et fraîcheur signalée aux moteurs. */
export const ANNEE = 2026;
/** I3/D12 — millésime cible du comparateur (PLF 2027, projet n° 60-26). */
export const ANNEE_CIBLE = 2027;

/** Dernière mise à jour éditoriale (lastmod sitemap + dateModified JSON-LD). */
export const DATE_MAJ = '2026-11-08';

/** Questions visibles (.qa) ET graphe FAQPage : même source, pas de drift.
 * Exemples chiffrés issus du moteur (profil par défaut 2026 : panier 500,
 * transport 500, AMO oui, CIMR 0, 0 charge) — jamais de sommes « de tête ». */
export const FAQ = [
  {
    q: 'Comment calculer son salaire net au Maroc en 2026 ?',
    a: "Net = total des gains (salaire de base + prime d'ancienneté + panier + transport) − CNSS − AMO − CIMR − IR net. L'IR est assis sur le revenu net imposable (SNI) : salaire de base imposable moins les frais professionnels, puis abattements sociaux. Le simulateur déroule tout le calcul à l'écran, barèmes 2026 (LF 50-25).",
  },
  {
    q: 'Quels sont les taux CNSS et AMO en 2026 ?',
    a: "Part salariale : CNSS 4,48 % sur le salaire de base plafonné à 6 000 MAD/mois (soit 268,80 MAD au maximum) et AMO 2,26 % sans plafond. Un brut de 20 000 MAD paie donc exactement autant de CNSS qu'un brut de 6 000 MAD ; seule l'AMO continue de croître.",
  },
  {
    q: "Comment est calculé l'IR sur salaire au Maroc en 2026 ?",
    a: "On déduit d'abord les frais professionnels du salaire de base imposable : 35 % jusqu'à 78 000 MAD par an, 25 % au-delà, plafond global 35 000 MAD/an (2 916,67 MAD/mois). Le reste, moins les cotisations, forme le SNI, soumis à l'IR par 6 tranches de 0 % à 37 %, puis abattement de 600 MAD/an par personne à charge (plafond 3 600 MAD). Les frais professionnels ne sont pas prélevés du salaire : c'est une déduction fiscale qui baisse l'IR.",
  },
  {
    q: 'Le panier et le transport sont-ils imposables ?',
    a: "Non : ces indemnités versées en espèces sont exclues de toutes les bases (CNSS, AMO, CIMR, IR) tout en restant versées, donc elles s'ajoutent au net — celui-ci peut dépasser le brut. Exemple avec 6 000 MAD de brut, 500 MAD de panier et 500 MAD de transport : 6 579,37 MAD de net mensuel.",
  },
  {
    q: 'Quel net mensuel pour quel brut en 2026 ?',
    a: "Profil courant (panier 500 MAD + transport 500 MAD, AMO, sans CIMR ni personne à charge) : 6 000 MAD de brut → 6 579,37 MAD de net par mois (78 952,44 MAD/an) ; 10 000 de brut → 9 903,64 de net (118 843,68/an) ; 20 000 de brut → 16 508,39 de net (198 100,68/an). Au SMIG (3 422,72 MAD), le net ressort à 4 192,03 MAD.",
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

/** Métadonnées de la page comparateur. `fichier` = fichier dist (stamping) ;
 * `chemin` = URL publique servie par Cloudflare — SANS extension : le
 * html_handling par défaut (auto-trailing-slash) redirige /x.html (307) vers /x,
 * donc les canonical/sitemap/maillage désignent l'URL sans extension, seule
 * servie en 200. Audit OpenSEO 27/10/2026 (contradiction canonical/307). */
export const PAGE_COMPARATEUR = {
  fichier: 'salaire-net-2027.html',
  chemin: 'salaire-net-2027',
  titre: `Salaire net ${ANNEE_CIBLE} vs ${ANNEE} au Maroc — comparateur IR PLF ${ANNEE_CIBLE}`,
  description: `Comparez votre salaire net ${ANNEE_CIBLE} vs ${ANNEE} au Maroc : barèmes IR du PLF ${ANNEE_CIBLE}, exonération 60 000 DH, écart mensuel et annuel ligne à ligne. Gratuit.`,
  ogDescription: `Votre net ${ANNEE_CIBLE} vs ${ANNEE}, ligne à ligne : barèmes IR du PLF ${ANNEE_CIBLE}, frais professionnels 45 %, écart mensuel et annuel.`,
  ogImage: 'og-comparateur-1200x630.png',
  nomApp: `Comparateur Salaire Net ${ANNEE_CIBLE} vs ${ANNEE} (PLF ${ANNEE_CIBLE})`,
  faq: FAQ_COMPARATEUR,
};

// ---------------------------------------------------------------------------
// Build 1/7 (ticket 09) — page F6 « Quel brut pour 8 000 MAD de net ? ».
// Chiffres = oracles moteur (04/11/2026), re-vérifiés ≤ 0,02 MAD par
// scripts/chiffres-8000.mjs à chaque build ; FAQ wording lexiqué (CONTEXT.md).
// ---------------------------------------------------------------------------

/** FAQ dédiée F6 : visible (.qa) ET graphe FAQPage — même source. */
export const FAQ_8000 = [
  {
    q: 'Quel brut de base pour 8 000 MAD de net au Maroc ?',
    a: "7 671,06 MAD de brut de base avec le profil courant (panier 500, transport 500, AMO, sans CIMR ni personne à charge). Dans cette zone de revenu, le net dépasse le brut de base : panier et transport (1 000 MAD ici) s'ajoutent au bulletin sans entrer dans les bases de cotisations ni d'impôt. Avec un CIMR ou des enfants à charge, le brut nécessaire baisse : recalculez votre cas dans le simulateur complet.",
  },
  {
    q: 'Pourquoi le net est-il supérieur au brut de base ?',
    a: "Parce que panier et transport (1 000 MAD ici) s'ajoutent au bulletin sans entrer dans les bases CNSS, AMO ni IR. À ce niveau de revenu, l'IR devient si faible que le net dépasse le brut de base.",
  },
  {
    q: 'Et en 2027 pour viser 8 000 MAD de net ?',
    a: "Le PLF 2027 (projet n° 60-26) supprime la tranche à 30 % et exonère jusqu'à 60 000 MAD/an : l'IR tombe à zéro jusqu'à environ 8 375 MAD de brut de base. Le même net de 8 000 MAD s'obtiendra alors avec un brut de base plus bas — comparez les deux millésimes dans le comparateur 2027.",
  },
];

export const PAGE_8000 = {
  fichier: 'salaire-net-8000.html',
  chemin: 'salaire-net-8000',
  titre: 'Salaire net 8 000 MAD : quel brut ? (Maroc 2026)',
  description:
    'Le brut de base pour 8 000 MAD de net au Maroc en 2026 : bulletin inversé calculé au centime par le moteur (LF 50-25), CNSS, AMO, IR ligne à ligne, net annuel et table brut → net autour de 8 000.',
  ogDescription:
    "Votre bulletin à l'envers : 8 000 MAD de net ⇒ 7 671,06 MAD de brut de base (LF 2026), CNSS, AMO, IR ligne à ligne.",
  ogImage: 'og-salaire-net-8000-1200x630.png',
  nomApp: 'Bulletin inversé 8 000 MAD net (Maroc 2026)',
  faq: FAQ_8000,
};

/** Pied de page F6 : maillage retour outils + textes + barèmes vérifiés (date
 * de VÉRIFICATION HUMAINE des barèmes, grillée au ticket 09 le 05/11 — le
 * build re-vérifie automatiquement les mêmes oracles à chaque déploiement ;
 * stampée par seo.mjs, forme inchangée du gabarit prod). */
export const FOOT_8000 = {
  maillage: [
    { href: '/', label: '← Simulateur 2026' },
    { href: '/salaire-net-2027', label: 'Comparateur PLF 2027' },
  ],
  textes: {
    url: 'https://www.tax.gov.ma',
    label: 'CGI/DGI',
    refs: 'LF 50-25 · PLF 2027 (projet n° 60-26)',
  },
  dateVerification: '05/11/2026',
};

/** Maillage entrant F6 (ADR §4) : lien contextuel home (guide) + croisé depuis
 * le comparateur — href verrouillé par site.test, ancres en prose des pages. */
export const LIEN_SNE8000 = {
  href: `/${PAGE_8000.chemin}`,
  label: 'Salaire net 8 000 MAD : quel brut ?',
};

// ---------------------------------------------------------------------------
// Build 2/7 (ticket 10) — page F6 « Quel brut pour 10 000 MAD de net ? ».
// Chiffres = oracles moteur (08/11/2026), re-vérifiés ≤ 0,02 MAD par
// scripts/chiffres-10000.mjs à chaque build ; FAQ wording lexiqué (CONTEXT.md).
// Particularité : ici le brut de base trouvé (10 126,92) DÉPASSE le net voulu
// (retenues ≈ 1 127 MAD > avantage panier/transport 1 000 MAD) — wording
// FAQ/note inversé par rapport à la page 8000.
// ---------------------------------------------------------------------------

/** FAQ dédiée F6 10000 : visible (.qa) ET graphe FAQPage — même source. */
export const FAQ_10000 = [
  {
    q: 'Quel brut de base pour 10 000 MAD de net au Maroc ?',
    a: "10 126,92 MAD de brut de base avec le profil courant (panier 500, transport 500, AMO, sans CIMR ni personne à charge). Contrairement à 8 000 MAD de net, le brut dépasse ici le net visé : à ce niveau, les retenues (CNSS plafonnée, AMO et IR à la tranche 30 %) dépassent l'avantage non imposable du panier et du transport (1 000 MAD). Avec un CIMR ou des enfants à charge, le brut nécessaire baisse : recalculez votre cas dans le simulateur complet.",
  },
  {
    q: 'Pourquoi le brut de base est-il supérieur au net visé ?',
    a: "Parce qu'à ce niveau de revenu les retenues pèsent plus que l'avantage non imposable : CNSS 268,80 + AMO 228,87 + IR net 629,26 font environ 1 127 MAD de retenues, contre 1 000 MAD de panier et transport hors bases. Sur la page 8 000 MAD de net, c'est l'inverse : les retenues y sont si faibles que le net dépasse le brut de base.",
  },
  {
    q: 'Et en 2027 pour viser 10 000 MAD de net ?',
    a: "Le PLF 2027 (projet n° 60-26) exonère jusqu'à environ 8 375 MAD de brut de base ; à 10 000 MAD, l'IR restant (158,85 MAD) est très inférieur à celui de 2026 (601,56 MAD). Le même net de 10 000 MAD demandera alors environ 9 606 MAD de brut au lieu de 10 127 — comparez les deux millésimes dans le comparateur 2027.",
  },
];

export const PAGE_10000 = {
  fichier: 'salaire-net-10000.html',
  chemin: 'salaire-net-10000',
  titre: 'Salaire net 10 000 MAD : quel brut ? (Maroc 2026)',
  description:
    'Le brut de base pour 10 000 MAD de net au Maroc en 2026 : bulletin inversé calculé au centime par le moteur (LF 50-25), CNSS, AMO, IR ligne à ligne, net annuel et table brut → net autour de 10 000.',
  ogDescription:
    "Votre bulletin à l'envers : 10 000 MAD de net ⇒ 10 126,92 MAD de brut de base (LF 2026), CNSS, AMO, IR ligne à ligne.",
  ogImage: 'og-salaire-net-10000-1200x630.png',
  nomApp: 'Bulletin inversé 10 000 MAD net (Maroc 2026)',
  faq: FAQ_10000,
};

/** Pied de page F6 10000 : maillage retour outils + textes + barèmes vérifiés
 * (date de VÉRIFICATION HUMAINE des barèmes du ticket 10, le 08/11 — les
 * mêmes oracles re-vérifiés automatiquement à chaque build ; stampée par
 * seo.mjs, forme inchangée du gabarit). */
export const FOOT_10000 = {
  maillage: [
    { href: '/', label: '← Simulateur 2026' },
    { href: '/salaire-net-2027', label: 'Comparateur PLF 2027' },
  ],
  textes: {
    url: 'https://www.tax.gov.ma',
    label: 'CGI/DGI',
    refs: 'LF 50-25 · PLF 2027 (projet n° 60-26)',
  },
  dateVerification: '08/11/2026',
};

/** Maillage entrant F6 10000 (ADR §4) : lien contextuel home (guide) + croisé
 * depuis le comparateur et la page 8000 (guide sœur) — href verrouillé par
 * site.test, ancres en prose des pages. */
export const LIEN_SNE10000 = {
  href: `/${PAGE_10000.chemin}`,
  label: 'Salaire net 10 000 MAD : quel brut ?',
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
  href: `/${PAGE_COMPARATEUR.chemin}`,
  label: `Salaire net ${ANNEE_CIBLE} vs ${ANNEE} — comparateur (PLF ${ANNEE_CIBLE})`,
};

/** D24 — bandeau d'entrée visible vers le comparateur (home, au-dessus du formulaire).
 * Exemple chiffré = vecteur moteur validé par golden test (brut 10 000 → +442,71). */
export const BANDEAU_COMPARATEUR = {
  badge: `PLF ${ANNEE_CIBLE}`,
  pitch: 'Votre net peut changer en 2027',
  exemple: 'Simulateur : brut 10 000 → +442,71 MAD/mois',
  cta: 'Comparer',
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
