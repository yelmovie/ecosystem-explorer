import { roles, predictions, finalElements, organisms, strategies, causes, chainEdges, foodEdges } from './data.js';
import { finalCheck, strategyCost, reachable, recovery } from './engine.js';
import { specimenArt, riverArt, restorationBoard } from './visuals.js';
const htmlText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function experimentView(d, ui) {
  const {btn,choice,icon,metrics,completedFooter}=ui;
  const role=roles.find(r=>r.id===d.removed);
  const vals=d.ran&&!d.restored?role.metrics.map(v=>Math.round(65+(v-65)*d.step/2)):[65,65,65];
  const phase=!d.ran?'prediction':d.step<2?'running':!d.restored?'restore':'reflection';
  const control=!d.ran?
    `<h3>없앨 역할</h3><div class="button-row role-controls">${roles.map(r=>choice(r.name,'remove-role',r.id,d.removed===r.id)).join('')}</div><h3>내 예상</h3><div class="choices">${predictions.map(([id,t])=>choice(t,'prediction',id,d.prediction===id)).join('')}</div>`:
    !d.restored?
    `<h3>${specimenArt(role.id,'inline-art')} ${role.name} 제거</h3><p class="experiment-prediction"><small>내 예상</small>${predictions.find(([id])=>id===d.prediction)?.[1]||''}</p><div class="experiment-tasks">${d.step<2?btn('결과 바로 보기','experiment-skip','','button secondary'):btn(`${icon('reset')} 역할 복원`,'experiment-restore','','button primary')}</div>`:
    `<h3>실제로 나타난 변화는?</h3><div class="choices">${predictions.map(([id,t])=>choice(t,'experiment-answer',id,d.answer===id)).join('')}</div>${btn('다른 역할 실험','remove-role',roles[(roles.indexOf(role)+1)%3].id,'text-button')}`;
  return `<div class="experiment-layout" data-phase="${phase}"><section class="experiment-controls">${control}</section><section class="experiment-tank"><div class="tank-heading"><b>생태계 모형</b><span class="experiment-state" role="status">${!d.ran?'처음 상태':d.restored?'✓ 복원한 상태':`관찰 ${d.step}/2`}</span></div><div class="tank-scene"><span class="tank-sun">${specimenArt('sun')}</span>${roles.map(r=>`<span class="tank-being ${d.ran&&!d.restored&&d.removed===r.id?'removed':''}">${specimenArt(r.id)}<small>${r.name}</small></span>`).join('')}${d.ran&&!d.restored&&d.removed==='decomposer'?`<span class="leaf-pile" style="opacity:${d.step/2}">${specimenArt('leaves')}</span>`:''}<div class="tank-earth">${specimenArt('soil')}</div></div>${metrics(vals,['양분 공급','소비자 먹이','분해 활동'])}<details class="stage-note"><summary>모형 안내</summary><p>다른 조건은 같게 두고 한 역할만 바꾼 모형이야. 짙은 세로선은 처음 상태야. 막대는 처음 상태와 비교한 변화이며 실제 개체수를 뜻하지 않아.</p></details></section></div>${completedFooter('p04',d.step===2&&d.restored&&d.answer===role.prediction,'실험 기록하기')}`;
}

export function compareView(d,ui) {
  const {btn,choice,icon,webGraph,completedFooter}=ui;
  const simple=['plants','grasshopper','frog','snake'];
  const reflection=d.tested.length===2?`<div class="reflection inline-reflection"><h3>두 모형의 반응이 다른 까닭은?</h3><div class="choices">${choice('B에는 사라진 생물을 거치지 않는 다른 먹이 길이 있어.','compare-answer','paths',d.answer==='paths')}${choice('생물의 종류가 많으면 어떤 변화에도 항상 안전해.','compare-answer','always',d.answer==='always')}</div></div>`:'';
  return `<div class="button-row compare-tools">${choice(`메뚜기 제거${d.tested.includes('grasshopper')?' · 확인':''}`,'compare-remove','grasshopper',d.removed==='grasshopper')}${choice(`개구리 제거${d.tested.includes('frog')?' · 확인':''}`,'compare-remove','frog',d.removed==='frog')}${btn(`${icon('reset')} 복원`,'compare-remove','','button')}</div><div class="compare-grid">${[['A','한 갈래 먹이사슬',chainEdges,simple],['B','여러 갈래 먹이그물',foodEdges,organisms.map(o=>o.id)]].map(([id,title,edges,active])=>{const hasPath=!d.removed||reachable(edges,active,d.removed).has('snake');return `<section class="compare-panel"><h3><span>${id}</span>${title}</h3>${webGraph(edges,{active,removed:d.removed,action:null,small:true,graphId:id})}<p class="comparison-result ${d.removed?(hasPath?'path-remains':'path-lost'):''}"><span>뱀까지 남은 먹이 길</span><b>${d.removed?(hasPath?'✓ 있음':'× 없음'):'제거 전'}</b></p></section>`;}).join('')}</div><div class="compare-reflection">${reflection}${completedFooter('p06',d.answer==='paths','비교 기록하기')}<details class="stage-note"><summary>비교 모형 안내</summary><p>실선은 이어진 먹이 길, 점선은 끊긴 먹이 길이야. 실제 생태계에는 물·기후·서식처 같은 조건도 영향을 줘.</p></details></div>`;
}

export function timeReflection(d,ui) {
  const {choice,completedFooter}=ui;
  if(d.seen.length<4)return `<div class="time-reading"><h3>관찰 지점</h3><div class="time-observation-points"><p><b>물</b><span>배수구 아래의 색과 쓰레기</span></p><p><b>숨을 곳</b><span>그루터기 주변의 풀</span></p></div><details class="stage-note"><summary>그림 안내</summary><p>변화의 방향을 보여 주는 그림이야. 실제 회복 시간을 뜻하지 않아.</p></details></div>`;
  return `<div class="reflection inline-reflection"><h3>비교해서 알게 된 사실은?</h3><div class="choices">${choice('오염원과 서식처를 돌본 쪽에서 생활 조건이 나아졌어.','time-answer','evidence',d.answer==='evidence')}${choice('대책이 없어도 모든 생태계는 곧 똑같이 회복돼.','time-answer','automatic',d.answer==='automatic')}</div></div>${completedFooter('p08',d.answer==='evidence','시간 변화 기록하기')}`;
}

export function timeView(d,ui) {
  const {btn,choice}=ui;
  return `<div class="button-row time-tools">${choice('대책 없음','time-policy','neglect',d.policy==='neglect')}${choice('오염원 줄이기 + 서식처 보호','time-policy','protect',d.policy==='protect')}</div><section class="time-visual" aria-label="같은 물가의 전후 비교"><div class="time-scene-captions"><b>변화 후</b><span>변화 전</span></div><div class="time-scene scene">${riverArt('before')}<div class="changed-scene ${d.policy}" style="clip-path:inset(0 ${100-d.position}% 0 0)">${riverArt(d.policy)}</div><div class="comparison-handle" style="--handle-position:${d.position}%" aria-hidden="true"><span>↔</span></div></div><label class="sr-only" for="time-range">전후 비교</label><div class="time-scrub-controls"><input id="time-range" aria-label="전후 비교 슬라이더" type="range" min="0" max="100" value="${d.position}"><div class="button-row time-jump-tools">${btn('변화 전','time-jump','0','button',`aria-pressed="${d.position<=5}"`)}${btn('변화 후','time-jump','100','button',`aria-pressed="${d.position>=95}"`)}</div></div><div class="time-observation sr-only"><b>배수구의 물 · 그루터기의 풀</b><span>확인한 장면 ${d.seen.length}/4</span></div></section><div class="time-reflection">${timeReflection(d,ui)}</div>`;
}

export function finalView(d, ui, tab) {
  const {btn,choice,icon,webGraph,savedWeb}=ui,result=finalCheck(d);
  const tabs=[['elements','1 요소'],['connections','2 먹이 길'],['policies','3 보전 대책']];
  const elementCard=e=>btn(`<span>${specimenArt(e.id)}</span><b>${e.name}</b>${d.elements.includes(e.id)?'<i>✓</i>':''}`,'element',e.id,`element ${d.elements.includes(e.id)?'selected':''}`,`data-drag="element" data-item="${e.id}" aria-pressed="${d.elements.includes(e.id)}" aria-label="${e.name} ${d.elements.includes(e.id)?'거두기':'배치'}"`);
  const foodGuide=`<details class="compact-food-guide"><summary>먹이 수첩</summary><div>${organisms.map(o=>`<p><b>${specimenArt(o.id,'inline-art')} ${o.name}</b><span>${o.hint}</span></p>`).join('')}</div></details>`;
  const palette=tab==='elements'?
    `${savedWeb&&!foodEdges.every(edge=>d.edges.includes(edge))?`<div class="saved-web-import">${btn('내 먹이그물 가져오기','final-import','','button secondary')}</div>`:''}<div class="element-grid organism-elements">${finalElements.slice(0,6).map(elementCard).join('')}</div><div class="element-grid environment-elements">${finalElements.slice(6).map(elementCard).join('')}</div>`:
    tab==='connections'?`<div class="connection-tools"><b class="connection-count">연결 ${d.edges.length}/8</b>${btn(`${icon('reset')} 마지막 선 지우기`,'final-undo','','button',d.edges.length?'':'disabled')}</div>${foodGuide}`:
    `<div class="palette-budget">남은 자원 <b>${6-strategyCost(d.strategies)}/6</b></div><div class="choices policy-choices">${strategies.map(s=>choice(`${specimenArt(s.id,'inline-art')} ${s.name} · 2`,'final-strategy',s.id,d.strategies.includes(s.id))).join('')}</div>`;
  const feedback=d.tested?result.success?
    `<b class="test-success">✓ ${d.shock?'메뚜기 없이도 먹이 길이 이어져!':'기본 가동 통과'}</b>`:
    `<div class="diagnosis-chips">${result.checks.map((c,i)=>`<span class="${c.ok?'ok':'needs-work'}">${icon(c.ok?'check':'info')}${['빛·물·흙','생산·분해','먹이 길','오염원·서식처'][i]}</span>`).join('')}</div><p>${result.checks.find(c=>!c.ok)?.hint}</p>`:'';
  const environment=finalElements.slice(6).filter(e=>d.elements.includes(e.id));
  return `<div class="design-tabs" role="group" aria-label="생태계 설계 단계">${tabs.map(([id,t])=>btn(t,'design-tab',id,`button ${tab===id?'selected':''}`,`aria-pressed="${tab===id}"`)).join('')}</div><div class="final-layout"><aside class="element-palette" data-tab="${tab}" aria-label="${tabs.find(([id])=>id===tab)[1]}">${palette}</aside><section class="design-area"><div class="final-habitat" data-drop="element" data-group="habitat"><div class="environment-tokens"><b class="design-stage-label">${d.shock?'메뚜기 부재 시험':'생태계 설계'}</b>${environment.map(e=>`<span>${specimenArt(e.id)} ${e.name}</span>`).join('')}</div>${d.elements.some(id=>organisms.some(o=>o.id===id))?webGraph(d.edges,{active:d.elements,selected:d.selected,removed:d.shock?'grasshopper':'',action:'final-edge',graphId:'final'}):`<div class="empty-habitat">${specimenArt('plants')}<h3>나만의 생태계</h3></div>`}</div>${feedback?`<div class="design-feedback" aria-live="polite">${feedback}</div>`:''}</section></div><div class="work-footer final-footer"><details class="food-help"><summary>시험 기록 · ${d.trials.length}회</summary><ol>${d.trials.map(t=>`<li>${htmlText(t)}</li>`).join('')}</ol></details><div class="run-controls">${d.tested&&result.success?(d.shock?btn(`${icon('trophy')} 복원 완료`,'final-finish','','button golden'):btn('메뚜기 부재 시험','final-shock','','button golden')):btn(`${icon('play')} ${d.shock?'수정안 시험':'생태계 가동'}`,'final-run','','button primary')}</div></div>`;
}

export function causeView(d,ui) {
  const {btn,icon,completedFooter}=ui,c=causes[d.row];
  if(d.solved.length===2)return `<div class="cause-findings">${causes.map(c=>`<article><h3>${icon('check')}${c.title}</h3><ol class="cause-finding-path">${[['사람의 행동',c.action[0]],['환경 변화',c.change[0]],['생물의 영향',c.impact[0]]].map(([label,text])=>`<li><small>${label}</small><b>${text}</b></li>`).join('')}</ol></article>`).join('')}</div>${completedFooter('p07',true,'원인 추적 마치기')}`;
  const keys=['action','change','impact'];
  const tokens=keys.flatMap((key,i)=>c[key].map((t,j)=>({key,j,t,sort:(i*2+j*3)%7}))).sort((a,b)=>a.sort-b.sort);
  return `<div class="cause-investigation"><div class="cause-banner ${c.id}">${riverArt('before')}<div><small>현장 ${d.solved.length+1}/2</small><h3>${c.title}</h3><p>${c.clue}</p></div></div><div class="cause-board"><div class="cause-token-tray">${tokens.map(({key,j,t})=>btn(`${d.picks[key]===j?icon('check'):''}<span>${t}</span>`,'cause-pick',`${key}:${j}`,`cause-token ${d.picks[key]===j?'selected':''}`,`data-drag="cause" data-item="${key}:${j}" aria-pressed="${d.picks[key]===j}"`)).join('')}</div><div class="cause-drop-chain">${[['action','사람의 행동'],['change','환경 변화'],['impact','생물의 영향']].map(([key,label],i)=>`<section data-drop="cause" data-group="${key}"><div class="cause-slot ${d.picks[key]!==undefined?'filled':''}"><small><span>${i+1}</span>${label}</small><b>${d.picks[key]===undefined?'—':c[key][d.picks[key]]}</b></div></section>`).join(`<span class="chain-arrow">${icon('next')}</span>`)}</div></div></div>${completedFooter('p07',false,'원인 추적 마치기')}`;
}

export function strategyView(d,ui,reflect) {
  const {btn,choice,icon,tag,metrics,strategyCards,completedFooter}=ui,values=recovery(d.selected);
  if(!reflect)return `<div class="workspace-label">${tag('복원 작전')}<span class="budget">남은 자원 <b>${6-strategyCost(d.selected)}</b> / 6</span></div>${strategyCards(d.selected)}<div class="work-footer">${btn(`${icon('play')} 작전 실행`,'strategy-run','','button primary',d.selected.length?'':'disabled')}</div>`;
  const previous=d.history.slice(0,-1).map(s=>{try{return JSON.parse(s);}catch{return [];}});
  return `<div class="workspace-label">${tag('작전 결과')}<span>${d.selected.map(id=>strategies.find(s=>s.id===id)?.name).join(' · ')}</span></div><div class="strategy-evaluation"><section class="strategy-outcome">${metrics(values)}<details class="stage-note strategy-applied"><summary>실행한 대책 보기</summary><div>${restorationBoard(d.selected)}</div></details>${previous.length?`<details class="stage-note strategy-comparisons"><summary>이전 작전 ${previous.length}개 비교</summary><div>${previous.map((ids,i)=>`<section><b>작전 ${i+1}: ${ids.map(id=>strategies.find(s=>s.id===id)?.name).join(' · ')}</b>${metrics(recovery(ids))}</section>`).join('')}</div></details>`:''}${btn(`${icon('reset')} 작전 바꾸기`,'strategy-edit','','button secondary')}</section><section class="strategy-reflection"><h3>먼저 해결하려 한 문제는?</h3><div class="choices">${d.selected.map(id=>choice(strategies.find(s=>s.id===id).desc,'strategy-reason',id,d.reason===id)).join('')}</div></section></div>${completedFooter('p09',d.ran&&!!d.reason,'작전 기록하기')}`;
}
