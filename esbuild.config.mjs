import { build } from 'esbuild';
await build({entryPoints:['src/main.ts'],bundle:true,external:['obsidian','electron','@electron/remote','node:fs/promises','node:path'],format:'cjs',target:'es2022',platform:'node',outfile:'main.js',minify:true,banner:{js:'/* NotePort | MIT | github.com/WNGjeanm/obsidian-noteport */'}});
