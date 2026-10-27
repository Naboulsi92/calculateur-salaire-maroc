// I2 — build multi-pages : la page comparateur rejoint la page principale.
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        comparateur: fileURLToPath(new URL('./salaire-net-2027.html', import.meta.url)),
        notfound: fileURLToPath(new URL('./404.html', import.meta.url)),
      },
    },
  },
});
