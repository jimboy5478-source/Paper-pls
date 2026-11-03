import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';

// GitHub Pages can serve the committed /docs directory directly from main.
rmSync('docs', { recursive: true, force: true });
mkdirSync('docs', { recursive: true });
cpSync('dist', 'docs', { recursive: true });
writeFileSync('docs/.nojekyll', '');
console.log('GitHub Pages release prepared in docs/.');
