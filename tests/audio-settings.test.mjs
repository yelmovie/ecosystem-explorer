import test from 'node:test';
import assert from 'node:assert/strict';

// Settings split (2026-11-19): background music (switch + size) and effects are separate switches.
test('music and effects follow their own switches; the default size matches the old fixed level', async () => {
  const doc = new EventTarget(); doc.hidden = false; doc.querySelector = () => null;
  globalThis.document = doc;
  const players = [], oscillators = [];
  globalThis.Audio = class { constructor(src) { this.src = src; this.paused = true; this.volume = 1; this.dataset = {}; players.push(this); } play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } };
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
  globalThis.AudioContext = class {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    createGain() { return { gain: param(), connect() {}, disconnect() {} }; }
    createOscillator() { const o = { frequency: param(), connect() {}, disconnect() {}, start() {}, stop() { o.stopped = true; } }; oscillators.push(o); return o; }
    suspend() { return Promise.resolve(); } resume() { return Promise.resolve(); } close() { return Promise.resolve(); }
  };
  let now = 1000; globalThis.performance = { now: () => (now += 500) };
  const audio = await import('../src/audio.js');
  const record = { music: true, sfx: true, musicVolume: 30 };

  audio.configureAudio(record); audio.startMusic();
  const main = players.at(-1);
  assert.match(main.src, /main-theme\.mp3$/);
  assert.equal(main.paused, false);
  assert.equal(main.volume, .3, 'default 30 % sounds like the old fixed .30');
  audio.mediaPriority(true); assert.equal(main.volume, .3 * .25, 'ducked, not stopped, under a voice');
  assert.equal(main.paused, false);
  audio.mediaPriority(false); assert.equal(main.volume, .3);

  // Music off: only the music stops.
  audio.configureAudio({ ...record, music: false });
  assert.equal(main.paused, true);
  audio.playSound('tap'); assert.equal(oscillators.length, 1, 'effects still play');
  audio.configureAudio(record); assert.equal(main.paused, false);

  // Effects off: the ringing effect stops at once, the music keeps playing at its size.
  audio.playSound('success'); const ringing = oscillators.slice(1); assert.equal(ringing.length, 3);
  audio.configureAudio({ ...record, sfx: false, musicVolume: 60 });
  assert(ringing.every(o => o.stopped));
  assert.equal(main.paused, false); assert.equal(main.volume, .6);
  const before = oscillators.length; audio.playSound('tap'); assert.equal(oscillators.length, before, 'no effect while the switch is off');

  // Size: 0 is silent, out-of-range and missing values stay safe.
  audio.configureAudio({ ...record, musicVolume: 0 }); assert.equal(main.paused, true);
  audio.configureAudio({ ...record, musicVolume: 100 }); assert.equal(main.paused, false); assert.equal(main.volume, 1);
  audio.configureAudio({ ...record, musicVolume: 400 }); assert.equal(main.volume, 1);
  audio.configureAudio({ music: true, sfx: true }); assert.equal(main.volume, .3);
  audio.configureAudio({ ...record, music: false, sfx: false }); assert.equal(main.paused, true);
  delete globalThis.AudioContext; delete globalThis.Audio; delete globalThis.document;
});
