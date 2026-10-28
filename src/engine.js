import { activities, foodEdges, organisms, strategies, finalElements } from './data.js';
export const SAVE_KEY = 'life-web-map:mvp:v1';
export function initialState() {
  return { version: 1, completed: [], unlocked: false, muted: false, reduced: false, last: 'map', drafts: {
    p01: { found: [], current: '' }, p02: { groups: {}, transfer: '' }, p03: { roles: {} },
    p04: { removed: 'decomposer', prediction: '', step: 0, ran: false, answer: '', restored: false, log: [] },
    p05: { edges: [], selected: '' }, p06: { removed: '', answer: '', tested: [] }, p07: { row: 0, picks: {}, solved: [] },
    p08: { policy: 'neglect', position: 50, seen: [], answer: '' }, p09: { selected: [], ran: false, reason: '', history: [] },
    p10: { phase: 'report', elements: [], edges: [], selected: '', strategies: [], initialized: false, shock: false, tested: false, trials: [] }
  } };
}
// Saved records are untrusted input. Accept only small JSON trees with safe property names.
function cleanTree(value, depth = 0) {
  if (depth > 6) return null;
  if (typeof value === 'string') return value.slice(0, 400);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(-1, Math.min(10000, value)) : 0;
  if (Array.isArray(value)) return value.slice(0, 80).map(v => cleanTree(v, depth + 1)).filter(v => v !== null);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).slice(0, 40).filter(([k]) => /^[a-z0-9_>:-]{1,60}$/i.test(k) && !['__proto__', 'constructor', 'prototype'].includes(k)).map(([k, v]) => [k, cleanTree(v, depth + 1)]));
  return null;
}
export function restoreState(raw) {
  const base = initialState();
  if (!raw || raw.version !== 1) return base;
  for (const key of ['unlocked', 'muted', 'reduced']) base[key] = raw[key] === true;
  base.completed = [...new Set(Array.isArray(raw.completed) ? raw.completed.filter(x => activities.some(a => a.id === x)) : [])];
  base.last = activities.some(a => a.id === raw.last) || raw.last === 'map' ? raw.last : 'map';
  for (const [id, defaults] of Object.entries(base.drafts)) {
    const draft = cleanTree(raw.drafts?.[id]);
    if (!draft || Array.isArray(draft)) continue;
    for (const [key, val] of Object.entries(defaults)) {
      const next = draft[key];
      if (Array.isArray(val)) defaults[key] = Array.isArray(next) ? next.filter(x => typeof x === 'string') : val;
      else if (val && typeof val === 'object') defaults[key] = next && typeof next === 'object' && !Array.isArray(next) ? Object.fromEntries(Object.entries(next).filter(([, v]) => typeof v === 'string' || typeof v === 'number')) : val;
      else if (typeof next === typeof val) defaults[key] = next;
    }
  }
  base.drafts.p04.step = Math.max(0, Math.min(2, Math.floor(base.drafts.p04.step)));
  const observationIds=['plant','water','sun','mushroom'];
  base.drafts.p01.found=[...new Set(base.drafts.p01.found.filter(x=>observationIds.includes(x)))];
  if(!observationIds.includes(base.drafts.p01.current))base.drafts.p01.current='';
  base.drafts.p02.groups=Object.fromEntries(Object.entries(base.drafts.p02.groups).filter(([k,v])=>['tree','frog','mushroom','water','sun','soil'].includes(k)&&['living','nonliving'].includes(v)));
  if(!['living','nonliving'].includes(base.drafts.p02.transfer))base.drafts.p02.transfer='';
  base.drafts.p03.roles=Object.fromEntries(Object.entries(base.drafts.p03.roles).filter(([k,v])=>['producer','consumer','decomposer'].includes(k)&&['producer','consumer','decomposer'].includes(v)));
  if (!['producer', 'consumer', 'decomposer'].includes(base.drafts.p04.removed)) base.drafts.p04.removed = 'decomposer';
  for(const key of ['prediction','answer'])if(!['food','plants','leaves'].includes(base.drafts.p04[key]))base.drafts.p04[key]='';
  if(!['grasshopper','frog'].includes(base.drafts.p06.removed))base.drafts.p06.removed='';
  base.drafts.p06.tested=[...new Set(base.drafts.p06.tested.filter(x=>['grasshopper','frog'].includes(x)))];
  base.drafts.p09.history=base.drafts.p09.history.slice(-3).filter(x=>{try{const ids=JSON.parse(x);return Array.isArray(ids)&&ids.length<=3&&ids.every(id=>strategies.some(s=>s.id===id));}catch{return false;}});
  base.drafts.p07.row = Math.max(0, Math.min(1, Math.floor(base.drafts.p07.row)));
  base.drafts.p07.solved=[...new Set(base.drafts.p07.solved.filter(x=>['0','1'].includes(x)))];
  base.drafts.p07.picks=Object.fromEntries(Object.entries(base.drafts.p07.picks).filter(([k,v])=>['action','change','impact'].includes(k)&&[0,1].includes(v)));
  base.drafts.p08.position = Math.max(0, Math.min(100, base.drafts.p08.position));
  base.drafts.p08.seen=[...new Set(base.drafts.p08.seen.filter(x=>['neglect:before','neglect:after','protect:before','protect:after'].includes(x)))];
  if (!['neglect', 'protect'].includes(base.drafts.p08.policy)) base.drafts.p08.policy = 'neglect';
  if (!['report', 'design', 'ending', 'certificate'].includes(base.drafts.p10.phase)) base.drafts.p10.phase = 'report';
  base.drafts.p05.edges = base.drafts.p05.edges.filter(e => foodEdges.includes(e));
  base.drafts.p10.edges = base.drafts.p10.edges.filter(e => foodEdges.includes(e));
  for(const draft of [base.drafts.p05,base.drafts.p10]){draft.edges=[...new Set(draft.edges)];if(!organisms.some(o=>o.id===draft.selected))draft.selected='';}
  base.drafts.p10.elements = [...new Set(base.drafts.p10.elements.filter(e => finalElements.some(x => x.id === e)))];
  for (const arr of [base.drafts.p09.selected, base.drafts.p10.strategies]) {
    const valid = [...new Set(arr.filter(id => strategies.some(s => s.id === id)))].slice(0, 3);
    arr.splice(0, arr.length, ...valid);
  }
  return base;
}
export function accessible(state, id) {
  const i = activities.findIndex(a => a.id === id);
  return i >= 0 && (state.unlocked || i === 0 || state.completed.includes(activities[i - 1].id));
}
export function evidenceCount(state) { return ['p02', 'p04', 'p06', 'p08', 'p09'].filter(id => state.completed.includes(id)).length; }
export function chapterDone(state, i) { return state.completed.includes(activities[i * 2 + 1].id); }
export function strategyCost(ids) { return strategies.filter(s => ids.includes(s.id)).reduce((n, s) => n + s.cost, 0); }
export function recovery(ids) {
  const values = [25, 25, 25];
  for (const s of strategies.filter(s => ids.includes(s.id))) s.effect.forEach((v, i) => values[i] = Math.min(100, values[i] + v));
  return values;
}
export function reachable(edges, selected = organisms.map(o => o.id), removed = '') {
  const live = new Set(selected.filter(id => id !== removed));
  const reached = new Set(live.has('plants') ? ['plants'] : []);
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of edges.filter(e => foodEdges.includes(e))) {
      const [a, b] = e.split('>');
      if (live.has(a) && live.has(b) && reached.has(a) && !reached.has(b)) { reached.add(b); changed = true; }
    }
  }
  return reached;
}
export function finalCheck(draft) {
  const reached = reachable(draft.edges, draft.elements, draft.shock ? 'grasshopper' : '');
  const checks = [
    { name: '빛·물·흙이 있어', ok: ['light', 'water', 'soil'].every(x => draft.elements.includes(x)), hint: '생물이 살아갈 비생물 요소를 놓아 줘.' },
    { name: '생산자와 분해자가 있어', ok: ['plants', 'fungi'].every(x => draft.elements.includes(x)), hint: '식물은 양분을 만들고, 버섯은 죽은 생물을 분해해.' },
    { name: '개구리·참새·뱀의 먹이가 이어져', ok: ['frog', 'sparrow', 'snake'].every(x => reached.has(x)), hint: draft.shock ? '메뚜기 없이도 남는 먹이 경로가 필요해. 애벌레가 먹는 것과 애벌레를 먹는 생물을 이어 봐.' : '식물에서 시작해 세 소비자까지 먹이 관계를 이어 줘.' },
    { name: '오염 원인과 서식처를 돌봐', ok: draft.strategies.includes('source') && draft.strategies.includes('habitat') && strategyCost(draft.strategies) <= 6, hint: '오염원 줄이기와 서식처 보호를 예산 안에 넣어 봐.' },
  ];
  return { checks, success: checks.every(c => c.ok), reached: [...reached] };
}
