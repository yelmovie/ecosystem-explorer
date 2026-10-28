import { mkdir, copyFile, cp, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
await mkdir(resolve(root, 'dist'), { recursive: true });
for (const file of ['index.html', 'favicon.svg']) await copyFile(resolve(root, file), resolve(root, 'dist', file));
await cp(resolve(root, 'src'), resolve(root, 'dist/src'), { recursive: true });
const assets = ['backgrounds/originals/chatgpt_generated_27.png', 'backgrounds/originals/chatgpt_generated_32.png', 'branding/originals/chatgpt_generated_39.png', 'characters/originals/chatgpt_generated_40.png'];
let bytes = 0;
for (const asset of assets) {
  const dest = resolve(root, 'dist/assets', asset);
  await mkdir(resolve(dest, '..'), { recursive: true });
  await copyFile(resolve(root, 'assets', asset), dest);
  bytes += (await stat(dest)).size;
}
for (const dir of ['concepts','audio','learning-v2']) {
  const { readdir } = await import('node:fs/promises');
  for (const name of await readdir(resolve(root,'assets',dir))) {
    if(!/\.(mp4|jpg|webp|vtt|mp3|txt|md|json)$/.test(name))continue;
    const dest=resolve(root,'dist/assets',dir,name);
    await mkdir(resolve(dest,'..'),{recursive:true});
    await copyFile(resolve(root,'assets',dir,name),dest);
    bytes+=(await stat(dest)).size;
  }
}
await copyFile(resolve(root,'assets/characters/doto.svg'),resolve(root,'dist/assets/characters/doto.svg'));
console.log(`Build complete: dist · ${assets.length} original assets · ${(bytes / 1024 / 1024).toFixed(2)} MiB`);
