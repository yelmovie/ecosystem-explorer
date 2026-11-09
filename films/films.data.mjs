// Ten films, one idea each. Text comes from src/learning.js (title, cue times); each film
// adds only name tags and its one-line conclusion. Changes are relative stages
// (처음 / 제거 후 / 복원 후, 대책 없이 / 보전), never counts, days or percentages.
// Cue times: beat 1 = cues[0], beat 2 = cues[1], beat 3 = cues[2] (the app's captions switch there too).
export const films = {
  p01: {
    conclusion: '움직임보다 살아가는 특징을 살펴봐', keyword: '살아가는 특징', poses: ['look', 'point', 'cheer'],
    build(k, [, b, c]) {
      const water = k.art('water', 400, 560, 250, 0.7, { alt: '흐르는 물' });
      k.arrow([280, 720], [520, 720], 1.4, { color: '#5cb6c9', width: 8, sound: null });
      k.label('물: 흐르지만 자라지 않아', 400, 820, 2.4, { to: [400, 660] });
      const sap = k.art('sapling', 790, 600, 190, 1.2, { alt: '어린 풀' });
      const mush = k.art('mushroom', 1180, 600, 250, 1.6, { alt: '버섯' });
      k.move(mush, { scale: .72 }, 1.6, .01);
      // Beat 2: the two living things grow; water does not.
      k.punch(990, 600, b + .1, 1.08, 3.8);
      k.fade(sap, b + .5, 0, .5);
      k.art('plants', 790, 580, 270, b + .5, { how: 'fade', sound: 'pop' });
      k.label('풀: 자라', 790, 380, b + 1.2, { to: [790, 470], accent: true });
      k.move(mush, { scale: 1 }, b + 1.5, 1.0);
      k.label('버섯: 자라', 1180, 400, b + 2.2, { to: [1180, 480], accent: true });
      // Beat 3: sort by living features.
      k.label('생물', 790, 790, c + .2, { size: 36 });
      k.label('생물', 1180, 790, c + .4, { size: 36, sound: null });
      k.fade(water, c + .3, .45, .5);
      k.sfx('found', c + .9, .5);
    },
  },
  p02: {
    conclusion: '생물과 비생물 요소가 함께 생태계를 이뤄', keyword: '생태계', poses: ['look', 'point', 'cheer'],
    build(k, [, b, c]) {
      const spots = { tree: [300, 470], sun: [640, 400], frog: [980, 470], water: [450, 720], mushroom: [800, 730], soil: [1150, 720] };
      const s = Object.fromEntries(Object.entries(spots).map(([id, [x, y]], i) => [id, k.art(id, x, y, 190, 0.6 + i * .25, { sound: i % 2 ? null : 'drop' })]));
      // Beat 1 end: living things gather on the left.
      k.move(s.tree, { y: 50 }, 3.0);
      k.move(s.frog, { x: -460, y: 50 }, 3.2);
      k.move(s.mushroom, { x: -390, y: -10 }, 3.4);
      k.heading('생물 · 스스로 자라', 410, 360, 4.0);
      // Beat 2: non-living factors gather on the right.
      k.move(s.sun, { x: 320, y: 120 }, b + .2);
      k.move(s.water, { x: 730, y: -200 }, b + .4);
      k.move(s.soil, { x: -80 }, b + .6);
      k.heading('비생물 요소 · 햇빛·물·흙', 1070, 360, b + 1.2);
      k.punch(1000, 560, b + .3, 1.06, 3.4);
      // Beat 3: one frame around both groups.
      k.frame(150, 280, 1290, 600, c + .2);
      k.label('생태계', 790, 860, c + 1.0, { accent: true, size: 44 });
      k.sfx('found', c + 1.0, .5);
    },
  },
  p03: {
    conclusion: '생산자·소비자·분해자는 양분을 얻는 방법이 달라', keyword: '양분을 얻는 방법', poses: ['look', 'point', 'cheer'],
    build(k, [, b, c]) {
      k.art('sun', 260, 380, 170, 0.6, { alt: '햇빛' });
      k.art('plants', 380, 650, 240, 1.1, { alt: '풀' });
      k.arrow([300, 450], [370, 560], 1.7, { color: 'var(--amber)', width: 8, dashed: true, sound: null });
      k.label('생산자<small>햇빛으로 양분을 만들어</small>', 400, 830, 2.4, { to: [390, 770], accent: true, size: 38 });
      // Beat 2: a consumer eats.
      k.art('grasshopper', 680, 640, 190, b + .2);
      k.art('frog', 960, 610, 230, b + .6);
      k.arrow([760, 640], [860, 620], b + 1.2, { width: 8 });
      k.label('소비자<small>다른 생물을 먹어 양분을 얻어</small>', 820, 330, b + 1.9, { to: [930, 500], accent: true, size: 38 });
      // Beat 3: a decomposer breaks down dead things.
      k.art('leaves', 1250, 720, 180, c + .1, { alt: '낙엽' });
      k.art('mushroom', 1270, 580, 220, c + .4, { alt: '죽은 나무의 버섯' });
      k.label('분해자<small>죽은 생물을 분해해 양분을 얻어</small>', 1200, 430, c + .9, { to: [1270, 480], accent: true, size: 38 });
      k.sfx('found', c + 1.3, .5);
    },
  },
  p04: {
    conclusion: '한 역할만 바꾸고 비교하면 그 역할이 보여', keyword: '비교', poses: ['look', 'surprise', 'cheer'],
    build(k, [, b, c]) {
      k.phase(['처음', '분해자 제거 후', '복원 후'], [0.4, b + .2, c + .2]);
      k.art('plants', 330, 620, 220, 0.7);
      k.art('frog', 640, 620, 210, 1.0, { sound: null });
      const mush = k.art('mushroom', 950, 610, 230, 1.3);
      const pile = k.art('leaves', 1250, 700, 200, 1.6, { alt: '낙엽' });
      k.move(pile, { scale: .6 }, 1.6, .01);
      k.until(c, () => k.label('분해자만 없애 볼게', 950, 380, 2.3, { to: [950, 500] }));
      const mark = k.remove(mush, 950, 610, 230, 3.4);
      // Beat 2: time passes, fallen leaves are not broken down.
      k.punch(1200, 680, b + .4, 1.12, 3.6);
      k.move(pile, { scale: 1.05 }, b + .7, 1.4);
      const pile2 = k.art('leaves', 1170, 760, 170, b + 1.4, { how: 'rise', sound: 'drop' });
      k.until(c + .6, () => k.label('낙엽이 쌓여<small>분해가 느려졌어</small>', 1290, 470, b + 2.2, { to: [1250, 590], accent: true }));
      // Beat 3: restore and compare with the start.
      k.restore(mush, mark, c + .1);
      k.fade(pile2, c + .7, 0, .8);
      k.move(pile, { scale: .65 }, c + .7, 1.2);
      k.label('처음처럼 돌아와', 1250, 860, c + 1.4, { size: 36 });
    },
  },
  p05: {
    conclusion: '화살표: 먹히는 생물 → 먹는 생물', keyword: '먹히는 생물 → 먹는 생물', poses: ['look', 'point', 'cheer'],
    build(k, [, b, c]) {
      k.art('plants', 320, 600, 230, 0.6);
      k.art('grasshopper', 740, 600, 210, 1.0);
      k.arrow([440, 600], [630, 600], 1.9, { color: 'var(--amber)', width: 9 });
      k.label('풀은 메뚜기에게 먹혀', 535, 420, 2.7, { to: [535, 585] });
      // Beat 2: the next link.
      k.art('frog', 1170, 590, 240, b + .2);
      k.arrow([850, 600], [1040, 600], b + 1.0, { color: 'var(--amber)', width: 9 });
      k.label('메뚜기는 개구리에게 먹혀', 945, 790, b + 1.8, { to: [945, 615] });
      // Beat 3: name both ends of the arrow.
      k.label('먹히는 생물', 320, 800, c + .2, { to: [320, 720], size: 36 });
      k.label('먹는 생물', 1290, 800, c + .6, { to: [1180, 720], size: 36, sound: null });
      k.sfx('found', c + 1.3, .5);
    },
  },
  p06: {
    conclusion: '먹이그물에는 다른 먹이 길이 남아', keyword: '다른 먹이 길', poses: ['look', 'surprise', 'cheer'],
    build(k, [, b, c]) {
      const P = { plants: [230, 600], grasshopper: [500, 450], caterpillar: [500, 760], frog: [790, 450], sparrow: [790, 760], snake: [1060, 600] };
      const n = Object.fromEntries(Object.entries(P).map(([id, [x, y]], i) => [id, k.art(id, x, y, 160, 0.5 + i * .18, { sound: i % 3 ? null : 'drop' })]));
      const edges = [['plants', 'grasshopper'], ['plants', 'caterpillar'], ['grasshopper', 'frog'], ['grasshopper', 'sparrow'], ['caterpillar', 'frog'], ['caterpillar', 'sparrow'], ['frog', 'snake'], ['sparrow', 'snake']];
      edges.forEach(([a, z], i) => k.arrow(P[a], P[z], 1.7 + i * .12, { width: 5, gap: 82, dur: .35, sound: null, z: 6 }));
      // Highlight the path through the grasshopper.
      [['plants', 'grasshopper'], ['grasshopper', 'frog'], ['frog', 'snake']].forEach(([a, z], i) => k.arrow(P[a], P[z], 3.2 + i * .3, { color: 'var(--amber)', width: 9, gap: 82, dur: .3, sound: i ? null : 'drop', z: 7 }));
      // Beat 2: the grasshopper disappears; its links break.
      const mark = k.remove(n.grasshopper, 500, 450, 160, b + .2, { word: '사라짐' });
      [['plants', 'grasshopper'], ['grasshopper', 'frog'], ['grasshopper', 'sparrow']].forEach(([a, z]) => k.arrow(P[a], P[z], b + .6, { color: '#c4c9bf', width: 9, gap: 82, sound: null, z: 9 }));
      k.until(c + .8, () => k.label('이 먹이 길은 끊어졌어', 640, 300, b + 1.3, { to: [600, 420] }));
      k.until(c, () => k.label('뱀까지 가는 길은?', 1060, 790, b + 3.0, { to: [1060, 690], size: 34 }));
      // Beat 3: another path still reaches the snake.
      [['plants', 'caterpillar'], ['caterpillar', 'frog'], ['frog', 'snake']].forEach(([a, z], i) => k.arrow(P[a], P[z], c + .1 + i * .3, { color: 'var(--forest)', width: 10, gap: 82, dur: .3, sound: i ? null : 'drop', z: 11 }));
      k.label('다른 먹이 길', 250, 850, c + .9, { to: [420, 780], accent: true, size: 36 });
      k.art('water', 1300, 470, 130, c + 1.6, { sound: null });
      k.art('tree', 1300, 690, 150, c + 1.8, { sound: null });
      k.label('물·서식처도 지켜야 해', 1300, 830, c + 2.4, { size: 32 });
      void mark;
    },
  },
  p07: {
    conclusion: '사람의 행동 → 환경 변화 → 생물의 영향', keyword: '환경 변화', poses: ['look', 'surprise', 'point'],
    build(k, [, b, c]) {
      // Clean bank first, then the same bank after polluted water flows in.
      k.photo('river-protect', 760, 560, 1060, 0.5, { label: '깨끗한 물가' });
      k.until(2.4, () => k.label('깨끗한 물가', 400, 330, 1.2, { size: 34, sound: null }));
      k.wipe('river-neglect', 760, 560, 1060, 2.4, { label: '오염된 물가' });
      k.until(b, () => k.label('오염 물질을 흘려보내', 560, 360, 3.2, { to: [400, 500], accent: true }));
      // Beat 2: the water itself, and who lives in it.
      k.punch(560, 640, b + .1, 1.16, 3.7);
      k.until(c, () => {
        k.label('물이 오염돼', 700, 740, b + .9, { to: [560, 640] });
        k.art('fish', 1090, 690, 230, b + 1.6, { how: 'rise', alt: '물고기' });
        k.label('물속 생물이 살기 어려워져', 1030, 840, b + 2.3, { size: 36 });
      });
      // Beat 3: the chain, read left to right.
      k.label('사람의 행동', 380, 820, c + .2, { size: 34 });
      k.arrow([520, 820], [610, 820], c + .5, { width: 7, sound: null, z: 45 });
      k.label('환경 변화', 750, 820, c + .7, { size: 34, accent: true });
      k.arrow([870, 820], [960, 820], c + 1.0, { width: 7, sound: null, z: 45 });
      k.label('생물의 영향', 1100, 820, c + 1.2, { size: 34 });
    },
  },
  p08: {
    conclusion: '같은 장소를 같은 조건에서 전후 비교해', keyword: '같은 조건', poses: ['look', 'point', 'cheer'],
    build(k, [, b, c]) {
      const big = [k.photo('river-before', 760, 570, 1000, 0.5, { label: '변화 전 물가' })];
      k.phase(['변화 전', '대책 없이 지낸 뒤', '다시 처음에서 · 대책 실행', '같은 장소 비교'], [0.5, 2.6, b + .2, c + .2]);
      big.push(k.wipe('river-neglect', 760, 570, 1000, 2.6));
      k.until(b + .2, () => k.label('쓰레기와 흐린 물이 늘었어', 760, 850, 3.6, { size: 36 }));
      // Beat 2: back to the same start, then protect it.
      big.push(k.photo('river-before', 760, 570, 1000, b + .2, { z: 7, how: 'fade' }));
      big.push(k.wipe('river-protect', 760, 570, 1000, b + 1.0, { z: 8 }));
      big.forEach(sel => k.fade(sel, c + .2, 0, .4));
      k.until(c + .2, () => k.label('오염원 줄이기 + 서식처 보호', 760, 850, b + 1.9, { size: 36, accent: true }));
      // Beat 3: the two results side by side, same frame.
      k.photo('river-neglect', 450, 570, 620, c + .2, { z: 20, label: '대책 없이' });
      k.photo('river-protect', 1110, 570, 620, c + .5, { z: 20, label: '보전 대책' });
      k.label('대책 없이', 450, 790, c + .8, { size: 34, z: 41 });
      k.label('보전 대책', 1110, 790, c + 1.0, { size: 34, z: 41, accent: true, sound: null });
    },
  },
  p09: {
    conclusion: '작전을 바꾸고 결과를 비교해 더 나은 선택을 해', keyword: '결과를 비교', poses: ['look', 'point', 'cheer'],
    build(k, [, b, c]) {
      // Status words are the game's own (돌봄 필요 / 개선 중 / 좋아짐) for the same plans.
      k.heading('작전 1 · 2포인트', 250, 330, 0.7, { size: 38 });
      k.art('clean', 250, 520, 200, 1.1, { alt: '하천 정화' });
      k.label('하천 정화', 250, 690, 1.6, { size: 32 });
      k.label('물 상태<small>개선 중</small>', 560, 420, 2.4, { size: 34 });
      k.label('서식처<small>돌봄 필요</small>', 560, 560, 2.8, { size: 34, sound: null });
      k.label('숲 상태<small>돌봄 필요</small>', 560, 700, 3.2, { size: 34, sound: null });
      k.label('한 대책으로는 어려워', 400, 850, 3.8, { accent: true, size: 36 });
      // Beat 2: causes and habitat together, six points.
      k.heading('작전 2 · 6포인트', 1040, 330, b + .2, { size: 38 });
      k.art('source', 860, 500, 170, b + .6, { alt: '오염원 줄이기' });
      k.art('tree', 1040, 500, 170, b + 1.0, { alt: '서식처 보호' });
      k.art('sapling', 1220, 500, 170, b + 1.4, { alt: '나무 심기' });
      k.label('오염 원인', 860, 650, b + 1.9, { size: 30, sound: null });
      k.label('서식처', 1040, 650, b + 2.1, { size: 30, sound: null });
      k.label('숲', 1220, 650, b + 2.3, { size: 30 });
      // Beat 3: the result of plan 2 next to plan 1.
      k.label('물 상태<small>개선 중</small>', 860, 790, c + .2, { size: 30 });
      k.label('서식처<small>좋아짐</small>', 1040, 790, c + .5, { size: 30, accent: true, sound: null });
      k.label('숲 상태<small>좋아짐</small>', 1220, 790, c + .8, { size: 30, accent: true });
      k.sfx('found', c + 1.0, .5);
    },
  },
  p10: {
    conclusion: '시험하고 고치는 과정이 생태계 설계야', keyword: '시험하고 고치는', poses: ['look', 'surprise', 'cheer'],
    build(k, [, b, c]) {
      k.art('sun', 260, 380, 120, 0.5, { sound: null });
      k.art('water', 400, 380, 120, 0.7, { sound: null });
      k.art('soil', 540, 380, 120, 0.9);
      k.label('빛·물·흙', 730, 380, 1.3, { size: 32, sound: null });
      const P = { plants: [300, 680], grasshopper: [620, 560], caterpillar: [620, 800], frog: [940, 680], mushroom: [1250, 680] };
      const n = Object.fromEntries(Object.entries(P).map(([id, [x, y]], i) => [id, k.art(id, x, y, 170, 1.4 + i * .2, { sound: i % 2 ? null : 'drop' })]));
      [['plants', 'grasshopper'], ['plants', 'caterpillar'], ['grasshopper', 'frog'], ['caterpillar', 'frog']].forEach(([a, z], i) => k.arrow(P[a], P[z], 2.6 + i * .2, { width: 6, gap: 88, dur: .35, sound: null }));
      k.label('분해자', 1250, 520, 3.6, { size: 32 });
      // Beat 2: the test — the grasshopper is gone.
      k.phase(['설계', '시험: 메뚜기가 사라지면?', '고치고 다시 확인'], [0.4, b + .1, c + .1]);
      k.remove(n.grasshopper, 620, 560, 170, b + .5, { word: '사라짐' });
      [['plants', 'grasshopper'], ['grasshopper', 'frog']].forEach(([a, z]) => k.arrow(P[a], P[z], b + .9, { color: '#c4c9bf', width: 8, gap: 88, sound: null, z: 9 }));
      [['plants', 'caterpillar'], ['caterpillar', 'frog']].forEach(([a, z], i) => k.arrow(P[a], P[z], b + 1.6 + i * .3, { color: 'var(--forest)', width: 9, gap: 88, dur: .3, sound: i ? null : 'drop', z: 11 }));
      k.label('먹이 길이 남았어', 1010, 830, b + 2.4, { to: [710, 810], accent: true, size: 34 });
      // Beat 3: the loop — design, test, fix.
      k.frame(170, 455, 1190, 435, c + .2, { color: 'var(--forest)' });
      k.label('설계 → 시험 → 고치기', 1110, 420, c + 1.0, { accent: true, size: 38 });
      k.sfx('found', c + 1.2, .5);
    },
  },
};
