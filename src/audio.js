import { createThemeEffects } from './theme-effects.js';
// Soft birdlike discovery tones and water-drop connections, synthesized locally.
// Settings: the music and the effects each have a switch and a size; voices have their own switch (app.js).
let musicOn = true, sfxOn = true, musicLevel = .3, sfxLevel = 1, mediaActive = false;
// Map combat cues (swing, hits, exit, appear, contact, a place opening, footsteps) pass a voice: the villain's own line must not silence its hit.
// Mute and hidden tabs still stop them; card cues and UI tones keep the voice rule. A voice that starts no longer cuts a ringing cue.
// Combat, card and unlock cues ring together (theme-effects.js 'reward' lane); a UI tone or a footstep never cuts them.
let combatPass = false;
const passVoice = fn => { combatPass = true; try { return fn(); } finally { combatPass = false; } };
// A voice silences the effects, except while an achievement card is open: the villain's parting line must not mute its reveal.
const effects = createThemeEffects('ecosystem', () => ({ muted: !sfxOn || !sfxLevel || (mediaActive && !combatPass && !document.querySelector('.rc-layer')), volume: .75 * sfxLevel }));
// Suno background music (originals in references/suno). The main theme loops from the first tap;
// the final theme plays once on the ending and certificate, and loops while the map finale is open.
// When it has ended and the ending is still open, the main theme carries on at 45 % instead of silence.
const musicFiles = { main: './assets/audio/bgm/main-theme.mp3', final: './assets/audio/bgm/final-theme.mp3' };
let music = null, track = 'main', finalDone = false, mapFinale = false, started = false;
function syncMusic() {
  const after = track === 'final' && !mapFinale && finalDone, want = mapFinale ? 'final' : after ? 'main' : track;
  const silent = !started || !musicOn || !musicLevel || document.hidden;
  if (silent) { music?.pause(); return; }
  const loop = want === 'main' || mapFinale;
  if (!music || music.dataset.track !== want) {
    music?.pause();
    music = new Audio(musicFiles[want]); music.dataset.track = want; music.preload = 'auto';
    music.onended = () => { if (music?.dataset.track === 'final' && !mapFinale) { finalDone = true; syncMusic(); } };
  }
  music.loop = loop;
  // Ducked under character voices and concept clips instead of stopping.
  music.volume = musicLevel * (mediaActive ? .25 : 1) * (after ? .45 : 1);
  if (music.paused) music.play().catch(() => {});
}
function sync() { passVoice(effects.sync); syncMusic(); }
document.addEventListener('visibilitychange', syncMusic);
globalThis.addEventListener?.('pagehide', () => music?.pause());
export function startMusic() { if (started) return; started = true; effects.unlock(); syncMusic(); }
export function setMusic(next) { if (next === track) return; track = next; if (next === 'final') finalDone = false; syncMusic(); }
export function setMapFinaleMusic(value) { if (mapFinale === value) return; mapFinale = value; if (value) effects.stop(); if (!value && music?.dataset.track === 'final') { music.pause(); music = null; } syncMusic(); }
// musicVolume is a percent; 30 is the level the music had before it became adjustable.
// sfxVolume is a percent of the effects level before it became adjustable (100 = unchanged); it scales every effects lane.
export function configureAudio({ music: on = true, sfx = true, musicVolume = 30, sfxVolume = 100 } = {}) {
  musicOn = on !== false; sfxOn = sfx !== false;
  musicLevel = Math.max(0, Math.min(1, (Number.isFinite(musicVolume) ? musicVolume : 30) / 100));
  sfxLevel = Math.max(0, Math.min(1, (Number.isFinite(sfxVolume) ? sfxVolume : 100) / 100));
  sync();
}
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
  // A new place opens on the map: a soft opening, then small bells 0.12 s later.
  unlock: [{ url: sfx('map-unlock'), volume: .55 }, { url: sfx('map-unlock-chime'), at: .12, volume: .4 }],
};
// Footsteps while the explorer really walks on the map (map.js): two CC0 steps in turn, each a little different in pitch.
// Their own lane: they cut nothing and nothing cuts them. Half as loud under a voice.
const steps = [sfx('map-step-1'), sfx('map-step-2')];
let stepCount = 0;
export function playStep() {
  const rate = .95 * (1 + (Math.random() * 2 - 1) * .06);
  return passVoice(() => effects.sample([{ url: steps[stepCount++ % 2], volume: mediaActive ? .1 : .2, rate, dur: .3 }], 'step'));
}
// Achievement card cues (map-reward-cards.js): the same CC0 library and the same mute and volume rules.
// Fly in and fly to the slot, reveal (the two rarest cards use the longer jingle), land in the slot, full set.
const cardCues = {
  whoosh: [{ url: sfx('card-whoosh'), volume: .45 }],
  reveal: [{ url: sfx('card-reveal'), volume: .6 }],
  epic: [{ url: sfx('card-epic'), volume: .6 }],
  slot: [{ url: sfx('card-slot'), volume: .6 }],
  complete: [{ url: sfx('card-complete'), volume: .6 }],
};
// Returns whether the cue sounds. The full-set jingle (2.43 s) is the all-villains fanfare: the map finale waits for it.
let jingleUntil = 0;
export function playCardCue(name) {
  const on = cardCues[name] ? effects.sample(cardCues[name]) : false;
  if (on && name === 'complete') jingleUntil = performance.now() + 2450;
  return on;
}
export const cardJingleLeft = () => Math.max(0, jingleUntil - performance.now());
export function playMapCue(kind, hits = 0) {
  if (kind === 'ready') { effects.preload([...new Set([...Object.values({ ...mapCues, ...cardCues }).flat().map(part => part.url), ...steps])]); return; }
  const cue = mapCues[kind === 'hit' ? (hits === 2 ? 'hit2' : 'hit1') : kind];
  if (cue) passVoice(() => effects.sample(cue));
}
