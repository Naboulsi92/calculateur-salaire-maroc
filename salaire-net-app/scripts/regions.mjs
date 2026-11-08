// Stamping de régions — helper partagé (seo.mjs + chiffres-8000.mjs).
// `<-- PREFIX:NAME:START/END -->` remplacées de manière idempotent : relançable
// sans risque (les régions sont remplacées, jamais les valeurs).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Garde-fou review : aucune écriture hors du projet, même si ROOT dérive. */
export function insideRoot(path) {
  const full = join(ROOT, path);
  if (full !== ROOT && !full.startsWith(ROOT + sep)) {
    throw new Error(`Hors projet, écriture refusée : ${path}`);
  }
  return full;
}

/** Remplace le bloc PREFIX:NAME (par défaut SEO:NAME) dans `path`. Le body est
 * écrit avec l'EOL du fichier cible ; l'indentation du marqueur START est
 * conservée pour le bloc régénéré. */
export function region(path, name, body, prefix = 'SEO') {
  const full = insideRoot(path);
  const text = readFileSync(full, 'utf8');
  const start = `<!-- ${prefix}:${name}:START -->`;
  const end = `<!-- ${prefix}:${name}:END -->`;
  if (!text.includes(start) || !text.includes(end)) {
    throw new Error(`${path} : région manquante ${prefix}:${name}`);
  }
  // Le body est écrit en \n ; on l'adapte aux CRLF éventuels du fichier cible.
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const norm = body.replace(/\r?\n/g, eol);
  // L'indentation du marqueur START est conservée pour le bloc régénéré.
  const line = text.split('\n').find((l) => l.includes(start)) || '';
  const ind = line.slice(0, line.length - line.trimStart().length);
  writeFileSync(
    full,
    text.replace(new RegExp(`${start}[\\s\\S]*?${end}`, ''), `${start}${eol}${norm}${eol}${ind}${end}`),
  );
}
