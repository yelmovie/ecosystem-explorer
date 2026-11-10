import test from 'node:test';
import assert from 'node:assert/strict';
import { changeFromBaseline, renderMetrics } from '../src/metrics.js';
test('시간 관찰 중 작은 변화도 처음 상태와 비교해서 설명한다', () => {
  assert.equal(changeFromBaseline(49), '처음보다 감소');
  assert.equal(changeFromBaseline(70), '처음보다 증가');
  assert.equal(changeFromBaseline(65), '처음과 같음');
});
test('실험 막대는 기준선을 제공하고 실제 백분율로 읽히지 않는다', () => {
  const html = renderMetrics([49,70,65], ['양분 공급','소비자','분해 활동']);
  assert.equal((html.match(/baseline-tick/g) || []).length, 3);
  assert.match(html, /처음보다 감소/); assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /role="progressbar"/);
  assert.doesNotMatch(renderMetrics([60,70,30]), /baseline-tick/);
});
