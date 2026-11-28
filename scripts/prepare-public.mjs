// Before `vite build`: the files the page loads from its own origin (TAB-Art. 1) — the standalone
// script and the Extensions API library, both vendored and verified — into public/.
import { copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
mkdirSync(`${root}public`, { recursive: true });
for (const file of ['silverpoint-embed.full.js', 'tableau.extensions.1.17.0.min.js', 'tableau.extensions.LICENSE.txt']) {
  copyFileSync(`${root}vendor/${file}`, `${root}public/${file}`);
}
console.log('public/: silverpoint-embed.full.js, tableau.extensions.1.17.0.min.js');
