import { experimentView, finalView, causeView, compareView, timeView, timeReflection, strategyView } from './experiences.js';
import { readyToRecord, nextUnplaced, nextConnection, importFoodWeb } from './progress.js';
import { mountInteractions } from './interactions.js';
import { concepts, hints, nextCue } from './learning.js';
import { configureAudio, playSound, stopAudio, mediaPriority } from './audio.js';
import { chapters, activities, observations, specimens, roles, predictions, organisms, foodEdges, chainEdges, strategies, finalElements, causes } from './data.js';
import { SAVE_KEY, initialState, restoreState, accessible, evidenceCount, chapterDone, strategyCost, recovery, reachable, finalCheck } from './engine.js';
import { mountMap } from './map.js';
import { specimenArt, riverArt } from './visuals.js';
import { playFeedback } from './feedback.js';

const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const notice = document.querySelector('#notice');
const paths = {
  home: '<path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10"/>', back: '<path d="m13 5-7 7 7 7M6 12h15"/>', next: '<path d="m10 5 7 7-7 7M4 12h13"/>',
  sound: '<path d="M11 4 6 8H3v8h3l5 4V4ZM15 8q5 4 0 8M18 4q9 8 0 16"/>', mute: '<path d="M11 4 6 8H3v8h3l5 4V4Zm5 5 6 6m0-6-6 6"/>',
  settings: '<path d="m9 3-1 3-3 1v4l-2 1 2 2v3l3 1 1 3h6l1-3 3-1v-3l2-2-2-1V7l-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
  leaf: '<path d="M5 19C-1 7 9 2 21 3c1 12-5 20-16 16Zm0 0L16 8"/>', search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  web: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="11" cy="19" r="2"/><path d="m7 5 10 1M6 7l4 10M18 8l-6 9"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>', flag: '<path d="M5 22V3c6-5 9 5 15 0v11c-6 5-9-5-15 0"/>',
  book: '<path d="M12 5C8 2 4 2 2 3v16c4-1 7 0 10 2 3-2 6-3 10-2V3c-2-1-6-1-10 2Zm0 0v16"/>', check: '<path d="m5 12 5 5L20 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>', play: '<path d="m7 3 15 9-15 9Z"/>',
  reset: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>', close: '<path d="m5 5 14 14M19 5 5 19"/>', trophy: '<path d="M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 3v6m-5 0h10"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v1"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
const esc = str => String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn = (label, action, value = '', cls = 'button', attrs = '') => `<button class="${cls}" data-action="${action}" data-value="${esc(value)}" ${attrs}>${label}</button>`;
const moa = (cls = '') => `<div class="moa ${cls}" role="img" aria-label="수달 연구원 모아"></div>`;
const tag = text => `<span class="tag">${text}</span>`;
const choice = (label, action, value, on = false, disabled = false) => btn(`${on ? icon('check') : '<span class="choice-dot"></span>'}${label}`, action, value, `choice ${on ? 'selected' : ''}`, `aria-pressed="${on}" ${disabled ? 'disabled' : ''}`);
let state = initialState(), loadWarning = '', saveError = false;
try {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) { const parsed = JSON.parse(raw); state = restoreState(parsed); if(parsed.version !== 1) loadWarning = '저장 형식이 달라 새 탐험을 준비했어.'; }
} catch { loadWarning = '저장 기록을 읽지 못했어. 새 탐험을 시작할 수 있어.'; }
let strategyReflect=false;
let feedbackEvent;
let selectedSpecimen='', selectedRole='', hintLevel=0, hintOpen=false, designTab='elements', chainedSource='';
let route = '', mapView, mapChapter = 0, historyRoutes = [], goingBack = false, toastTimer, focusBeforeModal, experimentTimer;
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); saveError = false; }
  catch { saveError = true; toast('이 브라우저에 저장할 수 없어. 창을 닫으면 진행이 사라질 수 있어.'); }
}
function toast(text, error = false) { if(error){configureAudio(state.muted);playSound('error');} notice.textContent = text; notice.className = `toast show ${error ? 'error' : ''}`; clearTimeout(toastTimer); toastTimer = setTimeout(() => notice.classList.remove('show'), 5200); }
function sound(success=false) { configureAudio(state.muted); playSound(success?'success':'tap'); }

function go(next) { if(route === next) render(); else location.hash = next; }
function header() {
  return `<header class="topbar"><div class="nav-group">${btn(icon('home'),'go','home','icon-button',`aria-label="홈" ${route==='home'?'disabled':''}`)}${btn(icon('back'),'back','','icon-button',`aria-label="이전" ${route==='home'&&!historyRoutes.length?'disabled':''}`)}<a class="brand" href="#home">${icon('leaf')}<span>생명의 그물 지도<small>모아의 생태 탐험</small></span></a></div><nav class="chapter-progress" aria-label="장별 진행">${chapters.map((c,i)=>`<span class="${chapterDone(state,i)?'done':activities.find(a=>a.id===route)?.chapter===i?'current':''}" title="${i+1}장 ${c.name}">${chapterDone(state,i)?icon('check'):i+1}</span>`).join('<i></i>')}</nav><div class="nav-group"><span class="evidence-counter">${icon('book')}<span>조사 기록 <b>${evidenceCount(state)}/5</b></span></span>${btn(icon(state.muted?'mute':'sound'),'mute','','icon-button',`aria-label="${state.muted?'소리 켜기':'소리 끄기'}" aria-pressed="${state.muted}"`)}${btn(icon('settings'),'settings','','icon-button','aria-label="설정"')}</div></header>`;
}
function homePage() {
  const started = state.completed.length || state.last !== 'map' || state.drafts.p01.found.length;
  return `<main id="main" class="home-page"><div class="home-haze"></div><section class="home-intro"><div class="eyebrow">${icon('leaf')} 초등 과학 · 생물과 환경</div><h1 class="sr-only">생명의 그물 지도</h1><div class="logo-crop"><img src="./assets/branding/originals/chatgpt_generated_39.png" alt="생명의 그물 지도"></div><h2>작은 발견이 모여,<br>숲의 내일을 바꿔.</h2><p>숲과 물가에서 이상 신호가 발견됐어.<br>모아와 함께 생명의 연결을 되찾으러 갈까?</p>${btn(`${icon('play')}${started?'이어서 탐험하기':'탐험 시작하기'}${icon('next')}`,'go',started?state.last:'map','button primary hero-start')}${started?btn('탐험 지도 보기','go','map','text-button'):''}<div class="home-meta">5개의 장소 <span>·</span> 10개의 탐구 <span>·</span> 나만의 복원 작전</div></section><div class="hero-guide"><div class="speech">반가워, 탐험가!<br><b>나는 수달 연구원 모아야.</b><span>다람쥐 도토와 생명의 비밀을 찾아보자.</span></div>${moa('large')}</div><div class="home-steps"><div>${icon('search')}<span><small>첫 번째 발견</small><b>관찰하고</b></span></div><i>···</i><div>${icon('web')}<span><small>이어지는 관계</small><b>연결하고</b></span></div><i>···</i><div>${icon('leaf')}<span><small>우리의 실천</small><b>다시 살려 줘!</b></span></div></div><footer class="home-footer"><span>모든 탐험은 이 브라우저에 자동 저장돼.</span>${btn('탐험 안내 · 제작 정보','about','','text-button')}</footer></main>`;
}
function chapterCard(i) {
  const c=chapters[i];
  return `<div class="eyebrow">CHAPTER ${String(i+1).padStart(2,'0')}</div><span class="place-emblem" style="--chapter:${c.color}">${icon(c.icon)}</span><h2>${c.place}</h2><p>${c.name}</p><div class="reward-note">${icon('book')}<span>이곳에서 얻을 기록<b>${c.reward}</b></span></div><div class="activity-links">${activities.slice(i*2,i*2+2).map(a=>btn(`<span><small>${a.id.toUpperCase()} · ${a.verb}</small>${a.title}</span>${icon(state.completed.includes(a.id)?'check':accessible(state,a.id)?'next':'lock')}`,'go',a.id,'activity-link',accessible(state,a.id)?'':'disabled')).join('')}</div><small class="muted">${chapterDone(state,i)?'✓ 조사를 마친 장소야. 다시 탐험할 수 있어.':accessible(state,activities[i*2].id)?'두 활동을 마치면 다음 장소가 열려.':'앞 장소의 두 활동을 먼저 마쳐 줘.'}</small>`;
}
function mapPage() {
  return `<main id="main" class="page map-page"><div class="page-heading"><div><div class="eyebrow">ECO EXPLORER · 탐험 지도</div><h1>오늘은 어디를 탐험할까?</h1><p>장소를 골라 도토와 함께 출발해 봐.</p></div><span class="save-badge">${icon('check')}${saveError?'저장 안 됨':'진행 자동 저장'}</span></div><div class="map-layout"><section class="world-panel"><div class="map-caption"><span>${icon('leaf')} 에코리아 생태 탐험 지구</span>${tag(`${chapters.filter((_,i)=>chapterDone(state,i)).length} / 5 장소 조사 완료`)}</div><div class="pixel-map"><canvas id="map-canvas" tabindex="0" aria-label="탐험 지도. 방향키 또는 W A S D로 탐험가와 도토를 움직일 수 있어. 장소는 아래 버튼으로 선택해."></canvas>${chapters.map((c,i)=>btn(`<span>${chapterDone(state,i)?icon('check'):i+1}</span><b>${c.place}</b>`,'chapter',i,`map-marker ${mapChapter===i?'selected':''} ${accessible(state,activities[i*2].id)?'':'locked'}`,`style="left:${c.x}%;top:${c.y-12}%" aria-label="${i+1}장 ${c.place} 선택"`)).join('')}<div class="map-compass">N<span>✦</span>S</div></div><div class="map-tip">${icon('info')} 땅을 누르거나 방향키로 걸어 봐. 장소 버튼으로 바로 선택해도 좋아.</div></section><aside class="chapter-card" id="chapter-card">${chapterCard(mapChapter)}</aside></div><section class="record-strip"><span>${icon('book')} 모아의 조사 수첩</span>${chapters.map((c,i)=>`<div class="record ${state.completed.includes(['p02','p04','p06','p08','p09'][i])?'collected':''}">${icon(c.icon)}<span>${c.evidence}</span>${state.completed.includes(['p02','p04','p06','p08','p09'][i])?'✓':'—'}</div>`).join('')}</section></main>`;
}
function helper(a) {
  return `<aside class="mission-guide"><div class="guide-avatar" aria-hidden="true">${moa()}</div><div class="next-cue" aria-live="polite">${icon('flag')}<span>${nextCue(a.id,state.drafts[a.id])}</span></div><div class="guide-tools">${state.completed.includes(a.id)&&a.id==='p10'?btn(`${icon('play')} 개념 다시 보기`,'concept',a.id,'button subtle'):''}<div class="companion-wrap">${btn('<img src="./assets/characters/doto.svg" alt=""><span>도토의 힌트</span>','hint','','button companion-button',`aria-expanded="${hintOpen}" aria-controls="companion-hint" aria-label="도토의 힌트"`)}${hintOpen?`<div class="companion-hint" id="companion-hint" role="region" aria-label="도토의 단계별 힌트"><div class="hint-heading"><b>다람쥐 도토 · 힌트 ${hintLevel+1}/3</b>${btn(icon('close'),'hint-close','','icon-button','aria-label="힌트 닫기"')}</div><p>${hints[a.id][hintLevel]}</p><div class="hint-actions">${hintLevel<2?btn('한 걸음 더 알려 줘','hint-more','','text-button'):''}${btn('직접 해 볼게!','hint-close','','button secondary')}</div></div>`:''}</div></div></aside>`;
}
function completedFooter(id, eligible, label = '탐구 기록하기') {
  if(state.completed.includes(id)) {
    const next=activities[activities.findIndex(a=>a.id===id)+1];
    return `<div class="work-footer activity-complete"><div class="completion-copy" role="status"><b>${icon('check')} 탐구 기록 완료!</b><span>${concepts[id].title}</span></div><div class="completion-actions">${btn(`${icon('play')} 개념 보기`,'concept',id,'button subtle')}${btn(`다음 탐험${icon('next')}`,'completion-next',next?.id||'map','button primary',`aria-label="다음 탐험: ${next?.title||'탐험 지도'}"`)}</div></div>`;
  }
  return `<div class="work-footer"><span>${icon('book')} 발견을 마치면 자동으로 기록돼.</span>${eligible?btn(`${label}${icon('check')}`,'complete',id,'button secondary'):''}</div>`;
}
function metrics(values, labels = ['물 상태','서식처','숲 상태']) {
  const experiment=labels[0]==='양분 공급';
  return `<div class="metrics">${values.map((v,i)=>`<div><span>${labels[i]}</span><div class="meter"><i style="width:${v}%"></i></div><b>${experiment?(v<40?'줄어듦':v>75?'늘어남':'기본 수준'):(v<40?'돌봄 필요':v<70?'개선 중':'좋아짐')}</b></div>`).join('')}</div>`;
}
function renderObservation() {
  const d=state.drafts.p01,o=observations.find(o=>o.id===d.current);
  return `<div class="workspace-label">${tag('현장 조사')}<span>단서 ${d.found.length} / 4</span></div><div class="observation-layout"><div class="scene observe-scene">${observations.map((o,i)=>btn(`<span class="observation-target">${specimenArt(o.id)}</span>${d.found.includes(o.id)?icon('check'):icon('search')}<b>${o.name}</b>`,'observe',o.id,`hotspot ${d.found.includes(o.id)?'found':''}`,`style="left:${o.x}%;top:${o.y}%" aria-label="${o.name} 관찰"`)).join('')}<span class="scene-label">관찰의 물가 · 네 곳의 흔적</span></div><aside class="observation-note">${o?`<span class="specimen-emoji">${specimenArt(o.id)}</span><h3>${o.name}</h3><p>${o.text}</p>${o.choices.map((text,i)=>choice(text,'observe-answer',i,d.found.includes(o.id)&&i===o.correct,d.found.includes(o.id))).join('')}`:`<span class="note-illustration">${icon('search')}</span><h3>작은 흔적을 찾아봐</h3><p>풍경 속 돋보기를 누르면 관찰 수첩이 열려.</p><div class="hint">물이 흐른다고 살아 있는 것은 아니야. 자라고 번식하는 특징을 생각해 봐.</div>`}</aside></div>${completedFooter('p01',d.found.length===4,'관찰 마치기')}`;
}
function renderClassify() {
  const d=state.drafts.p02;
  if(!selectedSpecimen)selectedSpecimen=nextUnplaced(specimens,d.groups);
  const card=s=>btn(`<span>${specimenArt(s.id)}</span><b>${s.name}</b>`,'specimen-pick',s.id,`drag-card ${selectedSpecimen===s.id?'selected':''}`,`data-drag="classify" data-item="${s.id}" aria-pressed="${selectedSpecimen===s.id}" aria-label="${s.name} 카드 선택"`);
  return `<div class="workspace-label">${tag('생태 스코프')}<span>선택된 카드의 상자를 골라. 다음 카드는 자동으로 선택돼.</span></div><div class="specimen-tray" aria-label="분류할 카드">${specimens.filter(s=>!d.groups[s.id]).map(card).join('')||'<p>여섯 카드를 모두 옮겼어. 기준을 확인해 봐!</p>'}</div><div class="sort-zones">${[['living','생물','스스로 자라고 살아가.'],['nonliving','비생물','생물이 살아갈 환경이야.']].map(([id,name,desc])=>`<section class="sort-zone" data-drop="classify" data-group="${id}" aria-label="${name} 조사 상자">${btn(`<b>${name} 조사 상자</b><span>${desc}</span>`,'specimen-place',id,'zone-label',`aria-label="선택한 카드를 ${name} 상자에 놓기"`)}<div class="placed-cards">${specimens.filter(s=>d.groups[s.id]===id).map(card).join('')}</div></section>`).join('')}</div>${Object.keys(d.groups).length===6?`<div class="transfer"><div><h3>다른 연못에서도 적용해 볼까?</h3><p>물고기에게 꼭 필요한 <b>연못의 물</b>은?</p></div>${choice('생물','transfer','living',d.transfer==='living')}${choice('비생물','transfer','nonliving',d.transfer==='nonliving')}</div>`:''}${completedFooter('p02',specimens.every(s=>d.groups[s.id])&&!!d.transfer,'분류 확인하기')}`;
}
function renderRoles() {
  const d=state.drafts.p03;
  if(!selectedRole)selectedRole=nextUnplaced(roles,d.roles);
  const card=r=>btn(`<span>${specimenArt(r.id)}</span><div><b>${r.target}</b><small>${r.clue}</small></div>`,'role-pick',r.id,`role-token ${selectedRole===r.id?'selected':''}`,`data-drag="role" data-item="${r.id}" aria-pressed="${selectedRole===r.id}"`);
  return `<div class="workspace-label">${tag('양분 탐정')}<span>선택된 카드의 역할을 골라. 끌어 놓아도 좋아.</span></div><div class="role-tray">${roles.filter(r=>!d.roles[r.id]).map(card).join('')||'<p>세 역할을 연결했어. 양분을 얻는 방법을 다시 확인해!</p>'}</div><div class="role-zones">${roles.map(r=>`<section class="role-zone" data-drop="role" data-group="${r.id}">${btn(`<b>${r.name}</b><small>${{producer:'스스로 양분을 만들어.',consumer:'다른 생물을 먹어.',decomposer:'죽은 생물을 분해해.'}[r.id]}</small>`,'role-place',r.id,'zone-label',`aria-label="선택한 카드를 ${r.name}에 놓기"`)}${roles.filter(v=>d.roles[v.id]===r.id).map(card).join('')}</section>`).join('')}</div>${completedFooter('p03',roles.every(r=>d.roles[r.id]),'역할 확인하기')}`;
}
function renderExperiment(){return experimentView(state.drafts.p04,{btn,choice,icon,tag,metrics,completedFooter});}

function webGraph(edges, { active = organisms.map(o=>o.id), selected = '', removed = '', action = 'edge', small = false, graphId = 'web' }={}) {
  const pts=Object.fromEntries(organisms.map(o=>[o.id,o]));
  const reached=removed?reachable(edges,active,removed):new Set(active);
  return `<div class="food-web ${small?'small-web':''}"><svg viewBox="0 0 100 100" preserveAspectRatio="none" class="web-lines" aria-hidden="true"><defs><marker id="arrow-${graphId}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0 0 6 3 0 6Z" fill="#438d75"/></marker></defs>${edges.map(e=>{const[a,b]=e.split('>'),p=pts[a],q=pts[b];if(!p||!q||!active.includes(a)||!active.includes(b))return '';const off=a===removed||b===removed||!reached.has(a), dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy);return `<line x1="${p.x+dx/len*7}" y1="${p.y+dy/len*7}" x2="${q.x-dx/len*8}" y2="${q.y-dy/len*8}" class="${off?'broken':'flow-line'}" marker-end="url(#arrow-${graphId})"/>${!off&&!state.reduced&&!matchMedia('(prefers-reduced-motion: reduce)').matches?`<circle r="1" class="energy-dot"><animateMotion dur="2.8s" repeatCount="indefinite" path="M${p.x+dx/len*7},${p.y+dy/len*7} L${q.x-dx/len*8},${q.y-dy/len*8}"/></circle>`:''}`;}).join('')}</svg>${organisms.filter(o=>active.includes(o.id)).map(o=>action?btn(`<span>${specimenArt(o.id)}</span><b>${o.name}</b>`,action,o.id,`web-node ${selected===o.id?'selected':''} ${removed===o.id?'removed':''}`,`style="left:${o.x}%;top:${o.y}%" aria-pressed="${selected===o.id}" aria-label="${o.name} 연결"`):`<div class="web-node static ${removed===o.id?'removed':removed?(reached.has(o.id)?'reachable':'disconnected'):''}" style="left:${o.x}%;top:${o.y}%"><span>${specimenArt(o.id)}</span><b>${o.name}</b></div>`).join('')}</div>`;
}
function renderWeb() {
  const d=state.drafts.p05;
  return `<div class="workspace-label">${tag('먹히는 생물 → 먹는 생물')}<span>연결 ${d.edges.length} / ${foodEdges.length}</span></div><div class="web-layout"><section>${webGraph(d.edges,{selected:d.selected})}<div class="web-toolbar"><span>${d.selected?`<b>${organisms.find(o=>o.id===d.selected)?.name}</b>을/를 먹는 생물을 골라 줘.`:'먹히는 생물을 먼저 눌러 줘. 이어진 생물은 자동으로 선택돼.'}</span>${btn(`${icon('reset')} 마지막 선 지우기`,'undo-edge','','button',d.edges.length?'':'disabled')}</div></section><details class="field-guide"><summary>먹이 관찰 수첩</summary><div><h3>${icon('book')} 먹이 관찰 수첩</h3>${organisms.map(o=>`<p><b>${specimenArt(o.id)} ${o.name}</b><span>${o.hint}</span></p>`).join('')}</div></details></div>${completedFooter('p05',foodEdges.every(e=>d.edges.includes(e)),'먹이그물 기록하기')}`;
}
function renderCompare(){return compareView(state.drafts.p06,{btn,choice,icon,tag,webGraph,completedFooter});}

function renderCauses(){return causeView(state.drafts.p07,{btn,icon,tag,completedFooter});}

function renderTime(){return timeView(state.drafts.p08,{btn,choice,icon,tag,completedFooter});}

function strategyCards(ids, action='strategy') {
  return `<div class="strategy-grid">${strategies.map(s=>btn(`<span class="strategy-art">${specimenArt(s.id)}</span><span class="strategy-content"><b>${s.name}</b><small>${s.desc}</small></span><span class="cost">${ids.includes(s.id)?icon('check'):'2'}<small>${ids.includes(s.id)?'선택':'포인트'}</small></span>`,action,s.id,`strategy-card ${ids.includes(s.id)?'selected':''}`,`aria-pressed="${ids.includes(s.id)}"`)).join('')}</div>`;
}
function renderStrategy(){return strategyView(state.drafts.p09,{btn,choice,icon,tag,metrics,strategyCards,completedFooter},strategyReflect);}

function reportPage() {
  const records=['p02','p04','p06','p08','p09'];
  return `<div class="workspace-label">${tag('최종 보고서')}<span>모은 증거 ${evidenceCount(state)}/5</span></div><h2 class="report-title">우리의 발견을 한 장에 모았어.</h2><div class="report-grid">${chapters.map((c,i)=>`<article class="report-record ${state.completed.includes(records[i])?'':'missing'}"><span class="stamp">${icon(c.icon)}</span><div><small>증거 ${String(i+1).padStart(2,'0')} · ${state.completed.includes(records[i])?'수집 완료':'미수집'}</small><h3>${c.evidence}</h3><p>${state.completed.includes(records[i])?c.summary:'아직 조사 기록이 없어. 지도에서 이 활동을 해 볼 수 있어.'}</p></div></article>`).join('')}</div><details class="report-personal"><summary>내 탐험의 흔적 펼치기</summary><p>역할 실험 예상: ${esc(predictions.find(([id])=>id===state.drafts.p04.prediction)?.[1] || '아직 기록하지 않았어.')}</p><p>역할 실험 관찰: ${esc(state.drafts.p04.step===2 ? roles.find(r=>r.id===state.drafts.p04.removed)?.result : "아직 관찰하지 않았어.")}</p><p>먹이그물 시험: ${state.drafts.p06.tested.length ? state.drafts.p06.tested.map(id=>esc(organisms.find(o=>o.id===id)?.name)).join(' · ')+' 제거 시험 완료' : '아직 시험하지 않았어.'}</p><p>복원 작전: ${state.drafts.p09.selected.map(id=>strategies.find(s=>s.id===id)?.name).join(' · ') || '아직 선택하지 않았어.'}</p></details><div class="work-footer"><span>이제 새로운 물가를 직접 설계해 보자.</span>${btn(`최종 미션 시작${icon('next')}`,'final-start','','button primary')}</div>`;
}
function finalDesign(){return finalView(state.drafts.p10,{btn,choice,icon,tag,webGraph,savedWeb:state.completed.includes('p05')&&readyToRecord('p05',state.drafts.p05)},designTab);}

function endingPage(certificate=false) {
  const d=state.drafts.p10,vals=recovery(d.strategies),collected=evidenceCount(state);
  if(certificate) return `<div class="certificate"><div class="eyebrow">ECO EXPLORER CERTIFICATE</div><div class="certificate-seal">${icon('leaf')}</div><h2>생명의 연결을 지킨<br>생태 탐험가</h2><p>생물과 환경의 관계를 관찰하고,<br>직접 설계한 생태계를 시험하고 완성했어.</p><div class="certificate-stats"><span><b>${collected}/5</b>수집한 증거</span><span><b>${d.trials.length}회</b>생태계 가동</span><span><b>완료</b>변화 대응 시험</span></div><p class="certificate-strategies">내 보전 실천: ${d.strategies.map(id=>strategies.find(s=>s.id===id)?.name).join(' · ')}</p><div class="certificate-sign">수달 생태연구원 모아 ${icon('check')}</div><small>생명의 그물 지도 · 생물과 환경</small></div><div class="work-footer no-print">${btn(`${icon('back')} 엔딩으로`,'final-phase','ending','button')}${btn('인증서 인쇄 / PDF 저장','print','','button primary')}${btn('탐험 지도로','go','map','button')}</div>`;
  return `<div class="ending-scene scene">${riverArt("protect")}<div class="ending-glow"></div><div class="ending-content"><span class="ending-badge">${icon('trophy')} 복원 미션 완료</span><h2>다시 이어진,<br>생명의 그물.</h2><p>네가 찾은 증거와 고친 설계가<br>생물들의 먹이 길을 이어 줬어.</p>${moa('ending-moa')}</div><span class="ending-animal one">${specimenArt("frog")}</span><span class="ending-animal two">${specimenArt("sparrow")}</span></div><div class="ending-report"><div><h3>우리의 작전이 만든 변화</h3><p>${d.strategies.includes('trees')?'숲을 되살릴 나무를 심었어. 물에 남은 오염은 계속 살펴보자.':d.strategies.includes('clean')?'물에 쌓인 오염을 줄였어. 훼손된 숲도 앞으로 돌봐 주자.':'오염 원인과 서식처를 돌봤어. 물과 숲의 남은 문제도 지켜보자.'}</p></div>${metrics(vals)}</div><div class="work-footer">${btn('설계 다시 살펴보기','final-phase','design','button')}${btn(`${icon('trophy')} 탐험 인증서 받기`,'final-phase','certificate','button primary')}</div>`;
}
function activityPage(a) {
  const views=[renderObservation,renderClassify,renderRoles,renderExperiment,renderWeb,renderCompare,renderCauses,renderTime,renderStrategy,()=>{const phase=state.drafts.p10.phase;return phase==='report'?reportPage():phase==='design'?finalDesign():endingPage(phase==='certificate');}];
  return `<main id="main" class="page activity-page"><div class="page-heading activity-heading"><div><div class="eyebrow">${a.id.toUpperCase()} <span>/</span> ${a.chapter+1}장 · ${a.verb}</div><h1>${a.title}</h1></div><span class="activity-count">${Number(a.id.slice(1))}<small> / 10</small></span></div><div class="mission-layout ${a.id==='p10'&&state.drafts.p10.phase==='design'?'final-workbench':''}">${helper(a)}<section class="work-area" aria-label="${a.title}">${views[activities.indexOf(a)]()}</section></div></main>`;
}
function render() {
  const active=document.activeElement;const focusAction=active?.dataset?.action,focusValue=active?.dataset?.value;
  mapView?.dispose();mapView=null;
  document.documentElement.classList.toggle('reduced-motion',state.reduced);
  configureAudio(state.muted);
  document.body.dataset.route=route;
  const a=activities.find(a=>a.id===route);
  app.innerHTML=header()+(route==='home'?homePage():route==='map'?mapPage():a?activityPage(a):homePage());
  if(route==='map')mapView=mountMap(document.querySelector('#map-canvas'),state,state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches);
  if(focusAction&&!modal.open) {
    const same=Array.from(app.querySelectorAll('[data-action]')).find(b=>!b.disabled&&b.dataset.action===focusAction&&b.dataset.value===focusValue);
    const fallback=app.querySelector('.activity-complete [data-action="completion-next"], .hotspot:not(.found), .experiment-controls button:not(:disabled), [data-action="final-shock"], [data-action="final-finish"]');
    (same||fallback)?.focus({preventScroll:true});
  }
  scheduleExperiment();
  playFeedback(feedbackEvent,state.reduced);feedbackEvent=undefined;
}
function routeChanged() {
  clearTimeout(experimentTimer);experimentTimer=undefined;
  chainedSource='';
  stopAudio();
  let next=location.hash.slice(1)||'home';
  if(!['home','map',...activities.map(a=>a.id)].includes(next))next='home';
  if(next.startsWith('p')&&!accessible(state,next)){next='map';toast('앞 활동을 마치면 열려. 수업 시연은 설정에서 전체 해금할 수 있어.');history.replaceState(null,'','#map');}
  if(route&&route!==next&&!goingBack){historyRoutes.push(route);if(historyRoutes.length>40)historyRoutes.shift();}
  if(route!==next){hintOpen=false;hintLevel=0;selectedSpecimen='';selectedRole='';strategyReflect=next==='p09'&&state.drafts.p09.ran;}
  goingBack=false;route=next;
  if(route!=='home'){state.last=route;save();}
  if(route==='map'){const first=chapters.findIndex((_,i)=>!chapterDone(state,i));mapChapter=first<0?4:first;}
  if(route==='p10'){
    const d=state.drafts.p10;
    if(!d.initialized){d.strategies=[...state.drafts.p09.selected];d.initialized=true;save();}
    if(['ending','certificate'].includes(d.phase)&&(!state.completed.includes('p10')||!d.shock||!finalCheck(d).success)){d.phase='design';save();}
  }
  autoRecord();render();window.scrollTo(0,0);document.querySelector('h1')?.setAttribute('tabindex','-1');document.querySelector('h1')?.focus({preventScroll:true});
}
function scheduleExperiment() {
  clearTimeout(experimentTimer);experimentTimer=undefined;
  const d=state.drafts.p04;
  if(route!=='p04'||!d.ran||d.step>=2||d.restored||document.hidden||modal.open)return;
  experimentTimer=setTimeout(()=>{
    experimentTimer=undefined;
    if(route!=='p04'||location.hash!=='#p04'||state.drafts.p04!==d||document.hidden||modal.open)return;
    d.step=Math.min(2,d.step+1);save();render();
  },1000);
}
document.addEventListener('visibilitychange',scheduleExperiment);
function openModal(html) {
  clearTimeout(experimentTimer);experimentTimer=undefined;
  if(!modal.open)focusBeforeModal=document.activeElement;
  modal.querySelector('video')?.pause();modal.classList.remove('concept-modal');mediaPriority(false);
  modal.innerHTML=html;
  const title=modal.querySelector('h2');if(title){title.id='modal-title';modal.setAttribute('aria-labelledby','modal-title');}
  if(!modal.open)modal.showModal();
  modal.querySelector('button:not(:disabled)')?.focus();
}
function closeModal() { modal.querySelector('video')?.pause();mediaPriority(false);modal.close();focusBeforeModal?.focus?.();scheduleExperiment(); }
function showConcept(id, next='') {
  const c=concepts[id];if(!c)return;
  const reduceVideo=state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
  mediaPriority(true);
  const nextLabel=next?activities.find(a=>a.id===next)?.title:'탐험 계속하기';
  openModal(`<div class="modal-heading"><div><div class="eyebrow">${state.completed.includes(id)?'발견을 기록했어!':'개념 한눈에'} · 12초</div><h2>${c.title}</h2></div>${btn(icon('close'),'close','','icon-button','aria-label="개념 영상 닫기"')}</div><video class="concept-video" controls playsinline preload="metadata" ${reduceVideo?'':'autoplay'} poster="./assets/concepts/${id}.jpg" aria-label="${c.title} 개념 영상"><source src="./assets/concepts/${id}.mp4" type="video/mp4"><track kind="captions" srclang="ko" label="한국어" src="./assets/concepts/${id}.vtt">이 브라우저에서는 아래 개념 글을 읽어 줘.</video><div class="media-status" role="status"></div><details class="concept-transcript"><summary>개념 글로 읽기</summary><ol>${c.lines.map(t=>`<li>${t}</li>`).join('')}</ol></details><div class="concept-footer"><span>영상은 다시 볼 수 있어.</span>${btn(`${nextLabel}${icon('next')}`,next?'completion-next':'close',next,'button primary')}</div>`);
  modal.classList.add('concept-modal');mediaPriority(true);
  const video=modal.querySelector('video');video.muted=state.muted;
  const isCurrent=()=>modal.open&&modal.querySelector('video')===video;
  const mediaError=()=>{if(!isCurrent())return;modal.querySelector('.media-status').textContent='영상을 불러오지 못했어. 아래 개념 글로 확인해 봐.';modal.querySelector('details').open=true;};
  video.addEventListener('error',mediaError);
  video.querySelector('source').addEventListener('error',mediaError);
  video.addEventListener('ended',()=>{if(!isCurrent())return;modal.querySelector('.media-status').textContent='개념 확인 완료! 다음 탐험으로 출발해 봐.';});
  if(!reduceVideo)video.play().catch(()=>{if(!isCurrent())return;if(video.error||video.networkState===3)mediaError();else modal.querySelector('.media-status').textContent='재생 버튼을 눌러 개념을 확인해 봐.';});
}
function settings() {
  openModal(`<div class="modal-heading"><h2>탐험 설정</h2>${btn(icon('close'),'close','','icon-button','aria-label="설정 닫기"')}</div><div class="setting-row"><div><h3>효과음</h3><p>소리가 없어도 모든 탐험을 할 수 있어.</p></div>${btn(state.muted?'꺼짐':'켜짐','setting-sound','','button',`aria-pressed="${!state.muted}"`)}</div><div class="setting-row"><div><h3>움직임 줄이기</h3><p>지도·먹이 흐름과 영상 자동 재생을 줄여.</p></div>${btn(state.reduced?'켜짐':'꺼짐','reduced','','button',`aria-pressed="${state.reduced}"`)}</div><div class="setting-block"><h3>교사용 · 관리자 전체 해금</h3><p>모든 장과 10개 활동을 한 번에 열어.<br>완료 기록과 조사 증거는 그대로 유지돼.</p>${btn(state.unlocked?`${icon('check')} 모든 활동이 열렸어`:`${icon('lock')} 모든 장·활동 한 번에 열기`,'unlock','','button secondary',state.unlocked?'disabled':'')}</div><div class="setting-block"><h3>진행 기록</h3><p>${state.completed.length}/10 활동 완료 · 증거 ${evidenceCount(state)}/5<br>${saveError?'현재 저장을 사용할 수 없어.':'이 기기와 브라우저에만 저장돼. 다른 주소나 기기에는 이어지지 않아.'}</p>${btn('진행 초기화','reset-confirm','','button danger')}${btn('안내 · 제작 정보','about','','text-button')}</div>`);
}
function about() { openModal(`<div class="modal-heading"><h2>모아의 탐험 안내</h2>${btn(icon('close'),'close','','icon-button','aria-label="안내 닫기"')}</div><div class="about-content"><p>네가 생태 탐험가가 되어 숲의 이상 신호를 조사해. 각 장소의 두 활동을 마치면 다음 장소가 열려.</p><ol><li>지도에서 장소를 골라 조사하기</li><li>관찰·실험·연결의 증거 모으기</li><li>새 생태계를 설계하고 고쳐 보기</li></ol><p>진행은 자동으로 저장돼. 이름이나 학번을 입력하지 않아도 돼. 전체 해금은 수업 시연용이며 완료 기록을 만들지 않아.</p><hr><h3>제작 정보 · MVP</h3><p>기획·자료: 사용자 제공 프로젝트<br>구현: Codex와 함께 제작<br>배경·로고·캐릭터: 프로젝트에 제공된 생성형 AI 이미지<br>지도·도토·개념 모션: 코드로 제작<br>효과음: <a href="https://kenney.nl/assets/interface-sounds" target="_blank" rel="noopener noreferrer">Kenney Interface Sounds · CC0</a></p><p>교육 참고: 미국 국립공원관리청 NPS (nps.gov), Craters Ecosystem / Create Your Own Marine Food Web.</p><p>생태계 변화는 학습을 위한 단순 모형이야. 실제 회복 시간과 개체수를 예측하지 않아.</p><p class="muted">에셋 권리는 각 권리자에게 있어. 화면 캡처와 제공 자료의 무단 복제·재배포·상업적 이용은 권리자의 허락이 필요해. 외부 배포용 권리·제작자 표기는 배포 전에 확인해야 해.</p></div>`); }
function markComplete(id) {
  if(state.completed.includes(id))return;
  clearTimeout(toastTimer);notice.classList.remove('show');
  state.completed.push(id);
  feedbackEvent={type:'complete',id};
  save();sound(true);
}
function autoRecord() {
  if(readyToRecord(route,state.drafts[route]))markComplete(route);
}
function validateComplete(id) {
  const d=state.drafts[id];
  switch(id){
    case'p01':return d.found.length===4;
    case'p02':{const wrong=specimens.find(s=>d.groups[s.id]!==s.type);if(wrong){toast(`${wrong.name}: ${wrong.type==='living'?'자라고 살아가는 생물':'생물이 살아가는 데 필요한 비생물 환경'}인지 다시 살펴봐.`,true);return false;}if(d.transfer!=='nonliving'){toast('물은 생물에게 필요하지만 스스로 살아 있는 생물은 아니야.',true);return false;}return true;}
    case'p03':{const wrong=roles.find(r=>d.roles[r.id]!==r.id);if(wrong){toast(`${wrong.target}의 흔적을 다시 읽어 봐. ${wrong.clue}`,true);return false;}return true;}
    case'p04':return d.restored&&d.step===2&&d.answer===roles.find(r=>r.id===d.removed)?.prediction;
    case'p05':return foodEdges.every(e=>d.edges.includes(e));
    case'p06':return readyToRecord(id,d);
    case'p07':return d.solved.length===2;
    case'p08':return d.seen.length===4&&d.answer==='evidence';
    case'p09':return d.ran&&d.selected.includes(d.reason)&&strategyCost(d.selected)<=6;
    default:return false;
  }
}
function connect(d,id,final=false) {
  if(!d.selected){d.selected=id;chainedSource='';return;}
  if(d.selected===id){d.selected='';chainedSource='';return;}
  const edge=`${d.selected}>${id}`;
  if(!foodEdges.includes(edge)){
    const active=final?d.elements:organisms.map(o=>o.id);
    const canStart=foodEdges.some(e=>e.startsWith(`${id}>`)&&!d.edges.includes(e)&&active.includes(e.split('>')[1]));
    if(chainedSource===d.selected&&canStart){d.selected=id;chainedSource='';return;}
    toast('그 방향의 먹이 관계는 관찰 수첩에서 확인되지 않았어. 먹히는 생물부터 다시 골라 줘.',true);d.selected='';chainedSource='';return;
  }
  if(d.edges.includes(edge)){d.selected=id;chainedSource='';return;}
  const from=d.selected;
  d.edges.push(edge);if(final)d.tested=false;playSound('connect');
  feedbackEvent={type:'connect',value:id};
  d.selected=nextConnection(d.edges,from,id,final?d.elements:undefined);
  chainedSource=d.selected;
}
function checkCause(d) {
  if(!['action','change','impact'].every(k=>d.picks[k]!==undefined))return;
  if(!['action','change','impact'].every(k=>d.picks[k]===0)){
    toast('현장 단서와 연결되는 원인·변화·영향인지 다시 읽어 봐.',true);return;
  }
  const row=String(d.row);
  if(d.solved.includes(row))return;
  d.solved.push(row);
  if(d.row===0){d.row=1;d.picks={};toast('물가의 원인을 찾았어! 이번에는 숲의 단서를 이어 봐.');playSound('discover');}
}
function runFinal(d) {
  const result=finalCheck(d);
  if(d.tested&&result.success)return;
  d.tested=true;
  const record=`${d.shock?'변화 시험':'기본 가동'}: ${result.success?'통과':result.checks.filter(c=>!c.ok).map(c=>c.name).join(', ')}`;
  if(d.trials.at(-1)!==record)d.trials.push(record);
  if(d.trials.length>30)d.trials.shift();
  if(result.success){sound(true);toast('이번 시험을 통과했어!');}
  else toast('수정할 곳을 발견했어. 점검 기록을 읽어 봐.',true);
}
function toggleStrategy(ids,id) {
  const i=ids.indexOf(id);if(i>=0){ids.splice(i,1);return true;}
  if(strategyCost(ids)+2>6){toast('자원은 6포인트야. 다른 대책을 먼저 거두고 골라 줘.',true);return false;}
  ids.push(id);return true;
}
document.addEventListener('click',e=>{
  if(interactions.isSuppressed()){e.preventDefault();return;}
  const el=e.target.closest('[data-action]');if(!el||el.disabled)return;
  const action=el.dataset.action,value=el.dataset.value,d=state.drafts[route];
  configureAudio(state.muted);
  if(action==='skip'){const main=document.querySelector('#main');main.setAttribute('tabindex','-1');main.focus();return;}
  if(action==='go'){go(value);return;}
  if(action==='back'){
    if(route==='p10'&&state.drafts.p10.phase!=='report'){
      const phases={certificate:'ending',ending:'design',design:'report'};
      state.drafts.p10.phase=phases[state.drafts.p10.phase];save();render();window.scrollTo(0,0);return;
    }
    const previous=historyRoutes.pop();goingBack=true;go(previous||(route.startsWith('p')?'map':'home'));return;
  }
  if(action==='close'){closeModal();return;}
  if(action==='settings'){settings();return;}
  if(action==='about'){about();return;}
  if(action==='concept'){showConcept(value);return;}
  if(action==='hint'||action==='hint-more'||action==='hint-close'){
    if(action==='hint-more')hintLevel=Math.min(2,hintLevel+1);
    hintOpen=action==='hint-close'?false:action==='hint'?!hintOpen:true;
    playSound('hint');render();
    document.querySelector(hintOpen?'[data-action="hint-close"]':'[data-action="hint"]')?.focus({preventScroll:true});return;
  }
  if(action==='strategy-edit'){strategyReflect=false;render();return;}
  if(action==='design-tab'){designTab=value;render();return;}
  if(action==='mute'||action==='setting-sound'){state.muted=!state.muted;configureAudio(state.muted);save();render();if(action==='setting-sound')settings();return;}
  if(action==='reduced'){state.reduced=!state.reduced;save();render();settings();return;}
  if(action==='unlock'){state.unlocked=true;save();render();settings();toast('모든 장과 활동을 열었어. 완료 기록은 바뀌지 않았어.');return;}
  if(action==='reset-confirm'){openModal(`<div class="modal-heading"><h2>새 탐험을 시작할까?</h2></div><p>조사 기록, 설계, 전체 해금이 이 브라우저에서 지워져. 이 작업은 되돌릴 수 없어.</p><div class="button-row">${btn('기록 유지','settings','','button primary')}${btn('기록 지우고 새로 시작','reset','','button danger')}</div>`);return;}
  if(action==='reset'){state=initialState();save();closeModal();historyRoutes=[];goingBack=true;go('home');return;}
  if(action==='completion-next'){if(modal.open)closeModal();go(value);return;}
  if(action==='chapter'){mapChapter=Number(value);mapView?.moveTo(mapChapter);document.querySelector('#chapter-card').innerHTML=chapterCard(mapChapter);document.querySelectorAll('.map-marker').forEach((b,i)=>b.classList.toggle('selected',i===mapChapter));sound();return;}
  if(action==='complete'){if(value===route&&validateComplete(value)){markComplete(value);render();}return;}
  if(action==='print'){window.print();return;}
  if(!d)return;
  switch(action){
    case'cause-pick':if(!placeCause(d,value,value.split(':')[0]))return;checkCause(d);break;
    case'specimen-pick':selectedSpecimen=selectedSpecimen===value?'':value;break;
    case'specimen-place':if(!selectedSpecimen){toast('옮길 카드를 고르면 분류를 바꿀 수 있어.');return;}d.groups[selectedSpecimen]=value;selectedSpecimen=nextUnplaced(specimens,d.groups);playSound('connect');break;
    case'role-pick':selectedRole=selectedRole===value?'':value;break;
    case'role-place':if(!selectedRole){toast('관찰 카드를 고르면 역할을 바꿀 수 있어.');return;}d.roles[selectedRole]=value;selectedRole=nextUnplaced(roles,d.roles);playSound('connect');break;
    case'observe':d.current=value;break;
    case'observe-answer':{const o=observations.find(o=>o.id===d.current);if(!o||d.found.includes(o.id))return;if(Number(value)===o.correct){d.found.push(o.id);toast(`관찰한 특징을 수첩에 담았어. ${d.found.length}/4 발견!`);playSound('discover');}else toast('눈으로 확인한 특징과 이어지는 설명을 다시 골라 봐.',true);break;}
    case'transfer':d.transfer=value;break;
    case'remove-role':if(d.removed===value)return;d.removed=value;d.ran=false;d.restored=false;d.step=0;d.answer='';d.prediction='';break;
    case'prediction':if(d.ran)return;d.prediction=value;d.ran=true;d.restored=false;d.step=0;d.answer='';playSound('experiment');break;
    case'experiment-skip':if(!d.ran||d.step>=2)return;d.step=2;break;
    case'experiment-restore':if(d.step===2&&!d.restored){d.restored=true;d.log.push(`${d.removed}:${d.prediction}`);d.log=d.log.slice(-30);}break;
    case'experiment-answer':d.answer=value;if(value!==roles.find(r=>r.id===d.removed).prediction)toast('실험에서 나타난 변화를 다시 읽고 기록해 봐.',true);break;
    case'edge':connect(d,value);break;
    case'undo-edge':d.edges.pop();d.selected='';chainedSource='';break;
    case'compare-remove':if(d.removed===value)return;d.removed=value;if(value&&!d.tested.includes(value))d.tested.push(value);playSound('experiment');break;
    case'compare-answer':d.answer=value;if(value==='always')toast('먹이가 이어져도 물이나 서식처가 달라지면 영향을 받아. 남아 있는 경로에 주목해 봐.',true);break;
    case'time-policy':if(d.policy===value)return;d.policy=value;recordTime(d);break;
    case'time-jump':d.position=Number(value);recordTime(d);break;
    case'time-answer':d.answer=value;if(value==='automatic')toast('대책을 바꿔 두 장면을 다시 비교해 봐. 오염이 계속 들어오면 저절로 똑같이 회복되지 않아.',true);break;
    case'strategy':if(toggleStrategy(d.selected,value)){d.ran=false;d.reason='';}break;
    case'strategy-run':if(d.selected.length){d.ran=true;strategyReflect=true;const record=JSON.stringify(d.selected);if(d.history.at(-1)!==record)d.history.push(record);d.history=d.history.slice(-3);sound(true);}break;
    case'strategy-reason':d.reason=value;break;
    case'final-start':d.phase='design';break;
    case'final-import':if(!importFoodWeb(state))return;toast('네 먹이그물을 가져왔어! 빛·물·흙과 분해자를 더해 새 환경을 완성해 봐.');playSound('connect');break;
    case'element':if(d.elements.includes(value)){d.elements=d.elements.filter(v=>v!==value);d.edges=d.edges.filter(e=>!e.split('>').includes(value));if(d.selected===value)d.selected='';}else d.elements.push(value);d.tested=false;break;
    case'final-edge':connect(d,value,true);break;
    case'final-undo':d.edges.pop();d.selected='';chainedSource='';d.tested=false;break;
    case'final-strategy':if(toggleStrategy(d.strategies,value))d.tested=false;break;
    case'final-run':runFinal(d);break;
    case'final-shock':if(d.shock||!d.tested||!finalCheck(d).success)return;d.shock=true;d.tested=false;runFinal(d);break;
    case'final-finish':if(!d.tested||!d.shock||!finalCheck(d).success)return;markComplete('p10');d.phase='ending';break;
    case'final-phase':if(['ending','certificate'].includes(value)&&(!d.tested||!d.shock||!finalCheck(d).success))return;d.phase=value;break;
    default:return;
  }
  autoRecord();save();render();
});
function recordTime(d) {
  const end=d.position<=5?'before':d.position>=95?'after':'';
  if(end&&!d.seen.includes(`${d.policy}:${end}`))d.seen.push(`${d.policy}:${end}`);
}
document.addEventListener('input',e=>{
  if(e.target.id!=='time-range'||route!=='p08')return;
  const d=state.drafts.p08;d.position=Number(e.target.value);recordTime(d);save();
  document.querySelector('.changed-scene').style.clipPath=`inset(0 ${100-d.position}% 0 0)`;
  document.querySelector('.comparison-handle').style.left=`${d.position}%`;
  document.querySelector('.time-observation span').textContent=`확인한 장면 ${d.seen.length}/4`;
  document.querySelector('.next-cue span').textContent=nextCue('p08',d);
  document.querySelectorAll('[data-action="time-jump"]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value==='0'?d.position<=5:d.position>=95)));
  const reflection=document.querySelector('.time-reflection');
  if(d.seen.length===4&&reflection&&!reflection.querySelector('.reflection')){
    reflection.innerHTML=timeReflection(d,{btn,choice,icon,tag,completedFooter});
    playSound('discover');
  }else if(d.seen.length<4&&reflection)reflection.querySelector('.work-footer>span').textContent=`두 대책의 전후 장면 ${d.seen.length}/4 · 실제 회복 시간을 뜻하지 않아.`;
});
const interactions=mountInteractions({app,
  applyDrop(kind,item,group){
    const d=state.drafts[route];if(!d)return;
    if(kind==='classify'&&route==='p02'&&specimens.some(s=>s.id===item)&&['living','nonliving'].includes(group)){d.groups[item]=group;selectedSpecimen='';}
    else if(kind==='role'&&route==='p03'&&roles.some(r=>r.id===item)&&roles.some(r=>r.id===group)){d.roles[item]=group;selectedRole='';}
    else if(kind==='element'&&route==='p10'&&finalElements.some(e=>e.id===item)){if(!d.elements.includes(item))d.elements.push(item);d.tested=false;}
    else if(kind==='cause'&&route==='p07'){if(!placeCause(d,item,group))return;checkCause(d);}
    else return;
    if(kind!=='cause')playSound('connect');autoRecord();save();render();
  },
  connectDrop(from,to,final){
    const d=state.drafts[route];if(!d||!(route==='p05'||route==='p10'))return;
    d.selected=from;chainedSource='';connect(d,to,final);autoRecord();save();render();
  },
  onScrub(x,scene){
    if(route!=='p08')return;const rect=scene.getBoundingClientRect(),input=document.querySelector('#time-range');
    input.value=Math.round(Math.max(0,Math.min(100,(x-rect.left)/rect.width*100)));input.dispatchEvent(new Event('input',{bubbles:true}));
  }
});
function placeCause(d,item,group){
  const [key,n]=item.split(':');
  if(key!==group){toast('사람의 행동인지, 환경 변화인지, 생물의 영향인지 살펴봐.',true);return false;}
  d.picks[group]=Number(n);playSound('connect');return true;
}
modal.addEventListener('close',()=>{modal.querySelector('video')?.pause();mediaPriority(false);scheduleExperiment();});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
window.addEventListener('hashchange',()=>{if(modal.open)closeModal();routeChanged();});
routeChanged();
if(loadWarning)toast(loadWarning,true);
