import test from 'node:test';import assert from 'node:assert/strict';import{evaluate, createMissionStore, missionKey, restoreMissionState}from'../src/play-mission-model.js';
test('needs evidence links and organisms',()=>{assert.equal(evaluate([],[],0).ok,false);assert.equal(evaluate(['plant','insect','frog','fungus'],[],0).ok,false);assert.equal(evaluate(['plant','insect','frog','fungus'],['plant>insect','insect>frog'],0).ok,true);});
test('environment changes require care',()=>{assert.equal(evaluate(['plant','insect','frog','fungus'],['plant>insect','insect>frog'],1).ok,false);for(const level of [1,2])assert.equal(evaluate(['plant','insect','frog','fungus','water','shade'],['plant>insect','insect>frog'],level,true).ok,true);});

test('mission records recover malformed fields and clamp locked levels', () => {
  const restored = restoreMissionState({version:1, level:2, plans:[['plant']], links:[{}], won:'bad'});
  assert.equal(restored.level, 0);
  assert.equal(restored.plans[0][0], 'plant');
  assert.deepEqual(restored.links, [[], [], []]);
  assert.deepEqual(restored.won, []);
});

test('mission restore keeps legacy progress but removes links without organisms', () => {
  const restored = restoreMissionState({version:1, level:2, won:[0,1,1], plans:[['plant','insect']], links:[['plant>insect','insect>frog','plant>insect']]});
  assert.equal(restored.level, 2);
  assert.deepEqual(restored.won, [0,1]);
  assert.deepEqual(restored.links[0], ['plant>insect']);
});

function memoryStorage(value) {
  const data = new Map(value === undefined ? [] : [[missionKey, value]]);
  return {getItem:key=>data.get(key)??null, setItem:(key,value)=>data.set(key,value)};
}

test('unreadable and future mission saves stay intact during temporary play', () => {
  for (const original of ['{broken', '{"version":2,"plans":["future"]}']) {
    const storage = memoryStorage(original), store = createMissionStore(storage);
    store.state.plans[0][0] = 'plant';
    assert.equal(store.save(store.state), false);
    assert.equal(storage.getItem(missionKey), original);
    assert.match(store.message, /보호/);
  }
});

test('mission save refuses to overwrite another tab and handles unavailable storage', () => {
  const storage = memoryStorage(), store = createMissionStore(storage);
  assert.equal(store.save(store.state), true);
  storage.setItem(missionKey, '{"version":1,"level":1}');
  assert.equal(store.save(store.state), false);
  assert.match(store.message, /다른 창/);
  const denied = createMissionStore({getItem(){throw new Error('denied');}});
  assert.equal(denied.save(denied.state), false);
});
