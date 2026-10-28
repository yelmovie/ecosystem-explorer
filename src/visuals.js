// Shared 2D learning illustrations. Labels and interactive arrows stay in the DOM.
export const learningAssets = Object.freeze(Object.fromEntries([
  'plants', 'grasshopper', 'caterpillar', 'frog', 'sparrow', 'snake',
  'tree', 'mushroom', 'water', 'sun', 'soil', 'leaves', 'source', 'clean', 'sapling'
].map(id => [id, `./assets/learning-v2/${id}.webp`])));
const aliases = { plant: 'plants', producer: 'plants', consumer: 'frog', decomposer: 'mushroom', light: 'sun', fungi: 'mushroom', habitat: 'tree', trees: 'sapling' };
export function specimenArt(id, className = '') {
  const key = aliases[id] || id;
  if (!learningAssets[key]) throw new Error(`Unknown learning illustration: ${id}`);
  return `<img class="specimen-art ${className}" src="${learningAssets[key]}" alt="" width="96" height="96" decoding="async" draggable="false">`;
}
export const riverScenes = Object.freeze({
  before: './assets/learning-v2/river-before.webp',
  protect: './assets/learning-v2/river-protect.webp',
  neglect: './assets/learning-v2/river-neglect.webp'
});
export const riverDescriptions = Object.freeze({
  before: '왼쪽 배수구에서 흐린 물이 들어오고, 오른쪽 잘린 나무 주변에는 숨을 곳이 적어.',
  protect: '오염 유입을 줄인 물가에 맑은 물이 흐르고, 그루터기 주변의 풀과 관목이 생물의 숨을 곳이 됐어.',
  neglect: '오염 유입이 계속되고 쓰레기가 늘었어. 잘린 나무 주변에는 맨흙이 남아 있어.'
});
export function riverArt(kind, className = '') {
  if (!riverScenes[kind]) throw new Error(`Unknown river scene: ${kind}`);
  return `<img class="river-art ${className}" src="${riverScenes[kind]}" alt="${riverDescriptions[kind]}" width="1280" height="720" decoding="async" draggable="false">`;
}
export function restorationBoard(ids) {
  const items = [['source','오염원 줄이기'],['clean','하천 정화'],['habitat','서식처 보호'],['trees','나무 심기']];
  return `<div class="restoration-board" aria-label="실행한 복원 대책">${items.map(([id,label])=>`<div class="restoration-piece ${ids.includes(id)?'applied':''}">${specimenArt(id)}<b>${label}</b><small>${ids.includes(id)?'✓ 실행했어':'다음에 돌볼 곳'}</small></div>`).join('')}</div>`;
}
