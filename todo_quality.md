# Revue qualité & maintenabilité — Calculateur Salaire Maroc

> Audit du 02/11/2026 — objectif : simplifier, supprimer ce qui n'apporte plus de valeur.
> Périmètre audité : `salaire-net-app/` (src, scripts, tests, racine), configs, `.gitignore`, `docs/` local.
> **Baseline vérifiée avant tout changement : 83 tests vitest / 7 fichiers, tous verts.**

Légende impact : 🟢 suppression sans risque (vérifiée par grep + tests) · 🟡 bénéfice réel, petit risque à gérer · 🔴 conserver (fausse alerte ou risque > bénéfice).

---

## État d'avancement

- [x] Phase 1 — audit complet (lecture de tout le code + scans de références croisées)
- [x] Phase 2 — exécutions 🟢 (assets morts, exports morts, script `npm test`)
- [x] Phase 3 — exécutions 🟡 (champ `irAnnuelControle`, validation TS des tests + `@types/node`, formatage `signe()`, listener dupliqué)
- [x] Phase 4 — rebuild + tests verts : **83/83 vitest · tsc (src+tests) · build OK · 5 scripts e2e verts** (dont golden `+442,71`)
- [x] Phase 5 — feux verts utilisateur exécutés : `404.html` racine (déjà disparu, clos) + **unification `LIGNES_BULLETIN`** (02/11, filets verts) + **item 16 artefacts e2e → `tests/artifacts/`** (02/11, e2e verts) + **item 15 assertion FAQ → plancher** (02/11, 83/83)
- [x] Plan consolidé clos : items 1-16 tous traités (faits ou clos sans action)

---

## 1. Code mort — code source (`src/`)

### 1.1 🟢 `SMIG_HORAIRE` — **0 référence**
`src/baremes.ts:243` — `export const SMIG_HORAIRE = 17.92;`
- **Pourquoi c'est inutile** : recherchée dans tout `src/`, `tests/`, `scripts/`, HTML : zéro utilisation. Valeur historique (taux horaire SMIG) que plus aucune page n'affiche.
- **Impact de la suppression** : 1 ligne + 1 concept mental de moins dans le registre des constantes.
- **Risque** : nul (grep exhaustif). Si le besoin revient, l'historique git le ressort.
- **Plan** : supprimer la ligne. ✅ fait.

### 1.2 🟢 Bloc compat `FP` (D11) + son unique consommateur — **l'interface ne sert plus que des tests**
`src/baremes.ts:206-220` (objet `FP` à 8 champs dérivés des tranches 2026) + `tests/baremes-2027.test.ts:50-57`.
- **Pourquoi c'est inutile** : le bloc est explicitement marqué « alias de compatibilité : zéro rupture pour calcul.ts / main.ts / tests ». Or `calcul.ts` et `main.ts` **ne l'importent plus** — seul le test l'importe encore, pour Assertir que l'alias est bien égal aux tranches du registre. C'est un test d'une abstraction que plus personne n'utilise : il consomme son existence en boucle.
- **Impact** : ~18 lignes de code + 8 assertions de test supprimées ; le registre `BAREMES` redevient la seule représentation du FP.
- **Risque** : faible. Le test qui disparaît testait une coïncidence de gélatine (alias = registre), pas une règle métier. Les règles FP sont déjà couvertes par `calcul.test.ts`, `comparateur.test.ts` et `bug-cimr.test.ts` via `fraisPro`/`calcMensuel`.
- **Plan** : supprimer l'objet `FP` et ses assertions ; relire les imports du test. ✅ fait.

### 1.3 ✅ Alias `IR_ANNUEL` — export source utilisé **uniquement par un test** — **SUPPRIMÉ**
`src/baremes.ts:204` ; importé seulement par `tests/calcul.test.ts` (2 assertions sur `impotTranche`).
- **Pourquoi c'est inutile** : le moteur accède au barème annuel via `getBareme(annee).irAnnuel` ; l'alias gèle 2026 pour le test. `IR_MENSUEL` en revanche est **vivant** (main.ts affiche le nombre de tranches) → celui-là reste.
- **Impact** : 1 export de moins dans l'API publique de `baremes.ts`.
- **Risque** : minime — le test bascule sur `getBareme(2026).irAnnuel`, sémantique identique.
- **Plan** : migrer `calcul.test.ts`, supprimer l'alias. ✅ fait.

### 1.4 🟡→✅ `Resultat.irAnnuelControle` — calculé à chaque appel, jamais affiché — **SUPPRIMÉ**
`src/calcul.ts:238-240` (calcul) + `:289` (return) ; **0 lecteur** dans `src/`, 0 assertion dans `tests/`.
- **Pourquoi c'est inutile** : « contrôle annuel IR » (barème annuel sur SNI annualisé) est un garde-fou de conception interne qui n'a jamais atteint l'UI ni les tests. À chaque frappe de touche, le moteur fait une recherche de tranche + un calcul d'impôt sur 12 fois le SNI pour produire un nombre que personne ne lit.
- **Impact** : un `impotTranche()` en moins par recalcul ; 1 champ de moins sur l'interface `Resultat` (la plus grosse surface d'API interne du projet).
- **Risque** : faible — vérifié : ni les adaptateurs ni les tests ne le consultent. À supprimer plutôt qu'un « on s'en servira » non financé.
- **Plan** : retirer le calcul + le champ. ✅ fait (décision : supprimer ; l'historique git le rend réversible si le contrôle annuel redevient une fonctionnalité).

### 1.5 🔴 Faux positifs vérifiés — **à conserver absolument**
- `derniereAnneeEnVigueur()`, `findTrancheFP()`, `getTauxAnciennete()` (exportée mais consommée en interne + tests) : vivants.
- `FAMILLE.parPersonneAn` / `plafondAn` : servis par `formulaire.ts` (texte d'aide sous le select charges).
- Classes CSS `pos` / `neg` : ajoutées dynamiquement par `comparateur.ts` (`classList.toggle`) — le scan statique les signalait à tort.
- `trancheIndex`, `ecartAnnuelPct`, `tauxFP`, `statut`, `fpPlafonne` : lus par les tests ou l'UI.
- `deps` npm : `wrangler` (deploy via Workers Builds), `@playwright/test` (e2e + og.mjs), `vitest`, `typescript`, `vite` — **tous utilisés**, aucune dépendance à retirer de `package.json`.
- `tsconfig` `noUnusedLocals/noUnusedParameters` : déjà activés et le build passe → pas de variables locales mortes.

---

## 2. Code mort — fichiers & assets

### 2.1 🟢 `src/assets/` entier (3 fichiers, ~20 K o) — **zéro référence**
`vite.svg` (9 K o, squelette Vite par défaut), `typescript.svg` (1,3 K o, idem), `hero.png` (10 K o).
- **Pourquoi c'est inutile** : recherchés dans HTML, TS, CSS, scripts, tests : aucune balise, aucun import, aucune URL. `hero.png` est un vestige d'une maquette abandonnée ; les deux SVG viennent du template Vite initial.
- **Impact** : dossier `src/assets/` supprimé ; le build est déjà identique (ils n'étaient pas référencés donc pas bundlés).
- **Risque** : nul (grep exhaustif, build post-suppression vérifié).
- **Plan** : `git rm -r salaire-net-app/src/assets`. ✅ fait.

### 2.2 🟢 `public/icons.svg` (5 K o) — sprite social du template Vite
Symboles `bluesky-icon`, `discord-icon`, `github-icon`, `x-icon`, `documentation-icon` — **aucune** `<img src="/icons.svg#…">`, aucun `<use>` nulle part.
- **Pourquoi c'est inutile** : le site n'a aucun réseau social ; c'est une ressource livrée à chaque visiteur pour zéro affichage.
- **Impact** : 5 K o de moins dans `dist/`, 1 fichier de moins à maintenir.
- **Risque** : nul — vérifié dans les 3 pages HTML + les tests e2e.
- **Plan** : `git rm salaire-net-app/public/icons.svg`. ✅ fait. (⚠️ ne pas confondre avec `favicon.svg`, lui vivant.)

### 2.3 ✅→clos `404.html` à la **racine du dépôt** — fichier fantôme non versionné
**Constat 02/11 (après votre feu vert)** : le fichier n'existe déjà plus sur le disque (`Get-ChildItem` + `git status` : rien à supprimer). Le seul 404 du dépôt est `salaire-net-app/404.html`, versionné et servi. Clôt sans action.

### 2.4 🔴 `docs/` (PLF2027, wayfinder, SEO, captures) — non versionné **par conception**
`docs/` est dans `.gitignore` (ligne « Source & notes de travail locales »). Ce ne sont pas des fichiers abandonnés : ce sont les sources légales et les journaux de travail référencés par `todo.md`. **Ne pas supprimer.** Option gratuite : les versionner dans une branche séparée ou un repo privé pour les sauvegarder (ils ne sont aujourd'hui nulle part d'autre que ce disque).

### 2.5 🟢 Artefacts ignorés mais encombrants — à purger localement
`e2e*.png` à la racine de l'app (4 fichiers réécrités à chaque run), `.playwright-mcp/` (16 fichiers), `dist/` (reconstruit par `npm run build`).
- **Pourquoi** : déjà gitignorés, donc aucun risque de commit ; ils ne polluent que le disque et les listings.
- **Plan** : purge occasionnelle ; rien à faire dans le repo. ✅ coché (optionnel, sans effet sur le code).

---

## 3. Logique dupliquée

### 3.1 ✅ `lignesPaie()` vs `lignesComparateur()` — **FACTORISÉ (feu vert utilisateur 02/11)**
`src/calcul.ts:333-354` vs `:397-419`. Même ordre, mêmes ids, mêmes libellés, mêmes signes ; une seule table label serait correcte.
- **Pourquoi** : tout changement de libellé/ordre devait être fait deux fois.
- **Résolution appliquée** : table unique `LIGNES_BULLETIN` (13 lignes : id, libellé, ordre, groupe, accent, signe `negate`, annualisable, `colore`, accesseurs `file`/`fileKey`) + deux projections minces. La divergence comparative reste déclarée par ligne (suffixe `labelTaux`, ligne `net-annuel` ajoutée, `colore`). Une convention d'affichage propre au comparateur a été identifiée et **encodée explicitement** (CIMR à 0 % = non-adhérent → pas de taux dans le comparateur, affiché dans le bulletin) : verrouillée par les tests existants.
- **Vérification** : 83/83 vitest (dont les tests d'alignement ids/groupes/accents déjà en place) + 5/5 e2e verts dont golden `+442,71`. Net : +81 lignes nettes dans `calcul.ts` (la table + le typage remplacent deux blocs déclaratifs) — mais surtout **une seule source des libellés/désordre**.

### 3.2 🟡 Rendu de tableau dupliqué main.ts ↔ comparateur.ts
Squelette identique : `<tr>` → cellules `.num.mono`, sous-entêtes de groupe `colSpan`, classes `strong`/accent. Les deux adaptateurs font la même chose avec 4 ou 5 colonnes.
- **Plan** : un `renderLignesTable(tbody, rows, opts)` dans un module de rendu (les deux pages garderaient leurs colonnes spécifiques). Bénéfice réel mais modeste à cette échelle (2 pages) ; à faire uniquement si une 3ᵉ page de bulletin arrive. → **Reporté (règle des trois).**

### 3.3 🔴 Stamping SEO home/comparateur dans `seo.mjs` — dupliqué **volontairement et bien fait**
Les 5 appels `region()` par page partagent déjà `headPage()`, `faqBody()`, `jsonLd()` ; les footers/bandeaux diffèrent par design. Fusionner davantage (boucle sur les pages) économiserait ~6 lignes pour un script de 180 lignes lu 4 fois par an. **Conserver.**

### 3.4 🔴 `format.ts` — déjà la consolidation (5 formatateurs, source unique). Rien à regrouper.

---

## 4. Complexité à simplifier

### 4.1 ✅ `signe()` + `montant(Math.abs(...))` répété 4 fois (comparateur.ts) — **RÉSOLU**
Le glyphe du signe était appliqué « à la main » à quatre endroits — c'est exactement le bug du double signe SNI du 02/11.
- **Résolution appliquée** : `signeEt(n, fmt)` (`src/comparateur.ts`) centralise glyphe + valeur absolue + formateur (montant **ou** %, la sortie `%` doit rester à 2 décimales — d'où le formateur en paramètre plutôt qu'une fonction montant-only). Les 4 call-sites l'utilisent ; l'e2e golden `+442,71` prouve la stricte identité de rendu.

### 4.2 ✅ Tests exclus de toute validation de types — **RÉSOLU**
`tsconfig.json` n'incluait que `src/` : `tsc` ne regardait jamais `tests/`.
- **Résolution appliquée** : `include: ["src", "tests/**/*.ts"]` + `allowJs` (les `.mjs` du harnais e2e restent hors vérification) + `@types/node` en devDependency (`site.test.ts` importe `node:fs`/`node:path` et utilise `import.meta.dirname` — le typage en était privé). Le passage tsc a immédiatement trouvé une vraie dette : `type Inputs` importé et jamais lu dans `comparateur.test.ts` — supprimé.
- **Risque couru** : nul — le build était vert avant et après ; seule ligne nouvelle : `@types/node ^26.6.6` dans `package.json`.

### 4.3 🔴 Moteur `calcul.ts` — 430 lignes mais **linéaire et bien découpé** (assiettes / fraisPro / impotTranche / lignesPaie). Pas de sur-abstraction, pas de branches millésimes (le registre les absorbe). **Ne pas « simplifier » par principe** : chaque couche est justifiée par un bug de prod passé (C3, C4, D9).

---

## 5. Héritage / legacy

| Élément | Verdict | Motif |
|---|---|---|
| Objet `FP` (D11) | 🟢 supprimé cette passe | voir 1.2 |
| `SMIG_HORAIRE` | 🟢 supprimé | voir 1.1 |
| `irAnnuelControle` | 🟢 supprimé | voir 1.4 |
| `ANNEE_LF`, `DEFAUT_PANIER/TRANSPORT`, `CIMR_SEUIL_FISCAL`, `TAUX_CIMR_LIST` | 🔴 garder | consommés (UI, avertissement fiscal) |
| Barèmes 2028-2031 « projet » | 🔴 garder | cœur de la page comparateur, argument SEO |
| `html_handling` défaut commenté dans `wrangler.jsonc` | 🔴 garder | décision documentée après incident prod du 27/10 — c'est de la documentation, pas du cruft |
| `bug-cimr.test.ts` (nom « legacy ») | 🔴 garder | test de non-régression sur un vrai bug de prod — c'est le pattern idéal |

---

## 6. Requêtes / appels redondants

Aucun backend, aucune base : le sujet réel est la **redondance de recalcul**.

- ✅ **Résolu** : `cableFormulaire()` ne branche plus qu'`input` (+ radios AMO sur `change`). Validé par les 5 scripts e2e (select CIMR, radios AMO, champs nombre, date) : tous verts.
- ✅ `calcMensuel()` appelé 2× dans le comparateur est **correct** (deux millésimes) — pas de cache à ajouter, le recalcul est pur et instantané.
- ✅ Les fixtures de référence (`bulletin-ref.mjs`) partagent déjà les nombres entre vitest et e2e — bonne pratique en place.

---

## 7. Fichiers déconnectés de l'application

| Fichier | État | Décision |
|---|---|---|
| `src/assets/*` (3) | jamais référencés | 🟢 supprimés |
| `public/icons.svg` | jamais référencé | 🟢 supprimé |
| `404.html` (racine dépôt) | non versionné, jamais servi | 🟡 [**vous**] confirmer la suppression |
| `scripts/og.mjs` | hors `npm run build`, mais procédure documentée README (régénérer après changement de titre) | 🔴 garder |
| `tests/verif-*.mjs` | hors `package.json` mais trio e2e documenté dans README | 🟡 intégrer au script `test` (fait) |
| `docs/` | ignoré par git volontairement | 🔴 garder (voir 2.4) |

---

## 8. Dette technique — petits dettes payables

### 8.1 ✅ Pas de script `npm test` — **RÉSOLU**
`package.json` n'avait aucun script `test`.
- **Résolution appliquée** : `"test": "vitest run"` et `"test:e2e"` (les 5 scripts d'affilée ; nécessite `npm run preview -- --port 4173` au préalable — rappel déjà dans le README).

### 8.2 🟢 Faux espace dans une chaîne de production
`tests/... ` et commentaires — vérifié : aucun problème de guillemets typographiques dans le code source (les `« »` du README sont du contenu voulu). RAS.

### 8.3 ✅ `site.test.ts`Assert les **valeurs absolues** de la FAQ — **RELÂCHÉ**
Un ajout de question cassait le test alors que la règles réelle est « body == JSON-LD ».
- **Résolution appliquée** : `toHaveLength(5)` / `toHaveLength(4)` → planchers `toBeGreaterThanOrEqual(4)` / `(3)` (accueil / comparateur). L'anti one-liner (longueur des réponses) et la cohérence dynamique visible↔JSON-LD (`toHaveLength(page.faq.length)`) sont conservés tels quels.
- **Vérification** : 83/83 vitest, tsc propre.

### 8.4 ✅ `e2e*.png` écrits à la racine de l'app — **RÉSOLU**
Les runs e2e écrasaient 4 PNG à côté du code source.
- **Résolution appliquée** : helper partagé `capture(page, nom)` dans `tests/helpers.mjs` — écrit dans `tests/artifacts/` (créé à la volée, gitignoré) ; les 4 appels `screenshot` des 3 scénarios passent par lui. La ligne `salaire-net-app/tests/artifacts/` a été ajoutée au `.gitignore` (l'ancienne `e2e*.png` reste pour couvrir d'éventuels anciens restes).
- **Vérifié** : les 3 scénarios e2e écrivent bien les 4 captures dans `tests/artifacts/`, et `git status` reste propre (dossier invisible pour git).

---

## 9. Plan de nettoyage consolidé (ordre d'exécution)

| # | Action | Risque | Statut |
|---|---|---|---|
| 1 | Supprimer `src/assets/` (3 fichiers) | 🟢 nul | ✅ |
| 2 | Supprimer `public/icons.svg` | 🟢 nul | ✅ |
| 3 | Supprimer `SMIG_HORAIRE` | 🟢 nul | ✅ |
| 4 | Supprimer objet `FP` + assertions du test 2027 | 🟢 quasi nul | ✅ |
| 5 | Supprimer alias `IR_ANNUEL` (+ test → `getBareme`) | 🟢 quasi nul | ✅ |
| 6 | Supprimer `irAnnuelControle` (calcul + interface) | 🟡 faible | ✅ |
| 7 | Centraliser `signe()+abs` dans comparateur.ts (`signeEt`) | 🟢 quasi nul | ✅ |
| 8 | Ajouter scripts `test` / `test:e2e` (les 5 scripts) | 🟢 nul | ✅ |
| 9 | Inclure `tests/` dans `tsc` (+ `@types/node`, `allowJs`) | 🟡 → vert | ✅ |
| 10 | Retirer le listener `change` dupliqué | 🟡 (5 e2e verts) | ✅ |
| 11 | Supprimer le `type Inputs` mort trouvé par le tsc élargi | 🟢 nul | ✅ (bonus) |
| 12 | ~~Supprimer `404.html` à la racine~~ — **constaté : le fichier n'existe plus** (supprimé par vous entre-temps, vérifié `Get-ChildItem` + `git status` propres) | ✅ clos | ✅ |
| 13 | Unifier `lignesPaie`/`lignesComparateur` derrière une table (`LIGNES_BULLETIN`) | 🟡 refactor | ✅ fait 02/11, filets verts |
| 14 | Factoriser le rendu de tableau (règle des trois) | 🟡 reporté | ⏳ si 3ᵉ page |
| 15 | Relâcher l'assertion « exactement 5 questions FAQ » | 🟢 cosmétique | ✅ fait 02/11 |
| 16 | Déplacer les artefacts e2e (`e2e*.png` → `tests/artifacts/`) | 🟢 cosmétique | ✅ fait 02/11 |
| 17 | **Flash non stylé (FOUC) aux navigations entre pages** | investigation 02/11 | voir §10 |

**Vérification finale (toute la passe exécutée)** :
- `npx vitest run` → 7 fichiers / **83 tests verts** (l'ancien test d'alias FP était 1 `it` de 8 assertions ; le compteur de fichiers/`it` est inchangé)
- `npx tsc` (src **+ tests**, strict) → 0 erreur
- `npm run build` → OK (dist identique, moins `icons.svg`)
- `npm run preview -- --port 4173` + les **5 scripts e2e** (`e2e`, `e2e-responsive`, `e2e-comparateur`, `verif-masthead`, `verif-seg-nav`) → tous verts, dont l'assertion golden `+442,71` qui prouve que le refactor `signeEt()` rend des chaînes identiques.

---

## 10. FOUC aux navigations (signal utilisateur 02/11) — diagnostic

**Symptôme** : en allant de `/` vers `/salaire-net-2027` (et inverse), la page s'affiche un instant en HTML nu avant de prendre le style.

**Ce que les preuves écartent** :
- **pas d'injection CSS au runtime** : les 3 bundles JS du `dist` ne contiennent aucun `createElement('style')` / `insertBefore` / `__vite__css` — le CSS est un vrai `<link rel="stylesheet">` bloquant, correctement émis par Vite dans le `<head>` des deux pages ;
- **CSS partagé entre les deux pages** (même fichier `style-[hash].css`) : au 2ᵉ affichage le fichier est déjà dans le cache disque du navigateur, il ne se retélécharge pas.

**Test navigateur réel (build servi, Playwright)** : home chargée (CSS en cache) puis navigation vers le comparateur → **0 frame peinte sans style** ; le CSS ne coûte que 2 ms et 300 o (revalidation 304). Le flash **n'existe pas dans le build local**.

**Cause la plus probable (prod)** : le CSS est servi avec `Cache-Control: public, max-age=0, must-revalidate` + ETag → à chaque navigation le navigateur doit **revalider** le CSS auprès de Cloudflare avant de peindre (round-trip ~50-150 ms — le réseau réel, pas le localhost), alors que le HTML sort du cache Edge (`CF-Cache-Status: HIT`). Le nom de fichier est déjà hashé (`style-CWOU-mmw.css`) → un `max-age` long est sûr.

**Correctif recommandé (sans toucher au code)** : Cloudflare → zone `calculateur-salaire.ma` → **Caching › Cache Rules** › créer une règle :
- If: `URI Path` starts with `/assets/`
- Then: Eligible for cache + **Edge TTL = 12 mois** + Cache **Respect existing** (le `must-revalidate` du Worker est conservé côté edge ; la réponse transformée avec `max-age=31536000, immutable` est celle servie au navigateur → effet visible dès que la réponse en cache edge est purgeable/revalidée).

**Si le flash est vu en `npm run dev` (localhost:5173)** — **cas confirmé par l'utilisateur (02/11)** : le HTML servi par le serveur de dev ne contient qu'un seul `<link rel="stylesheet">`, celui des **Google Fonts** ; le CSS applicatif (`/src/style.css`) n'arrive qu'après le parsing du module (`comparateur.ts → import './style.css'`). Le navigateur peindre donc d'abord le texte dans la police de repli, le style applicatif 100-300 ms plus tard = le flash.

**Correction réellement appliquée (mode dev uniquement, zéro changement en prod)** : plugin `dev-flash-css` dans `vite.config.ts` (`apply: 'serve'`) — à chaque request HTML, il lit l'import `./style.css` du module d'entrée de la page et injecte `<link rel="stylesheet" href="/src/style.css">` dans le `<head>` (Vite sert le CSS en dev, HMR inchangé ; `404.html` statique non concerné).

**Vérification (Playwright sur le serveur de dev redémarré)** : navigation home → comparateur avec échantillonnage frame par frame → **0 frame peinte sans style** (le style est appliqué à ~81 ms, avant la première peinture). Build revérifié : `npm run build` OK, `dist` ne contient aucune trace du plugin (réservé au serve).

**Note** : la prod était déjà saine (0 frame non stylée mesurée sur le build) ; les Cache Rules Cloudflare restent une optimisation optionnelle de perfs, plus une nécessité.
