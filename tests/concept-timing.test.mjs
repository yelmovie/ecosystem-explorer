import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { concepts, conceptClock } from '../src/learning.js';
const file = name => new URL(`../assets/concepts/${name}`, import.meta.url);
const seconds = s => { const [h, m, rest] = s.split(':'); return +h * 3600 + +m * 60 + +rest; };
// Movie header duration without ffprobe: find the 'mvhd' box and read timescale/duration.
function mp4Duration(buf) {
  const i = buf.indexOf('mvhd');
  assert.ok(i > 0, 'mvhd box');
  const v = buf[i + 4];
  return v === 1 ? Number(buf.readBigUInt64BE(i + 24)) / buf.readUInt32BE(i + 20) : buf.readUInt32BE(i + 20) / buf.readUInt32BE(i + 16);
}
test('concept captions, scene buttons and films share one clock', () => {
  for (const [id, c] of Object.entries(concepts)) {
    assert.equal(c.duration, conceptClock.duration, id);
    assert.equal(c.cues.length, c.lines.length, id);
    assert.equal(c.cues[0], 0, id);
    const cues = [...readFileSync(file(`${id}.vtt`), 'utf8').matchAll(/([\d:.]+) --> ([\d:.]+)\n(.+)/g)];
    assert.deepEqual(cues.map(m => seconds(m[1])), c.cues, `${id} VTT starts`);
    assert.equal(seconds(cues.at(-1)[2]), c.duration, `${id} VTT end`);
    assert.deepEqual(cues.map(m => m[3]), c.lines, `${id} VTT text`);
    const d = mp4Duration(readFileSync(file(`${id}.mp4`)));
    assert.ok(Math.abs(d - c.duration) < 0.1, `${id} film ${d}s ≠ ${c.duration}s`);
  }
});
