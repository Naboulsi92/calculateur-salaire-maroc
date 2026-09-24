# Fonctions — Backlog V2 — Calculateur Salaire Brut/Net Maroc

> Périmètre V1 (gelé) : saisie mensuelle, brut + ancienneté + panier/transport,
> AMO oui/non, CIMR 0–10 %, 0–6 charges, IR/CNSS/AMO/FP 2026, SMIG 2026.
> Règles : `Calcul.md` v1.2. Ne rien ajouter ici sans exigence métier.

## P1 — Demandées ou prévues (forte valeur, faible risque)

| Fonction | Description | Notes |
|---|---|---|
| Saisie annuelle | Toggle mensuel/annuel en entrée (résultats identiques, moteur inchangé) | Prévu dès le plan initial, non fait |
| Partage via URL | Query params (`?brut=…&cimr=…`) : lien partageable, état rechargeable | Prévu dès le plan initial, non fait |
| Prime 13e mois | Champ gratification annuelle, proratisée ou versée au mois choisi | Ligne « Prime 13ème mois » vue sur bulletin réel (0,00) |
| Emprunts déductibles | Intérêts d'emprunt déductibles du SNI (champ montant) | Formule SNI du doc source les cite |
| Export / impression PDF | Bouton d'impression du bulletin (CSS print déjà en place) | Vérifier rendu 1 page |
| Plafond fiscal CIMR | Passage warning → contrôle : part > 6 % non déductible, calculée à part | Actuellement simple avertissement |

## P2 — Élargissement paie (moyen)

| Fonction | Description | Notes |
|---|---|---|
| CIMR Al Mounassib | Cotisation sur tranche > plafond CNSS uniquement | Hors scope V1 assumé |
| Comparateur de scénarios | 2–3 simulations côte à côte (ex. avec/sans CIMR, taux variés) | S'appuie sur `calcMensuel` pur |
| Historique local | Dernières simulations en localStorage, sans compte | 100 % local conservé |
| Taux paramétrables | CNSS/AMO/FP modifiables (écran « hypothèses ») pour tester une réforme | Isoler des barèmes officiels par défaut |

## P3 — Idées (à cadrer, risque ou coût élevé)

| Fonction | Description | Notes |
|---|---|---|
| Version arabe (RTL) | UI bilingue FR/AR + `hreflang` (vrai gain SEO alors seulement) | Coût traduction + QA RTL |
| SMAG / agricole | Secteur agricole, bases journalières | Autre barème, autre usage |
| Pensions et autres revenus | Taux FP spécifiques (25–45 %), abattements pensions | Complexité barèmes |
| Vérification bulletin | Saisie d'un bulletin réel → écart ligne à ligne vs moteur | Bascule debug/support |
| PWA offline | Installation mobile, fonctionnement sans réseau | Build + manifest + icônes |
| Mode sombre | Thème alternatif | Design à trancher |

## Règles d'ajout en V2

1. Toute règle de calcul atterrit d'abord dans `Calcul.md` (base de vérité).
2. Montants : moteur pur + tests vitest avant UI.
3. Pas de backend : tout reste calculable en local.
