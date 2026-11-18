import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { REWARD_CARDS, ownedRewardCards, newRewardCards, awardRewardCards, rewardCardTurn } from '../src/map-reward-cards.js';
import { chapters } from '../src/data.js';

const root = new URL('../', import.meta.url);

test('one achievement card per map villain, in chapter order, with its art and thumbnail', () => {
  assert.deepEqual(REWARD_CARDS.map(card => card.id), ['0', '1', '2', '3', '4']);
  assert.deepEqual(REWARD_CARDS.map(card => card.stage), chapters.map(chapter => chapter.place));
  assert.equal(new Set(REWARD_CARDS.map(card => card.title)).size, 5);
  for (const [index, card] of REWARD_CARDS.entries()) for (const file of [card.art, card.thumb]) {
    assert.match(file, new RegExp(`^\\./assets/reward-cards/(card|thumb)-${index + 1}-${index}\\.webp$`));
    assert.ok(existsSync(new URL(file, root)), file);
  }
});

test('a card is owned only after the third hit, from the existing hit record', () => {
  assert.deepEqual(ownedRewardCards({}), [false, false, false, false, false]);
  assert.deepEqual(ownedRewardCards(undefined), [false, false, false, false, false]);
  assert.deepEqual(ownedRewardCards({ 0: 3, 1: 2, 3: 3 }), [true, false, false, true, false]);
});

test('a card is won only by the hit that takes a villain from under three to three', () => {
  assert.deepEqual(newRewardCards({}, { 1: 1 }), []);
  assert.deepEqual(newRewardCards({ 1: 2 }, { 1: 3 }), [1]);
  assert.deepEqual(newRewardCards({ 1: 3 }, { 1: 3 }), []);
  assert.deepEqual(newRewardCards({ 0: 3, 4: 2 }, { 0: 3, 4: 3 }), [4]);
});

test('the card keeps its turn from the end of the exit until it is settled, so the finale cannot pass it', async () => {
  assert.equal(rewardCardTurn(), false);
  let stage = 'wait';
  const hits = { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3 };
  awardRewardCards({ ...hits, 4: 2 }, { 4: 3 }, { hits: () => hits, stage: () => stage });
  const hit = performance.now();
  assert.equal(rewardCardTurn(hit), false, 'the villain is still leaving');
  assert.equal(rewardCardTurn(hit + 2920), true, 'by the finale time the turn is taken, whatever the timers did');
  await new Promise(resolve => setTimeout(resolve, 900));
  assert.equal(rewardCardTurn(), true, 'a dialog over the map keeps the turn');
  stage = 'gone';
  await new Promise(resolve => setTimeout(resolve, 400));
  assert.equal(rewardCardTurn(), false, 'leaving the map gives the turn up; the slot is filled from the record');
});

test('the card sounds and the build copy list ship with the cards', () => {
  for (const name of ['whoosh', 'reveal', 'epic', 'slot', 'complete']) assert.ok(existsSync(new URL(`assets/audio/sfx/card-${name}.mp3`, root)), name);
  assert.match(readFileSync(new URL('scripts/build.mjs', root), 'utf8'), /'reward-cards'/);
});
