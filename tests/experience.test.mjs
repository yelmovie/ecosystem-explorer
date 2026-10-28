import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState,restoreState,recovery } from '../src/engine.js';
import { nextCue,concepts,hints } from '../src/learning.js';
import { finalView } from '../src/experiences.js';

test('old save records migrate to new comparison and strategy defaults',()=>{
  const state=restoreState({version:1,completed:['p01','p02'],drafts:{p06:{removed:'frog',answer:'paths'},p09:{selected:['clean'],ran:true,reason:'clean'}}});
  assert.deepEqual(state.drafts.p06.tested,[]);assert.deepEqual(state.drafts.p09.history,[]);assert.deepEqual(state.completed,['p01','p02']);
});
test('restored experiment and strategy histories remain bounded and valid',()=>{
  const state=initialState();state.drafts.p06.tested=['frog','frog','grasshopper','snake'];state.drafts.p09.history=['bad','["missing"]','["source","habitat"]'];
  const safe=restoreState(state);assert.deepEqual(safe.drafts.p06.tested,['frog','grasshopper']);assert.deepEqual(safe.drafts.p09.history,['["source","habitat"]']);assert.deepEqual(recovery(JSON.parse(safe.drafts.p09.history[0])),[60,70,30]);
});
test('learning cues follow current experiment conditions and ask for both removal trials',()=>{
  const d=initialState().drafts;assert.match(nextCue('p04',d.p04),/예상/);d.p04.prediction='leaves';d.p04.ran=true;assert.match(nextCue('p04',d.p04),/시간/);d.p04.step=2;assert.match(nextCue('p04',d.p04),/복원/);
  d.p06.removed='frog';d.p06.tested=['frog'];assert.match(nextCue('p06',d.p06),/다른 생물/);d.p06.tested.push('grasshopper');assert.match(nextCue('p06',d.p06),/까닭/);
});
test('every activity has its own concept and three progressively revealed hints',()=>{
  for(const[id,c]of Object.entries(concepts)){assert.equal(c.lines.length,3);assert.equal(hints[id].length,3);assert.ok(c.title&&c.nodes.length>=3);}assert.equal(Object.keys(concepts).length,10);
});
test('restored final trial text cannot insert HTML into the design board',()=>{
  const d=initialState().drafts.p10;d.trials=['<img src=x onerror=alert(1)>'];
  const html=finalView(d,{btn:()=>'',choice:()=>'',icon:()=>'',tag:()=>'',webGraph:()=>''},'elements');
  // Learning illustrations are valid img tags; saved trial text must remain text.
  assert.ok(!html.includes(d.trials[0]));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.doesNotMatch(html, /<img\b[^>]*\bonerror\s*=/i);
});
