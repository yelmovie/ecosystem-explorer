import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// A villain line (mediaPriority) must not silence the map combat cues; card cues and UI tones keep the voice rule.
test('map combat cues play at full level while a villain voice plays', async () => {
  const doc = new EventTarget(); doc.hidden = false; let cardOpen = false;
  doc.querySelector = selector => selector === '.rc-layer' && cardOpen ? {} : null;
  globalThis.document = doc;
  const sources = [], oscillators = [];
  globalThis.fetch = async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
  globalThis.AudioContext = class {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createGain() { return { gain: param(), connect() {}, disconnect() {} }; }
    createBufferSource() { const s = { playbackRate: { value: 1 }, connect(g) { s.gain = g; }, disconnect() {}, start() { s.started = true; }, stop() { s.stopped = true; } }; sources.push(s); return s; }
    createOscillator() { const o = { frequency: param(), connect() {}, disconnect() {}, start() {}, stop() {} }; oscillators.push(o); return o; }
    decodeAudioData() { return Promise.resolve({ decoded: true }); }
    suspend() { return Promise.resolve(); } resume() { return Promise.resolve(); } close() { return Promise.resolve(); }
  };
  globalThis.performance ??= { now: () => Date.now() };
  const audio = await import('../src/audio.js');
  audio.playMapCue('ready');
  await new Promise(r => setTimeout(r, 0)); await new Promise(r => setTimeout(r, 0));
  // Prime the decode (the first tap creates the AudioContext).
  audio.playMapCue('appear'); await new Promise(r => setTimeout(r, 0)); await new Promise(r => setTimeout(r, 0));
  sources.length = 0;

  audio.mediaPriority(true); // villain voice starts
  audio.playMapCue('hit', 1);
  await new Promise(r => setTimeout(r, 0));
  assert.equal(sources.length, 2, 'swing and hit start under the voice');
  assert(sources.every(s => s.started && !s.stopped));
  assert(sources.every(s => s.gain.gain.value >= .7 * .4 * .75), 'not ducked below 70 %');
  audio.mediaPriority(true); audio.configureAudio({ music: true, sfx: true }); // a voice (re)starting or a tone sync does not cut the ringing cue
  assert(sources.every(s => !s.stopped));
  audio.playMapCue('finish', 3); await new Promise(r => setTimeout(r, 0));
  assert.equal(sources.length, 5, 'swing, heavy hit and exit');

  // Card cues and UI tones keep the voice rule (except while a card is open).
  const before = sources.length;
  audio.playCardCue('reveal'); assert.equal(sources.length, before);
  audio.playSound('tap'); assert.equal(oscillators.length, 0);
  cardOpen = true; audio.playCardCue('reveal'); await new Promise(r => setTimeout(r, 0)); assert.equal(sources.length, before + 1);
  cardOpen = false;

  // Mute still stops everything.
  audio.configureAudio({ music: false, sfx: false });
  assert(sources.every(s => s.stopped));
  audio.playMapCue('hit', 1); await new Promise(r => setTimeout(r, 0)); assert.equal(sources.length, before + 1);
  delete globalThis.AudioContext; delete globalThis.document; delete globalThis.fetch;
});

test('hit and exit lines speak ~300 ms after the combat cue; taunts speak at once', () => {
  const source = readFileSync(new URL('../src/map-encounters.js', import.meta.url), 'utf8');
  assert.match(source, /time\+\(n===HITS\?2750:1800\),300\);/);
  assert.match(source, /if\(voiceDelay\)\(view\?\?globalThis\)\.setTimeout\(/);
  assert.match(source, /speak\(current,message,now\+2200\);/);
});
