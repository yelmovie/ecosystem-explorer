import { createThemeEffects } from './theme-effects.js';
// Soft birdlike discovery tones and water-drop connections, synthesized locally.
let muted = false, mediaActive = false;
const effects = createThemeEffects('ecosystem', () => ({ muted: muted || mediaActive, volume: .75 }));
// Suno background music (originals in references/suno). The main theme loops from the first tap;
// the final theme plays once on the ending and certificate, and loops while the map finale is open.
const musicFiles = { main: './assets/audio/bgm/main-theme.mp3', final: './assets/audio/bgm/final-theme.mp3' };
let music = null, track = 'main', finalDone = false, mapFinale = false, started = false;
function syncMusic() {
  const want = mapFinale ? 'final' : track;
  const silent = !started || muted || document.hidden || (want === 'final' && !mapFinale && finalDone);
  if (silent) { music?.pause(); return; }
  const loop = want === 'main' || mapFinale;
  if (!music || music.dataset.track !== want) {
    music?.pause();
    music = new Audio(musicFiles[want]); music.dataset.track = want; music.preload = 'auto';
    music.onended = () => { if (music?.dataset.track === 'final' && !mapFinale) finalDone = true; };
  }
  music.loop = loop;
  // Ducked under character voices and concept clips instead of stopping.
  music.volume = mediaActive ? .3 * .25 : .3;
  if (music.paused) music.play().catch(() => {});
}
function sync() { effects.sync(); syncMusic(); }
document.addEventListener('visibilitychange', syncMusic);
globalThis.addEventListener?.('pagehide', () => music?.pause());
export function startMusic() { if (started) return; started = true; effects.unlock(); syncMusic(); }
export function setMusic(next) { if (next === track) return; track = next; if (next === 'final') finalDone = false; syncMusic(); }
export function setMapFinaleMusic(value) { if (mapFinale === value) return; mapFinale = value; if (!value && music?.dataset.track === 'final') { music.pause(); music = null; } syncMusic(); }
export function configureAudio(value) { muted = value; sync(); }
export function stopAudio() { effects.stop(); }
export function mediaPriority(value) { mediaActive = value; sync(); }
export function playSound(kind = 'tap') { effects.play(kind); }
// Map villain cues: local CC0 recordings (assets/audio/sfx, see assets/CREDITS.md), one cue per counted hit.
// The swing starts on the input; the hit lands with the hero's strike frame (~75 ms; 2nd hit pitched lower); the exit follows the shrink.
const sfx = name => `./assets/audio/sfx/${name}.mp3`;
const swing = { url: sfx('map-swing'), volume: .4, dur: .38 };
const mapCues = {
  hit1: [swing, { url: sfx('map-hit-1'), at: .075, volume: .7 }],
  hit2: [swing, { url: sfx('map-hit-1'), at: .075, volume: .8, rate: .84 }],
  finish: [swing, { url: sfx('map-hit-heavy'), at: .075, volume: .75 }, { url: sfx('map-exit'), at: .34, volume: .55, dur: .85 }],
  contact: [{ url: sfx('map-bump'), volume: .8 }],
  appear: [{ url: sfx('map-appear'), volume: .4 }],
};
export function playMapCue(kind, hits = 0) {
  if (kind === 'ready') { effects.preload([...new Set(Object.values(mapCues).flat().map(part => part.url))]); return; }
  const cue = mapCues[kind === 'hit' ? (hits === 2 ? 'hit2' : 'hit1') : kind];
  if (cue) effects.sample(cue);
}
