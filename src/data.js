export const chapters = [
  { name: '이상 신호를 찾아서', place: '관찰의 물가', icon: 'search', color: '#5d9d69', evidence: '구성 요소 기록', summary: '생물과 비생물 요소가 함께 생태계를 이뤄.', reward: '생태계를 이루는 것들의 기록', x: 26, y: 61 },
  { name: '저마다의 역할', place: '양분의 정원', icon: 'leaf', color: '#c39345', evidence: '역할 실험 기록', summary: '생산자·소비자·분해자는 서로 영향을 줘.', reward: '역할을 없앴을 때의 변화', x: 39, y: 32 },
  { name: '이어지는 생명의 그물', place: '연결의 초원', icon: 'web', color: '#4b9aab', evidence: '먹이 관계 기록', summary: '먹이 경로가 이어지면 다른 먹이를 이용할 수도 있어.', reward: '먹이그물과 대체 먹이의 증거', x: 62, y: 39 },
  { name: '변화에는 이유가 있어', place: '시간의 습지', icon: 'clock', color: '#a386b8', evidence: '환경 변화 기록', summary: '원인을 줄이고 서식처를 지키는 행동이 필요해.', reward: '원인과 시간 변화의 증거', x: 73, y: 64 },
  { name: '우리가 만드는 내일', place: '복원의 연구소', icon: 'flag', color: '#ce9851', evidence: '복원 전략 기록', summary: '한정된 자원으로 원인과 서식처를 함께 돌봐.', reward: '직접 세운 전략과 최종 설계', x: 49, y: 76 },
];
export const activities = [
  ['흔적을 자세히 살펴봐', '물가에 도착했어. 네 지점을 조사하고, 눈으로 확인한 특징을 기록하자.', '관찰'],
  ['무엇이 생태계를 이룰까?', '찾아낸 것들을 기준에 따라 나누고, 다른 장소에도 같은 기준을 적용해 봐.', '분류'],
  ['양분은 어디에서 올까?', '생물이 양분을 얻는 흔적을 읽고, 세 가지 역할을 찾아보자.', '조사'],
  ['한 역할이 사라진다면?', '먼저 예상하고, 한 가지 역할만 없애 본 뒤 변화를 비교해 봐.', '실험'],
  ['끊어진 먹이 관계를 이어 줘', '먹히는 생물, 먹는 생물 순서로 눌러. 화살표는 양분이 이동하는 방향이야.', '연결'],
  ['다른 먹이 길이 남아 있을까?', '같은 생물을 없애고 두 그물의 남은 먹이 경로를 비교해 보자.', '비교'],
  ['변화의 원인을 추적해', '현장 단서를 읽고 인간의 활동부터 생물에게 생긴 영향까지 이어 봐.', '추론'],
  ['시간이 흐르면 어떻게 될까?', '같은 장소의 전후를 비교해. 우리의 행동에 따라 달라지는 것도 찾아보자.', '관찰'],
  ['6포인트로 복원 작전!', '모든 대책을 고를 수는 없어. 필요한 대책을 조합하고 결과를 확인해 봐.', '전략'],
  ['생명의 그물 지도를 완성해', '조사 기록을 바탕으로 새 생태계를 만들고, 변화를 견디는지 시험해 보자.', '최종 미션'],
].map(([title, desc, verb], i) => ({ id: `p${String(i + 1).padStart(2, '0')}`, title, desc, verb, chapter: Math.floor(i / 2) }));
export const observations = [
  { id: 'plant', name: '물가의 풀', emoji: '🌱', x: 22, y: 63, text: '잎 사이에서 작은 새잎이 올라왔어.', choices: ['자라면서 새잎이 생겨.', '햇빛처럼 스스로 빛나.'], correct: 0 },
  { id: 'water', name: '흐르는 물', emoji: '💧', x: 58, y: 68, text: '돌 사이로 물이 흐르고 있어. 물은 스스로 자라거나 번식하지 않아.', choices: ['흐르니까 동물이야.', '생물이 살아가는 데 필요한 환경이야.'], correct: 1 },
  { id: 'sun', name: '햇빛', emoji: '☀️', x: 60, y: 18, text: '밝은 곳에서 풀잎이 빛을 받고 있어.', choices: ['식물이 양분을 만드는 데 쓰여.', '빛이 밝으니 살아 있어.'], correct: 0 },
  { id: 'mushroom', name: '그루터기의 버섯', emoji: '🍄', x: 86, y: 57, text: '버섯이 자란 그루터기에는 잘게 부서지는 죽은 나무가 보여.', choices: ['움직이지 않아 생물이 아니야.', '자라며 죽은 나무를 분해하는 생물이야.'], correct: 1 },
];
export const specimens = [
  { id: 'tree', name: '나무', emoji: '🌳', type: 'living' }, { id: 'frog', name: '개구리', emoji: '🐸', type: 'living' },
  { id: 'mushroom', name: '버섯', emoji: '🍄', type: 'living' }, { id: 'water', name: '물', emoji: '💧', type: 'nonliving' },
  { id: 'sun', name: '햇빛', emoji: '☀️', type: 'nonliving' }, { id: 'soil', name: '흙', emoji: '⛰️', type: 'nonliving' },
];
export const roles = [
  { id: 'producer', name: '생산자', emoji: '🌿', clue: '풀은 햇빛을 이용해 스스로 양분을 만들어.', target: '풀', result: '새 양분의 공급이 끊겨 소비자의 먹이가 줄어들어.', prediction: 'food', metrics: [15, 30, 65] },
  { id: 'consumer', name: '소비자', emoji: '🐸', clue: '개구리가 메뚜기를 먹고 양분을 얻어.', target: '개구리', result: '식물을 먹는 동물도 사라져 식물이 먹히는 일이 줄어들어.', prediction: 'plants', metrics: [85, 0, 65] },
  { id: 'decomposer', name: '분해자', emoji: '🍄', clue: '버섯이 죽은 나무를 분해하며 양분을 얻어.', target: '버섯', result: '죽은 생물의 분해가 느려져 낙엽 같은 것이 쌓여.', prediction: 'leaves', metrics: [55, 55, 15] },
];
export const predictions = [['food', '소비자의 먹이가 줄어들어.'], ['plants', '식물이 덜 먹힐 거야.'], ['leaves', '낙엽 같은 것이 쌓여.']];
export const organisms = [
  { id: 'plants', name: '식물', emoji: '🌿', hint: '풀과 잎 · 스스로 양분을 만들어', x: 14, y: 50 },
  { id: 'grasshopper', name: '메뚜기', emoji: '🦗', hint: '풀과 잎을 먹어', x: 38, y: 23 },
  { id: 'caterpillar', name: '애벌레', emoji: '🐛', hint: '이 모형에서는 식물의 잎을 먹어', x: 38, y: 77 },
  { id: 'frog', name: '개구리', emoji: '🐸', hint: '메뚜기와 애벌레를 먹어', x: 64, y: 23 },
  { id: 'sparrow', name: '참새', emoji: '🐦', hint: '메뚜기와 애벌레를 먹어', x: 64, y: 77 },
  { id: 'snake', name: '뱀', emoji: '🐍', hint: '이 모형에서는 개구리와 참새를 먹어', x: 88, y: 50 },
];
export const foodEdges = ['plants>grasshopper', 'plants>caterpillar', 'grasshopper>frog', 'caterpillar>frog', 'grasshopper>sparrow', 'caterpillar>sparrow', 'frog>snake', 'sparrow>snake'];
export const chainEdges = ['plants>grasshopper', 'grasshopper>frog', 'frog>snake'];
export const strategies = [
  { id: 'source', name: '오염원 줄이기', emoji: '🚰', cost: 2, desc: '오염 물질이 물가로 들어오는 원인을 줄여.', effect: [35, 0, 0] },
  { id: 'clean', name: '하천 정화', emoji: '💧', cost: 2, desc: '이미 쌓인 쓰레기와 오염 물질을 줄여.', effect: [25, 5, 0] },
  { id: 'habitat', name: '서식처 보호', emoji: '🏞️', cost: 2, desc: '생물이 숨고 살아갈 공간을 지켜.', effect: [0, 45, 5] },
  { id: 'trees', name: '나무 심기', emoji: '🌳', cost: 2, desc: '훼손된 숲에 나무를 심어 숲을 돌봐.', effect: [5, 10, 40] },
];
export const finalElements = [...organisms, { id: 'light', name: '햇빛', emoji: '☀️' }, { id: 'water', name: '물', emoji: '💧' }, { id: 'soil', name: '흙', emoji: '⛰️' }, { id: 'fungi', name: '버섯', emoji: '🍄' }];
export const causes = [
  { id: 'pollution', title: '물가의 단서', clue: '배수구 아래에서 물이 흐려졌고, 물고기가 줄었어.', action: ['오염 물질 흘려보내기', '쓰레기 수거하기'], change: ['물의 오염', '서식처 보호'], impact: ['물속 생물이 살기 어려워짐', '나무가 더 많이 자람'] },
  { id: 'habitat', title: '숲의 단서', clue: '나무를 베어 낸 곳에서 새가 숨거나 둥지를 지을 곳이 줄었어.', action: ['나무 베어 내기', '보호 구역 만들기'], change: ['서식처 감소', '깨끗한 물 증가'], impact: ['새가 살아갈 공간이 줄어듦', '모든 생물이 즉시 늘어남'] },
];
