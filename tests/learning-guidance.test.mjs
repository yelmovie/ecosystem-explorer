import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, restoreState } from '../src/engine.js';
import { activityGuidance, learningNotes, curriculum } from '../src/learning.js';
import { foodEdges, organisms, practiceActions } from '../src/data.js';

test('every activity has a core concept, misconception clarification and discussion question', () => {
  assert.deepEqual(Object.keys(learningNotes), Object.keys(curriculum));
  for (const note of Object.values(learningNotes)) {
    assert.ok(note.terms.length >= 2);
    assert.ok(note.core.length > 10);
    assert.ok(note.clarify.length > 10);
    assert.ok(note.question.endsWith('?'));
  }
});

test('guidance points to correction and the next unvisited comparison instead of a completed control', () => {
  const state = initialState();
  state.drafts.p02.groups = {tree:'nonliving',frog:'living',mushroom:'living',water:'nonliving',sun:'nonliving',soil:'nonliving'};
  assert.match(activityGuidance('p02',state.drafts.p02).selector,/specimen-pick/);
  state.drafts.p08.seen = ['neglect:before','neglect:after'];
  assert.match(activityGuidance('p08',state.drafts.p08).selector,/time-policy.*protect/);
  state.drafts.p08.policy = 'protect';
  assert.match(activityGuidance('p08',state.drafts.p08).selector,/time-jump.*0/);
  state.drafts.p08.seen.push('protect:before');
  assert.match(activityGuidance('p08',state.drafts.p08).selector,/time-jump.*100/);
});

test('final design guidance follows construction, connections, care and testing', () => {
  const d = initialState().drafts.p10;
  d.phase = 'design';
  assert.match(activityGuidance('p10',d,{designTab:'elements'}).selector,/element/);
  d.elements = [...organisms.map(o=>o.id),'light','water','soil','fungi'];
  assert.match(activityGuidance('p10',d,{designTab:'elements'}).selector,/design-tab.*connections/);
  d.edges = [...foodEdges];
  assert.match(activityGuidance('p10',d,{designTab:'connections'}).selector,/design-tab.*policies/);
  d.strategies = ['source','habitat'];
  assert.match(activityGuidance('p10',d,{designTab:'policies'}).selector,/final-run/);
  d.tested = true;
  assert.match(activityGuidance('p10',d).selector,/final-shock/);
  d.shock = true;
  assert.match(activityGuidance('p10',d).selector,/final-finish/);
  d.elements = d.elements.filter(id=>id!=='caterpillar');
  assert.match(activityGuidance('p10',d,{designTab:'connections'}).selector,/design-tab.*elements/);
  assert.match(activityGuidance('p10',d,{designTab:'elements'}).text,/애벌레/);
});

test('a real-world practice plan survives reload and rejects unknown saved choices', () => {
  const state = initialState();
  assert.equal(state.drafts.p10.practice,'');
  state.drafts.p10.practice = practiceActions[0].id;
  assert.equal(restoreState(state).drafts.p10.practice,practiceActions[0].id);
  state.drafts.p10.phase = 'ending';
  assert.match(activityGuidance('p10',state.drafts.p10,{completed:true}).selector,/certificate/);
  state.drafts.p10.practice = 'unknown';
  assert.equal(restoreState(state).drafts.p10.practice,'');
  assert.equal(restoreState({version:1}).drafts.p10.practice,'');
});
