import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, restoreState, finalCheck } from '../src/engine.js';
import { activityGuidance, activityHint, learningNotes, curriculum } from '../src/learning.js';
import { foodEdges, organisms, practiceActions } from '../src/data.js';
import { voiceLines } from '../src/voice-lines.js';

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
  const cue = activityGuidance('p10',d,{designTab:'elements'});
  assert.match(cue.text,/카드.*비교/);
  assert.doesNotMatch(cue.text,/애벌레/);
  assert.match(finalCheck(d).checks[2].hint,/2 먹이 길.*비교/);
  assert.doesNotMatch(finalCheck(d).checks[2].hint,/애벌레/);
  assert.match(activityHint('p10',d,{designTab:'elements'},2),/2 먹이 길.*비교/);
});

test('deep hints follow the available observation tool and keep both conclusions open', () => {
  const { drafts } = initialState();
  assert.match(activityHint('p01',drafts.p01,{},2),/확인하지 않은 돋보기/);
  drafts.p01.current = 'mushroom';
  assert.match(activityHint('p01',drafts.p01,{},2),/두 보기.*비교/);
  assert.doesNotMatch(activityHint('p01',drafts.p01,{},2),/버섯|정답/);
  assert.match(activityHint('p04',drafts.p04,{},2),/없앨 역할.*예상 보기/);
  Object.assign(drafts.p04,{ ran:true,step:2 });
  assert.match(activityHint('p04',drafts.p04,{},2),/역할 복원을 눌러/);
  drafts.p04.restored = true;
  assert.match(activityHint('p04',drafts.p04,{},2),/막대.*비교/);
  assert.doesNotMatch(activityHint('p04',drafts.p04,{},2),/분해자|낙엽/);
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

test('the final report hint has a recording that matches the clue shown on arrival', () => {
  const draft = initialState().drafts.p10;
  assert.equal(voiceLines.find(line => line.id === 'hint-p10').text, activityHint('p10', draft));
});
