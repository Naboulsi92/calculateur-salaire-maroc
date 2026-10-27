# Calculateur Salaire Brut/Net — Maroc (IR 2026 · comparateur PLF 2027)

SPA frontend-only (Vite + TypeScript vanilla, zéro backend) : brut mensuel →
net mensuel et annuel selon les règles marocaines (IR, CNSS, AMO, CIMR, frais
professionnels, foyer fiscal 600/pers.). Référence des règles :
[`Calcul.md`](../Calcul.md) v1.2. Backlog V2 : [`Fonctions.md`](../Fonctions.md).

**2 pages** (build multi-pages) :

- `/` — simulateur IR 2026 (barèmes en vigueur)
- `/salaire-net-2027.html` — comparateur 2027+ vs 2026 (chips 2027–2031, badge
  « projet non voté » tant que le PLF n'est pas promulgué)

Production : https://calculateur-salaire-maroc.naboulsi-riyad.workers.dev/
(déploiement auto Cloudflare Pages à chaque push sur `master`).

## Commandes

- `npm run dev` — serveur de développement (http://localhost:5173/)
- `npm run seo` — régénère head/FAQ/footer + bandeau des **2 pages**
  (`index.html`, `salaire-net-2027.html`), `robots.txt`, `sitemap.xml` (2 URL)
  depuis `scripts/site.mjs` (source unique, dont le domaine)
- `npm run og` — régénère les 2 images OG 1200×630 (Chromium)
- `npm run build` — `seo` + `tsc` + build Vite multi-pages (`dist/`)
- `npx vitest run` — tests unitaires (`tests/*.test.ts`, 75 tests, dont les
  golden barèmes 2026–2031)
- `node tests/e2e.mjs` / `node tests/e2e-responsive.mjs` /
  `node tests/e2e-comparateur.mjs` — Playwright (nécessite
  `npm run preview -- --port 4173` au préalable)

## Structure

- `src/baremes.ts` — **registre multi-années `BAREMES` 2026–2031** (IR mensuel +
  annuel + FP par année, `statut: 'en-vigueur' | 'projet'`, défaut = dernière
  année en vigueur) + constantes partagées (CNSS, AMO, CIMR, Famille, SMIG)
- `src/calcul.ts` — moteur pur : `calcMensuel(annee)`, `assiettes` (bases),
  `impotTranche` (IR par tranche), `fraisPro` (FP générique par tranches),
  `lignesPaie` + `lignesComparateur` (modèles des bulletins), `Avertissement`
  (codes smig/cimr-fiscal/fp-plafonne)
- `src/comparateur.ts` — adaptateur de la page comparateur (pattern `main.ts`)
- `src/avertissements.ts` — formatage français partagé des avertissements
- `src/main.ts` — adapter de rendu et libellés de la page principale
- `src/format.ts` — formatage français unique (`mad/montant/pct/court/entier`)
- `scripts/site.mjs` — source unique SEO des 2 pages (métadonnées, FAQ, maillage, bandeau)
- `scripts/seo.mjs` + `scripts/og.mjs` — stamping SEO idempotent 2 pages, images OG
- `tests/baremes-2027.test.ts` — golden tests du registre (vecteurs exacts,
  frontières de tranches, plafonds FP, écart-net = −écart-IR)

## Mise à jour PLF — procédure (D20)

Le PLF 2027 (projet de loi n° 60-26) n'est **pas voté** au 27/10/2026. Jalons de
re-vérification (plan.md, T7/D18) : **vote du Parlement** (~19/11–17/12/2026) ·
**publication au Bulletin officiel** (fin décembre) · **01/01/2027** — plus
re-vérification à la demande si un amendement médiatisé touche les salaires.

À chaque jalon, tout passe par les **données** (pas de mécanisme parallèle) :

1. **`src/baremes.ts`** — vérifier/amender le millésime concerné (tranches IR,
   déductions, FP). Les déductions doivent vérifier
   `ded(n+1) = ded(n) + au(n)·(τ(n+1)−τ(n))` (controle testé). Une fois le texte
   promulgué au BO : `statut: 'projet'` → `'en-vigueur'` (le badge et le défaut
   du moteur suivent automatiquement).
2. **Golden tests** — `npx vitest run` : mettre à jour les vecteurs attendus si
   amendés (`tests/baremes-2027.test.ts`). Les millésimes 2028–2030 restent
   « dérivées » (bornes + taux confirmés, déductions calculées) jusqu'à
   confirmation au vote/BO.
3. **SEO** — mettre `DATE_MAJ` à la date du jour dans `scripts/site.mjs`
   (lastmod sitemap + dateModified JSON-LD), réécrire les FAQ concernées
   (`FAQ_COMPARATEUR` : « Le PLF 2027 est-il voté ? » bascule à la promulgation),
   puis `npm run seo`.
4. **`npm run og`** si un titre/millésime change, puis `npm run build` et
   re-vérification navigateur (`npm run preview -- --port 4173`).

## Conventions

- Toute règle de calcul atterrit d'abord dans `Calcul.md`.
- Montants : moteur pur + tests vitest avant UI. Pas de backend.
- Arrondi : `round2` par ligne (paie réelle) — le comparateur suit le moteur.
- CSS : `@layer base, composants, responsive, print, motion`.
