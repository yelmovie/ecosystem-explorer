import { createThemeEffects } from './theme-effects.js';
// Soft birdlike discovery tones and water-drop connections, synthesized locally.
let muted = false, mediaActive = false;
const effects = createThemeEffects('ecosystem', () => ({ muted: muted || mediaActive, volume: .75 }));
export function configureAudio(value) { muted = value; effects.sync(); }
export function stopAudio() { effects.stop(); }
export function mediaPriority(value) { mediaActive = value; effects.sync(); }
export function playSound(kind = 'tap') { effects.play(kind); }
