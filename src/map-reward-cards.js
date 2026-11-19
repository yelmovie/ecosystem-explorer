import { createRewardCards } from './reward-cards.js';
import { chapters } from './data.js';

// One achievement card per map villain, in chapter order. A villain's id is its chapter index '0'–'4'
// (map.js encounterStage(i, i, …)), so the saved hit record state.mapHits is the only source of ownership.
const TITLES = ['생태계 관찰 탐험가', '생물 역할 탐구 박사', '먹이그물 연결 달인', '환경 변화 추적 탐정', '생명의 그물 수호자'];
const base = './assets/reward-cards/';
export const REWARD_CARDS = chapters.map((chapter, index) => {
  const id = String(index), file = `${index + 1}-${id}.webp`;
  return { id, title: TITLES[index], stage: chapter.place, art: `${base}card-${file}`, thumb: `${base}thumb-${file}` };
});
const HITS = 3;
// A card is owned once its villain has taken all three hits. Nothing extra is saved.
export const ownedRewardCards = hits => REWARD_CARDS.map(({ id }) => hits?.[id] === HITS);
// Card indexes won by this save patch: only the hit that takes a villain from under three to three.
export const newRewardCards = (before, patch) => REWARD_CARDS.flatMap(({ id }, index) => before?.[id] !== HITS && patch?.[id] === HITS ? [index] : []);

let cue = () => {};
// app.js hands over the card cue of audio.js, so the cards follow the sound switch and the effects volume.
export function bindRewardSound(play) { cue = play; }

// Built on first use: tests load this module without a browser.
let instance;
function rewards() {
  return instance ??= createRewardCards({
    setName: '생명의 그물 지도 성취 카드',
    cards: REWARD_CARDS,
    theme: { accent: '#f2c14e', accent2: '#175c47', glow: '#ffe48f', ink: '#203f34' },
    particles: ['leaf', 'petal', 'drop', 'spark'],
    colors: ['#f2c14e', '#5d9d69', '#4b9aab', '#a386b8', '#dbe9b5', '#ffffff'],
    // The leaf of the app's brand mark (app.js icon('leaf')).
    emblem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19C-1 7 9 2 21 3c1 12-5 20-16 16Zm0 0L16 8"/></svg>',
    sound: name => cue(name),
    inertRoot: () => document.querySelector('#app'),
  });
}

// Cards won but not in their slot yet: index → the time its villain's exit has played and the card may open.
const pending = new Map();
// A card on its way stays empty in the header until it lands, even if the header is redrawn in between.
const shown = hits => ownedRewardCards(hits).map((owned, index) => owned && !pending.has(index));
export const rewardSlotsHtml = hits => rewards().slotsHtml(shown(hits));
// The card's turn: from the end of the villain's exit until the card sits in its slot. map.js adds it to the
// villains' blocked() so the all-villains finale waits for the card even when a dialog has delayed it.
// It reads the clock, not a timer, so a late timer can never let the finale through first.
export function rewardCardTurn(now = performance.now()) {
  for (const at of pending.values()) if (now >= at) return true;
  return false;
}
// Opens the cards won by a villain save (map.js onSave) once the exit has played: 760 ms, 520 ms with reduced motion.
// hits() is the live hit record. stage() says what the learner sees: 'open' the map, 'wait' a dialog covers it
// (the card waits for it to close), 'gone' they left the map (the slot is simply filled on the next visit).
// speaking() says whether a voice (the villain's parting line) is playing: the card waits until it has been quiet
// for 300 ms, at most 7 s after the hit. Without a voice (none, or effects off) the card keeps its 760 ms.
// The waiting card stays pending, so rewardCardTurn() still holds the map finale until it sits in its slot.
const QUIET = 300, PATIENCE = 7000;
export function awardRewardCards(before, patch, { hits, stage, speaking = () => false }) {
  const won = newRewardCards(before, patch);
  if (!won.length) return;
  const calm = globalThis.document?.documentElement.classList.contains('reduced-motion')
    || typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const index of won) {
    const delay = calm ? 520 : 760;
    const won = performance.now();
    let quietSince = 0;
    pending.set(index, won + delay);
    const show = () => {
      const now = stage();
      if (now === 'gone' || !ownedRewardCards(hits())[index]) { pending.delete(index); return; }
      if (now === 'wait') { setTimeout(show, 300); return; }
      const t = performance.now();
      if (speaking()) quietSince = 0; else quietSince ||= t;
      if (t - won < PATIENCE && (speaking() || quietSince && t - quietSince < QUIET && t - won > delay + 50)) { setTimeout(show, 100); return; }
      // The card flies in from the villain while its spot is still on screen.
      const foe = document.querySelector(`.map-encounter-foe[data-encounter="${REWARD_CARDS[index].id}"]`);
      const spot = foe?.getClientRects().length ? foe.getBoundingClientRect() : null;
      rewards().reveal(index, spot ? { x: spot.left, y: spot.top - 28 } : undefined, ownedRewardCards(hits())).finally(() => pending.delete(index));
    };
    setTimeout(show, delay);
  }
}
