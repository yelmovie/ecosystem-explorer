import test from 'node:test';
import assert from 'node:assert/strict';
import { standards, curriculumSource } from '../src/curriculum.js';
import { curriculum } from '../src/learning.js';
test('curriculum preserves verified codes, wording, source and pending teacher review',()=>{
  assert.equal(standards.length,3);
  assert.equal(new Set(standards.map(s=>s[0])).size,3);
  assert.ok(standards.every(([code,text])=>/^\[4과\d{2}-0[1-3]\]$/.test(code)&&text.endsWith('수 있다.')));
  assert.match(curriculumSource.url,/https:\/\/www\.moe\.go\.kr\//);
  assert.equal(curriculumSource.needsReview,true);
  assert.equal(curriculumSource.reviewer,null);
});
test('ten activities map to exact standards without claiming teacher approval',()=>{
  assert.equal(Object.keys(curriculum).length,10);
  for(const item of Object.values(curriculum)){
    assert.ok(item.standards.length);
    for(const mapped of item.standards)assert.deepEqual(standards.find(s=>s[0]===mapped.code),[mapped.code,mapped.text]);
    assert.equal(item.needsReview,true);assert.equal(item.reviewer,null);
  }
  assert.equal(curriculum.p03.extension,false);assert.equal(curriculum.p04.extension,true);
  assert.equal(curriculum.p10.standards.length,3);
});
