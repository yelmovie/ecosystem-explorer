import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, restoreState} from '../src/engine.js';
test('legacy saves preserve learning and initialize repair records',()=>{const old=initialState();const before=restoreState(old);assert.deepEqual(before.mapRepairs,[]);const next=restoreState({...old,mapRepairs:[0,2,2,4,-1,5,'1',null]});assert.deepEqual(next.mapRepairs,[0,2,4]);delete before.mapRepairs;delete next.mapRepairs;assert.deepEqual(next,before);});
test('completed repair survives serialization without awarding learning',()=>{const s=initialState();s.mapRepairs=[1];assert.deepEqual(restoreState(JSON.parse(JSON.stringify(s))).mapRepairs,[1]);});
