// I2 — build multi-pages : la page comparateur rejoint la page principale.
// Le plugin dev-flash-css supprime le flash non stylé du mode dev (FOUC vue
// par l'utilisateur 02/11 — prod saine, build : 0 frame sans style mesurée) :
// en dev, le HTML n'a pas de <link> CSS, le style n'arrive qu'avec le module
// JS. On injecte le lien du CSS (servi par Vite, HMR inchangé) dans le <head>.
import { defineConfig, type Plugin } from 'vite';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));

/** Pages MPA : fichier HTML → entrée TS (même table que rollupOptions.input). */
const PAGES: Record<string, string> = {
  'index.html': 'src/main.ts',
  'salaire-net-2027.html': 'src/comparateur.ts',
  'salaire-net-8000.html': 'src/salaire8000.ts', // Build 1/7 (ticket 09)
  'salaire-net-10000.html': 'src/salaire10000.ts', // Build 2/7 (ticket 10)
  '404.html': '', // page statique, pas de module ni de CSS
};

function devFlashCss(): Plugin {
  return {
    name: 'dev-flash-css',
    apply: 'serve',
    transformIndexHtml: {
      order: 'pre',
      handler(_html, ctx) {
        const file = ctx.filename ? ctx.filename.replace(/\\/g, '/').split('/').pop() : '';
        const entry = PAGES[file ?? ''];
        if (!entry) return;
        // Le module d'entrée importe-t-il le CSS ? (source unique : on suit l'import)
        const entrySrc = readFileSync(resolve(ROOT, entry), 'utf8');
        const m = entrySrc.match(/import\s+['"](\.\/[^'"]+\.css)['"]/);
        if (!m) return;
        const cssUrl = '/' + join(dirname(entry), m[1]).replaceAll('\\', '/');
        if (!existsSync(resolve(ROOT, cssUrl.slice(1)))) return;
        return [{ tag: 'link', attrs: { rel: 'stylesheet', href: cssUrl }, injectTo: 'head' }];
      },
    },
  };
}

export default defineConfig({
  plugins: [devFlashCss()],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        comparateur: fileURLToPath(new URL('./salaire-net-2027.html', import.meta.url)),
        net8000: fileURLToPath(new URL('./salaire-net-8000.html', import.meta.url)),
        net10000: fileURLToPath(new URL('./salaire-net-10000.html', import.meta.url)),
        notfound: fileURLToPath(new URL('./404.html', import.meta.url)),
      },
    },
  },
});
