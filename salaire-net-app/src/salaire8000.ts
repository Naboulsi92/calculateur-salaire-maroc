// Build 1/7 (ticket 09) — entrée de /salaire-net-8000 : CSS partagé + count-up
// des tuiles. Les valeurs (data-n) sont stampées au build par
// scripts/chiffres-8000.mjs depuis le moteur : ce module ne duplique AUCUN
// chiffre, il anime le montant déjà présent dans le HTML, formaté par la
// source unique du formatage (D2, montant()). Pattern = main.ts/comparateur.ts.
import { montant } from './format';
import './style.css';

// Count-up des nombres seulement (l'unité MAD est statique dans la tuile,
// visible aussi en reduced-motion). 280 ms ≤ barre 300 ms du plateau v1,
// easing cubic-out. Reduced-motion : le HTML stampé est déjà la valeur
// finale — rien à faire.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll<HTMLSpanElement>('.nets .n[data-n]').forEach((el) => {
    const target = Number(el.dataset.n);
    if (!Number.isFinite(target)) return;
    const t0 = performance.now();
    const dur = 280;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = montant(target * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
