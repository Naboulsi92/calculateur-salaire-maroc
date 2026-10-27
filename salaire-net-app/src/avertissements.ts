// C5 — formatage des avertissements codés : le moteur émet des codes + paramètres,
// les adaptateurs (main.ts, comparateur.ts) formattent le français. Un seul
// libellé partagé pour les deux pages — pas de drift.
import type { Avertissement } from './calcul';
import { SMIG_ANNEE } from './baremes';
import { mad } from './format';

export function texteAvertissement(a: Avertissement): string {
  switch (a.code) {
    case 'smig':
      return `Brut inférieur au SMIG ${SMIG_ANNEE} (${mad(a.seuil)}/mois).`;
    case 'cimr-fiscal':
      return `Taux CIMR ${a.taux} % > 6 % : part excédentaire possiblement non déductible fiscalement (à vérifier).`;
    case 'fp-plafonne':
      return 'Frais professionnels plafonnés.';
  }
}

/** Spec §2 / art. 57-1° PLF : restriction de l'exonération des indemnités à
 * partir de 2031 (hors périmètre du moteur — pure information UI, comparateur). */
export const AVERTISSEMENT_2031 =
  "À partir de 2031, l'exonération des indemnités (panier, transport) est restreinte (art. 57-1° du PLF) : bulletin indicatif, imposition possible au-delà du plafond.";
