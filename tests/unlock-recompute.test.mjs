// F15 (2026-11-21 user decision): unlocks are recomputed from the saved record, and old saved values still count,
// so a save opens the same activities as before or more, never fewer.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { restoreState, accessible, initialState } from '../src/engine.js';
import { activities } from '../src/data.js';

const ids = activities.map(a => a.id);
const open = state => ids.filter(id => accessible(state, id));
// The rule before F15: only the stored completed list and the stored unlocked flag.
const oldOpen = raw => {
  const completed = Array.isArray(raw?.completed) ? raw.completed.filter(x => ids.includes(x)) : [];
  return ids.filter((id, i) => raw?.unlocked === true || i === 0 || completed.includes(ids[i - 1]));
};
const live = JSON.parse(readFileSync(new URL('../artifacts/experience-check/completed-save.json', import.meta.url), 'utf8'));

test('a finished save in the current production format comes back unchanged', () => {
  const state = restoreState(JSON.parse(JSON.stringify(live)));
  assert.deepEqual(state.completed, live.completed);
  assert.equal(state.unlocked, false);
  assert.deepEqual(open(state), ids);
  assert.deepEqual(Object.keys(state.evidence).sort(), [...live.completed].sort());
});

test('older saves keep what they had: a completed list without evidence, and the old unlocked flag', () => {
  const legacy = { version: 1, completed: ['p01', 'p02', 'p03'], drafts: {} };
  const state = restoreState(legacy);
  assert.deepEqual(state.completed, ['p01', 'p02', 'p03']);
  assert.deepEqual(open(state), ['p01', 'p02', 'p03', 'p04']);
  // The engine keeps an old unlocked flag; storage.js then turns it off on load (since 2026-11-09) because it was the
  // teacher demo flag, not a student unlock. That rule is unchanged by F15.
  const teacher = restoreState({ version: 1, unlocked: true, completed: [], drafts: {} });
  assert.equal(teacher.unlocked, true);
  assert.deepEqual(open(teacher), ids);
});

test('a saved record opens its activity even when the completed flag was lost', () => {
  const evidence = { p01: live.evidence.p01, p02: live.evidence.p02 };
  const state = restoreState({ version: 1, completed: [], evidence, drafts: {} });
  assert.deepEqual(state.completed, ['p01', 'p02']);
  assert.equal(accessible(state, 'p03'), true);
  assert.equal(accessible(state, 'p04'), false);
  assert.deepEqual(state.evidence.p02, restoreState({ version: 1, drafts: { p02: live.evidence.p02 } }).drafts.p02);
  // Chapter 1 is done, so its villain record survives the same way as before.
  const hits = restoreState({ version: 1, completed: [], evidence, mapHits: { 0: 3 }, drafts: {} });
  assert.equal(hits.mapHits['0'], 3);
});

test('recomputed unlocks never open fewer activities than the stored values did', () => {
  const samples = [
    live,
    { version: 1, completed: ['p01'], drafts: {} },
    { version: 1, completed: ['p01', 'p02', 'p04'], evidence: { p03: live.evidence.p03 }, drafts: {} },
    { version: 1, completed: ['p05', 'p01'], evidence: { p02: live.evidence.p02, p09: live.evidence.p09 }, drafts: {} },
    { version: 1, unlocked: true, completed: ['p01'], drafts: {} },
    { version: 1, completed: ids, evidence: {}, drafts: {} },
  ];
  for (const raw of samples) {
    const state = restoreState(JSON.parse(JSON.stringify(raw)));
    const before = oldOpen(raw), after = open(state);
    assert.ok(before.every(id => after.includes(id)), `lost ${before.filter(id => !after.includes(id))}`);
    for (const id of raw.completed) assert.ok(state.completed.includes(id), `dropped ${id}`);
    assert.equal(new Set(state.completed).size, state.completed.length);
  }
});

test('broken records never unlock anything and never break the restore', () => {
  for (const evidence of [null, 'p05', ['p05'], { p05: 'done' }, { p05: ['x'] }, { p99: {} }, { __proto__: { p05: {} } }, { constructor: {} }, { p05: null }]) {
    const state = restoreState({ version: 1, completed: ['p01'], evidence, drafts: {} });
    assert.deepEqual(state.completed, ['p01']);
    assert.deepEqual(open(state), ['p01', 'p02']);
  }
  assert.deepEqual(restoreState({ version: 2, completed: ids, evidence: live.evidence }).completed, []);
  assert.deepEqual(restoreState(null), initialState());
});
