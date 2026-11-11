export const title='모아의 생태 설계';
export const intro='생물을 놓고 먹이 관계를 이어서, 변화에 견디는 서식처를 만들어 봐.';
export const background='/assets/web/bg-pond.webp';
export const items=[['plant','식물','🌿','plants'],['insect','메뚜기','🦗','grasshopper'],['frog','개구리','🐸','frog'],['fungus','분해자','🍄','mushroom'],['water','물가','💧',null],['shade','그늘','🌳',null]].map(([id,name,symbol,art])=>({id,name,symbol,art:art?`./assets/learning-v2/${art}.webp`:null,cost:1}));
export const missions=[{name:'풀밭의 첫 연결',goal:'식물→메뚜기→개구리 관계를 만들고 분해자를 함께 놓아 봐.',event:'평소 날',needsWater:false},{name:'마른 날의 물가',goal:'마른 날에도 물과 그늘이 남는 서식처를 설계해 봐.',event:'마른 날',needsWater:true},{name:'다시 살피는 서식처',goal:'물가 쓰레기 수거 계획을 더하고 생물·환경의 연결을 다시 살펴봐.',event:'더운 날',needsWater:true}];
export const note='단순화한 교육용 모형이야. 실제 생태계는 종과 환경에 따라 관계가 다르고, 생물 수를 이 모형으로 예측할 수 없어.';
export function evaluate(plan,links,level,care=false){
 const count=id=>plan.filter(x=>x===id).length; const present=id=>count(id)>0;
 const reasons=[];if(level===2&&!care)reasons.push('물가에 버려진 쓰레기가 있어. 수거 계획을 먼저 세워 봐.');
 if(!present('plant'))reasons.push('식물이 없어. 먹이 관계의 시작을 놓아 봐.');
 if(!present('insect')||!present('frog'))reasons.push('메뚜기와 개구리를 놓고 먹이 관계를 살펴봐.');
 if(!present('fungus'))reasons.push('죽은 생물의 물질을 되돌리는 분해자의 역할도 필요해.');
 if(!links.includes('plant>insect')||!links.includes('insect>frog'))reasons.push('먹이가 되는 생물에서 먹는 생물 쪽으로 두 화살표를 이어 봐.');
 if(level>0&&(!present('water')||!present('shade')))reasons.push('더 건조하고 더운 조건을 생각하며 물가와 그늘도 마련해 봐.');
 return {ok:!reasons.length,reasons,summary:reasons.length?reasons[0]:'관계와 환경을 함께 고려했어! 실제 서식처는 계속 관찰해야 해.',active:!reasons.length};
}

export const missionKey = 'science-play-14-v1';
export function initialMissionState() {
  return {
    version: 1,
    level: 0,
    plans: missions.map(() => Array(6).fill(null)),
    links: missions.map(() => []),
    won: [],
    care: missions.map(() => false)
  };
}

export function validMissionLinks(plan, links) {
  if (!Array.isArray(links)) return [];
  return [...new Set(links.filter(link =>
    ['plant>insect', 'insect>frog'].includes(link) &&
    link.split('>').every(id => plan.includes(id))
  ))];
}

export function restoreMissionState(raw) {
  const state = initialMissionState();
  if (!raw || raw.version !== 1) return state;
  state.plans = missions.map((_, level) => Array.from({length:6}, (_, cell) => {
    const id = raw.plans?.[level]?.[cell];
    return items.some(item => item.id === id) ? id : null;
  }));
  state.links = missions.map((_, level) => validMissionLinks(state.plans[level], raw.links?.[level]));
  state.care = missions.map((_, level) => raw.care?.[level] === true);
  const won = Array.isArray(raw.won) ? raw.won : [];
  for (let level = 0; level < missions.length && won.includes(level); level++) state.won.push(level);
  state.level = Math.max(0, Math.min(missions.length - 1, state.won.length, Math.trunc(Number(raw.level)) || 0));
  return state;
}

// Match the main investigation's protection against unreadable data and tab conflicts.
export function createMissionStore(storage) {
  let previous = null, blocked = false, message = '';
  let state = initialMissionState();
  try {
    previous = storage.getItem(missionKey);
    if (previous !== null) {
      const raw = JSON.parse(previous);
      if (!raw || raw.version !== 1) throw new Error('unsupported');
      state = restoreMissionState(raw);
    }
  } catch {
    blocked = true;
    message = '기존 설계 기록을 읽지 못해 보호 중이야. 이번 설계는 임시로 진행돼.';
  }
  return {
    state,
    get message() { return message; },
    save(next) {
      if (blocked) return false;
      try {
        if (storage.getItem(missionKey) !== previous) {
          blocked = true;
          message = '다른 창에서 설계가 바뀌었어. 이 창을 닫고 미션을 다시 열어 최신 기록을 이어 가 줘.';
          return false;
        }
        const value = JSON.stringify(next);
        storage.setItem(missionKey, value);
        previous = value;
        message = '';
        return true;
      } catch {
        message = '이 기기에 저장하지 못했어. 창을 닫으면 이번 설계 기록을 잃을 수 있어.';
        return false;
      }
    }
  };
}
