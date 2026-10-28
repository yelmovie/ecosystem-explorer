import { specimens, roles, foodEdges, organisms } from './data.js';
import { strategyCost } from './engine.js';

// Readiness is shared by automatic recording and explicit review. It never mutates a draft.
export function readyToRecord(id, d) {
  if (!d) return false;
  switch (id) {
    case 'p01': return d.found.length === 4;
    case 'p02': return specimens.every(s => d.groups[s.id] === s.type) && d.transfer === 'nonliving';
    case 'p03': return roles.every(r => d.roles[r.id] === r.id);
    case 'p04': return d.ran && d.restored && d.step === 2 && d.answer === roles.find(r => r.id === d.removed)?.prediction;
    case 'p05': return foodEdges.every(e => d.edges.includes(e));
    case 'p06': return ['grasshopper', 'frog'].every(id => d.tested.includes(id)) && d.answer === 'paths';
    case 'p07': return ['0', '1'].every(id => d.solved.includes(id));
    case 'p08': return ['neglect:before', 'neglect:after', 'protect:before', 'protect:after'].every(id => d.seen.includes(id)) && d.answer === 'evidence';
    case 'p09': return d.ran && d.selected.includes(d.reason) && strategyCost(d.selected) <= 6;
    default: return false;
  }
}

export function nextUnplaced(items, placements) {
  return items.find(item => !placements[item.id])?.id || '';
}

export function nextConnection(edges, from, to, active = organisms.map(o => o.id)) {
  const hasNext = id => foodEdges.some(edge => edge.startsWith(`${id}>`) && active.includes(edge.split('>')[1]) && !edges.includes(edge));
  return hasNext(from) ? from : hasNext(to) ? to : '';
}

// Copy only a completed, still valid web; keep environmental choices and existing work.
export function importFoodWeb(state) {
  if (!state.completed.includes('p05') || !readyToRecord('p05', state.drafts.p05)) return false;
  const d = state.drafts.p10;
  d.elements = [...new Set([...d.elements, ...organisms.map(o => o.id)])];
  d.edges = [...new Set([...d.edges, ...state.drafts.p05.edges.filter(e => foodEdges.includes(e))])];
  d.selected = '';
  d.tested = false;
  return true;
}
