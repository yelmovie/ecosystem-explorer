import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, restoreState, finalCheck } from '../src/engine.js';
import { specimens, roles, foodEdges } from '../src/data.js';
import { readyToRecord, nextUnplaced, nextConnection, importFoodWeb } from '../src/progress.js';

test('automatic recording keeps the required learning evidence for every activity', () => {
  const {drafts:d}=initialState();
  for(const id of Object.keys(d))assert.equal(readyToRecord(id,d[id]),false,id);
  d.p01.found=['plant','water','sun','mushroom'];
  d.p02.groups=Object.fromEntries(specimens.map(s=>[s.id,s.type]));d.p02.transfer='nonliving';
  d.p03.roles=Object.fromEntries(roles.map(r=>[r.id,r.id]));
  Object.assign(d.p04,{ran:true,step:2,restored:true,answer:'leaves'});
  d.p05.edges=[...foodEdges];
  Object.assign(d.p06,{tested:['grasshopper','frog'],answer:'paths',removed:''});
  d.p07.solved=['0','1'];
  Object.assign(d.p08,{seen:['neglect:before','neglect:after','protect:before','protect:after'],answer:'evidence'});
  Object.assign(d.p09,{selected:['source','habitat'],ran:true,reason:'source'});
  for(const id of Object.keys(d).slice(0,9))assert.equal(readyToRecord(id,d[id]),true,id);
  d.p02.groups.water='living';assert.equal(readyToRecord('p02',d.p02),false);
  d.p03.roles.consumer='producer';assert.equal(readyToRecord('p03',d.p03),false);
  d.p04.restored=false;assert.equal(readyToRecord('p04',d.p04),false);
  d.p06.tested=['frog'];assert.equal(readyToRecord('p06',d.p06),false);
  d.p08.seen.pop();assert.equal(readyToRecord('p08',d.p08),false);
  d.p09.reason='clean';assert.equal(readyToRecord('p09',d.p09),false);
});

test('card progression chooses only unplaced cards without assigning answers', () => {
  const groups={};assert.equal(nextUnplaced(specimens,groups),specimens[0].id);
  for(const s of specimens)groups[s.id]='living';
  assert.equal(nextUnplaced(specimens,groups),'');
  assert.equal(readyToRecord('p02',{groups,transfer:'nonliving'}),false);
});

test('continuous connections prioritize remaining branches then the next source', () => {
  assert.equal(nextConnection(['plants>grasshopper'],'plants','grasshopper'),'plants');
  assert.equal(nextConnection(['plants>grasshopper','plants>caterpillar'],'plants','caterpillar'),'caterpillar');
  assert.equal(nextConnection(foodEdges,'sparrow','snake'),'');
  assert.equal(nextConnection(['plants>grasshopper'],'plants','grasshopper',['plants','grasshopper','frog']),'grasshopper');
});

test('import reuses earned work while preserving environmental choices and invalidating stale tests', () => {
  const s=initialState();assert.equal(importFoodWeb(s),false);
  s.completed=['p05'];s.drafts.p05.edges=[foodEdges[0]];assert.equal(importFoodWeb(s),false);
  s.drafts.p05.edges=[...foodEdges];
  Object.assign(s.drafts.p10,{elements:['light'],strategies:['source'],tested:true,shock:true});
  assert.equal(importFoodWeb(s),true);assert.equal(importFoodWeb(s),true);
  assert.equal(s.drafts.p10.edges.length,8);assert.equal(s.drafts.p10.elements.length,7);
  assert.equal(s.drafts.p10.tested,false);assert.equal(s.drafts.p10.shock,true);
  assert.deepEqual(s.drafts.p10.strategies,['source']);assert.equal(finalCheck(s.drafts.p10).success,false);
  s.drafts.p10.edges.pop();assert.equal(s.drafts.p05.edges.length,8);
  assert.equal(readyToRecord('p05',restoreState(s).drafts.p05),true);
});
