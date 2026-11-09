import test from 'node:test';
import assert from 'node:assert/strict';
import { curriculum, concepts } from '../src/learning.js';
test('every activity carries a learning objective and review metadata', () => {
  assert.deepEqual(Object.keys(curriculum).sort(), Object.keys(concepts).sort());
  for (const [id, c] of Object.entries(curriculum)) {
    assert.ok(c.objective.length > 10, id);
    assert.equal(c.unit, '생물과 환경');
    assert.match(c.standardArea, /^4과\d+$/);
    assert.equal(typeof c.needsReview, 'boolean');
    if (c.needsReview) assert.ok(c.reviewNote, id);
  }
});
