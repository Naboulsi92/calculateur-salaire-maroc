// Formulaire partagé par les 2 pages (revue code : anti-duplication main.ts ↔
// comparateur.ts). Conventions C2/D5 conservées : libellés, options et défauts
// générés depuis baremes.ts — le HTML ne contient que des coquilles vides.
import type { Inputs } from './calcul';
import {
  AMO,
  DEFAUT_PANIER,
  DEFAUT_TRANSPORT,
  FAMILLE,
  SMIG_ANNEE,
  SMIG_MENSUEL,
  TAUX_CIMR_LIST,
} from './baremes';
import { court, entier, mad } from './format';

function $id(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} introuvable`);
  return el;
}

const nombre = (el: { value: string }, defaut = 0): number => {
  const v = Number(el.value);
  return Number.isFinite(v) ? v : defaut;
};

const lireAmo = (): boolean => {
  const checked = document.querySelector<HTMLInputElement>('input[name="amo"]:checked');
  return checked ? checked.value === 'oui' : true;
};

export interface ChampsFormulaire {
  brut: HTMLInputElement;
  embauche: HTMLInputElement;
  panier: HTMLInputElement;
  transport: HTMLInputElement;
  cimr: HTMLSelectElement;
  charges: HTMLSelectElement;
}

export function champsFormulaire(): ChampsFormulaire {
  return {
    brut: $id('brut') as HTMLInputElement,
    embauche: $id('embauche') as HTMLInputElement,
    panier: $id('panier') as HTMLInputElement,
    transport: $id('transport') as HTMLInputElement,
    cimr: $id('cimr') as HTMLSelectElement,
    charges: $id('charges') as HTMLSelectElement,
  };
}

/** Options, aides, légende AMO et défauts. Brut par défaut paramétrable
 * (politique page principale : SMIG · comparateur : 10 000, prototype T3). */
export function preparerFormulaire(f: ChampsFormulaire, brutDefaut: number): void {
  // max date d'embauche = aujourd'hui (évite la valeur codée en dur du HTML)
  f.embauche.max = new Date().toISOString().slice(0, 10);
  f.brut.value = String(brutDefaut);
  f.panier.value = String(DEFAUT_PANIER);
  f.transport.value = String(DEFAUT_TRANSPORT);
  $id('smig-aide').textContent = `SMIG ${SMIG_ANNEE} : ${mad(SMIG_MENSUEL)}/mois`;
  $id('famille-aide').textContent =
    `${entier(FAMILLE.parPersonneAn)} MAD/an/pers., plaf. ${entier(FAMILLE.plafondAn)}.`;
  $id('amo-legende').textContent = `Cotisation AMO (${court(AMO.taux * 100)} %)`;
  for (const t of TAUX_CIMR_LIST) {
    const opt = document.createElement('option');
    opt.value = String(t);
    opt.textContent = t === 0 ? '0 % — non-adhérent' : `${court(t)} %`;
    f.cimr.appendChild(opt);
  }
  f.cimr.value = '0';
  for (let n = 0; n <= FAMILLE.maxPersonnes; n++) {
    const opt = document.createElement('option');
    opt.value = String(n);
    opt.textContent = n === 0 ? '0' : `${n} pers.`;
    f.charges.appendChild(opt);
  }
  f.charges.value = '0';
}

/** Entrées du moteur depuis le DOM (clamps identiques des deux côtés). */
export function lireInputs(f: ChampsFormulaire): Inputs {
  return {
    brutBase: Math.max(0, nombre(f.brut)),
    dateEmbauche: f.embauche.value,
    panier: Math.max(0, nombre(f.panier)),
    transport: Math.max(0, nombre(f.transport)),
    amoOui: lireAmo(),
    tauxCimr: Number(f.cimr.value) || 0,
    nbCharges: Math.min(FAMILLE.maxPersonnes, Math.max(0, Math.floor(nombre(f.charges)))),
  };
}

/** Câblage des listeners (input + change + radios AMO). */
export function cableFormulaire(f: ChampsFormulaire, recalc: () => void): void {
  for (const el of [f.brut, f.embauche, f.panier, f.transport, f.cimr, f.charges]) {
    el.addEventListener('input', recalc);
    el.addEventListener('change', recalc);
  }
  document.querySelectorAll('input[name="amo"]').forEach((el) => {
    el.addEventListener('change', recalc);
  });
}
