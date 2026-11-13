import { mkdir, copyFile, cp, stat, readdir, rm, readFile, writeFile } from 'node:fs/promises';
import { resolve, posix } from 'node:path';
const root = resolve(import.meta.dirname, '..');
// Start clean so replaced or removed assets never linger in the deploy folder.
await rm(resolve(root, 'dist'), { recursive: true, force: true });
await mkdir(resolve(root, 'dist'), { recursive: true });
for (const file of ['index.html', 'favicon.svg']) await copyFile(resolve(root, file), resolve(root, 'dist', file));
await cp(resolve(root, 'src'), resolve(root, 'dist/src'), { recursive: true, filter: src => !/[\\/]\._/.test(src) });
let bytes = 0, files = 0;
// Only web-ready copies ship; the original PNGs stay in the repository as sources.
for (const dir of ['web', 'og', 'concepts', 'audio', 'learning-v2', 'fonts', 'map-encounters']) {
  for (const name of await readdir(resolve(root, 'assets', dir))) {
    if (name.startsWith('._') || !/\.(mp4|jpg|png|webp|vtt|mp3|m4a|txt|md|woff2)$/.test(name)) continue;
    const dest = resolve(root, 'dist/assets', dir, name);
    await mkdir(resolve(dest, '..'), { recursive: true });
    await copyFile(resolve(root, 'assets', dir, name), dest);
    bytes += (await stat(dest)).size; files++;
  }
}
await mkdir(resolve(root, 'dist/assets/characters'), { recursive: true });
await copyFile(resolve(root, 'assets/characters/doto.svg'), resolve(root, 'dist/assets/characters/doto.svg'));
console.log(`Build complete: dist · ${files + 1} assets · ${(bytes / 1024 / 1024).toFixed(2)} MiB`);

await cp(resolve(root, 'assets/audio/voices'), resolve(root, 'dist/assets/audio/voices'), { recursive: true, filter: src => !/[\\/]\._/.test(src) });

// Preserve stylesheet order and the insertion point for activity-only styles.
const htmlFile = resolve(root, 'dist/index.html');
let html = await readFile(htmlFile, 'utf8');
const screens = ['experience.css', 'learning-art.css', 'screens.css'];
const screenCSS = await Promise.all(screens.map(file => readFile(resolve(root, 'src', file), 'utf8')));
await writeFile(resolve(root, 'dist/src/screen-shell.css'), screenCSS.join('\n'));
html = html.replace('./src/experience.css', './src/screen-shell.css');
for (const file of screens.slice(1)) html = html.replace(`  <link rel="stylesheet" href="./src/${file}">\n`, '');

// Start the native entry graph immediately. Dynamic imports stay on their own screens.
const modules = new Set();
async function inspectModule(file) {
  const source = await readFile(resolve(root, file), 'utf8');
  for (const [, specifier] of source.matchAll(/^\s*(?:(?:import|export)\s+[^'";]*?\bfrom\s*|import\s*)['"](\.\.?\/[^'"]+)['"]/gm)) {
    const dependency = posix.normalize(posix.join(posix.dirname(file), specifier));
    if (modules.has(dependency)) continue;
    modules.add(dependency);
    await inspectModule(dependency);
  }
}
await inspectModule('src/app.js');
const preload = ['src/app.js', ...modules].map(file => `  <link rel="modulepreload" href="./${file}">`).join('\n');
html = html.replace('</head>', preload + '\n</head>');
await writeFile(htmlFile, html);
