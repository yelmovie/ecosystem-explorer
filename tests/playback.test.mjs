import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, finalCheck } from '../src/engine.js';
import { foodEdges, organisms } from '../src/data.js';
import { playbackStep, playbackDelay } from '../src/playback.js';

test('playback never classifies, connects a food web, or solves a causal question',()=>{
  const state=initialState(),before=structuredClone(state);
  for(const id of ['p02','p03','p05','p07'])assert.equal(playbackStep(id,state.drafts[id],0).kind,'pause');
  assert.deepEqual(state,before);
});
test('observation playback opens a clue and waits for the learner to answer',()=>{
  const d=initialState().drafts.p01;
  assert.deepEqual(playbackStep('p01',d,0).action,'observe');
  d.current='plant';assert.equal(playbackStep('p01',d,1).kind,'pause');
  d.found=['plant'];assert.equal(playbackStep('p01',d,0).value,'water');
});
test('experiment playback requires a prediction and stops at reflection',()=>{
  const d=initialState().drafts.p04;
  assert.equal(playbackStep('p04',d,0).kind,'pause');
  Object.assign(d,{ran:true,prediction:'leaves'});
  assert.equal(playbackStep('p04',d,0).action,'experiment-advance');
  d.step=2;assert.equal(playbackStep('p04',d,2).kind,'pause');
  d.restored=true;assert.equal(playbackStep('p04',d,3).kind,'pause');assert.equal(d.answer,'');
});
test('comparison playback visits both removal conditions without answering',()=>{
  const d=initialState().drafts.p06;
  const steps=Array.from({length:5},(_,i)=>playbackStep('p06',d,i));
  assert.deepEqual(steps.slice(0,4).map(s=>[s.action,s.value]),[['compare-remove','grasshopper'],['compare-remove',''],['compare-remove','frog'],['compare-remove','']]);
  assert.equal(steps[4].kind,'pause');assert.equal(d.answer,'');
});
test('time playback covers endpoints of both policies and leaves the explanation blank',()=>{
  const d=initialState().drafts.p08,steps=Array.from({length:13},(_,i)=>playbackStep('p08',d,i));
  assert.deepEqual(steps.filter(s=>s.action==='time-policy').map(s=>s.value),['neglect','protect']);
  assert.equal(steps.filter(s=>s.action==='time-jump'&&s.value==='0').length,2);
  assert.equal(steps.filter(s=>s.action==='time-jump'&&s.value==='100').length,2);
  assert.equal(steps.at(-1).kind,'pause');assert.equal(d.answer,'');
});
test('restoration playback runs only a learner-selected plan',()=>{
  const d=initialState().drafts.p09;
  assert.equal(playbackStep('p09',d,0).kind,'pause');d.selected=['clean'];
  assert.equal(playbackStep('p09',d,0).action,'strategy-run');d.ran=true;
  assert.equal(playbackStep('p09',d,1).kind,'pause');assert.equal(d.reason,'');
});
test('final playback tests a learner design and never adds answers or claims completion',()=>{
  const d=initialState().drafts.p10;d.phase='design';
  assert.equal(playbackStep('p10',d,0).kind,'pause');
  Object.assign(d,{elements:[...organisms.map(o=>o.id),'light','water','soil','fungi'],edges:[...foodEdges],strategies:['source','habitat']});
  assert.equal(finalCheck(d).success,true);assert.equal(playbackStep('p10',d,0).action,'final-run');
  d.tested=true;assert.equal(playbackStep('p10',d,1).action,'final-shock');
  d.shock=true;assert.equal(playbackStep('p10',d,2).kind,'pause');
  assert.deepEqual(d.edges,foodEdges);assert.deepEqual(d.strategies,['source','habitat']);
});
test('speed selection changes only bounded pacing',()=>{
  assert.equal(playbackDelay(.5),1800);assert.equal(playbackDelay(1),900);assert.equal(playbackDelay(2),450);
  assert.equal(playbackDelay(99),900);assert.equal(playbackDelay(NaN),900);
});
