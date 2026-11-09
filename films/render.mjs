// Render films/pNN with HyperFrames (1920×1080 30 fps), then make the app copies:
// assets/concepts/pNN.mp4 (1280×720 H.264 + AAC, faststart, ≤ 2.5 MB) and pNN.jpg (last frame = poster
// and the reduced-motion still). Full-size renders stay in $TMPDIR, never in the repository.
// Run: node films/render.mjs [p03 p05 …]
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { concepts } from '../src/learning.js';
const root = resolve(import.meta.dirname, '..'), tmp = join(process.env.TMPDIR || '', 'film-renders');
if (!process.env.TMPDIR) throw new Error('TMPDIR를 외장 SSD 경로로 지정해 줘.');
mkdirSync(tmp, { recursive: true });
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(concepts);
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 }).toString();
for (const id of ids) {
  const big = join(tmp, `${id}-1080.mp4`), out = join(root, 'assets/concepts', `${id}.mp4`), poster = join(root, 'assets/concepts', `${id}.jpg`);
  run('hyperframes', ['render', '--quality', 'looks', '-o', big], join(root, 'films', id));
  for (const crf of [26, 29, 32]) {
    run('ffmpeg', ['-v', 'error', '-y', '-i', big, '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', String(crf), '-r', '30', '-c:a', 'aac', '-b:a', '96k', '-ac', '1', '-movflags', '+faststart', out]);
    if (statSync(out).size <= 2.5 * 1024 * 1024) break;
  }
  run('ffmpeg', ['-v', 'error', '-y', '-sseof', '-0.1', '-i', big, '-frames:v', '1', '-vf', 'scale=1280:720:flags=lanczos', '-q:v', '4', poster]);
  const dur = run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).trim();
  console.log(`${id}: ${dur}s · ${(statSync(out).size / 1024).toFixed(0)} KiB · poster ${(statSync(poster).size / 1024).toFixed(0)} KiB`);
}
