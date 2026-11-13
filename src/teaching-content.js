import { standards, curriculumSource } from './curriculum.js';

export const learningNotes = {
  p01: {terms:['생물','생명 활동'], core:'생물은 양분을 얻고 자라는 등 여러 생명 활동을 해.', clarify:'움직임과 함께 자라는 특징도 살펴봐. 흐르는 물과 움직이지 않는 버섯을 비교할 수 있어.', question:'풀과 버섯이 생물이라는 것을 어떤 특징으로 알 수 있을까?', success:'살아가는 특징을 찾았어'},
  p02: {terms:['생물 요소','비생물 요소'], core:'생물 요소와 비생물 요소가 서로 영향을 주며 생태계를 이뤄.', clarify:'흙 자체는 비생물 요소야. 흙 속에 사는 작은 생물은 생물 요소로 나눠.', question:'흙과 흙 속의 작은 생물은 각각 어느 쪽일까?', success:'생물·비생물 요소를 나눴어'},
  p03: {terms:['생산자','소비자','분해자'], core:'양분을 얻는 방법에 따라 생산자·소비자·분해자로 나눠.', clarify:'이 그림의 버섯은 죽은 나무를 분해하며 양분을 얻어. 세균 중에도 분해자 역할을 하는 생물이 있어.', question:'죽은 나무에서 양분을 얻는 버섯은 풀과 역할이 어떻게 다를까?', success:'양분을 얻는 방법을 찾았어', image:'decomposer-log-v3'},
  p04: {terms:['예상','비교','분해자'], core:'다른 조건을 같게 두고 한 역할을 바꾸어 결과를 비교해.', clarify:'같은 역할의 생물을 모두 빼 본 모형이야. 막대는 처음 상태와 비교한 변화의 방향을 나타내.', question:'처음 예상과 모형에서 관찰한 결과는 어떻게 같거나 달랐을까?', success:'예상과 결과를 비교했어', image:'decomposer-log-v3'},
  p05: {terms:['먹히는 생물','먹는 생물','먹이그물'], core:'화살표는 먹히는 생물에서 먹는 생물로 향해. 먹이를 통해 양분이 이동해.', clarify:'여기에는 물가에서 볼 수 있는 먹이 관계의 일부를 담았어. 실제 생물은 다른 먹이도 이용할 수 있어.', question:'풀에서 메뚜기로 향한 화살표를 말로 설명하면 어떻게 될까?', success:'먹이그물을 연결했어'},
  p06: {terms:['먹이사슬','먹이그물','먹이 길'], core:'먹이그물에 다른 먹이 길이 남으면 다른 먹이를 이용할 수 있어.', clarify:'먹이 길과 함께 물·기후·서식처도 생존에 영향을 줘. 남은 길을 찾은 뒤 주변 환경도 살펴봐.', question:'뱀까지 먹이 길이 남아 있어도 더 살펴봐야 할 환경은 무엇일까?', success:'다른 먹이 길을 찾았어'},
  p07: {terms:['사람의 행동','환경 변화','생물의 영향'], core:'사람의 행동이 환경을 바꾸고, 그 변화가 생물에 영향을 줄 수 있어.', clarify:'단서를 읽고 원인과 결과를 이어 봐. 실제 현장에서는 여러 자료를 더 조사해 원인을 확인해.', question:'사람의 행동이 새의 보금자리에 어떤 변화를 만들었을까?', success:'원인과 결과를 연결했어'},
  p08: {terms:['처음 조건','보전 대책','비교'], core:'같은 장소와 같은 처음 조건에서 보전 대책에 따른 변화를 비교해.', clarify:'그림은 변화의 방향을 보여 줘. 실제 회복에 걸리는 시간은 오염 정도와 주변 환경에 따라 달라.', question:'두 대책의 효과를 비교할 때 장소와 처음 조건을 같게 하는 까닭은 무엇일까?', success:'대책에 따른 변화를 비교했어'},
  p09: {terms:['오염원','서식처','보전'], core:'새로 들어오는 오염을 줄이고, 생물이 사는 곳인 서식처도 함께 돌봐.', clarify:'6포인트는 게임에서 정한 자원이야. 실제 보전에 드는 돈과 시간은 장소와 대책에 따라 달라.', question:'내가 고른 대책은 어떤 문제를 줄이는 데 도움이 될까?', success:'보전 대책의 이유를 찾았어'},
  p10: {terms:['모형','시험','실천'], core:'생태계 모형을 만들고, 변화 뒤의 결과를 보고 고쳐 봐. 배운 것을 생활에서 실천해.', clarify:'이번 시험은 이 물가 모형의 조건을 확인해. 실제 생태계는 여러 생물과 환경을 꾸준히 관찰하며 돌봐야 해.', question:'우리 주변에서 할 수 있는 실천 하나와 그 까닭은 무엇일까?', success:'시험 결과로 설계를 고쳤어'}
};

// Curriculum wording cross-checked against the preserved 2022 official text.
// Classroom validation remains pending; this is not proof of achieved learning.
const area = { grade: '초등 3~4학년군 과학', unit: '생물과 환경', standardArea: '4과14', needsReview: true, reviewNote: '보존 고시본 원문 대조 완료 · 교사 수업 검수 전' };
export const curriculum = {
  p01: { ...area, objective: '움직임만이 아니라 자라고 번식하는 특징으로 생물을 구별한다.' },
  p02: { ...area, objective: '생태계를 생물 요소와 비생물 요소로 나누고 새 사례에 적용한다.' },
  p03: { ...area, objective: '양분을 얻는 방법에 따라 생산자·소비자·분해자를 구분한다.' },
  p04: { ...area, objective: '한 역할을 없앤 뒤 변화를 관찰하고 복원해 역할과 변화의 관계를 설명한다.' },
  p05: { ...area, objective: '먹히는 생물에서 먹는 생물로 먹이 관계를 이어 먹이그물을 만든다.' },
  p06: { ...area, objective: '같은 생물이 사라질 때 먹이사슬과 먹이그물의 차이를 비교한다.' },
  p07: { ...area, objective: '사람의 행동 → 환경 변화 → 생물의 영향을 원인과 결과로 잇는다.' },
  p08: { ...area, objective: '같은 장소를 같은 조건에서 비교해 보전 대책의 효과를 판단한다.' },
  p09: { ...area, objective: '한정된 자원 안에서 원인과 서식처를 함께 돌보는 대책을 고르고 이유를 말한다.' },
  p10: { ...area, objective: '생태계를 설계하고 변화 시험 결과를 보고 고쳐 본다.' },
};

for (const [id, item] of Object.entries(curriculum)) {
  const n = Number(id.slice(1));
  const indexes = n === 10 ? [0, 1, 2] : n <= 2 ? [0] : n <= 4 ? [0, 1] : n <= 6 ? [1] : [2];
  Object.assign(item, { standards: indexes.map(index => ({ code: standards[index][0], text: standards[index][1] })), source: curriculumSource.url, checkedAt: curriculumSource.checkedAt, reviewer: null, extension: n === 4, discussion: learningNotes[id].question });
}
