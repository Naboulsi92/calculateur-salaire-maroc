# Calcul — Base de vérité absolue — Salaire Net Maroc IR 2026

> Version 1.2 (2026) — LF2026 (loi n°50-25) : barème IR inchangé (cf. NC DGI n°737),
> foyer fiscal 600 MAD/an/pers. plaf. 3600. SMIG 2026 : 17,92/3422,72 (déc. 2.25.983).
> v1.1 : panier/transport versés, exclus des bases. Net = Total gains − C − IR.
> Toute divergence d'un bulletin réel doit être remontée ici avant modification du code.
> Monnaie: MAD. Arrondi: 2 décimales, `round2 + clamp ≥ 0`. Format: `fr-MA`.

## 1. Glossaire et ordre de calcul

1. `brut_base`: salaire brut saisi = base taxable (ligne «salaire brut» du bulletin).
2. `prime_anc`: prime d'ancienneté, imposable + soumise CNSS/IR/CIMR.
3. `brut_majoré = brut_base + prime_anc`
4. `SBI` (base imposable) = `brut_majoré`. Panier/transport ne sont JAMAIS soustraits.
5. `total_gains = brut_majoré + panier + transport` (ligne «Total Gain» du bulletin).
6. `C = CNSS + AMO + CIMR` (cotisations salariales déductibles + prélevées).
7. `FP` (frais professionnels): abattement fiscal uniquement, jamais prélevé.
8. `SNI` = `SBI - (FP + C)` → assiette de l'IR.
9. `IR_brut` = barème(SNI), `IR_net = max(IR_brut - famille, 0)` → prélevé.
10. `Net = total_gains - C - IR_net` → viré au salarié.

Relation fondamentale:
```
SBI - C = SNI + FP = Net + IR_net - panier - transport
Net = SNI + FP - IR_net + panier + transport
```
Ne jamais faire `Net = SBI - C - IR` (oublie les indemnités versées).

## 2. Ancienneté (today suffit en V1)

- Référence: `today` (pas de mois de paie paramétrable en V1).
- `années = plancher((today - date_embauche) / 365.25)`, afficher `X ans Y mois`.
- Taux code du travail: `<2a 0%, 2–5a 5%, 5–12a 10%, 12–20a 15%, 20–25a 20%, ≥25a 25%`.
- `prime_anc = brut_base * taux`. Base = brut de base (in surnon-imposable exclu).
- Prime incluse dans SBI, donc soumise FP/CNSS/AMO/CIMR/IR.

## 3. SBI et primes non-imposables V1

- Le brut saisi est la base taxable (comme la ligne «salaire brut» du bulletin).
- `SBI_mensuel = brut_majoré`. Panier (défaut 0) + transport (défaut 500 MAD/mois)
  sont des indemnités non imposables : exclues de TOUTES les bases
  (FP/CNSS/AMO/CIMR/SNI), ajoutées au net via le total des gains.
- `total_gains_mensuel = brut_majoré + panier + transport` (= «Total Gain»).
- Si saisie annuelle: diviser par 12 pour le moteur mensuel.

## 4. Frais professionnels (FP) — CGI Art.59, inchangé LF2025

Taux unique selon SBI annuel, non cumulé par tranches:

| SBI annuel | Taux | Plafond annuel | Équiv. mensuel |
|---|---|---|---|
| 0 → 78 000 | 35% | 30 000 | seuil 6 500/mois, plaf 2 500/mois |
| 78 000.01 → + | 25% | 35 000 | plaf 2 916.67/mois |

```
SBI_an = SBI_mensuel * 12
FP_mensuel = SBI_an <= 78000 ? min(SBI_mensuel*0.35, 2500) : min(SBI_mensuel*0.25, 2916.67)
FP_annuel = FP_mensuel * 12
```
FP calculé sur SBI incluant prime d'ancienneté. Ne pas confondre avec taux spécifiques (casinos, marins, journalistes, pensions — hors scope salaires taux normal).

## 5. Cotisations sociales salariales

### 5.1 CNSS (01/01/2025)
- Prestations sociales: `min(SBI, 6000) * 4.48%` → max 268.80/mois (3 225.60/an).
- Allocations familiales 6.40% + taxe formation 1.6% = part patronale uniquement, ignorées côté salarié.

### 5.2 AMO
- Toggle oui/non (défaut oui). `oui ? SBI * 2.26% : 0`, sans plafond.
- Participation AMO: — (ignorée).

### 5.3 CIMR (retraite complémentaire facultative)
- Base = **brut majoré** (brut de base + prime d'ancienneté, AVANT toute indemnité —
  qui de toute façon s'ajoutent après, cf. §3) — confirmé par bulletin réel :
  brut majoré 22 404,61 × 6 % = 1 344,28.
- `CIMR = brut_majoré * taux_choisi`.
- Liste V1: `0 (= non-adhérent) + 3 / 3.75 / 4.5 / 5.25 / 6 / 7 / 7.5 / 8 / 8.5 / 9 / 9.5 / 10 %`.
- Déductible SNI + prélevée du net.
- Avertissement UI si taux > 6% (limite fiscale déductible citée, à confirmer CGI — avertir sans bloquer).
- Al Mounassib (tranche > 6000 uniquement): hors scope V1.

## 6. SNI

```
SNI_mensuel = SBI - FP_mensuel - CNSS - AMO - CIMR
SNI_annuel = SNI_mensuel * 12
```
Clamper à 0 si négatif (cas SBI très faible + arrondis).

## 7. IR — barèmes 2025 (6 tranches, IR = SNI * taux - déduction)

### 7.1 Mensuel
| SNI du | SNI au | Taux | Déduction |
|---|---|---|---|
| 0.00 | 3 333.33 | 0% | 0.00 |
| 3 333.34 | 5 000.00 | 10% | 333.33 |
| 5 000.01 | 6 666.67 | 20% | 833.33 |
| 6 666.68 | 8 333.33 | 30% | 1 500.00 |
| 8 333.34 | 15 000.00 | 34% | 1 833.33 |
| 15 000.01 | + | 37% | 2 283.33 |

### 7.2 Annuel
| SNI du | SNI au | Taux | Déduction |
|---|---|---|---|
| 0.00 | 40 000.00 | 0% | 0.00 |
| 40 001.00 | 60 000.00 | 10% | 4 000.00 |
| 60 001.00 | 80 000.00 | 20% | 10 000.00 |
| 80 001.00 | 100 000.00 | 30% | 18 000.00 |
| 100 001.00 | 180 000.00 | 34% | 22 000.00 |
| 180 001.00 | + | 37% | 27 400.00 |

`IR_brut_mensuel` via table mensuelle sur SNI_mensuel. Contrôle: `IR_brut_annuel` via table annuelle sur SNI_annuel ≈ `IR_brut_mensuel*12` (écarts d'arrondi tolérés ±1 MAD).

## 8. Charges de famille — LF2026 art.7-IV-10 (loi 50-25, NC DGI n°737)

- **Valeur 2026: 600 MAD/an/pers., plaf. 3 600 (6 pers. max)** → `50/mois/pers., plaf 300/mois`.
- Valeurs 2025 (500/3000) et pré-2025 (360/2160) obsolètes, ne pas utiliser.
- `IR_net = max(IR_brut - min(nb_charges*50, 300), 0)` en mensuel.

## 9. Salaire net

```
Net_mensuel = total_gains - CNSS - AMO - CIMR - IR_net_mensuel
Net_annuel = Net_mensuel * 12
```
FP non soustrait (déjà exclu via SNI). Famille non re-soustraite (déjà dans IR_net).
Panier/transport inclus via total_gains (ils sont versés).

## 10. SMIG 01/2026 (décret n° 2.25.983, BO 7469)

- Horaire 17,92 MAD, mensuel 3 422,72 MAD (= 17,92 × 191 h, 2e tranche +5 % accord 29/04/2024).
- Warning UI si `brut_base < 3422.72`, ne pas bloquer.
- (Rappel 2025 : 17,10 / 3 266,10. IR et famille restent base LF2025.)

## 11. Exemple chiffré — bulletin réel (mensuel)

Entrées: brut 21 337,72, embauche 04/07/2022 → 4 ans → 5 %, panier 500,
transport 500, AMO non, CIMR 6 %, 1 charge.
```
prime_anc = 21337.72*5% = 1066.89
brut_majoré = SBI = 22404.61
total_gains = 22404.61+500+500 = 23404.61
SBI_an = 268855.32 >78000 → FP = min(22404.61*25%, 2916.67) = 2916.67
CNSS = min(22404.61,6000)*4.48% = 268.80
AMO = 0 (non) — le bulletin ne comporte aucune ligne AMO
CIMR = 22404.61*6% = 1344.28
SNI = 22404.61-2916.67-268.80-0-1344.28 = 17874.86
IR_brut = 17874.86*37%-2283.33 = 4330.37
famille = min(1*50,300)=50 → IR_net = 4280.37
Net = 23404.61-268.80-0-1344.28-4280.37 = 17511.16/mois
```
Comparaison bulletin (barème foyer 2025 : 41.67) : FP 2918.67 (vs 2916.67 standard = 35000/12),
SNI 17872.86, IR 4287.96, Net 17503.57 — soit −7.59 vs moteur 2026 :
FP +2.00 (→ −0.74 d'IR) + foyer bulletin 41.67 vs 50 en 2026 (→ +8.33 d'IR).
✅ Tranché : le standard 35000/12 = 2916.67 est correct, le 2918.67 du bulletin
était une coquille. L'app applique 2916.67.

## 12. Cas limites et règles d'implémentation

- Tous inputs ≥ 0, dates ≤ today, nb_charges entier 0–6.
- Ordre strict: anc. → SBI → FP/CNSS/AMO/CIMR → SNI → IR → Net.
- `round2` après chaque ligne pour affichage, calcul enchaîné sur valeurs arrondies à 2 décimales (paie réelle).
- Si SNI ≤ 3333.33/mois → IR_brut = 0 → IR_net = 0.
- Annualisation toujours `mensuel*12`, pas de recalcul indépendant sauf contrôle IR annuel.
- Transport défaut 500 appliqué en mensuel; en mode annuel affiché `6000/an`.

## 13. Sources primaires

CGI 2025 FR (tax.gov.ma), LF 60-24 BO 7362 (finances.gov.ma), cimr.ma FAQ + simulateur, cnss.ma, OJRAWEB FP 2025, calculator.ma, H24/Le360/Grant Thornton LF2025 (famille).
