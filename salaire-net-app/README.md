# Calculateur Salaire Brut/Net — Maroc (IR 2026, SMIG 2026)

SPA frontend-only (Vite + TypeScript vanilla, zéro backend) : brut mensuel →
net mensuel et annuel, selon les règles marocaines (IR 6 tranches, CNSS,
AMO, CIMR, frais professionnels, foyer fiscal 600/pers.). Référence des règles :
[`Calcul.md`](../Calcul.md) v1.2. Backlog V2 : [`Fonctions.md`](../Fonctions.md).

Production : https://calculateur-salaire-maroc.naboulsi-riyad.workers.dev/
(déploiement auto Cloudflare Pages à chaque push sur `master`).

## Commandes

- `npm run dev` — serveur de développement (http://localhost:5173/)
- `npm run seo` — régénère head/FAQ/footer (`index.html`), `robots.txt`,
  `sitemap.xml` depuis `scripts/site.mjs` (source unique, dont le domaine)
- `npm run og` — régénère `public/og-calculateur-1200x630.png` (Chromium)
- `npm run build` — `seo` + `tsc` + build Vite (`dist/`)
- `npx vitest run` — tests unitaires (`tests/*.test.ts`, 27 tests)
- `node tests/e2e.mjs` / `node tests/e2e-responsive.mjs` — Playwright
  (nécessite `npm run preview -- --port 4173` au préalable)

## Structure

- `src/calcul.ts` — moteur pur : `calcMensuel`, `assiettes` (bases),
  `impotTranche` (IR par tranche), `lignesPaie` (modèle du bulletin),
  `Avertissement` (codes smig/cimr-fiscal/fp-plafonne)
- `src/baremes.ts` — barèmes et constantes (source unique d'affichage :
  options, libellés, défauts, millésimes)
- `src/format.ts` — formatage français unique (`mad/montant/pct/court/entier`)
- `src/main.ts` — adapters de rendu et libellés (aucune règle métier)
- `scripts/site.mjs` — métadonnées SEO (domaine, dates, FAQ, références)
- `scripts/seo.mjs` + `scripts/og.mjs` — stamping SEO idempotent, image OG
- `tests/` — fixtures partagées (`bulletin-ref.mjs`, `helpers.mjs`)

## Conventions

- Toute règle de calcul atterrit d'abord dans `Calcul.md`.
- Montants : moteur pur + tests vitest avant UI. Pas de backend.
- CSS : `@layer base, composants, responsive, print, motion`.
