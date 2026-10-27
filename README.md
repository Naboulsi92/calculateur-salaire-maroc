# Calculateur du Salaire Brut/Net — Maroc

Simulateur de salaire net marocain (IR, CNSS, AMO, CIMR, frais professionnels,
famille, ancienneté) et **comparateur PLF 2027** — SPA frontend-only (Vite +
TypeScript, zéro backend, 100 % local).

## 🌐 En ligne

- **Simulateur 2026** — https://calculateur-salaire-maroc.naboulsi-riyad.workers.dev/
- **Comparateur 2027 vs 2026 (PLF 2027)** — https://calculateur-salaire-maroc.naboulsi-riyad.workers.dev/salaire-net-2027.html

Déploiement auto (Cloudflare Workers Builds) à chaque push sur `master`.

## 📁 Structure du dépôt

| Emplacement | Contenu |
|---|---|
| [`salaire-net-app/`](salaire-net-app/) | **L'application** (code, tests, build) — voir son [README](salaire-net-app/README.md) : commandes, architecture, procédure de mise à jour PLF |

Les documents de travail (recherche PLF, prototype, journal de décisions) sont
locaux, non versionnés. Les règles de calcul vivent dans le code — barèmes en
données (`src/baremes.ts`), moteur pur (`src/calcul.ts`) — verrouillées par les
golden tests.

## 🧪 Qualité

- **79 tests vitest** dont 33 golden tests des barèmes IR 2026–2031 (exact au
  centime, vecteurs vérifiés en croisant le projet de loi n° 60-26)
- **3 scénarios e2e** Playwright (home, responsive 320–1024 px, comparateur)
- Source unique SEO (`scripts/site.mjs`) → head, FAQ, JSON-LD, sitemap 2 URL,
  images OG générées par Chromium

## 📅 Statut des données

Barèmes 2026 = loi en vigueur (LF 50-25). Barèmes 2027–2031 = **projet**
(PLF 2027, n° 60-26, non voté au 27/10/2026) : badge et bandeau « projet non
voté » sur le site. Procédure de re-vérification aux jalons (vote du
Parlement ~mi-décembre 2026 · Bulletin officiel fin décembre · 01/01/2027)
documentée dans le [README de l'app](salaire-net-app/README.md).
