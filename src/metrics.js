// The bars are qualitative model indices, not real populations or percentages.
export function changeFromBaseline(value, baseline = 65) {
  return value < baseline ? '처음보다 감소' : value > baseline ? '처음보다 증가' : '처음과 같음';
}
const safe = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderMetrics(values, labels = ['물 상태','서식처','숲 상태']) {
  const experiment = labels[0] === '양분 공급';
  return `<div class="metrics ${experiment ? 'baseline-metrics' : ''}" role="list" aria-label="${experiment ? '처음 상태와 비교한 모형 변화' : '생태계 돌봄 상태'}">${values.map((raw,i) => {
    const v = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0;
    const description = experiment ? changeFromBaseline(v) : v < 40 ? '돌봄 필요' : v < 70 ? '개선 중' : '좋아짐';
    return `<div role="listitem"><span>${safe(labels[i])}</span><div class="meter" aria-hidden="true"><i style="width:${v}%"></i>${experiment ? '<span class="baseline-tick" title="처음 상태"></span>' : ''}</div><b>${description}</b></div>`;
  }).join('')}</div>`;
}
