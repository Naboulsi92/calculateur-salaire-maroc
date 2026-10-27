# Extraction PLF 2027 — éléments touchant le salaire net (vs 2026)

> Artefact de recherche (ticket T1 — « Fiabilisation des barèmes PLF 2027 »). Généré le 27/10/2026
> par extraction LLM des deux documents sources, lecture seule. Fiabilité : voir l'artefact
> de [vérification croisée](verification-croisee-baremes-2027-2031.md) qui confirme ces chiffres
> (1 correction : déduction mensuelle 10 % 2027 = 500 DH).

**Sources analysées** :
- **F1** = `PLF2027/01-_Projet_loi_de_Finances_2027_Ar.md` (texte du projet de loi, 2 743 lignes)
- **F2** = `PLF2027/02-_Note_de_présentation_Ar_0.md` (note de présentation, ~2 830 lignes)

⚠️ Les fichiers sont une conversion OCR/PDF avec texte arabe RTL fortement imbriqué. Les tableaux IR ont été reconstruits à partir de lignes brutes ; les chiffres sont recopiés tels quels.

---

## Section 1 — Changements IR (Impôt sur le Revenu)

### 1.1 Barème IR 2027 (année 1 de la réforme) — F1, ligne 319
Disposition transitoire nouvelle (item « XXXXVII » ajouté à l'article 241 mukarra/247, rubrique « restitution au titre de l'IR »). Texte introductif :
> « À titre transitoire, le tableau de calcul de l'impôt sur le revenu, prévu à l'article 73-I ci-dessus, est fixé pour la période allant du 1er janvier 2027 au 31 décembre 2030 comme suit : 1°- pour la période allant du 1er janvier 2027 au 31 décembre 2027 : … »

**Barème ANNUEL 2027** (recopié chiffre par chiffre, F1 ligne 319) :
| Tranche annuelle (DH) | Taux |
|---|---|
| 0 → 60 000 | 0 % (exonéré) |
| 60 001 → 80 000 | 10 % |
| 80 001 → 100 000 | 20 % |
| 100 001 → 180 000 | 34 % |
| > 180 000 | 37 % |

Citations exactes : « شريحة الدخل إلى غاية 60000 درهم معفاة من الضريبة » · « %10 بالنسبة لشريحة الدخل من 60001 إلى 80000 درهم » · « %20 … من 80001 إلى 100000 درهم » · « %34 … من 100001 إلى 180000 درهم » · « %37 بالنسبة لما زاد على ذلك ».

**Comparaison avec le barème 2026 en vigueur** (= barème de l'application) : l'exonération passe de **40 000 → 60 000 DH** ; les tranches 10 % (40 001–60 000) et 20 % (60 001–80 000) sont **décalées vers le haut** de 20 000 DH ; la tranche 30 % (80 001–100 000 en 2026) **disparaît** ; les tranches 34 % (100 001–180 000) et 37 % (>180 000) sont **inchangées**.

### 1.2 Barèmes IR transitoires 2028, 2029, 2030 — F1, lignes 319 (2°, 3°, 4°) + ligne 326

- **2028** : 0–60 000 : 0 % · 60 001–100 000 : 10 % · 100 001–200 000 : 25 % · > 200 000 : 37 %
- **2029** : 0–60 000 : 0 % · 60 001–130 000 : 10 % · 130 001–200 000 : 20 % · > 200 000 : 35 %
- **2030** : 0–60 000 : 0 % · 60 001–150 000 : 10 % · 150 001–200 000 : 20 % · > 200 000 : 30 %

La partie 2030 figure dans le bloc OCR « picture text » (F1 lignes 325–326) ; le début du tableau 2030 est en fin de ligne 319. (La ligne 326 entrelace ces lignes avec l'article 282 du CGI ; les bornes distinguent nettement ce tableau 2030 du tableau définitif 2031.)

### 1.3 Barème IR définitif (article 73-I du CGI, applicable à partir du 1er janvier 2031) — F1 lignes 214 + 216 ; F2 lignes 2469–2480

**Barème ANNUEL définitif (2031)** :
| Tranche annuelle (DH) | Taux |
|---|---|
| 0 → 60 000 | 0 % (exonéré) |
| 60 001 → 150 000 | 10 % |
| 150 001 → 500 000 | 20 % |
| > 500 000 | 30 % |

### 1.4 Tableau comparatif officiel 2026 vs cible — F2 lignes 2473–2480
> « | **الأسعار المقترحة** | **شرائح الدخل المقترحة (بالدرهم)** | **الأسعار الحالية** | **شرائح الدخل الحالية (بالدرهم)** |
> | 0 % | من 0 إلى 60 000 | 0 % | من 0 إلى 40 000 |
> | 10 % | من 60 001 إلى 150 000 | 10 % | من 40 001 إلى 60 000 |
> | 20 % | من 150 001 إلى 500 000 | 20 % | من 60 001 إلى 80 000 |
> | | | 30 % | من 80 001 إلى 100 000 |
> | 30 % | ما زاد على 500 000 | 34 % | من 100 001 إلى 180 000 |
> | | | 37 % | ما زاد على 180 000 | »

⚠️ Ce tableau de la note donne la **cible finale (2031)**, pas le barème 2027. Les « شرائح الدخل الحالية » concordent exactement avec le barème annuel 2026 du code existant.

### 1.5 Formulation gouvernementale de la réforme IR — F2 lignes 579 et 2469–2471
- L. 579 : « relèvement de la première tranche (revenu net imposable exonéré) de 40 000 à 60 000 dirhams, réduction du nombre de tranches imposables de cinq à trois, taux progressifs de 10 %, 20 % et 30 % … et baisse du taux marginal de la dernière tranche de 37 % à 30 %. Ce reforme sera déployé progressivement sur cinq ans (2027–2031) ».
- L. 2488 : élargissement de la classe des exonérés, allègement de la pression fiscale sur la classe moyenne, baisse du taux marginal des hauts revenus, en restant sur le principe de progressivité ; déploiement sur cinq ans (2027 à 2031).

### 1.6 Frais professionnels (déduction forfaitaire) : 35 %/25 % → 45 % pour tous, plafond 35 000 DH/an — F1 lignes 214 + 682 ; F2 ligne 2490
- **État actuel cité** (F2, L. 2490) : 35 % si revenu ≤ 78 000 DH ; 25 % au-delà, plafond 35 000 DH ; certaines catégories professionnelles bénéficient de taux forfaitaires préférentiels allant jusqu'à 45 %.
- **Nouveau** (F1, L. 214, article 59-I) : « 45 % pour les personnes ne relevant pas de la catégorie professionnelle visée au C ci-après, sans que la déduction puisse excéder trente-cinq mille (35 000) dirhams ». (F2, L. 2490) : « relèvement proposé du taux forfaitaire à 45 % pour l'ensemble des salariés, avec un plafond de déduction fixé à 35 000 dirhams ».
- **Effet sur l'appli** : le FP passe de 35 % (SBI ≤ 78 000) / 25 % (SBI > 78 000) à **45 % uniforme** (plafond 35 000 DH/an = 2 916,67/mois), dès **2027**.

### 1.7 Rationalisation de l'exonération des indemnités professionnelles (article 57-1°) — F1 lignes 214 + 708 ; F2 ligne 2490
- Nouveau texte (F1, L. 214, art. 57) : l'exonération vise les « indemnités spéciales » remboursant des frais réels et justifiés supportés exclusivement dans l'intérêt de l'employeur, **à l'exclusion** des indemnités versées de manière habituelle pour l'exercice normal de la fonction ou du travail, qui constituent des compléments de salaire.
- **Entrée en vigueur : 1er janvier 2031** (F1, L. 708 : l'ancien régime reste applicable aux revenus acquis jusqu'au 31 décembre 2030). À partir de 2031, la combinaison déduction 45 % + indemnités exonérées n'est plus admise.

### 1.8 Clarification de l'assiette « revenus salariaux » (article 56) — F1 ligne 214 ; F2 ligne 2490
Toute prime/indemnité « quelle que soit sa nature ou sa qualification » entre dans la base salariale IR.

### 1.9 Exonérations IR « Coupe du Monde FIFA 2030 » — F1 lignes 336–341 ; F2 lignes 2600–2608
Exonération temporaire des primes/indemnités liées à la compétition (personnes rattachées, volontaires, joueurs non résidents), fenêtre 60 jours avant le 1er match / 60 jours après la finale — **sans impact** pour les salariés résidents fiscaux marocains. Applicable dès le **1er janvier 2027**.

### 1.10 Autres mesures IR (non-salariales)
- Nouvelle « procédure d'imposition automatique » en cas de non-dépôt des déclarations de retenues sur salaires/pensions (F2, L. 2584).
- Acompte (Tresdim) de 5 % de la valeur en douane à l'importation pour les commerçants-importateurs, imputé sur le minimum d'IR/acomptes IS — à partir du **1er juillet 2027** ; ne touche pas les salariés.

---

## Section 2 — Autres changements touchant la paie

| Élément | Statut dans les documents | Localisation |
|---|---|---|
| **CNSS 4,48 % / plafond 6 000** | **Aucune mention** d'un changement de taux ou de plafond. | Absent de la liste des articles CGI modifiés (F1, L. 210) |
| **AMO 2,26 %** | **Aucun changement de taux**. Seul changement : transfert de la gestion de l'AMO secteur public vers la CNSS au 1er février 2027. | F2, L. 207, 613, 621, 627 |
| **CIMR / SNI** | Aucune mention. | — |
| **Déduction famille (600 DH/an/pers., plafond 3 600)** | **Aucune mention** ; l'article 58 du CGI (personnes à charge) ne figure pas dans la liste des articles modifiés → présumé inchangé. | F1, L. 210 |
| **Prime d'ancienneté** | Aucune mention. | — |
| **Panier / transport / logement** | Aucune mesure de taux/montant ; simple critère qualitatif du futur « travail décent ». | F2, L. 1063 |
| **SMIG/SMAG 2027** | **Pas de relèvement annoncé pour 2027**. Bilan 2021–2026 : +21 % (SMIG), +27 % (SMAG) ; SMIG non agricole 17,92 DH/h, SMAG 97,44 DH/jour. | F2, L. 199 et 1053 |
| **Salaires secteur public** | Enveloppe dialogue social ≈ 50 milliards DH pour 1,25 M d'agents à l'horizon 2027 — aucun taux individuel. | F2, L. 199, 579 |
| **Postes budgétaires 2027** | Création de 34 454 postes. | F2, L. 2612 |
| **Pensions (contexte)** : minimum pension 1 700 DH/mois en 2027 (étape 1) → 3 000 DH/mois à terme ; pension de veuve 50 % → 100 %. | F2, L. 207, 579 |
| **Allocation de soutien direct** : 500 → 600 DH/mois en 2027 (objectif 1 000 DH) — hors chaîne salariale. | F2, L. 163, 201, 607 |

---

## Section 3 — Exemples chiffrés / simulations

- **Aucun exemple individuel de simulation** (type « un salarié à X dirhams paiera Y dirhams de moins ») dans les deux documents. Phrase la plus proche, qualitative : « élargissement significatif de la classe des exonérés, allègement pour la classe moyenne » (F2, L. 2488).
- **Seul tableau comparatif chiffré IR** : le tableau barème 2026 vs cible (§ 1.4).
- **Chiffres macro-recettes IR** (F2, L. 453) : recette IR 71 490 267 000 DH en 2027 contre 64 665 046 000 DH en 2026 (+10,55 %). (IS : 126 008 429 000 vs 95 614 035 000, +31,79 %.)

---

## Section 4 — Dates d'entrée en vigueur

| Disposition | Date | Source |
|---|---|---|
| Barème IR **2027** (transitoire 1°) | **1er janvier 2027 → 31 décembre 2027** | F1, L. 319 |
| Barèmes IR transitoires 2°/3°/4° | 1er janvier → 31 décembre de **2028**, **2029**, **2030** | F1, L. 319 + 326 |
| Barème IR **définitif** (art. 73-I modifié) | **1er janvier 2031** | F1, L. 684 |
| Déduction frais professionnels **45 %**, plafond 35 000 | **1er janvier 2027** (« revenus acquis à partir du 1er janvier 2027 ») | F1, L. 682 |
| Restriction de l'exonération des indemnités (art. 57-1°) | **1er janvier 2031** ; ancien régime maintenu jusqu'au **31 décembre 2030** | F1, L. 708 |
| Régime fiscal FIFA 2030 | **1er janvier 2027** | F2, L. 2602 |
| Tresdim 5 % importations | **1er juillet 2027** | F1, L. 686–688 |
| Transfert gestion AMO secteur public → CNSS | **1er février 2027** | F2, L. 207, 613, 627 |
| Règle générale : articles CGI modifiés en vigueur « à partir du 1er janvier 2027 », sauf dérogations ci-dessus | 1er janvier 2027 | F1, L. 210 |

---

## Section 5 — Ce que les documents ne contiennent PAS (trous d'information)

1. **Aucun barème MENSUEL** (bornes/déductions) — ni dans la loi, ni dans la note ; les montants mensuels 2027–2031 doivent être dérivés (annuel ÷ 12).
2. **Aucune colonne « déduction »** pour les tableaux 2027–2030 (l'OCR ne restitue que bornes + taux) → déductions recalculées.
3. **Aucun changement affiché** pour CNSS, AMO, famille (600/3 600), ancienneté, panier/transport, CIMR : silence total → traité comme « inchangé ».
4. **Aucune simulation salaire individuel** 2026 vs 2027.
5. **Aucune mention de SMIG 2027**.
6. **Nuance clé** : le tableau « prix proposés » de la note (60 k/150 k/500 k ; 10/20/30 %) est la cible **2031**, pas 2027 ; le barème applicable en 2027 conserve 34 % et 37 %.
7. **Risque OCR** : lignes 319 et 326 de F1 entrelacent plusieurs articles ; relecture croisée recommandée avant codage (→ faite, voir l'artefact de vérification croisée).
8. La note indique que la réforme IR sera conduite « après évaluation de son coût et de ses effets » et « en parallèle de l'élargissement de l'assiette et de la lutte contre l'évasion fiscale » (F2, L. 579).
