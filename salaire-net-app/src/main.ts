// Page principale — adaptateur de rendu (aucune règle métier, C1).
// Le formulaire (options, défauts, listeners) est partagé avec le comparateur
// via src/formulaire.ts (revue code : anti-duplication).
import { calcMensuel, lignesPaie } from './calcul';
import { texteAvertissement } from './avertissements';
import { ANNEE_BAREME_IR, ANNEE_LF, IR_MENSUEL, SMIG_MENSUEL } from './baremes';
import { mad, montant, pct } from './format';
import { cableFormulaire, champsFormulaire, lireInputs, preparerFormulaire } from './formulaire';
import './style.css';

const f = champsFormulaire();
const ancAide = document.getElementById('anc-aide')!;
const netMois = document.getElementById('net-mois')!;
const netAn = document.getElementById('net-an')!;
const badgeTranche = document.getElementById('badge-tranche')!;
const badgeSni = document.getElementById('badge-sni')!;
const warningsBox = document.getElementById('warnings')!;
const lignes = document.getElementById('lignes')!;

// C2/D5 : libellés, options et défauts générés depuis baremes.ts.
// Politique : défaut brut = SMIG.
preparerFormulaire(f, SMIG_MENSUEL);
const lfAnnee = document.getElementById('lf-annee')!;
lfAnnee.textContent = `LF ${ANNEE_LF}`;
const stampIr = document.getElementById('stamp-ir')!;
stampIr.textContent = `IR ${ANNEE_BAREME_IR}`;
const stampTranches = document.getElementById('stamp-tranches')!;
stampTranches.textContent = `${IR_MENSUEL.length} tranches`;

function recalc(): void {
  const inp = lireInputs(f);
  const r = calcMensuel(inp);

  ancAide.textContent = `Ancienneté : ${r.anciennete.libelle} — prime ${mad(r.primeAnc)}/mois.`;

  netMois.textContent = mad(r.net);
  netAn.textContent = mad(r.annual.net);
  badgeTranche.textContent = `IR ${r.trancheLabel}`;
  badgeSni.textContent = `SNI ${mad(r.sni)}/mois`;

  warningsBox.innerHTML = '';
  for (const a of r.avertissements) {
    const p = document.createElement('p');
    p.className = 'warn';
    p.textContent = texteAvertissement(a);
    warningsBox.appendChild(p);
  }

  // C1 : le modèle de lignes vient de l'interface — ici simple rendu (adapter).
  const rows = lignesPaie(r, { tauxCimr: inp.tauxCimr, amoOui: inp.amoOui, nbCharges: inp.nbCharges });
  lignes.innerHTML = '';
  for (const ligne of rows) {
    const tr = document.createElement('tr');
    if (ligne.accent) tr.className = 'strong';
    const tdL = document.createElement('td');
    tdL.textContent = ligne.label;
    const tdP = document.createElement('td');
    tdP.className = 'num mono';
    tdP.textContent = ligne.tauxPct === undefined ? '—' : pct(ligne.tauxPct);
    const tdM = document.createElement('td');
    tdM.className = 'num mono';
    tdM.textContent = montant(ligne.mensuel);
    const tdA = document.createElement('td');
    tdA.className = 'num mono';
    tdA.textContent = ligne.annuel === null ? '—' : montant(ligne.annuel);
    tr.append(tdL, tdP, tdM, tdA);
    lignes.appendChild(tr);
  }
}

cableFormulaire(f, recalc);
recalc();
