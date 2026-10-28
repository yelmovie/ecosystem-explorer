import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, restoreState, accessible, evidenceCount, chapterDone, strategyCost, recovery, reachable, finalCheck } from '../src/engine.js';
import { activities, foodEdges, chainEdges, finalElements } from '../src/data.js';

test('normal progression requires the previous activity; admin unlock never completes work', () => {
  const state=initialState();
  assert.equal(accessible(state,'p01'),true);
  assert.equal(accessible(state,'p02'),false);
  assert.equal(accessible(state,'p10'),false);
  state.completed.push('p01');
  assert.equal(accessible(state,'p02'),true);
  assert.equal(accessible(state,'p03'),false);
  state.unlocked=true;
  assert.ok(activities.every(a=>accessible(state,a.id)));
  assert.equal(evidenceCount(state),0);
  assert.deepEqual(state.completed,['p01']);
  assert.equal(accessible(state,'p99'),false);
});
test('strategy evidence and final chapter completion are separate milestones', () => {
  const state=initialState();state.completed=['p02','p04','p06','p08','p09'];
  assert.equal(evidenceCount(state),5);
  assert.equal(chapterDone(state,4),false);
  state.completed.push('p10');assert.equal(chapterDone(state,4),true);
});
test('round trip preserves in-progress observations, experiments, and sound settings', () => {
  const state=initialState();state.muted=true;state.last='p04';state.drafts.p01.found=['water','sun'];
  state.drafts.p04={removed:'decomposer',prediction:'food',step:2,ran:true,answer:'leaves',restored:true,log:['decomposer:food']};
  state.drafts.p10.elements=['plants','water'];state.drafts.p10.trials=['기본 가동: 수정 필요'];
  assert.deepEqual(restoreState(JSON.parse(JSON.stringify(state))),state);
});
test('unknown versions and malicious, oversized, malformed save data fall back safely', () => {
  assert.deepEqual(restoreState({version:99,completed:['p10']}),initialState());
  const restored=restoreState(JSON.parse('{"version":1,"unlocked":"true","completed":["p01","p01","p99",null],"drafts":{"p04":{"removed":"other","step":99},"p05":{"edges":["plants>snake","plants>grasshopper"]},"p07":{"row":999,"picks":{"__proto__":{"polluted":true}}},"p09":{"selected":["source","clean","habitat","trees","source","unknown"]},"p10":{"elements":["water","water","missing"],"phase":"error"}}}'));
  assert.equal(restored.unlocked,false);
  assert.deepEqual(restored.completed,['p01']);assert.equal(restored.drafts.p04.step,2);assert.equal(restored.drafts.p04.removed,'decomposer');
  assert.equal(restored.drafts.p07.row,1);assert.equal({}.polluted,undefined);
  assert.deepEqual(restored.drafts.p05.edges,['plants>grasshopper']);assert.ok(strategyCost(restored.drafts.p09.selected)<=6);
  assert.deepEqual(restored.drafts.p10.elements,['water']);assert.equal(restored.drafts.p10.phase,'report');
});
test('food-web paths differ after the same shock, without claiming population forecasts', () => {
  const simple=['plants','grasshopper','frog','snake'];
  assert.ok(reachable(chainEdges,simple).has('snake'));
  for(const removed of ['grasshopper','frog']){
    assert.equal(reachable(chainEdges,simple,removed).has('snake'),false);
    assert.equal(reachable(foodEdges,undefined,removed).has('snake'),true);
  }
  assert.equal(reachable(foodEdges,undefined,'plants').has('snake'),false);
  assert.equal(reachable(['plants>snake']).has('snake'),false);
});
test('corrupt activity identifiers cannot render invalid evidence or inflate exploration counts', () => {
  const state=initialState();state.drafts.p01.found=['sun','sun','unknown'];state.drafts.p07.solved=['0','55','0'];state.drafts.p07.picks={action:99,change:0,impact:'x'};state.drafts.p08.seen=['protect:after','x','protect:after'];
  const safe=restoreState(state);
  assert.deepEqual(safe.drafts.p01.found,['sun']);assert.deepEqual(safe.drafts.p07.solved,['0']);
  assert.deepEqual(safe.drafts.p07.picks,{change:0});assert.deepEqual(safe.drafts.p08.seen,['protect:after']);
});
test('different plans produce distinct outcomes and have bounded costs', () => {
  const water=['source','habitat','clean'],forest=['source','habitat','trees'];
  assert.equal(strategyCost(water),6);assert.equal(strategyCost(forest),6);
  assert.ok(recovery(water)[0]>recovery(forest)[0]);assert.ok(recovery(forest)[2]>recovery(water)[2]);
  assert.equal(strategyCost(['source','source']),2);
});
function design() { return {elements:finalElements.map(e=>e.id).filter(e=>e!=='caterpillar'),edges:['plants>grasshopper','grasshopper>frog','grasshopper>sparrow','frog>snake','sparrow>snake'],strategies:['source','habitat','trees'],shock:false}; }
test('final mission rejects empty and cosmetic-only designs, missing roles and missing policies', () => {
  assert.equal(finalCheck({elements:[],edges:[],strategies:[],shock:false}).success,false);
  const d=design();assert.equal(finalCheck(d).success,true);
  for(const element of ['light','water','soil','fungi','plants','frog','sparrow','snake']){
    assert.equal(finalCheck({...d,elements:d.elements.filter(e=>e!==element)}).success,false,element);
  }
  assert.equal(finalCheck({...d,edges:[]}).success,false);
  assert.equal(finalCheck({...d,strategies:['clean','trees']}).success,false);
  assert.equal(finalCheck({...d,strategies:['source','habitat','clean','trees']}).success,false);
});
test('successful initial design must be revised to survive grasshopper loss', () => {
  const d=design();assert.equal(finalCheck(d).success,true);
  d.shock=true;assert.equal(finalCheck(d).success,false);
  d.elements.push('caterpillar');assert.equal(finalCheck(d).success,false,'placing an animal is insufficient');
  d.edges.push('plants>caterpillar','caterpillar>frog','caterpillar>sparrow');
  assert.equal(finalCheck(d).success,true);
  d.elements=d.elements.filter(e=>e!=='water');assert.equal(finalCheck(d).success,false,'later changes invalidate success');
});
