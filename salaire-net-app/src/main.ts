import { calcMensuel, lignesPaie, type Avertissement, type Inputs } from './calcul';
import { AMO, ANNEE_BAREME_IR, ANNEE_LF, DEFAUT_PANIER, DEFAUT_TRANSPORT, FAMILLE, IR_MENSUEL, SMIG_ANNEE, SMIG_MENSUEL, TAUX_CIMR_LIST } from './baremes';
import { court, entier, mad, montant, pct } from './format';
import './style.css';

function $(id: string): HTMLInputElement | HTMLSelectElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} introuvable`);
  return el as HTMLInputElement;
}

const brut = $('brut') as HTMLInputElement;
const embauche = $('embauche') as HTMLInputElement;
const panier = $('panier') as HTMLInputElement;
const transport = $('transport') as HTMLInputElement;
const cimr = $('cimr') as HTMLSelectElement;
const charges = $('charges') as HTMLSelectElement;
const ancAide = document.getElementById('anc-aide')!;
const netMois = document.getElementById('net-mois')!;
const netAn = document.getElementById('net-an')!;
const badgeTranche = document.getElementById('badge-tranche')!;
const badgeSni = document.getElementById('badge-sni')!;
const warningsBox = document.getElementById('warnings')!;
const lignes = document.getElementById('lignes')!;

// max date d'embauche = aujourd'hui (évite la valeur codée en dur du HTML)
embauche.max = new Date().toISOString().slice(0, 10);

// C2/D5 : libellés, options et défauts générés depuis baremes.ts.
// Le HTML ne contient que des coquilles vides remplies ici.
brut.value = String(SMIG_MENSUEL); // politique : défaut = SMIG
panier.value = String(DEFAUT_PANIER);
transport.value = String(DEFAUT_TRANSPORT);
const lfAnnee = document.getElementById('lf-annee')!;
lfAnnee.textContent = `LF ${ANNEE_LF}`;
const stampIr = document.getElementById('stamp-ir')!;
stampIr.textContent = `IR ${ANNEE_BAREME_IR}`;
const stampTranches = document.getElementById('stamp-tranches')!;
stampTranches.textContent = `${IR_MENSUEL.length} tranches`;
const smigAide = document.getElementById('smig-aide')!;
smigAide.textContent = `SMIG ${SMIG_ANNEE} : ${mad(SMIG_MENSUEL)}/mois`;
const familleAide = document.getElementById('famille-aide')!;
familleAide.textContent = `${entier(FAMILLE.parPersonneAn)} MAD/an/pers., plaf. ${entier(FAMILLE.plafondAn)}.`;
const amoLegende = document.getElementById('amo-legende')!;
amoLegende.textContent = `Cotisation AMO (${court(AMO.taux * 100)} %)`;
for (const t of TAUX_CIMR_LIST) {
  const opt = document.createElement('option');
  opt.value = String(t);
  opt.textContent = t === 0 ? '0 % — non-adhérent' : `${court(t)} %`;
  cimr.appendChild(opt);
}
cimr.value = '0';
for (let n = 0; n <= FAMILLE.maxPersonnes; n++) {
  const opt = document.createElement('option');
  opt.value = String(n);
  opt.textContent = n === 0 ? '0' : `${n} pers.`;
  charges.appendChild(opt);
}
charges.value = '0';

function readAmo(): boolean {
  const checked = document.querySelector<HTMLInputElement>('input[name="amo"]:checked');
  return checked ? checked.value === 'oui' : true;
}

function num(el: { value: string }, fallback = 0): number {
  const v = Number(el.value);
  return Number.isFinite(v) ? v : fallback;
}

/** C5 : formatage des avertissements codés (le libellé reste libre). */
function texteAvertissement(a: Avertissement): string {
  switch (a.code) {
    case 'smig':
      return `Brut inférieur au SMIG ${SMIG_ANNEE} (${mad(a.seuil)}/mois).`;
    case 'cimr-fiscal':
      return `Taux CIMR ${a.taux} % > 6 % : part excédentaire possiblement non déductible fiscalement (à vérifier).`;
    case 'fp-plafonne':
      return 'Frais professionnels plafonnés.';
  }
}

function recalc(): void {
  const inp: Inputs = {
    brutBase: Math.max(0, num(brut)),
    dateEmbauche: embauche.value,
    panier: Math.max(0, num(panier)),
    transport: Math.max(0, num(transport)),
    amoOui: readAmo(),
    tauxCimr: Number(cimr.value) || 0,
    nbCharges: Math.min(6, Math.max(0, Math.floor(num(charges)))),
  };
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

for (const el of [brut, embauche, panier, transport, cimr, charges]) {
  el.addEventListener('input', recalc);
  el.addEventListener('change', recalc);
}
document.querySelectorAll('input[name="amo"]').forEach((el) => {
  el.addEventListener('change', recalc);
});

recalc();
