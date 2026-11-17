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
