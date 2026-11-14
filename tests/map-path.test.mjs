import test from 'node:test';
import assert from 'node:assert/strict';
import { door, PLAZA, routeOnPaths, walkable } from '../src/map-path.js';

test('the painted path network connects the plaza and every location in both directions', () => {
  const stops=[PLAZA,...Array.from({length:5},(_,i)=>door(i))];
  for(const from of stops)for(const destination of stops){
    const route=routeOnPaths(from,destination,{exact:true});
    assert.deepEqual(route.at(-1),destination);
    let last=from;
    for(const next of route){
      const steps=Math.max(1,Math.ceil(Math.hypot(next.x-last.x,next.y-last.y)));
      for(let i=0;i<=steps;i++){
        assert.ok(walkable({x:last.x+(next.x-last.x)*i/steps,y:last.y+(next.y-last.y)*i/steps}),
          'the route must stay on the walkable path at turns and bridges');
      }
      last=next;
    }
  }
});

test('a tap on distant water does not send the explorer across it', () => {
  const river={x:548,y:110};
  assert.equal(walkable(river),false);
  assert.deepEqual(routeOnPaths(PLAZA,river),[]);
});
