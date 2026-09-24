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
