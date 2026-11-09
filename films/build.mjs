// films.data.mjs + kit/ → films/pNN/ (one HyperFrames project per concept film).
// Pictures are cut from the game's own art: the learning illustrations (assets/learning-v2),
// the river before/after scenes and Moa's pose sheet. Sounds are the game's Kenney CC0 effects.
// Run: SHARP_MODULE=<path to sharp> node films/build.mjs   (sharp is a local tool, not an app dependency)
import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { concepts } from '../src/learning.js';
import { films } from './films.data.mjs';
import { createFilm, page } from './kit/kit.mjs';

const here = dirname(fileURLToPath(import.meta.url)), root = resolve(here, '..');
const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || 'sharp'); sharp.cache(false); sharp.concurrency(1);
const gsapPath = process.env.GSAP_PATH || '/Users/yel/.local/node/lib/node_modules/hyperframes/dist/vendor/npm/gsap@3.15.0/dist/gsap.min.js';
const css = await readFile(join(here, 'kit', 'kit.css'), 'utf8');
const sheet = join(root, 'assets/characters/originals/chatgpt_generated_40.png');
// Cells of the pose sheet (1672×941). Neighbouring poses overlap the boxes, so we keep only
// the connected shape that contains the seed point, then shave a 2 px fringe.
const CELLS = { look: [600, 0, 420, 500, 230, 300], point: [280, 0, 420, 500, 200, 300], surprise: [930, 0, 420, 500, 230, 300], cheer: [1290, 0, 382, 500, 200, 300], fish: [440, 680, 420, 200, 200, 100] };

async function cutout([left, top, width, height, sx, sy], out, maxH) {
  const { data, info } = await sharp(sheet).extract({ left, top, width, height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, keep = new Uint8Array(W * H), solid = i => data[i * 4 + 3] > 40;
  let seed = sy * W + sx;
  if (!solid(seed)) for (let d = 1; d < 120 && !solid(seed); d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) { const j = (sy + dy) * W + sx + dx; if (solid(j)) { seed = j; break; } }
  const stack = [seed]; keep[seed] = 1;
  while (stack.length) { const i = stack.pop(), x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, j = ny * W + nx; if (nx >= 0 && ny >= 0 && nx < W && ny < H && !keep[j] && solid(j)) { keep[j] = 1; stack.push(j); } } }
  let mask = keep;
  for (let pass = 0; pass < 2; pass++) { const next = new Uint8Array(W * H); for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; next[i] = mask[i] && mask[i - 1] && mask[i + 1] && mask[i - W] && mask[i + W] ? 1 : 0; } mask = next; }
  for (let i = 0; i < W * H; i++) if (!mask[i]) data[i * 4 + 3] = 0;
  await sharp(data, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 }).resize({ height: maxH, withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 95 }).toFile(out);
}

for (const [id, spec] of Object.entries(films)) {
  const c = concepts[id], dir = join(here, id), img = join(dir, 'assets', 'img'), sfx = join(dir, 'assets', 'sfx');
  await mkdir(img, { recursive: true }); await mkdir(sfx, { recursive: true });
  await copyFile(gsapPath, join(dir, 'assets', 'gsap.min.js'));
  for (const s of ['pluck_001', 'drop_003', 'switch_002', 'maximize_001', 'confirmation_002', 'LICENSE.txt']) await copyFile(join(root, 'assets/audio', s.includes('.') ? s : `${s}.mp3`), join(sfx, s.includes('.') ? s : `${s}.mp3`));
  const film = createFilm({ id, title: c.title, cues: c.cues, duration: c.duration, conclusion: spec.conclusion, keyword: spec.keyword, poses: spec.poses });
  spec.build(film, c.cues);
  const f = film.film, used = new Set([...f.parts.join('').matchAll(/assets\/img\/([a-z-]+)\.webp/g)].map(m => m[1]));
  for (const name of used) await copyFile(join(root, 'assets/learning-v2', `${name}.webp`), join(img, `${name}.webp`)).catch(e => { if (name !== 'fish') throw e; });
  if (used.has('fish')) await cutout(CELLS.fish, join(img, 'fish.webp'), 240);
  for (const pose of new Set(spec.poses)) await cutout(CELLS[pose], join(img, `moa-${pose}.webp`), 640);
  await writeFile(join(dir, 'index.html'), page(f, css));
  await writeFile(join(dir, 'hyperframes.json'), JSON.stringify({ $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json', paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true }, authoringSkill: 'hyperframes' }, null, 2) + '\n');
  await writeFile(join(dir, 'meta.json'), JSON.stringify({ id, name: `개념영상 ${id} · ${c.title}` }, null, 2) + '\n');
  console.log(`${id}: ${f.parts.length} parts, ${f.sounds.length} sounds, ${c.duration}s`);
}
