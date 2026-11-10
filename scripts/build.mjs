import { mkdir, copyFile, cp, stat, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
// Start clean so replaced or removed assets never linger in the deploy folder.
await rm(resolve(root, 'dist'), { recursive: true, force: true });
await mkdir(resolve(root, 'dist'), { recursive: true });
for (const file of ['index.html', 'favicon.svg']) await copyFile(resolve(root, file), resolve(root, 'dist', file));
await cp(resolve(root, 'src'), resolve(root, 'dist/src'), { recursive: true, filter: src => !/[\\/]\._/.test(src) });
let bytes = 0, files = 0;
// Only web-ready copies ship; the original PNGs stay in the repository as sources.
for (const dir of ['web', 'og', 'concepts', 'audio', 'learning-v2', 'fonts']) {
  for (const name of await readdir(resolve(root, 'assets', dir))) {
    if (name.startsWith('._') || !/\.(mp4|jpg|webp|vtt|mp3|m4a|txt|md|woff2)$/.test(name)) continue;
    const dest = resolve(root, 'dist/assets', dir, name);
    await mkdir(resolve(dest, '..'), { recursive: true });
    await copyFile(resolve(root, 'assets', dir, name), dest);
    bytes += (await stat(dest)).size; files++;
  }
}
await mkdir(resolve(root, 'dist/assets/characters'), { recursive: true });
await copyFile(resolve(root, 'assets/characters/doto.svg'), resolve(root, 'dist/assets/characters/doto.svg'));
console.log(`Build complete: dist · ${files + 1} assets · ${(bytes / 1024 / 1024).toFixed(2)} MiB`);
