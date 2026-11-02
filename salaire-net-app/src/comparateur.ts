// I2 — page comparateur 2026 ↔ 2027+ : adaptateur de rendu (pattern main.ts).
// Mêmes entrées que la page principale (formulaire partagé) → deux bulletins
// côte à côte + écart (MAD, %, annuel — revue code/Spec §1). Moteur I1 :
// calcMensuel(annee) appelé deux fois ; colonne de base = dernière année
// 'en-vigueur' (D10), chips = millésimes suivants du registre (T3).
import { GROUPE_LABELS, calcMensuel, lignesComparateur, round2, type LigneComparateur } from './calcul';
import {
  ANNEE_COURANTE,
  ANNEES_BAREMES,
} from './baremes';
import { court, mad, montant, pct } from './format';
import { AVERTISSEMENT_2031, texteAvertissement } from './avertissements';
import { cableFormulaire, champsFormulaire, lireInputs, preparerFormulaire } from './formulaire';
import './style.css';

const f = champsFormulaire();
const ancAide = document.getElementById('anc-aide')!;
const chipsBox = document.getElementById('chips')!;
const stampAnnee = document.getElementById('stamp-annee')!;
const stampStatut = document.getElementById('stamp-statut')!;
const thB = document.getElementById('th-b')!;
const netALabel = document.getElementById('net-a-label')!;
const netBLabel = document.getElementById('net-b-label')!;
const netA = document.getElementById('net-a')!;
const netB = document.getElementById('net-b')!;
const netEcart = document.getElementById('net-ecart')!;
const netEcartPct = document.getElementById('net-ecart-pct')!;
const badges = document.getElementById('badges')!;
const warningsBox = document.getElementById('warnings')!;
const lignesBody = document.getElementById('lignes')!;

// C2/D5 via le formulaire partagé. Défaut brut = 10 000 (prototype T3 validé) :
// le sujet de la page est l'écart, or au SMIG les deux années sont à IR nul.
preparerFormulaire(f, 10000);

const ANNEE_BASE = ANNEE_COURANTE; // colonne de référence (2026 tant que non voté)
const ANNEE_CIBLE = ANNEES_BAREMES[ANNEES_BAREMES.length - 1]!; // « · cible »
const CHIPS = ANNEES_BAREMES.filter((a) => a > ANNEE_BASE);
let anneeCible = CHIPS[0]!; // 2027 par défaut

const signe = (n: number): string => (n > 0 ? '+' : '−');

/** Préfixe de signe normalisé + nombre formaté. La fonction qui formate un
 * écart (montant ou %) passe par ici : le double signe SNI du 02/11 venait
 * précisément de ce couple recopié à la main à quatre endroits. */
const signeEt = (n: number, fmt: (x: number) => string): string =>
  `${signe(n)}${fmt(Math.abs(n))}`;

/** Cellules d'écart (l.4 = MAD + sous-ligne « an : », l.5 = %). Gris neutre
 * sauf sur les lignes colorées (IR/Net/Net annuel, T3). % SIGNÉ par rapport à
 * |2026| (mensuel ; annuel sur la ligne annuelle). */
function cellulesEcart(l: LigneComparateur): [HTMLTableCellElement, HTMLTableCellElement] {
  const tdD = document.createElement('td');
  const tdP = document.createElement('td');
  tdD.className = 'num mono';
  tdP.className = 'num mono';
  if (l.ecart === 0) {
    tdD.classList.add('ecart-nul');
    tdP.classList.add('ecart-nul');
    tdD.textContent = '—';
    tdP.textContent = '—';
    return [tdD, tdP];
  }
  const cls = l.colore ? (l.ecart > 0 ? 'ecart-pos' : 'ecart-neg') : 'ecart-nul';
  tdD.classList.add(cls);
  tdP.classList.add(cls);
  tdD.textContent = signeEt(l.ecart, montant);
  if (l.ecartAnnuel !== null && l.ecartAnnuel !== 0) {
    const sub = document.createElement('span');
    sub.className = 'ecart-sub';
    sub.textContent = `an : ${signeEt(l.ecartAnnuel, montant)}`;
    tdD.appendChild(sub);
  }
  // % signé : écartPct porte déjà le signe par le calcul, préfixer le montant
  // signé à nouveau doublait le « - » (SNI 02/11) — on signe donc à partir de |pct|.
  tdP.textContent = l.ecartPct === null ? '—' : signeEt(l.ecartPct, pct);
  return [tdD, tdP];
}

function renderChips(): void {
  chipsBox.innerHTML = '';
  for (const annee of CHIPS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (annee === anneeCible ? ' on' : '');
    btn.setAttribute('aria-pressed', String(annee === anneeCible));
    btn.textContent = annee === ANNEE_CIBLE ? `${annee} · cible` : String(annee);
    btn.addEventListener('click', () => {
      anneeCible = annee;
      recalc();
    });
    chipsBox.appendChild(btn);
  }
}

function recalc(): void {
  renderChips();
  const inp = lireInputs(f);
  const rA = calcMensuel({ ...inp, annee: ANNEE_BASE });
  const rB = calcMensuel({ ...inp, annee: anneeCible });

  // Stamp + entêtes dynamiques
  stampAnnee.textContent = `${rB.statut === 'projet' ? 'PLF' : 'LF'} ${rB.annee}`;
  stampStatut.textContent = rB.statut === 'projet' ? 'Projet — non voté' : 'En vigueur';
  netBLabel.textContent = `Net ${rB.annee}`;
  thB.textContent = String(rB.annee);

  // Trio de nets + écart coloré (vert = gain net) + % relatif au net 2026
  netALabel.textContent = `Net ${rA.annee}`;
  netA.textContent = mad(rA.net);
  netB.textContent = mad(rB.net);
  const ecart = round2(rB.net - rA.net);
  netEcart.textContent = ecart === 0 ? montant(ecart) : signeEt(ecart, montant);
  netEcart.classList.toggle('pos', ecart > 0);
  netEcart.classList.toggle('neg', ecart < 0);
  netEcartPct.textContent = ecart === 0 || rA.net === 0 ? '' : `≈ ${pct(round2((ecart / rA.net) * 100))}`;

  // Badges : tranches IR des deux millésimes + FP plafonnés éventuels
  badges.innerHTML = '';
  for (const [r, annee] of [
    [rA, rA.annee],
    [rB, rB.annee],
  ] as const) {
    const b = document.createElement('span');
    b.className = 'badge';
    b.textContent = `IR ${annee} · ${court(r.tauxIR * 100)} %`;
    badges.appendChild(b);
    if (r.fpPlafonne) {
      const fp = document.createElement('span');
      fp.className = 'badge ghost';
      fp.textContent = `FP plafonné ${annee} · ${montant(r.fp)}`;
      badges.appendChild(fp);
    }
  }

  // Avertissements dédupliqués par code (le seuil smig est identique aux 2 années)
  warningsBox.innerHTML = '';
  const vus = new Set<string>();
  for (const r of [rA, rB]) {
    for (const a of r.avertissements) {
      if (vus.has(a.code)) continue;
      vus.add(a.code);
      const p = document.createElement('p');
      p.className = 'warn';
      p.textContent = texteAvertissement(a);
      warningsBox.appendChild(p);
    }
  }
  // Spec §2 / art. 57-1° : information 2031 (hors périmètre du moteur)
  if (rB.annee === 2031 && (inp.panier > 0 || inp.transport > 0)) {
    const p = document.createElement('p');
    p.className = 'warn';
    p.textContent = AVERTISSEMENT_2031;
    warningsBox.appendChild(p);
  }

  // C1 : le modèle de lignes vient du moteur — ici simple rendu (adapter),
  // 5 colonnes : Ligne · 2026 · 2027 · Écart MAD · Écart %.
  lignesBody.innerHTML = '';
  for (const ligne of lignesComparateur(rA, rB, {
    tauxCimr: inp.tauxCimr,
    amoOui: inp.amoOui,
    nbCharges: inp.nbCharges,
  })) {
    if (ligne.groupe) {
      const trG = document.createElement('tr');
      trG.className = 'groupe';
      const tdG = document.createElement('td');
      tdG.colSpan = 5;
      tdG.textContent = GROUPE_LABELS[ligne.groupe];
      trG.appendChild(tdG);
      lignesBody.appendChild(trG);
    }
    const tr = document.createElement('tr');
    if (ligne.id === 'net' || ligne.id === 'net-annuel') tr.className = 'net-row';
    else if (ligne.accent) tr.className = 'strong';

    const tdL = document.createElement('td');
    tdL.textContent = ligne.labelTaux ? `${ligne.label}${ligne.labelTaux}` : ligne.label;

    const tdA = document.createElement('td');
    tdA.className = 'num mono';
    tdA.textContent = montant(ligne.a);

    const tdB = document.createElement('td');
    tdB.className = 'num mono';
    tdB.textContent = montant(ligne.b);

    const [tdEcart, tdPct] = cellulesEcart(ligne);
    tr.append(tdL, tdA, tdB, tdEcart, tdPct);
    lignesBody.appendChild(tr);
  }

  ancAide.textContent = `Ancienneté : ${rA.anciennete.libelle} — prime ${mad(rA.primeAnc)}/mois.`;
}

cableFormulaire(f, recalc);
recalc();
