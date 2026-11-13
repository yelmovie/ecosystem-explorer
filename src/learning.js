import { learningNotes } from './teaching-content.js';
export { learningNotes, curriculum } from './teaching-content.js';
import { finalCheck } from './engine.js';
import { specimens, roles, organisms } from './data.js';
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
export const hints = {
  p01: ['풍경의 돋보기 네 곳을 눌러 특징을 관찰해.', '움직이는지만 보지 말고 자라는지 생각해 봐.', '버섯도 자라는 생물이야. 물과 햇빛은 생활에 필요한 환경이지.'],
  p02: ['선택된 카드를 읽고 생물·비생물 상자를 눌러. 끌어 놓아도 돼.', '스스로 자라고 살아가는 특징이 있는지 생각해.', '버섯은 생물이고, 물·햇빛·흙은 비생물 요소야.'],
  p03: ['선택된 관찰 카드를 읽고 맞는 역할을 눌러 줘. 끌어 놓아도 돼.', '스스로 만드는가, 다른 생물을 먹는가, 죽은 생물을 분해하는가?', '풀은 생산자, 개구리는 소비자, 버섯은 분해자야.'],
  p04: ['없앨 역할을 고른 뒤 예상을 누르면 실험이 시작돼.', '시간이 흐르며 달라지는 모습을 보고, 원래 상태로 복원해서 비교해.', '분해자가 없으면 낙엽이 쌓여. 결과와 맞는 관찰 기록을 골라.'],
  p05: ['생물에서 다른 생물로 끌어 연결해. 눌러 연결하면 다음 출발점이 선택돼.', '먹히는 생물에서 먹는 생물 쪽으로 이어. 수첩에서 먹이를 확인해.', '식물→메뚜기·애벌레, 두 곤충→개구리·참새, 개구리·참새→뱀이야.'],
  p06: ['생물을 제거하고 A와 B에서 남은 선을 살펴봐.', '선 위를 움직이는 점은 식물에서 출발해 먹이 길을 따라 이동하는 양분이야.', 'B에는 애벌레를 거쳐 개구리와 참새로 가는 길이 남아 있어.'],
  p07: ['현장 단서를 읽고 맞는 카드를 눌러. 빈칸에 바로 놓여.', '물가와 숲의 두 사건을 모두 조사해야 해.', '오염 물질→물의 오염→물속 생물이 살기 어려움. 나무 베기→서식처 감소→새의 공간 감소야.'],
  p08: ['사진 위를 직접 쓸어 전후를 비교해 봐.', '두 대책에서 각각 변화 전·후 보기 버튼을 누르거나 손잡이를 양 끝까지 움직여.', '네 장면을 비교한 뒤 질문에 답해. 오염원과 서식처를 돌본 곳의 변화를 살펴봐.'],
  p09: ['대책을 고르고 작전을 실행해. 6포인트 안에서 바꿀 수 있어.', '한 번의 결과와 다음 작전의 결과를 막대에서 비교해.', '오염원 줄이기는 오염이 들어오는 원인을 줄여. 서식처 보호는 생물이 사는 곳을 지켜.'],
  p10: ['완성한 먹이그물을 가져오거나 직접 연결해. 빛·물·흙과 분해자도 필요해.', '시험 결과에서 부족한 조건을 확인하고 고쳐 봐.', '빛·물·흙·식물·버섯, 다른 먹이 길, 오염원 줄이기와 서식처 보호를 갖춰.'],
};
// One learning cue and one matching target keep instructions aligned with the UI.
export function activityGuidance(id, d, context = {}) {
  const action = (text, selector) => ({text, selector});
  if (id === 'p10' && d.phase === 'ending') return d.practice
    ? action('실천 약속을 골랐어. 탐험 인증서를 받아 보자.','[data-action="final-phase"][data-value="certificate"]')
    : action('탐험 완료! 생활 속에서 해 볼 실천을 하나 골라 봐.','[data-action="practice-show"]');
  if (id === 'p10' && d.phase === 'certificate') return action('내 탐험 기록과 실천 약속을 살펴봐. 인증서를 인쇄할 수 있어.','[data-action="print"]');
  if (context.completed && id !== 'p10') return action('기록 완료! 다음 탐험에서 배운 것을 이어 써 보자.','[data-action="completion-next"]');
  switch (id) {
    case 'p01': return d.current && !d.found.includes(d.current)
      ? action('관찰한 특징과 맞는 설명을 골라.','[data-action="observe-answer"]')
      : action(`돋보기를 눌러 생물의 특징을 찾아. ${d.found.length}/4`,'.hotspot:not(.found)');
    case 'p02': {
      const selected = context.selectedSpecimen || specimens.find(item => !d.groups[item.id])?.id;
      if (selected) return action(`${specimens.find(item => item.id===selected).name} 카드를 놓을 상자를 눌러. 생물일까, 비생물일까?`,'[data-action="specimen-place"]');
      if (!specimens.every(item => d.groups[item.id]===item.type)) return action('상자 속 카드를 다시 골라 알맞은 상자로 옮겨 봐.','[data-action="specimen-pick"]');
      return action('바닷물도 같은 기준으로 나눠 봐. 생물일까, 비생물일까?','[data-action="transfer"]');
    }
    case 'p03': {
      const selected = context.selectedRole || roles.find(role => !d.roles[role.id])?.id;
      return selected
        ? action(`선택한 ${roles.find(role => role.id===selected).target}의 관찰 문장을 읽고 역할 상자를 눌러.`,'[data-action="role-place"]')
        : action('상자 속 카드를 다시 골라 역할을 바꿔 볼 수 있어.','[data-action="role-pick"]');
    }
    case 'p04':
      if (!d.ran) return action(`${roles.find(role => role.id===d.removed).name}가 모두 사라지면? 아래에서 내 예상을 골라. 다른 역할도 고를 수 있어.`,'[data-action="prediction"]');
      if (d.step<2) return action('시간에 따른 모형의 변화를 관찰해. 기다리거나 결과 바로 보기를 눌러.','[data-action="experiment-skip"]');
      if (!d.restored) return action('역할 복원을 눌러 처음 상태와 비교해.','[data-action="experiment-restore"]');
      return action('역할을 뺐을 때 모형에서 나타난 변화와 맞는 설명을 골라.','[data-action="experiment-answer"]');
    case 'p05': return d.selected
      ? action(`선택한 ${organisms.find(item => item.id===d.selected)?.name}의 먹이 관계를 이어. 먹는 생물을 눌러.`,`.web-node:not([data-value="${d.selected}"])`)
      : action('먹히는 생물을 먼저 눌러. 다음에 먹는 생물을 눌러 이어.','.web-node');
    case 'p06': {
      const next = ['grasshopper','frog'].find(value => !d.tested.includes(value));
      return next
        ? action(`${next==='grasshopper'?'메뚜기':'개구리'}를 빼고 A와 B에서 뱀까지 남은 먹이 길을 비교해.`,`[data-action="compare-remove"][data-value="${next}"]`)
        : action('남은 먹이 길을 보고 두 모형의 반응이 다른 까닭을 골라.','[data-action="compare-answer"]');
    }
    case 'p07': {
      const next = ['action','change','impact'].find(key => d.picks[key]===undefined);
      const names = {action:'사람의 행동',change:'환경 변화',impact:'생물의 영향'};
      return next
        ? action(`현장 단서를 읽고 ${names[next]}에 맞는 카드를 눌러. ${d.solved.length+1}/2 현장`,`[data-action="cause-pick"][data-value^="${next}:"]`)
        : action('현장 단서와 맞지 않는 카드를 다시 골라 바꿔 봐.','[data-action="cause-pick"]');
    }
    case 'p08': {
      if (d.seen.length===4) return action('네 장면을 비교해서 알게 된 사실을 골라.','[data-action="time-answer"]');
      const name = d.policy==='protect'?'보전 대책을 쓴 곳':'대책이 없는 곳';
      if (!d.seen.includes(`${d.policy}:before`)) return action(`${name}의 변화 전을 눌러 처음 모습을 살펴봐. ${d.seen.length}/4`,'[data-action="time-jump"][data-value="0"]');
      if (!d.seen.includes(`${d.policy}:after`)) return action(`${name}의 변화 후를 눌러 달라진 곳을 찾아봐. ${d.seen.length}/4`,'[data-action="time-jump"][data-value="100"]');
      const other = d.policy==='protect'?'neglect':'protect';
      return action('이번 대책의 전후를 봤어. 위에서 다른 대책을 골라 비교해. 2/4',`[data-action="time-policy"][data-value="${other}"]`);
    }
    case 'p09': {
      const showingResult = context.strategyReflect ?? d.ran;
      if (showingResult) return action('대책으로 먼저 해결하려 한 문제를 골라. 결과를 보고 작전을 바꿀 수도 있어.','[data-action="strategy-reason"]');
      return d.selected.length
        ? action(`대책 ${d.selected.length}개를 골랐어. 작전 실행을 눌러 결과를 살펴봐.`,'[data-action="strategy-run"]')
        : action('6포인트 안에서 필요한 보전 대책을 골라. 대책 하나는 2포인트야.','[data-action="strategy"]');
    }
    case 'p10': {
      if (d.phase==='report') return action('앞에서 모은 증거를 살펴보고 설계를 시작해.','[data-action="final-start"]');
      const result = finalCheck(d);
      const basicElements = ['light','water','soil','plants','fungi','frog','sparrow','snake'].every(value => d.elements.includes(value));
      const hasPrey = d.shock ? d.elements.includes('caterpillar') : ['grasshopper','caterpillar'].some(value => d.elements.includes(value));
      if (!basicElements || !hasPrey) return context.designTab==='elements'
        ? action(d.shock&&!hasPrey?'메뚜기를 거치지 않는 먹이 길이 필요해. 애벌레를 더해 봐.':'1 요소에서 생물과 빛·물·흙을 골라 놓아 봐. 앞에서 만든 먹이그물도 가져올 수 있어.','[data-action="element"], [data-action="final-import"]')
        : action('1 요소를 눌러 필요한 생물과 환경 요소를 더해 봐.','[data-action="design-tab"][data-value="elements"]');
      if (!result.checks[2].ok) return context.designTab==='connections'
        ? action('먹히는 생물 → 먹는 생물 순서로 눌러 먹이 길을 이어.','.web-node')
        : action('2 먹이 길을 눌러 식물에서 소비자로 이어지는 관계를 만들어.','[data-action="design-tab"][data-value="connections"]');
      if (!result.checks[3].ok) return context.designTab==='policies'
        ? action('오염이 들어오는 원인과 생물이 사는 곳을 함께 돌볼 대책을 골라.','[data-action="final-strategy"]')
        : action('3 보전 대책을 눌러 물가를 돌볼 방법을 골라.','[data-action="design-tab"][data-value="policies"]');
      if (!d.tested) return action('설계를 시험해 보자. 결과를 보고 고칠 수 있어.','[data-action="final-run"]');
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
