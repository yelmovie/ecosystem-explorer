// Writes assets/concepts/pNN.vtt from src/learning.js so captions never drift from the film clock.
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { concepts } from '../src/learning.js';
const root = resolve(import.meta.dirname, '..');
const stamp = t => `00:00:${String(Math.floor(t)).padStart(2, '0')}.${String(Math.round((t % 1) * 1000)).padStart(3, '0')}`;
for (const [id, c] of Object.entries(concepts)) {
  const body = c.lines.map((line, i) => `${stamp(c.cues[i])} --> ${stamp(c.cues[i + 1] ?? c.duration)}\n${line}`).join('\n\n');
  await writeFile(resolve(root, 'assets/concepts', `${id}.vtt`), `WEBVTT\n\n${body}\n`);
}
console.log(`VTT ${Object.keys(concepts).length}편 · ${Object.values(concepts)[0].duration}s`);
