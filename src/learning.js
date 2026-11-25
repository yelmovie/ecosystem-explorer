import { learningNotes } from './teaching-content.js';
export { learningNotes, curriculum } from './teaching-content.js';
import { finalCheck } from './engine.js';
import { activities, specimens, seawaterFeedback, roles } from './data.js';
// Shared, activity-specific learning cues. Hints reveal reasoning in three steps.
// One clock for each concept film: the film's scene cuts, the VTT captions, the caption
// highlight and the scene buttons all read these numbers (see films/ and tests/concept-timing).
export const conceptClock = { duration: 15, cues: [0, 5, 10] };
export const concepts = {
  p01: { title: '움직이면 모두 생물일까?', lines: ['물은 흐르지만 스스로 자라거나 번식하지 않아.', '풀과 버섯은 자라는 생물이야.', '움직임 하나보다 살아가는 특징을 살펴봐.'], nodes: ['water','plant','fungi'] },
  p02: { title: '함께 이루는 생태계', lines: ['생물은 자라고 살아가는 특징이 있어.', '햇빛·물·흙은 생물이 살아갈 환경이야.', '생물과 비생물 요소가 함께 생태계를 이뤄.'], nodes: ['plant','sun','water'] },
  p03: { title: '양분을 얻는 세 가지 방법', lines: ['생산자는 햇빛을 이용해 양분을 만들어.', '소비자는 다른 생물을 먹어 양분을 얻어.', '분해자는 죽은 생물을 분해하며 양분을 얻어.'], nodes: ['plant','frog','fungi'] },
  p04: { title: '한 역할이 사라지면', lines: ['한 가지 역할만 없애고 변화를 비교해.', '분해자가 없으면 죽은 생물의 분해가 느려져.', '다시 복원해서 역할과 변화의 관계를 확인해.'], nodes: ['plant','frog','fungi'] },
  p05: { title: '화살표는 어느 쪽으로?', lines: ['풀은 메뚜기에게 먹혀.', '메뚜기는 개구리에게 먹혀.', '화살표는 먹히는 생물에서 먹는 생물로 향해.'], nodes: ['plant','insect','frog'] },
  p06: { title: '다른 먹이 길이 있다면', lines: ['메뚜기로 이어진 한 먹이 길을 살펴봐.', '메뚜기가 사라져 한 먹이 길이 끊어졌어.', '다른 먹이 길이 남아도 물과 서식처는 중요해.'], nodes: ['plant','insect','frog','caterpillar'] },
  p07: { title: '변화의 원인을 이어 보자', lines: ['오염 물질을 흘려보내면 물이 오염돼.', '물이 오염되면 물속 생물이 살기 어려워져.', '사람의 행동 → 환경 변화 → 생물의 영향을 살펴봐.'], nodes: ['pipe','water','fish'] },
  p08: { title: '같은 장소, 달라진 내일', lines: ['아무 대책 없이 지낸 물가를 관찰해.', '오염원을 줄이고 서식처를 보호한 물가와 비교해.', '같은 조건에서 전후를 비교해야 차이를 알 수 있어.'], nodes: ['water','tree','frog'] },
  p09: { title: '자원은 한정되어 있어', lines: ['한 대책으로 모든 문제를 해결하기는 어려워.', '오염 원인과 서식처를 함께 돌봐.', '작전을 바꾸고 결과를 비교해 더 나은 선택을 해.'], nodes: ['pipe','tree','water'] },
  p10: { title: '시험하고 고치는 생태 탐험가', lines: ['빛·물·흙과 생물의 역할을 갖추고 먹이 길을 이어.', '메뚜기가 사라졌을 때도 먹이 길이 남는지 시험해.', '결과를 보고 고치는 과정이 생태계 설계야.'], nodes: ['sun','plant','frog','fungi'] },
};
for (const c of Object.values(concepts)) Object.assign(c, { duration: conceptClock.duration, cues: [...conceptClock.cues] });

// The notebook gives observable descriptions. Students match these clues to the pictured organisms.
export const foodEvidence = {
  plants: '햇빛을 이용해 스스로 양분을 만들어.',
  grasshopper: '풀밭에서 뛰어다니며 턱으로 풀잎을 갉아 먹어.',
  caterpillar: '잎 위를 기어 다니며 풀잎이나 나뭇잎을 갉아 먹어.',
  frog: '잎을 갉아 먹는 곤충을 혀로 낚아채.',
  sparrow: '이 먹이그물에서는 잎을 갉아 먹는 곤충을 찾아 부리로 잡아.',
  snake: '이 먹이그물에서는 물가에서 뛰는 작은 동물과 날개 달린 작은 새를 사냥해.',
};

export const hints = {
  p01: ['풍경의 돋보기 네 곳을 눌러 특징을 관찰해.', '움직이는지만 보지 말고 자라는지 생각해 봐.', '돋보기를 누르고 설명을 다시 읽어 봐. 그림에서 확인한 특징을 두 보기와 비교해.'],
  p02: ['선택된 카드를 읽고 생물·비생물 상자를 눌러. 끌어 놓아도 돼.', '카드가 스스로 자라고 살아가는지 생각해 봐.', '옮길 카드를 다시 눌러. 카드의 특징을 두 상자의 분류 기준과 비교해 봐.'],
  p03: ['선택된 관찰 카드를 읽고 맞는 역할을 눌러 줘. 끌어 놓아도 돼.', '카드의 문장에서 양분을 어디서 어떻게 얻는지 찾아봐.', '관찰 카드를 다시 눌러. 양분을 얻는 방법을 세 상자의 역할 설명과 비교해 봐.'],
  p04: ['없앨 역할을 고른 뒤 예상을 누르면 실험이 시작돼.', '역할을 뺀 뒤 어떤 막대가 달라졌는지 살펴봐.', '짙은 세로선(처음 상태)과 지금 막대를 비교해. 달라진 항목을 보기에서 찾아봐.'],
  p05: ['생물에서 다른 생물로 끌어 연결해. 눌러 연결하면 다음 출발점이 선택돼.', '먹히는 생물에서 먹는 생물 쪽으로 이어. 수첩에서 먹이를 확인해.', '먹이 수첩을 눌러 내가 이으려는 두 생물의 기록을 찾아봐. 그 관계와 화살표 방향을 비교해.'],
  p06: ['생물을 제거하고 A와 B에서 남은 선을 살펴봐.', '두 모형에서 같은 생물을 뺐을 때 어디까지 길이 이어지는지 봐.', '같은 제거 버튼을 눌러 놓고 A와 B에서 뱀까지 선을 따라가 봐. 끊긴 곳과 남은 곳을 비교해.'],
  p07: ['현장 단서를 읽고 맞는 카드를 눌러. 빈칸에 바로 놓여.', '단서에서 처음에 일어난 일과 그 뒤 달라진 것을 찾아봐.', '현장 단서와 빈칸 제목을 다시 읽어 봐. 고른 카드가 그 칸의 질문에 답하는지 비교해.'],
  p08: ['사진 위를 직접 쓸어 전후를 비교해 봐.', '위의 대책 카드를 누르면 시간이 흘러. 사진 위를 쓸어서 다시 볼 수도 있어.', '다른 대책을 눌러 같은 곳을 다시 봐. 배수구 아래와 그루터기 주변이 각각 어떻게 달라졌는지 비교해.'],
  p09: ['대책을 고르고 작전을 실행해. 6포인트 안에서 바꿀 수 있어.', '대책 카드가 바꾸려는 것과 작전 결과의 막대를 비교해 봐.', '작전 바꾸기를 눌러 대책 하나만 바꿔 봐. 다시 실행하고 이전 작전과 같은 항목의 막대를 비교해.'],
  p10: ['조사 기록을 참고해서 요소와 먹이 길, 보전 대책을 살펴봐.', '점검 기록에서 확인할 항목을 찾아 해당 탭을 눌러 봐.', '해당 탭에서 한 가지를 바꾸고 다시 시험해. 점검 기록에서 바꾸기 전과 뒤를 비교해 봐.'],
};

// Start with the current tool; deeper hints explain how to inspect the evidence.
export function activityHint(id, d, context = {}, level = 0) {
  const guidance = activityGuidance(id, d, context);
  const hint = hints[id]?.[level];
  // A replay still needs the current experiment's clue, even after its first record.
  if (id === 'p04' && hint && level > 0) {
    if (d.restored) return '역할을 되돌린 지금은 세 막대가 처음 상태와 같아. 되돌리기 전 관찰 기록과 비교해.';
    if (!d.ran) return '없앨 역할을 하나 눌러. 그 역할을 빼면 무엇이 달라질지 아래 예상 보기와 비교해.';
    if (d.step < 2) return '막대가 바뀌는 모습을 봐. 곧 마지막 모습이 나와.';
    if (level === 1) return '짙은 세로선은 처음 상태야. 지금 막대의 끝과 비교하고 그림의 변화도 살펴봐.';
    return '짙은 세로선과 지금 막대를 비교해. 양분 공급, 소비자, 분해 활동 중 무엇이 달라졌는지 보고 설명을 골라.';
  }
  if (context.completed || !hint) return guidance.text || hint || '';
  if (level === 0) {
    const initial = (id === 'p01' && !d.current && !d.found.length) ||
      (id === 'p02' && !Object.keys(d.groups).length) || (id === 'p03' && !Object.keys(d.roles).length) ||
      (id === 'p04' && !d.ran) || (id === 'p05' && !d.selected && !d.edges.length) ||
      (id === 'p06' && !d.tested.length) || (id === 'p07' && !d.row && !Object.keys(d.picks).length) ||
      (id === 'p08' && !d.seen.length) || (id === 'p09' && !d.selected.length);
    return initial ? hint : guidance.text;
  }
  if (level === 2) {
    if (id === 'p01' && (!d.current || d.found.includes(d.current))) return '아직 살펴보지 않은 돋보기 표시를 눌러. 무엇이 보이는지 자세히 봐.';
    if (id === 'p02' && guidance.selector?.includes('transfer')) return seawaterFeedback.hint;
    if (id === 'p09' && !(context.strategyReflect ?? d.ran)) return d.selected.length
      ? '작전 실행을 눌러. 결과의 막대를 보고 다음에 다시 비교할 항목을 골라 봐.'
      : '대책 카드를 눌러. 카드마다 바꾸려는 것과 남은 자원을 비교해 봐.';
    if (id === 'p10') {
      if (d.phase !== 'design' || guidance.selector?.includes('final-finish') || guidance.selector?.includes('final-shock')) return guidance.text;
      if (!d.tested) {
        if (guidance.selector?.includes('final-run')) return d.shock
          ? '수정안 시험을 눌러. 바꾸기 전과 뒤에 어떤 먹이 길이 남았는지 시험 기록을 비교해.'
          : '생태계 시험을 눌러. 결과를 읽고 다시 살펴볼 항목을 골라 봐.';
        return guidance.text;
      }
      return finalCheck(d).checks.find(check=>!check.ok)?.hint || guidance.text;
    }
  }
  return hint;
}
// One learning cue and one matching target keep instructions aligned with the UI.
export function activityGuidance(id, d, context = {}) {
  const action = (text, selector) => ({text, selector});
  const options = (text, selector) => ({text, selector, group: true});
  if (id === 'p10' && d.phase === 'ending') return d.practice
    ? action('탐험 인증서를 받아 봐.','[data-action="final-phase"][data-value="certificate"]')
    : action('내일 해 볼 일을 하나 골라 봐.','[data-action="practice-show"]');
  if (id === 'p10' && d.phase === 'certificate') return action('내 탐험 인증서를 보관해.','[data-action="print"]');
  // The completion line beside the buttons already says what was found; the cue only names the next button.
  const replayingExperiment = id === 'p04' && (!d.restored || d.answer !== roles.find(role => role.id === d.removed).prediction);
  if (context.completed && id !== 'p10' && !replayingExperiment) return action(activities.findIndex(a => a.id === id) % 2 === 1
    ? '지도로 돌아가 변화를 살펴봐.'
    : '다음 장소를 탐험해.','[data-action="completion-next"]');
  switch (id) {
    case 'p01': return d.current && !d.found.includes(d.current)
      ? options('눈으로 본 특징과 맞는 설명을 골라.','[data-action="observe-answer"]')
      : options('돋보기 표시를 누르거나 큰 돋보기를 옮겨 봐.','.hotspot:not(.found)');
    case 'p02': {
      const selected = context.selectedSpecimen || specimens.find(item => !d.groups[item.id])?.id;
      if (selected) return options(`${specimens.find(item => item.id===selected).name} 카드를 어느 상자에 놓을까?`,'[data-action="specimen-place"]');
      if (!specimens.every(item => d.groups[item.id]===item.type)) return options('다시 살펴볼 카드를 골라 봐.','[data-action="specimen-pick"]');
      return options('바닷물 자체를 두 상자 중 어디에 놓을까?','[data-action="transfer"]');
    }
    case 'p03': {
      const selected = context.selectedRole || roles.find(role => !d.roles[role.id])?.id;
      return selected
        ? options(`${roles.find(role => role.id===selected).target}에게 맞는 역할 도장을 골라.`,'[data-action="role-place"]')
        : options('다시 살펴볼 카드를 골라 봐.','[data-action="role-pick"]');
    }
    case 'p04':
      if (!d.ran) return options(`${roles.find(role => role.id===d.removed).name}가 사라질 때를 예상해 봐.`,'[data-action="prediction"]');
      if (d.step<2) return action('모형의 막대가 어떻게 바뀌는지 봐.','');
      return options('막대의 변화와 맞는 설명을 골라.','[data-action="experiment-answer"]');
    case 'p05': return d.selected
      ? options('이 생물을 먹는 쪽을 골라.',`.web-node:not([data-value="${d.selected}"])`)
      : options('먹히는 생물에서 먹는 생물로 이어 봐.','.web-node');
    case 'p06': {
      const next = ['grasshopper','frog'].find(value => !d.tested.includes(value));
      return next
        ? options(`${next==='grasshopper'?'메뚜기':'개구리'}를 빼고 두 먹이 길을 비교해.`,`[data-action="compare-remove"][data-value="${next}"]`)
        : options('두 모형의 변화가 다른 까닭을 골라.','[data-action="compare-answer"]');
    }
    case 'p07': {
      const next = ['action','change','impact'].find(key => d.picks[key]===undefined);
      const names = {action:'사람의 행동',change:'환경 변화',impact:'생물의 영향'};
      return next
        ? options(`단서를 보고 「${names[next]}」에 들어갈 말을 골라.`,`[data-action="cause-pick"][data-value^="${next}:"]`)
        : options('단서와 다시 비교해 볼 카드를 골라.','[data-action="cause-pick"]');
    }
    case 'p08': {
      if (d.seen.length===4) return options('두 물가를 비교해서 알게 된 사실을 골라.','[data-action="time-answer"]');
      const next = ['neglect','protect'].find(p => !d.seen.includes(`${p}:before`) || !d.seen.includes(`${p}:after`));
      return action(next==='neglect'
        ? '대책 없이 지낸 물가의 변화를 봐.'
        : '대책을 세웠을 때 같은 물가의 변화를 봐.',`[data-action="time-policy"][data-value="${next}"]`);
    }
    case 'p09': {
      const showingResult = context.strategyReflect ?? d.ran;
      if (showingResult) return options('먼저 해결하려 한 문제를 골라.','[data-action="strategy-reason"]');
      return d.selected.length
        ? action('고른 대책을 시험해 봐.','[data-action="strategy-run"]')
        : options('동전을 쓸 대책을 골라.','[data-action="strategy"]');
    }
    case 'p10': {
      if (d.phase==='report') return action('앞에서 모은 증거를 살펴보고 설계를 시작해.','[data-action="final-start"]');
      const result = finalCheck(d);
      const basicElements = ['light','water','soil','plants','fungi','frog','sparrow','snake'].every(value => d.elements.includes(value));
      const hasPrey = d.shock ? d.elements.includes('caterpillar') : ['grasshopper','caterpillar'].some(value => d.elements.includes(value));
      if (!basicElements || !hasPrey) return context.designTab==='elements'
        ? options(d.shock&&!hasPrey?'빠진 생물 없이 이어질까? 모형과 카드를 비교해 봐.':'모형에 놓을 요소를 골라.','[data-action="element"]')
        : action('「1 요소」에서 모형에 넣을 카드를 살펴봐.','[data-action="design-tab"][data-value="elements"]');
      if (!result.checks[2].ok) return context.designTab==='connections'
        ? options('먹히는 생물에서 먹는 생물로 이어 봐.','.web-node')
        : action('2 먹이 길을 눌러 화살표가 어디까지 이어지는지 살펴봐.','[data-action="design-tab"][data-value="connections"]');
      if (!result.checks[3].ok) return context.designTab==='policies'
        ? options('물가를 돌볼 대책을 골라.','[data-action="final-strategy"]')
        : action('3 보전 대책을 눌러 물가를 돌볼 방법을 골라.','[data-action="design-tab"][data-value="policies"]');
      if (!d.tested) return action(d.shock?'수정안 시험을 눌러 바꾼 먹이 길을 확인해.':'생태계 시험을 눌러 설계를 확인해.','[data-action="final-run"]');
      return d.shock
        ? action('변화 시험 통과! 복원 완료를 눌러 탐험을 마무리해.','[data-action="final-finish"]')
        : action('이번에는 메뚜기 없이 시험을 눌러 다른 먹이 길이 남는지 확인해.','[data-action="final-shock"]');
    }
    default: return action('','');
  }
}
export function nextCue(id, d, context) {
  return activityGuidance(id,d,context).text;
}
