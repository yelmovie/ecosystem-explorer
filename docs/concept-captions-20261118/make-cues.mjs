// 14번 개념 영상 자막 큐: 앱의 문장(learning.js)·시점(conceptClock)·키워드(concept-recall.js vocabulary)를 그대로 쓴다.
import { fileURLToPath } from 'node:url'; import fs from 'node:fs'; import path from 'node:path';
const REPO = '/Volumes/T7 Shield/iscreammedia_sc34/14 environments';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bottom = Number(process.argv[2] || 64);
const { concepts, conceptClock } = await import(path.join(REPO, 'src/learning.js'));
const src = fs.readFileSync(path.join(REPO, 'src/concept-recall.js'), 'utf8');
const vocabulary = Function('return ' + src.match(/const vocabulary=(\{.*?\});/s)[1])();
const END = 15.0;
const mark = (text, terms) => {
  const words = [...new Set(terms)].sort((a, b) => b.length - a.length);
  const re = new RegExp(words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  return text.replace(re, (m, at) => m.length === 1 && /[가-힣]/.test(text[at - 1] || '') ? m : `[${m}]`); // 한 글자 키워드가 낱말 안(생물의 '물')에 걸리면 강조하지 않는다
};
for (const [id, c] of Object.entries(concepts)) {
  const cues = conceptClock.cues.map((s, i, a) => ({ s, e: i + 1 < a.length ? +(a[i + 1] - 0.1).toFixed(2) : END, text: mark(c.lines[i], vocabulary[id]) }));
  const film = { src: `src2/${id}.mp4`, out: `out/${id}.mp4`, theme: { box: '#123d31', accent: '#ffd776', hot: '#ffd776' }, bottom, sweep: false, cues };
  fs.writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify(film, null, 1) + '\n');
}
console.log('ok', Object.keys(concepts).length);
