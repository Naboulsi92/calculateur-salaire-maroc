// Helper de test partagé (revue code : déduplication baremes-2027 ↔ comparateur).
// Profil du comparateur : sans ancienneté ni indemnités, foyer simple.
import type { Inputs } from '../src/calcul';

export const profil = (brut: number, over: Partial<Inputs> = {}): Inputs => ({
  brutBase: brut,
  dateEmbauche: '',
  panier: 0,
  transport: 0,
  amoOui: true,
  tauxCimr: 0,
  nbCharges: 0,
  ...over,
});

export const entreesLignes = { tauxCimr: 0, amoOui: true, nbCharges: 0 };
