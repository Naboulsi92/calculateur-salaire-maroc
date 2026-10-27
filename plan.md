# Plan — Comparateur salaire net 2026 ↔ 2027 (PLF 2027)

> **Fichier vivant** — suivi et mis à jour tout au long du travail. Dernière MAJ : **27 oct. 2026**.
> Méthode : wayfinder (carte + tickets = décisions) ; un ticket à la fois ; journal en fin de fichier.

---

## 1. Objectif (destination)

Un comparateur de salaire net « 2026 ↔ 2027 » en **page dédiée SEO-optimisée** dans `salaire-net-app` :
mêmes entrées → **deux bulletins côte à côte + écart ligne à ligne** (mensuel, annuel, %),
moteur paramétré **par année (2026–2031)**, barèmes validés contre les tableaux du PLF 2027
(projet de loi **n° 60-26**).

La carte **porte l'exécution** : le ticket de décomposition (T6) créera les tickets d'implémentation ;
la destination n'est atteinte qu'à la mise en ligne validée.

## 2. Faits verrouillés (état au 27/10/2026)

- **Statut législatif** : PLF 2027 **non voté** — déposé 20/10, confiance 22/10, présenté 23/10,
  discussion générale dès 28/10, vote attendu d'ici ~17/12/2026, publication BO fin décembre.
- **Changements 2027 modélisés** :
  - **Barème IR** : exonération 40 000 → 60 000 DH/an, tranches 10/20 % décalées vers le haut,
    tranche 30 % supprimée (2027 garde 34/37 %), séquence transitoire 2028–2030, cible 2031
    (art. 247-XXXXVII & 73-I CGI).
  - **Frais professionnels** : 45 % uniforme, plafond 35 000 DH/an (fin du régime 35 %/25 % et
    du seuil 78 000), applicable aux revenus acquis dès le 01/01/2027.
- **Invariants confirmés** : CNSS 4,48 % (plaf. 6 000), AMO 2,26 % (sans plafond),
  famille 600 DH/an/pers. (plaf. 3 600), ancienneté (0/5/10/15/20/25 %), SMIG 3 422,72/mois (17,92/h).
  Indemnités (panier/transport) exonérées jusqu'en 2030 — restriction art. 57-1° reportée à 2031.
- **Fiabilité** : barèmes 2027–2031 validés par croisement externe (texte PLF + 6 sources) ;
  1 correction appliquée (déduction mensuelle 10 % 2027 = **500 DH**, pas 166,67).
- **Artefacts de recherche** :
  - [`docs/wayfinder/recherche/extraction-PLF2027-paie.md`](docs/wayfinder/recherche/extraction-PLF2027-paie.md) — extraction exhaustive des deux documents arabes
  - [`docs/wayfinder/recherche/verification-croisee-baremes-2027-2031.md`](docs/wayfinder/recherche/verification-croisee-baremes-2027-2031.md) — vérification web + vecteurs secondaires

## 3. Données de référence (source unique du codage)

### 3.1 Barème IR annuel (RNI, DH) — `taux / déduction`
| Année | Tranches |
|---|---|
| **2026** | 0–40 k 0 % · 40–60 k 10 %/4 000 · 60–80 k 20 %/10 000 · 80–100 k 30 %/18 000 · 100–180 k 34 %/22 000 · >180 k 37 %/27 400 |
| **2027** | 0–60 k 0 % · 60–80 k 10 %/6 000 · 80–100 k 20 %/14 000 · 100–180 k 34 %/28 000 · >180 k 37 %/33 400 |
| **2028** | 0–60 k 0 % · 60–100 k 10 %/6 000 · 100–200 k 25 %/21 000 · >200 k 37 %/45 000 |
| **2029** | 0–60 k 0 % · 60–130 k 10 %/6 000 · 130–200 k 20 %/19 000 · >200 k 35 %/49 000 |
| **2030** | 0–60 k 0 % · 60–150 k 10 %/6 000 · 150–200 k 20 %/21 000 · >200 k 30 %/41 000 |
| **2031** | 0–60 k 0 % · 60–150 k 10 %/6 000 · 150–500 k 20 %/21 000 · >500 k 30 %/71 000 |

### 3.2 Barème IR mensuel (SNI = annuel ÷ 12) — `taux / déduction`
| Année | Tranches |
|---|---|
| **2026** | 0–3 333,33 0 % · –5 000 10 %/333,33 · –6 666,67 20 %/833,33 · –8 333,33 30 %/1 500 · –15 000 34 %/1 833,33 · >15 000 37 %/2 283,33 |
| **2027** | 0–5 000 0 % · –6 666,67 10 %/500 · –8 333,33 20 %/1 166,67 · –15 000 34 %/2 333,33 · >15 000 37 %/2 783,33 |
| **2028** | 0–5 000 0 % · –8 333,33 10 %/500 · –16 666,67 25 %/1 750 · >16 666,67 37 %/3 750 |
| **2029** | 0–5 000 0 % · –10 833,33 10 %/500 · –16 666,67 20 %/1 583,33 · >16 666,67 35 %/4 083,33 |
| **2030** | 0–5 000 0 % · –12 500 10 %/500 · –16 666,67 20 %/1 750 · >16 666,67 30 %/3 416,67 |
| **2031** | 0–5 000 0 % · –12 500 10 %/500 · –41 666,67 20 %/1 750 · >41 666,67 30 %/5 916,67 |

### 3.3 Frais professionnels (FP, sur SBI)
- **2026** : SBI annuel ≤ 78 000 → 35 % (plaf. 30 000/an = 2 500/mois) ; > 78 000 → 25 % (plaf. 35 000/an = 2 916,67/mois)
- **2027+** : **45 % uniforme**, plaf. 35 000/an = 2 916,67/mois (plafond atteint dès ≈ 6 481,48 DH/mois de SBI)

### 3.4 Vecteurs secondaires (validation)
- Gain plafond 2027 : **+500 DH/mois** · IR nul 2027 jusqu'à ≈ **8 375 DH brut/mois**
- Exemple publié : brut 10 000 → IR 2026 ≈ 602 → IR 2027 = **159** (+443)

## 4. Décisions verrouillées (cadrage)

1. Livrable : comparateur dans l'app, **page dédiée** (Q1/Q8)
2. Périmètre : **tout ce qui impacte le net** (Q2)
3. Tests : barèmes PLF = **vecteurs dorés** + dérivation mensuelle + cas frontières (Q7)
4. Présentation : **2 colonnes + écart** ligne à ligne (Q4)
5. Modélisation : **barèmes par année 2026–2031**, 2026 par défaut tant que non voté (Q5)
6. V1 : profil saisi seul, sans grille de profils types (Q6)
7. Barèmes **fiabilisés** par croisement externe ✅ (T1)
8. Registre **minimal** : chaque année porte IR (mensuel + annuel) + FP ; CNSS/AMO/famille/
   ancienneté/SMIG restent des constantes partagées — le partage est la garantie d'invariance (T2)
9. FP **générique par tranches** : `{ tranches: [{ seuilAnnuel|null, taux, plafondAnnuel }] }`
   — 2026 = 2 tranches (35 %/78 000/30 000 puis 25 %/null/35 000), 2027+ = 1 tranche (45 %/null/35 000) (T2)
10. **Statut `'en-vigueur' | 'projet'` par année** ; défaut UI = dernière année en vigueur (2026)
    tant que le PLF n'est pas au BO ; badge « projet » (T2)
11. Exports actuels (`IR_MENSUEL`, `IR_ANNUEL`, `FP`…) conservés comme **alias** vers l'année
    courante — zéro rupture pour `calcul.ts`/`main.ts`/tests (T2)

**Out of scope** : pensions (minimum/veuve), soutien direct, transfert de gestion AMO, FIFA 2030,
Tresdim importateurs, salaires publics, catégories professionnelles spéciales du FP,
i18n/interface arabe.

**Brouillard : vide** (plus rien à décider qui ne soit nommé).

## 5. Tickets

| # | Ticket | Type | État | Bloqué par |
|---|---|---|---|---|
| T1 | Fiabilisation des barèmes PLF 2027 | research | ✅ **résolu** (§2, §3) | — |
| T2 | Forme des données barèmes multi-années et statut projet | grilling | ✅ **résolu** (D8–D11) | — |
| T3 | Prototype UI/UX de la page comparateur | prototype | ✅ **résolu** (prototype v2 validé) | — |
| T4 | SEO de la page comparateur dédiée | grilling | ✅ **résolu** (D12–D15) | — |
| T5 | Stratégie de validation par vecteurs dorés | grilling | ✅ **résolu** (D16–D17) | ✅ débloqué (T2 fait) |
| T7 | Politique d'amendements et suivi du vote | grilling | ✅ **résolu** (D18–D20) | — |
| T6 | Décomposition de l'implémentation | grilling | ✅ **résolu** (D21–D23) | — |
| I1 | Moteur multi-années : registre baremes.ts + year param calcul.ts + golden tests | implémentation | ✅ **terminé** (60/60 tests verts, build vert) | T2, T5 |
| I2 | Page comparateur `salaire-net-2027.html` (prototype v2 + toutes entrées) | implémentation | ✅ **terminé** (69/69 tests, build 2 pages, captures validées) | I1, T3 |
| I3 | SEO stamping 2 pages : site.mjs, FAQ 2027, OG dédiée, sitemap, maillage | implémentation | ✅ **terminé** (74/74 tests, build 2 pages, OG + maillage vérifiés) | I2, T4 |
| I4 | e2e + build + README procédure PLF + clôture plan | implémentation | ✅ **terminé** (3 e2e verts dont e2e-comparateur, README D20, plan clôturé) | I3, T7 |

### T2 — Forme des données barèmes multi-années et statut projet
> **Question** : quelle structure de données dans `baremes.ts` (registre par année 2026–2031,
> contenu par année, forme générique du FP, champ de statut projet/voté, compatibilité avec les
> exports actuels `IR_MENSUEL`/`IR_ANNUEL`/`FP` consommés par `calcul.ts`/`main.ts`/tests) ?
>
> **✅ Résolu** — D8 registre minimal (IR + FP par année, reste partagé) · D9 FP générique par
> tranches · D10 statut par année, défaut = dernière année en vigueur · D11 alias de compatibilité.

### T3 — Prototype UI/UX de la page comparateur 2026 vs 2027
> **Question** : layout des 2 colonnes + colonne d'écart (MAD, %, accentuation), position et
> contenu du sélecteur d'années, badge « projet de loi » + disclaimer, état FP plafonné,
> responsive mobile, impression/partage, recalcul instantané.
>
> **✅ Résolu** — prototype v2 validé (`docs/wayfinder/prototype/`, captures desktop + mobile) :
> chips d'années 2027–2031 au-dessus du bulletin (« 2031 · cible ») ; **FP affiché en positif**
> (déduction fiscale, écart gris neutre) ; couleurs d'écart réservées à IR brut/IR net/Net ;
> bandeau « projet non voté » + stamp ; mobile empilé avec table scrollable.

### T4 — SEO de la page comparateur dédiée
> **Question** : slug + mot-clé primaire, title/meta/OG, FAQ 2027, schema.org, sitemap,
> maillage interne, politique d'indexation tant que le PLF n'est pas voté.
>
> **✅ Résolu** — **D12** slug `/salaire-net-2027.html`, mot-clé « salaire net 2027 »,
> title « Salaire net 2027 vs 2026 au Maroc — comparateur IR (PLF 2027) » (pas de
> cannibalisation avec la home « calculateur salaire brut net maroc 2026 ») ·
> **D13** indexation immédiate (index,follow) tant que « projet », badge visible, fraîcheur
> gérée par DATE_MAJ/lastmod + T7 · **D14** 4 FAQ dédiées 2027 (ce qui change · barème
> mensuel · est-ce voté ? · combien vais-je gagner ?) avec FAQPage JSON-LD ·
> **D15** OG dédiée `og-comparateur-1200x630.png` via `scripts/og.mjs`. Le tout depuis la
> source unique `scripts/site.mjs` → `npm run seo` ; sitemap : 2ᵉ URL ; maillage interne
> croisé home ↔ comparateur.
>
> **✅ Itéré en I3** — **D24** l'entrée home → comparateur n'est pas qu'un lien de footer
> (réserve utilisateur : « pas une bonne UX ») : bandeau visible sous le masthead
> (« PLF 2027 — Comparez votre net 2027 vs 2026 — brut 10 000 → +442,71 MAD/mois → »),
> stampé région SEO:BANDEAU depuis `site.mjs` (BANDEAU_COMPARATEUR) · **D25** le lien
> footer est conservé (bandeau pour les humains, footer pour le maillage/crawl).
>
> **✅ Itéré après revue de code (2 axes : standards + spec)** — **D26** le bandeau
> « projet non voté » vit dans `site.mjs` (BANDEAU_PROJET, région SEO:PROJET) : la
> bascule D19 se fait en éditant la source unique, plus rien en dur dans le HTML ·
> **D27** l'écart est rendu au complet (objectif §1 « mensuel, annuel, % ») : % relatif
> à |2026|, même signe que l'écart, null si 2026 = 0 ou écart nul ; sous-ligne dans les
> cellules (« 73,59 % · an : +5 312,52 »), « ≈ 4,47 % » au trio de nets, « (4,47 %) »
> au gain annuel · **D28** avertissement visible chip 2031 si panier/transport > 0
> (art. 57-1° PLF : restriction de l'exonération des indemnités dès 2031 — information
> UI seule, hors moteur) · **D29** liens externes (CNSS, DamanCom, CIMR, CGI/DGI) en
> `target="_blank" rel="noopener noreferrer"`, maillage interne inchangé · doublons de
> la revue refactorés : formulaire partagé `src/formulaire.ts` (main.ts + comparateur.ts),
> helper `tests/profil.ts`, `FP.seuilMensuel` dérivé (÷12), `FAMILLE.maxPersonnes` ·
> `Calcul.md` v1.3 (barèmes 2027–2031 → baremes.ts, règles 2026 inchangées).

### T5 — Stratégie de validation par vecteurs dorés
> **Question** : quels tests exactement — tableaux 2026–2031 reproduits en données de test,
> cohérence mensuel × 12 = annuel, cas frontières, vecteurs secondaires, niveau d'exigence pour
> les déductions 2028–2030 (dérivées) ?
>
> **✅ Résolu** — **D16** assertion exacte au centime sur nos sorties moteur recomputées
> indépendamment (IR 2026 = 601,56 · IR 2027 = 158,85 · écart +442,71…) ; vecteurs externes
> (≈ 602/159/+443 · IR nul ≈ 8 375 brut · +500 max) testés avec tolérance **±3 MAD** ·
> **D17** barèmes 2028–2030 testés tels quels, étiquetés « dérivées — à re-vérifier au
> vote/BO », re-vérification déclenchée par T7. Reste plié sans question : golden data = tableaux
> exacts du plan §3 ; cas frontières (du−0,01/du/au/au+0,01) mensuel + annuel, tous millésimes ;
> cohérence mensuel × 12 = annuel ; FP plafonné (cap 2 916,67 à SBI ≈ 6 481,48) ; relation
> écart-net = −(écart-IR) (CNSS/AMO identiques entre années) ; non-régression des alias (D11) ;
> arrondi round2 ligne à ligne (convention app, notée au prototype).

### T6 — Décomposition de l'implémentation
> **Question** : comment découper l'exécution (moteur multi-années → page comparateur → tests →
> stamping SEO) en tickets avec ordres et dépendances, une fois T2/T3/T4 tranchés ?
>
> **✅ Résolu** — **D21** ordre : I1 moteur d'abord (données prouvées par les golden tests avant
> toute UI) → I2 page → I3 SEO → I4 finalisation · **D22** 4 tickets (frontières naturelles
> données/UI/stamping/validation) · **D23** I1 démarré immédiatement dans la session.

### T7 — Politique d'amendements et suivi du vote
> **Question** : que faire si le texte bouge d'ici le vote (~17/12) et à la publication au BO —
> quels déclencheurs de mise à jour des données, comment basculer `statut: projet → en-vigueur`,
> qui surveille quoi ?
>
> **✅ Résolu** — **D18** 3 jalons de re-vérification (vote du Parlement ~19/11–17/12 ·
> publication au BO fin décembre · 01/01/2027) + re-vérification à la demande (amendement
> médiatisé) · **D19** bascule « projet → en vigueur » par édition des données (`baremes.ts` :
> statut + montants amendés éventuels) + golden tests + `npm run seo` (DATE_MAJ, lastmod) +
> FAQ réécrite — pas de mécanisme parallèle · **D20** procédure documentée dans le README de
> `salaire-net-app` (checklist : baremes.ts → tests → npm run seo → FAQ) ; ce plan reste le journal.

## 6. Phases

| Phase | Contenu | État |
|---|---|---|
| P0 | Matérialisation : `plan.md` + artefacts de recherche | ✅ |
| P1 | T2 — forme des données | ✅ (D8–D11) |
| P2 | T3 — prototype UI/UX | ✅ (prototype v2 validé) |
| P3 | T4 — SEO | ✅ (D12–D15) |
| P4 | T5 — stratégie de validation | ✅ (D16–D17) |
| P5 | T7 — politique d'amendements | ✅ (D18–D20) |
| P6 | T6 — décomposition de l'implémentation | ✅ (D21–D23, tickets I1–I4) |
| P7 | Implémentation (I1 ✅ → I2 ✅ → I3 ✅ → I4 ✅) | ✅ |
| P8 | Validation finale (golden tests, e2e, build) + clôture | ✅ |

## 7. Critères de complétion

1. ✅ Le comparateur (page dédiée) fonctionne : mêmes entrées → 2 bulletins + écart (mensuel, annuel)
2. ✅ Barèmes 2026–2031 en données, validés : golden tests verts (tableaux exacts, frontières, mensuel × 12 cohérent)
3. ✅ Badge « projet » + disclaimer tant que non voté ; politique d'amendements documentée (T7, README D20)
4. ✅ SEO complet : slug, meta, OG, FAQ, sitemap (2 URL), maillage interne (bandeau D24 + footers)
5. ✅ e2e verts (home, responsive, comparateur), build vert, `plan.md` à jour (journal tenu)

## 8. Journal

- **27/10/2026** — Création du plan (matérialisation de la carte wayfinder). T1 résolu :
  extraction PLF + vérification croisée (2 artefacts) ; 1 correction (déduction mensuelle 10 %
  2027 = 500). Brouillard vide. Début T2 (forme des données).
- **27/10/2026 (2)** — **T2 résolu** (D8–D11 : registre minimal IR+FP, FP générique par tranches,
  statut par année, alias de compatibilité). **T3 en cours** : prototype rough créé →
  [`docs/wayfinder/prototype/comparateur-2026-2027.html`](docs/wayfinder/prototype/comparateur-2026-2027.html)
  (captures : `proto-desktop.png`, `proto-mobile.png`). Contrôle de cohérence : brut 10 000 →
  IR 2026 = 601,56 (≈ 602 publié ✓), écart +442,71/mois (≈ +443 publié ✓). Point reporté à T5 :
  le prototype n'arrondit pas ligne à ligne (l'app si : round2 par ligne) — politique d'arrondi
  du comparateur à verrouiller.
- **27/10/2026 (3)** — **T3 itéré** sur retour utilisateur : chips d'années 2027–2031 au-dessus
  du bulletin (remplace le sélecteur déroulant), **FP affiché en positif** (déduction fiscale,
  écart gris neutre), couleurs d'écart réservées à IR/Net. Captures v2 (desktop + mobile)
  remplacées.
- **27/10/2026 (4)** — **T3 clôturé** (prototype v2 validé par l'utilisateur). **T4 résolu**
  (D12–D15 : slug /salaire-net-2027, indexation immédiate, 4 FAQ 2027 + JSON-LD, OG dédiée ;
  tout depuis site.mjs → npm run seo). **T5 résolu** (D16–D17 : exact auto + ±3 MAD externes,
  2028–2030 testées + étiquetées). **T7 en cours** (politique d'amendements).
- **27/10/2026 (5)** — **T7 résolu** (D18–D20 : 3 jalons de re-vérification + à la demande ;
  bascule par édition des données + npm run seo, pas de mécanisme parallèle ; procédure
  documentée dans le README de l'app). **T6 résolu** (D21–D23 : ordre I1→I2→I3→I4, 4 tickets,
  I1 démarre immédiatement). **I1 terminé** : registre multi-années dans
  `salaire-net-app/src/baremes.ts` (BAREMES 2026–2031, TrancheFP générique D9, statut D10,
  alias D11 dérivés du registre), `calcul.ts` reçoit `annee` en paramètre (défaut = dernière
  en-vigueur) + `fraisPro()` générique + `Resultat.annee/statut` exposés. Nouvelle suite
  `tests/baremes-2027.test.ts` : 33 golden tests (vecteurs exacts au centime, frontières
  du−ε/du/au/au+ε, cohérence des déductions, mensuel × 12, FP plafonné 2 916,67 à
  6 481,48, vecteurs externes ±3, écart-net = −écart-IR, statuts) — **60/60 verts**,
  build vert (seo + tsc + vite).
- **27/10/2026 (7)** — **I2 terminé** : page `salaire-net-2027.html` (régions SEO posées,
  stamping I3) + `src/comparateur.ts` (adaptateur, pattern main.ts, défaut brut 10 000 =
  prototype T3) + `lignesComparateur()` dans `calcul.ts` (FP positif, colore IR/Net) +
  `src/avertissements.ts` partagé + `vite.config.ts` multi-pages + styles comparateur.
  Vérifié en preview : écart +442,71 vert, badges IR 30 % → 10 % / FP plafonné, chips
  dynamiques (2028 ✓), mobile empilé + table scrollable, home non régressée. Captures :
  `docs/wayfinder/captures/i2-comparateur-{desktop,mobile}.png`. **I3 en cours** (SEO
  stamping : site.mjs 2 pages, og-comparateur, sitemap, maillage).
- **27/10/2026 (8)** — **I3 terminé** : `scripts/site.mjs` devient la source unique des
  **2 pages** (PAGE_HOME + PAGE_COMPARATEUR, FAQ_COMPARATEUR ×4, LIEN_COMPARATEUR +
  COMPARATEUR_FOOTER, ANNEE_CIBLE=2027, DATE_MAJ → 2026-10-27) ; `scripts/seo.mjs` généralisé
  (builders par page, stamping des 2 fichiers, sitemap 2 URL — home 1.0 · comparateur 0.9
  monthly, robots inchangé) ; `scripts/og.mjs` génère les 2 visuels (og-comparateur-1200x630 :
  « 2026 ↔ 2027 · +500 MAD/mois max », mention « PLF 2027 (projet) » ; home préservée) ;
  maillage croisé home ↔ comparateur dans les footers stampés (cliquable, vérifié navigateur).
  Tests site.test.ts étendus (slug, titre mot-clé, FAQ ×4, maillage, OG distinctes) —
  **74/74 verts**, build 2 pages vert. Captures : `docs/wayfinder/captures/i3-maillage-home.png`.
- **27/10/2026 (9)** — **I3 itéré** sur réserve utilisateur (le lien footer seul = mauvaise
  UX) : **D24** bandeau visible sous le masthead de la home vers le comparateur (badge
  « PLF 2027 », pitch + exemple chiffré +442,71), stampé région `SEO:BANDEAU` depuis
  `site.mjs` (BANDEAU_COMPARATEUR) — la source unique reste seule détentrice du lien ;
  **D25** lien footer conservé. Vérifié desktop + mobile (wrap propre) + clic → comparateur.
  Captures : `docs/wayfinder/captures/i3-bandeau-{desktop,mobile}.png`. **75/75 tests**
  (nouveau test bandeau), build 2 pages vert.
- **27/10/2026 (10)** — **I4 terminé — PLAN CLÔTURÉ**. e2e comparateur créé
  (`tests/e2e-comparateur.mjs`, 12 vérifications : titre stampé, bandeau projet, chips,
  nets/écart au centime — page démarre panier/transport 500 donc nets 9 903,64 → 10 346,35,
  badges IR 30 % → 10 %, FP positif 2 500,00 → 2 916,67, chip 2028, cas brut 8 000
  (écart +276,75 : SNI 2026 5 550,40 → IR 276,75 · SNI 2027 4 633,73 → IR 0), maillage
  bandeau+footer bidirectionnel, responsive 320–1024 sans débordement, table-scroll 320px).
  e2e home + responsive re-passés verts. README mis à jour (2 pages, registre multi-années,
  **procédure de mise à jour PLF D20** : baremes.ts → golden tests → site.mjs/DATE_MAJ/FAQ →
  npm run seo/og/build). **État final : 75/75 vitest · 3 e2e verts · build 2 pages vert.**
  Reste au suivi (hors plan) : jalons D18 (vote ~17/12 · BO fin décembre · 01/01/2027).
- **27/10/2026 (11)** — **Revue de code (2 axes, sous-agents parallèles) puis corrections**.
  Revue : Standards 6 constats (Calcul.md v1.2 périmé/double vérité, banner-projet en dur
  hors site.mjs cassant D19, duplications main.ts↔comparateur.ts + profil() tests,
  FP.seuilMensuel en dur, Math.min(6) vs maxPersonnes) ; Spec : §3 conforme à 100 %, manques
  (écart en % absent vs §1, écart annuel calculé mais non rendu ligne à ligne, restriction
  art. 57-1° 2031 non signalée). Corrections retenues par l'utilisateur (5 chantiers, D26–D29) :
  `calcul.ts` — LigneComparateur étendu (ecart/ecartPct/ecartAnnuel/ecartAnnuelPct via
  ecartDe ; % base |2026|, null si a=0 ou écart nul) ; `comparateur.ts` réécrit sur le
  formulaire partagé — cellules avec sous-ligne « % · an », #net-ecart-pct « ≈ % », gain
  annuel « (x %) », avertissement 2031 (AVERTISSEMENT_2031) si rB=2031 et indemnités > 0 ;
  `src/formulaire.ts` (nouveau, anti-duplication : champs/preparer/lire/cable) + `main.ts`
  basculé dessus (défaut SMIG préservé) ; `baremes.ts` — FP.seuilMensuel dérivé (÷12) et
  FAMILLE.maxPersonnes pour le clamp ; `site.mjs`/`seo.mjs` — BANDEAU_PROJET stampé région
  SEO:PROJET + helper `externe()` (_blank noopener noreferrer, D29) sur tous les liens
  externes des 2 footers ; `Calcul.md` v1.3 ; `tests/profil.ts` partagé ; tests étendus
  (écart %/annuel au centime, BANDEAU_PROJET, e2e startsWith '+442,71').
  **État : 77/77 vitest · tsc · build 2 pages · 3 e2e verts.** Vérifié navigateur : % +
  écart annuel rendus, #net-ecart-pct, warning 2031 (chip 2031 + indemnités), _blank sur
  CNSS/DamanCom/CIMR/CGI-DGI uniquement (maillage interne inchangé), home non régressée
  (SMIG 3 422,72, net 4 192,03). Capture : `docs/wayfinder/captures/i5-corrections-comparateur.png`.

---

## 🗄️ Annexe — plan historique (SPA 2025/2026, terminée — conservé tel quel)

# Plan — SPA Calculateur Salaire Net Maroc IR 2025

## 1. Objectif
App frontend-only (aucun backend) pour calculer le salaire net mensuel + annuel à partir du brut, selon `Calcul IR 2025.md` + LF2025.

- Stack: **Vite + Vanilla TS**, UI **français**, monnaie MAD (`fr-MA`, 2 décimales, clamp ≥ 0)
- Dossier: `salaire-net-app/` dans `D:\Personnal\Calculateur Salaire`

## 2. Entrées V1 (verrouillées)
- `brut_base` mensuel (MAD, ≥ 0)
- `date_embauche` (date, max = today) → ancienneté calculée avec **today** comme référence
- `panier` (défaut 0), `transport` (défaut 500 MAD/mois)
- `AMO` toggle oui (défaut) / non
- `CIMR` liste discrète: `0 (= non-adhérent) + 3 / 3.75 / 4.5 / 5.25 / 6 / 7 / 7.5 / 8 / 8.5 / 9 / 9.5 / 10 %`
- `nb_charges` 0–6 (défaut 0)
- Pas de champ emprunts en V1. Saisie mensuelle, résultats mensuel + annuel simultanés.

## 3. Règles paie 2025
- **Ancienneté:** années = plancher((today - embauche)/365.25). Taux: <2a 0%, 2–5a 5%, 5–12a 10%, 12–20a 15%, 20–25a 20%, ≥25a 25%. `prime_anc = brut * taux`, `brut_majoré = brut + prime_anc`
- **SBI:** `= brut_majoré` (le brut saisi est la base taxable). Panier/transport : exclus des bases, versés via `total_gains = brut_majoré + panier + transport`.
- **CNSS:** `min(SBI, 6000) * 4.48%` (max 268.80/mois)
- **AMO:** `oui ? SBI * 2.26% : 0`, sans plafond
- **CIMR:** base = **brut majoré** (avant panier/transport — confirmé bulletin réel). `CIMR = brut_majoré * taux`. Déductible SNI + net. Warning fiscal si > 6% sans bloquer.
- **FP (confirmé CGI Art.59):** taux unique selon SBI annuel, non cumulé:
  - `SBI_an ≤ 78 000 → min(SBI*35%, 2500/mois)` (seuil 6500/mois, plaf 30k/an)
  - `SBI_an > 78 000 → min(SBI*25%, 2916.67/mois)` (plaf 35k/an)
  - FP sur SBI incluant prime d'ancienneté.
- **SNI:** `SBI - (FP + CNSS + AMO + CIMR)`
- **IR barème mensuel:** 0–3333.33 0%/0, 3333.34–5000 10%/333.33, 5000.01–6666.67 20%/833.33, 6666.68–8333.33 30%/1500, 8333.34–15000 34%/1833.33, 15000.01+ 37%/2283.33
- **IR barème annuel:** 0–40k 0%/0, 40–60k 10%/4000, 60–80k 20%/10000, 80–100k 30%/18000, 100–180k 34%/22000, 180k+ 37%/27400
- **Famille LF2026:** `600 MAD/an/pers. plaf 3600 (6 max)` → `50/mois/pers. plaf 300/mois`. `IR_net = max(IR_brut - famille, 0)`
- **Net:** `total_gains - CNSS - AMO - CIMR - IR_net`. Relation: `Net = SNI + FP - IR_net + panier + transport`.
- **SMIG:** warning si brut < 3266.10/mois. SMIG horaire 17.10 MAD (01/2025).

## 4. Structure projet
```
salaire-net-app/
  index.html         # coquille : SEO/head/FAQ/footer timbrés par npm run seo
  src/main.ts        # adapters rendu + libellés/options/défauts depuis baremes
  src/calcul.ts      # calcMensuel(), lignesPaie(), annualisation
  src/baremes.ts     # IR_MENSUEL/ANNUEL, TAUX_ANC, plafonds, millésimes, défauts
  src/format.ts      # formatage français unique (D2)
  src/style.css      # @layer base/composants/responsive/print/motion (D4)
  scripts/site.mjs   # source unique SEO (D3) · scripts/seo.mjs (stamping)
  tests/             # vitest (calcul, lignesPaie, format, site, fixtures)
  package.json (seo, build, dev, preview), vite.config.ts, README.md
```

## 5. UI
- Gauche: formulaire. Droite: Net mensuel + annuel en grand, tableau décomposition (Brut → Prime anc. → SBI → FP → CNSS → AMO → CIMR → SNI → IR brut → IR net → Net), badges tranche IR / SMIG / CIMR>6%.
- Recalcul instantané, validation ≥ 0, partage via query params (optionnel).

## 6. Tests (vitest)
Seuil FP 6500, plafonds FP/CNSS, AMO off, CIMR base brut majoré, limites IR, famille 500/3000 plafonnée, ancienneté à 2 ans pile, cohérence mensuel*12 ≈ annuel.

## 7. Sources
CGI 2025 / LF 60-24, cimr.ma FAQ, teleservices.cimr.ma, cnss.ma, OJRAWEB FP 2025, calculator.ma, H24/Le360/Grant Thornton (famille 500/3000).
