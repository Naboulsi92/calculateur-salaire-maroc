# Calculateur Salaire Brut/Net — Maroc (IR 2026, SMIG 2026)

SPA frontend-only (Vite + TypeScript vanilla, zéro backend) : brut mensuel →
net mensuel et annuel, selon les règles marocaines (IR 6 tranches, CNSS,
AMO, CIMR, frais professionnels, foyer fiscal). Référence des règles :
[`Calcul.md`](../Calcul.md) v1.2.

## Commandes

- `npm run dev` — serveur de développement (http://localhost:5173/)
- `npm run seo` — régénère head/FAQ/footer (`index.html`), `robots.txt`,
  `sitemap.xml` depuis `scripts/site.mjs` (source unique)
- `npm run og` — régénère `public/og-calculateur-1200x630.png` (Chromium)
- `npm run build` — `seo` + `tsc` + build Vite (`dist/`)
- `npx vitest run` — tests unitaires (`tests/*.test.ts`)
- `node tests/e2e.mjs` / `node tests/e2e-responsive.mjs` — Playwright
  (nécessite `npm run preview -- --port 4173` au préalable)

## Structure

- `src/calcul.ts` — moteur pur (`calcMensuel`, `lignesPaie`, `impotTranche`)
- `src/baremes.ts` — barèmes et constantes (source unique d'affichage)
- `src/format.ts` — formatage français unique
- `src/main.ts` — adapters de rendu (aucune règle métier)
- `scripts/site.mjs` — métadonnées SEO (domaine, dates, FAQ, références)
