import {mountRepair} from './map-repair.js';
import {mountConceptRecall} from './concept-recall.js';
import { renderMetrics } from './metrics.js';
import { playbackStep, playbackDelay } from './playback.js';
import { createNarration, mountNarrationControl } from './narration.js';
import { voiceLines } from './voice-lines.js';
let voiceControls = [], modalVoiceCleanup = () => {}, modalMediaCleanup = () => {};
const narration = createNarration({ isMuted: () => state.muted, duck: mediaPriority });
function voiceControl(host, id, caption = false) {
  if (!host) return;
  if (caption) { const text = document.createElement('p'); text.className = 'voice-caption'; text.textContent = voiceLines.find(line => line.id === id)?.text || ''; text.style.cssText = 'font-size:var(--support-size,16px);line-height:1.5;margin:4px 0;'; host.append(text); }
  voiceControls.push(mountNarrationControl(host, id, narration));
}
import { createRecordStore } from './storage.js';
import { experimentView, finalView, causeView, compareView, timeView, timeReflection, strategyView } from './experiences.js';
import { readyToRecord, nextUnplaced, nextConnection, importFoodWeb } from './progress.js';
import { mountInteractions } from './interactions.js';
import { concepts, hints, activityGuidance, learningNotes, curriculum } from './learning.js';
import { emphasizeConcept } from './concept-focus.js';
import { configureAudio, playSound, stopAudio, mediaPriority } from './audio.js';
import { chapters, activities, observations, specimens, roles, predictions, organisms, foodEdges, chainEdges, strategies, finalElements, causes, practiceActions } from './data.js';
import { SAVE_KEY, initialState, restoreState, accessible, evidenceCount, chapterDone, strategyCost, recovery, reachable, finalCheck } from './engine.js';
import { mountMap, markerPosition } from './map.js';
import { specimenArt, riverArt } from './visuals.js';
import { playFeedback } from './feedback.js';

const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
const notice = document.querySelector('#notice');
const paths = {
  fit: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M8 8h8v8H8z"/>',
  home: '<path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10"/>', back: '<path d="m13 5-7 7 7 7M6 12h15"/>', next: '<path d="m10 5 7 7-7 7M4 12h13"/>',
  sound: '<path d="M11 4 6 8H3v8h3l5 4V4ZM15 8q5 4 0 8M18 4q9 8 0 16"/>', mute: '<path d="M11 4 6 8H3v8h3l5 4V4Zm5 5 6 6m0-6-6 6"/>',
  pause: '<path d="M8 4v16M16 4v16"/>', settings: '<path d="m9 3-1 3-3 1v4l-2 1 2 2v3l3 1 1 3h6l1-3 3-1v-3l2-2-2-1V7l-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
  leaf: '<path d="M5 19C-1 7 9 2 21 3c1 12-5 20-16 16Zm0 0L16 8"/>', search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  web: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="11" cy="19" r="2"/><path d="m7 5 10 1M6 7l4 10M18 8l-6 9"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>', flag: '<path d="M5 22V3c6-5 9 5 15 0v11c-6 5-9-5-15 0"/>',
  book: '<path d="M12 5C8 2 4 2 2 3v16c4-1 7 0 10 2 3-2 6-3 10-2V3c-2-1-6-1-10 2Zm0 0v16"/>', check: '<path d="m5 12 5 5L20 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>', play: '<path d="m7 3 15 9-15 9Z"/>', hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-1V4a1.5 1.5 0 0 1 3 0v7m0-.5V5.5a1.5 1.5 0 0 1 3 0V13m0-4.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.5c-2.2 0-3.6-.8-4.9-2.3L3.3 15.4a1.6 1.6 0 0 1 2.4-2.1L8 15"/>',
  reset: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>', close: '<path d="m5 5 14 14M19 5 5 19"/>', trophy: '<path d="M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 3v6m-5 0h10"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v1"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
const esc = str => String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn = (label, action, value = '', cls = 'button', attrs = '') => `<button class="${cls}" data-action="${action}" data-value="${esc(value)}" ${attrs}>${label}</button>`;
const moa = (cls = '') => `<div class="moa ${cls}" role="img" aria-label="수달 연구원 모아"></div>`;
const tag = text => `<span class="tag">${text}</span>`;
const choice = (label, action, value, on = false, disabled = false) => btn(`${on ? icon('check') : '<span class="choice-dot"></span>'}<span class="choice-label">${label}</span>`, action, value, `choice ${on ? 'selected' : ''}`, `aria-pressed="${on}" ${disabled ? 'disabled' : ''}`);
let browserStorage;
try { browserStorage = localStorage; } catch { browserStorage = null; }
const recordStore = createRecordStore(browserStorage);
let state = recordStore.state, loadWarning = recordStore.message, saveError = !!loadWarning;
let studentState = null;
let strategyReflect=false;
let feedbackEvent;
let selectedSpecimen='', selectedRole='', hintLevel=0, hintOpen=false, designTab='elements', chainedSource='';
let playback={running:false,speed:1,cursor:0,message:'',finished:false}, simulatedPlayback=false;
let route = '', mapView, mapChapter = 0, historyRoutes = [], goingBack = false, toastTimer, focusBeforeModal, experimentTimer;
function save() {
  if (studentState) return;
  saveError = !recordStore.save(state);
  if (saveError) toast(recordStore.message);
}
function toast(text, error = false) { if(error){configureAudio(state.muted);playSound('error');} notice.textContent = text; notice.className = `toast show ${error ? 'error' : ''}`; clearTimeout(toastTimer); toastTimer = setTimeout(() => notice.classList.remove('show'), 5200); }
function sound(success=false) { configureAudio(state.muted); playSound(success?'success':'tap'); }

function go(next) { if(route === next) render(); else location.hash = next; }
function header() {
  return `${studentState&&!route.startsWith('p')?`<div class="preview-banner" role="status">교사 시연 · 학생 기록은 저장하지 않아. ${btn('학생 탐험으로 돌아가기','preview-exit','','button secondary')}</div>`:''}<header class="topbar"><div class="nav-group">${btn(icon('home'),'go','home','icon-button',`aria-label="홈" ${route==='home'?'disabled':''}`)}${btn(icon('back'),'back','','icon-button',`aria-label="이전" ${route==='home'&&!historyRoutes.length?'disabled':''}`)}<a class="brand" href="#home">${icon('leaf')}<span>생명의 그물 지도<small>모아의 생태 탐험</small></span></a></div><nav class="chapter-progress" aria-label="장별 진행">${chapters.map((c,i)=>`<span class="${chapterDone(state,i)?'done':activities.find(a=>a.id===route)?.chapter===i?'current':''}" title="${i+1}장 ${c.name}">${chapterDone(state,i)?icon('check'):i+1}</span>`).join('<i></i>')}</nav><div class="nav-group"><span class="evidence-counter">${icon('book')}<span>조사 기록 <b>${evidenceCount(state)}/5</b></span></span>${btn(icon(state.muted?'mute':'sound'),'mute','','icon-button',`aria-label="${state.muted?'소리 켜기':'소리 끄기'}" aria-pressed="${state.muted}"`)}${btn(icon('settings'),'settings','','icon-button','aria-label="설정"')}</div></header>`;
}
function homePage() {
  const started = state.completed.length || state.last !== 'map' || state.drafts.p01.found.length;
  return `<main id="main" class="home-page title-screen"><div class="title-shade" aria-hidden="true"></div><section class="title-copy"><span class="title-chip">${icon('leaf')} 모아·도토와 함께하는 물가 생태 탐험</span><h1 class="title-logo"><img src="./assets/web/logo.webp" alt="생명의 그물 지도"></h1><p class="title-lead">작은 발견이 모여, 숲의 내일을 바꿔.</p><p class="title-sub">물가와 숲에 이상 신호가 생겼어.<br>생물과 환경의 연결을 찾아 생명의 그물을 다시 이어 줘!</p><div class="title-actions">${btn(`${started?'이어서 탐험하기':'탐험 시작'}${icon('next')}`,'go',started?state.last:'map','button golden hero-start')}${started?btn(`${icon('flag')}탐험 지도`,'go','map','button title-secondary'):''}</div><div class="title-meta"><span>${icon('search')}관찰하고</span><span>${icon('web')}연결하고</span><span>${icon('leaf')}다시 살려 줘</span></div></section><div class="title-guide" aria-hidden="true"><div class="speech">반가워, 탐험가!<br><b>나는 수달 연구원 모아야.</b></div>${moa('large')}<img class="title-doto" src="./assets/characters/doto.svg" alt=""></div>${btn(`${icon('info')}탐험 안내`,'about','','title-about')}</main>`;
}
const ro = word => { const code=word.charCodeAt(word.length-1)-0xAC00, last=code%28; return code<0||last===0||last===8?'로':'으로'; };
const nextChapter = () => { const first=chapters.findIndex((_,i)=>!chapterDone(state,i)); return first<0?4:first; };
const chapterTarget = i => { const acts=activities.slice(i*2,i*2+2); return acts.find(a=>accessible(state,a.id)&&!state.completed.includes(a.id))||acts.find(a=>accessible(state,a.id)); };
function chapterCard(i) {
  const c=chapters[i], target=chapterTarget(i);
  const label=chapterDone(state,i)?'조사 완료':i===nextChapter()?'다음 목적지':'선택한 장소';
  return `<div class="next-card-head">${btn(icon('back'),'map-cycle','-1','icon-button map-cycle','aria-label="이전 장소"')}<div><span class="map-eyebrow">${label} · ${i+1}장</span><h2>${c.place}</h2><p>${c.name}</p></div>${btn(icon('next'),'map-cycle','1','icon-button map-cycle','aria-label="다음 장소"')}</div><div class="activity-links">${activities.slice(i*2,i*2+2).map(a=>btn(`<span><small>${a.id.toUpperCase()} · ${a.verb}</small>${a.title}</span>${icon(state.completed.includes(a.id)?'check':accessible(state,a.id)?'next':'lock')}`,'go',a.id,`activity-link ${state.completed.includes(a.id)?'done':''}`,accessible(state,a.id)?'':'disabled')).join('')}</div>${target?btn(`${c.place}${ro(c.place)} 가기${icon('next')}`,'map-enter',i,'button golden map-go'):`<p class="map-locked">${icon('lock')} 앞 장소의 두 활동을 먼저 마쳐 줘.</p>`}`;
}
function mapPage() {
  const done=chapters.filter((_,i)=>chapterDone(state,i)).length;
  const dirs=[['ArrowUp','위로','↑','up'],['ArrowLeft','왼쪽으로','←','left'],['ArrowDown','아래로','↓','down'],['ArrowRight','오른쪽으로','→','right']];
  return `<main id="main" class="map-page map-screen"><h1 class="sr-only">탐험 지도 · 오늘은 어디를 탐험할까?</h1><div class="map-viewport" role="region" aria-label="탐험 지도. 땅을 누르거나 방향키·W A S D로 걸어. 끌어서 지도를 움직일 수 있어."><div class="map-world"><canvas id="map-canvas" aria-hidden="true"></canvas>${chapters.map((c,i)=>{const p=markerPosition(i),open=accessible(state,activities[i*2].id);return btn(`<span class="marker-num">${chapterDone(state,i)?icon('check'):open?i+1:icon('lock')}</span><b>${c.place}</b>`,'chapter',i,`map-marker ${mapChapter===i?'selected':''} ${open?'':'locked'} ${chapterDone(state,i)?'done':''}`,`style="left:${p.left}%;top:${p.top}%" aria-label="${i+1}장 ${c.place}${open?'':' (잠김)'} 선택"`);}).join('')}</div></div><div class="map-title-chip"><span>${icon('leaf')} 에코리아 생태 탐험 지구</span><b>${done} / 5 장소 조사</b>${state.unlocked?`<em>${icon('check')} 교사용 전체 해금</em>`:''}</div><div class="map-controls"><div class="map-dpad" role="group" aria-label="탐험가 이동">${dirs.map(([key,label,arrow,cls])=>`<button class="map-dir ${cls}" data-map-dir="${key}" aria-label="${label} 이동">${arrow}</button>`).join('')}</div><div class="map-controls-copy"><b>도토와 함께 탐험해 봐!</b><span>땅 누르기 · 방향키 / WASD</span><div class="map-tools"><button class="map-tool" data-map-toggle="overview" aria-label="지도 전체 보기" title="지도 전체 보기" aria-pressed="false">${icon('fit')}</button><button class="map-tool" data-map-toggle="pan" aria-label="손으로 지도 이동" title="손으로 지도 이동" aria-pressed="false">${icon('hand')}</button></div></div></div><section class="map-next-card" id="chapter-card" aria-live="polite">${chapterCard(mapChapter)}</section></main>`;
}
function selectChapter(i, walk = true) {
  mapChapter=(i+chapters.length)%chapters.length;
  if(walk)mapView?.moveTo(mapChapter);else mapView?.select(mapChapter);
  document.querySelector('#chapter-card').innerHTML=chapterCard(mapChapter);
  document.querySelectorAll('.map-marker').forEach((b,k)=>b.classList.toggle('selected',k===mapChapter));
}
function teacherSkip(a) {
  if(!state.unlocked)return '';
  const next=activities[activities.indexOf(a)+1];
  return btn(`${icon('next')}<span>${next?next.id.toUpperCase():'지도'}</span>`,'go',next?next.id:'map','teacher-skip',`aria-label="${next?`다음 스테이지 ${next.title}로 바로 가기`:'탐험 지도로 가기'}"`);
}
function currentGuidance() {
  return activityGuidance(route,state.drafts[route],{
    completed:state.completed.includes(route),selectedSpecimen,selectedRole,strategyReflect,designTab
  });
}
function helper(a) {
  const cue=currentGuidance().text;
  return `<aside class="mission-guide"><div class="guide-avatar" aria-hidden="true">${moa()}</div><div class="next-cue" id="next-cue" aria-live="polite"><span>${emphasizeConcept(cue,learningNotes[a.id].terms)}</span></div><div class="guide-tools" style="display:flex;align-items:center">${btn('개념·안내','voice-guide','','button companion-button')}${btn('<img src="./assets/characters/doto.svg" alt=""><span>힌트</span>','hint','','button companion-button',`aria-expanded="${hintOpen}" aria-controls="companion-hint" aria-label="도토의 힌트"`)}</div></aside>`;
}
function completedFooter(id, eligible, label='기록하기') {
  if(!state.completed.includes(id))return eligible?`<div class="work-footer">${btn(label,'complete',id,'button secondary')}</div>`:'';
  const next=activities[activities.findIndex(a=>a.id===id)+1];
  return `<div class="work-footer activity-complete"><div class="completion-copy" role="status"><b>${icon('check')} ${emphasizeConcept(learningNotes[id].success,learningNotes[id].terms)}</b></div><div class="completion-actions">${btn(`${icon('play')} 개념 보기`,'concept',id,'button subtle')}${btn(`다음 탐험${icon('next')}`,'completion-next',next?.id||'map','button primary',`aria-label="다음 탐험: ${next?.title||'탐험 지도'}"`)}</div></div>`;
}
function stageTransport(a){
  const canPlay=['p01','p04','p06','p08','p09','p10'].includes(a.id)&&!(a.id==='p10'&&state.drafts.p10.phase!=='design');
  const controls=canPlay?`<div class="playback-controls">${btn(`${icon(playback.running?'pause':'play')}<span>${playback.running?'직접 해보기':'자동재생'}</span>`,'playback-toggle','','button playback-toggle',`aria-pressed="${playback.running}"`)}<div class="playback-speeds" role="group" aria-label="재생 속도">${[.5,1,2].map(speed=>btn(`${speed}배`,'playback-speed',speed,`button ${playback.speed===speed?'selected':''}`,`aria-pressed="${playback.speed===speed}"`)).join('')}</div><span class="playback-status" role="status">${playback.message}</span></div>`:'';
  return `<div class="stage-transport">${controls}${studentState?`<div class="stage-teacher"><span>교사 시연</span>${btn('학생 탐험으로','preview-exit','','button')}${teacherSkip(a)}</div>`:''}</div>`;
}
const metrics = renderMetrics;

function renderObservation() {
  const d=state.drafts.p01,o=observations.find(o=>o.id===d.current);
  return `<div class="observation-layout"><div class="scene observe-scene">${observations.map((o,i)=>btn(`<span class="observation-target">${specimenArt(o.id)}</span>${d.found.includes(o.id)?icon('check'):icon('search')}<b>${o.name}</b>`,'observe',o.id,`hotspot ${d.found.includes(o.id)?'found':''}`,`style="left:${o.x}%;top:${o.y}%" aria-label="${o.name} 관찰" aria-pressed="${d.current===o.id}"`)).join('')}</div><aside class="observation-note">${o?`<h3>${o.name}</h3><p>${o.text}</p>${o.choices.map((text,i)=>choice(text,'observe-answer',i,d.found.includes(o.id)&&i===o.correct,d.found.includes(o.id))).join('')}`:`<span class="note-illustration">${icon('search')}</span><h3>관찰 수첩</h3><p>자라고 살아가는 특징을 찾아봐.</p>`}</aside></div>${completedFooter('p01',d.found.length===4,'관찰 마치기')}`;
}
function renderClassify() {
  const d=state.drafts.p02;
  if(!selectedSpecimen)selectedSpecimen=nextUnplaced(specimens,d.groups);
  const card=s=>btn(`<span>${specimenArt(s.id)}</span><b>${s.name}</b>`,'specimen-pick',s.id,`drag-card ${selectedSpecimen===s.id?'selected':''}`,`data-drag="classify" data-item="${s.id}" aria-pressed="${selectedSpecimen===s.id}" aria-label="${s.name} 카드 선택"`);
  return `<div class="specimen-tray" aria-label="분류할 카드">${specimens.filter(s=>!d.groups[s.id]).map(card).join('')||''}</div><div class="sort-zones">${[['living','생물','스스로 자라고 살아가.'],['nonliving','비생물','생물이 살아갈 환경이야.']].map(([id,name,desc])=>`<section class="sort-zone" data-drop="classify" data-group="${id}" aria-label="${name} 조사 상자">${btn(`<b>${name}</b><span>${desc}</span>`,'specimen-place',id,'zone-label',`aria-label="선택한 카드를 ${name} 상자에 놓기"`)}<div class="placed-cards">${specimens.filter(s=>d.groups[s.id]===id).map(card).join('')}</div></section>`).join('')}</div>${Object.keys(d.groups).length===6?`<div class="transfer"><div><p>바다의 <b>바닷물</b>도 같은 기준으로 나눠 볼까?</p></div>${choice('생물','transfer','living',d.transfer==='living')}${choice('비생물','transfer','nonliving',d.transfer==='nonliving')}</div>`:''}${completedFooter('p02',specimens.every(s=>d.groups[s.id])&&!!d.transfer,'분류 확인하기')}`;
}
function renderRoles() {
  const d=state.drafts.p03;
  if(!selectedRole)selectedRole=nextUnplaced(roles,d.roles);
  const card=r=>btn(`<span>${specimenArt(r.id)}</span><div><b>${r.target}</b><small>${r.clue}</small></div>`,'role-pick',r.id,`role-token ${selectedRole===r.id?'selected':''}`,`data-drag="role" data-item="${r.id}" aria-pressed="${selectedRole===r.id}"`);
  return `<div class="role-tray">${roles.filter(r=>!d.roles[r.id]).map(card).join('')||''}</div><div class="role-zones">${roles.map(r=>`<section class="role-zone" data-drop="role" data-group="${r.id}">${btn(`<b>${r.name}</b><small>${{producer:'스스로 양분을 만들어.',consumer:'다른 생물을 먹어.',decomposer:'죽은 생물을 분해해.'}[r.id]}</small>`,'role-place',r.id,'zone-label',`aria-label="선택한 카드를 ${r.name}에 놓기"`)}${roles.filter(v=>d.roles[v.id]===r.id).map(card).join('')}</section>`).join('')}</div>${completedFooter('p03',roles.every(r=>d.roles[r.id]),'역할 확인하기')}`;
}
function renderExperiment(){return experimentView(state.drafts.p04,{btn,choice,icon,tag,metrics,completedFooter});}

function webGraph(edges, { active = organisms.map(o=>o.id), selected = '', removed = '', action = 'edge', small = false, graphId = 'web' }={}) {
  const pts=Object.fromEntries(organisms.map(o=>[o.id,o]));
  const reached=removed?reachable(edges,active,removed):new Set(active);
  return `<div class="food-web ${small?'small-web':''}"><svg viewBox="0 0 100 100" preserveAspectRatio="none" class="web-lines" aria-hidden="true"><defs><marker id="arrow-${graphId}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0 0 6 3 0 6Z" fill="#438d75"/></marker></defs>${edges.map(e=>{const[a,b]=e.split('>'),p=pts[a],q=pts[b];if(!p||!q||!active.includes(a)||!active.includes(b))return '';const off=a===removed||b===removed||!reached.has(a), dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy);return `<line x1="${p.x+dx/len*7}" y1="${p.y+dy/len*7}" x2="${q.x-dx/len*8}" y2="${q.y-dy/len*8}" class="${off?'broken':'flow-line'}" marker-end="url(#arrow-${graphId})"/>${!off&&!state.reduced&&!matchMedia('(prefers-reduced-motion: reduce)').matches?`<circle r="1" class="energy-dot"><animateMotion dur="2.8s" repeatCount="indefinite" path="M${p.x+dx/len*7},${p.y+dy/len*7} L${q.x-dx/len*8},${q.y-dy/len*8}"/></circle>`:''}`;}).join('')}</svg>${organisms.filter(o=>active.includes(o.id)).map(o=>action?btn(`<span>${specimenArt(o.id)}</span><b>${o.name}</b>`,action,o.id,`web-node ${selected===o.id?'selected':''} ${removed===o.id?'removed':''}`,`style="left:${o.x}%;top:${o.y}%" aria-pressed="${selected===o.id}" aria-label="${o.name} 연결"`):`<div class="web-node static ${removed===o.id?'removed':removed?(reached.has(o.id)?'reachable':'disconnected'):''}" style="left:${o.x}%;top:${o.y}%"><span>${specimenArt(o.id)}</span><b>${o.name}</b></div>`).join('')}</div>`;
}
function renderWeb() {
  const d=state.drafts.p05;
  return `<div class="workspace-label"><b>연결 ${d.edges.length}/${foodEdges.length}</b>${btn(`${icon('book')} 먹이 수첩`,'food-guide','','button subtle')}</div><div class="web-layout"><section>${webGraph(d.edges,{selected:d.selected})}<div class="web-toolbar">${btn(`${icon('reset')} 마지막 선 지우기`,'undo-edge','','button',d.edges.length?'':'disabled')}</div></section></div>${completedFooter('p05',foodEdges.every(e=>d.edges.includes(e)),'먹이그물 기록하기')}`;
}
function renderCompare(){return compareView(state.drafts.p06,{btn,choice,icon,tag,webGraph,completedFooter});}

function renderCauses(){return causeView(state.drafts.p07,{btn,icon,tag,completedFooter});}

function renderTime(){return timeView(state.drafts.p08,{btn,choice,icon,tag,completedFooter});}

function strategyCards(ids, action='strategy') {
  return `<div class="strategy-grid">${strategies.map(s=>btn(`<span class="strategy-art">${specimenArt(s.id)}</span><span class="strategy-content"><b>${s.name}</b><small>${s.desc}</small></span><span class="cost">${ids.includes(s.id)?icon('check'):'2'}<small>${ids.includes(s.id)?'선택':'포인트'}</small></span>`,action,s.id,`strategy-card ${ids.includes(s.id)?'selected':''}`,`aria-pressed="${ids.includes(s.id)}"`)).join('')}</div>`;
}
function renderStrategy(){return strategyView(state.drafts.p09,{btn,choice,icon,tag,metrics,strategyCards,completedFooter},strategyReflect);}

function reportPage(){
  const records=['p02','p04','p06','p08','p09'];
  return `<div class="report-grid">${chapters.map((c,i)=>`<article class="report-record ${state.completed.includes(records[i])?'':'missing'}"><span class="stamp">${icon(c.icon)}</span><div><h3>${c.evidence}</h3><p>${state.completed.includes(records[i])?c.summary:'아직 조사하지 않은 기록이야.'}</p></div></article>`).join('')}</div><div class="work-footer">${btn(`${icon('book')} 내 조사 기록`,'report-details','','button')}${btn(`설계 시작${icon('next')}`,'final-start','','button primary')}</div>`;
}
function showReport(){
  const evidence=id=>state.evidence[id]||state.drafts[id];
  openModal(`<div class="modal-heading"><h2>내 조사 기록</h2>${btn(icon('close'),'close','','icon-button','aria-label="기록 닫기"')}</div><div class="report-detail"><p>역할 실험 예상: ${esc(predictions.find(([id])=>id===evidence('p04').prediction)?.[1]||'기록 전')}</p><p>역할 실험 관찰: ${esc(evidence('p04').step===2?roles.find(r=>r.id===evidence('p04').removed)?.result:'기록 전')}</p><p>먹이그물 비교에서 없앤 생물: ${evidence('p06').tested.map(id=>esc(organisms.find(o=>o.id===id)?.name)).join(' · ')||'기록 전'}</p><p>복원 작전: ${evidence('p09').selected.map(id=>strategies.find(s=>s.id===id)?.name).join(' · ')||'기록 전'}</p><small>완료할 때 남긴 기록이야. 이전 버전 기록은 마지막 저장 상태일 수 있어.</small></div>`);
}
function finalDesign(){return finalView(state.drafts.p10,{btn,choice,icon,tag,webGraph,savedWeb:state.completed.includes('p05')&&readyToRecord('p05',state.drafts.p05)},designTab);}

function endingPage(certificate=false) {
  const d=state.drafts.p10,vals=recovery(d.strategies),collected=evidenceCount(state);
  if(certificate) return `<div class="certificate"><div class="eyebrow">생태 탐험 인증서</div><div class="certificate-seal">${icon('leaf')}</div><h2>생명의 연결을 지킨<br>생태 탐험가</h2><p>생물과 환경의 관계를 관찰하고,<br>직접 설계한 생태계를 시험하고 완성했어.</p><div class="certificate-stats"><span><b>${collected}/5</b>수집한 증거</span><span><b>${d.trials.length}회</b>모형 시험</span><span><b>완료</b>변화 대응 시험</span></div><p class="certificate-strategies">모형의 보전 대책 · ${d.strategies.map(id=>strategies.find(s=>s.id===id)?.name).join(' · ')}</p>${d.practice?`<p class="certificate-practice">내 실천 약속 · ${esc(practiceActions.find(item=>item.id===d.practice)?.text||'')}</p>`:''}<div class="certificate-sign">수달 생태연구원 모아 ${icon('check')}</div><small>생명의 그물 지도 · 생물과 환경</small></div><div class="work-footer no-print">${btn(`${icon('back')} 엔딩으로`,'final-phase','ending','button')}${btn('인증서 인쇄 / PDF 저장','print','','button primary')}${btn('탐험 지도로','go','map','button')}</div>`;
  return `<div class="ending-scene scene">${riverArt("protect")}<div class="ending-glow"></div><div class="ending-content"><span class="ending-badge">${icon('trophy')} 복원 미션 완료</span><h2>다시 이어진,<br>생명의 그물.</h2><p>네가 찾은 증거와 고친 설계가<br>생물들의 먹이 길을 이어 줬어.</p>${moa('ending-moa')}</div><span class="ending-animal one">${specimenArt("frog")}</span><span class="ending-animal two">${specimenArt("sparrow")}</span></div><div class="ending-report"><div><h3>우리의 작전이 만든 변화</h3><p>${d.strategies.includes('trees')?'숲을 되살릴 나무를 심었어. 물에 남은 오염은 계속 살펴보자.':d.strategies.includes('clean')?'물가에 쌓인 쓰레기를 줄였어. 훼손된 숲도 앞으로 돌봐 주자.':'오염 원인과 서식처를 돌봤어. 물과 숲의 남은 문제도 지켜보자.'}</p></div>${metrics(vals)}</div><div class="work-footer">${btn('설계 다시 살펴보기','final-phase','design','button')}${btn(`${icon('play')} 개념 보기`,'concept','p10','button subtle')}${btn(d.practice?'실천 약속 살펴보기':'생활 속 실천 약속','practice-show','','button')}${btn(`${icon('trophy')} 탐험 인증서 받기`,'final-phase','certificate','button primary')}</div>`;
}
function activityPage(a) {
  const views=[renderObservation,renderClassify,renderRoles,renderExperiment,renderWeb,renderCompare,renderCauses,renderTime,renderStrategy,()=>{const phase=state.drafts.p10.phase;return phase==='report'?reportPage():phase==='design'?finalDesign():endingPage(phase==='certificate');}];
  return `<main id="main" class="page activity-page stage-page" data-phase="${a.id==='p10'?state.drafts.p10.phase:'activity'}"><div class="page-heading activity-heading"><div><div class="eyebrow">${a.chapter+1}장 · ${a.verb}</div><h1>${a.title}</h1></div></div><div class="mission-layout ${a.id==='p10'&&state.drafts.p10.phase==='design'?'final-workbench':''}">${helper(a)}<section class="work-area" data-stage="${a.id}" aria-label="${a.title}">${views[activities.indexOf(a)]()}</section></div>${stageTransport(a)}</main>`;
}
function render() {
  narration.stop(); voiceControls.forEach(cleanup => cleanup()); voiceControls = [];
  const active=document.activeElement;const focusAction=active?.dataset?.action,focusValue=active?.dataset?.value;
  mapView?.dispose();mapView=null;
  document.documentElement.classList.toggle('reduced-motion',state.reduced);
  configureAudio(state.muted);
  document.body.dataset.route=route;
  const a=activities.find(a=>a.id===route);
  app.classList.toggle('activity-shell',!!a);syncStageViewport();
  app.innerHTML=header()+(route==='home'?homePage():route==='map'?mapPage():a?activityPage(a):homePage());
  if (route === 'home') voiceControl(app.querySelector('.title-copy'), 'welcome', true);
  app.querySelectorAll('.report-record').forEach((host, index) => { if (state.completed.includes(['p02','p04','p06','p08','p09'][index])) voiceControl(host.querySelector('div'), `summary-${index+1}`); });
  if (app.querySelector('.certificate')) voiceControl(app.querySelector('.certificate'), 'ending');
  if(route==='map')mapView=mountMap(document.querySelector('#main'),state,{reduced:state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches,selected:mapChapter,onArrive:i=>{if(i!==mapChapter)selectChapter(i,false);}});
  if(route==='map')mountRepair(document.querySelector('#main'),{state,save,sound:kind=>{configureAudio(state.muted);playSound(kind);},kind:'clean',preview:!!studentState,available:chapters.map((c,i)=>({id:i,label:c.title||c.name||`${i+1}번 구역`})).filter(c=>studentState||chapterDone(state,c.id))});
  if(focusAction&&!modal.open) {
    const same=Array.from(app.querySelectorAll('[data-action]')).find(b=>!b.disabled&&b.dataset.action===focusAction&&b.dataset.value===focusValue);
    const fallback=app.querySelector('.activity-complete [data-action="completion-next"], .hotspot:not(.found), .experiment-controls button:not(:disabled), [data-action="final-shock"], [data-action="final-finish"]');
    (same||fallback)?.focus({preventScroll:true});
  }
  markNextTargets();updatePlaybackControls();scheduleExperiment();
  playFeedback(feedbackEvent,state.reduced);feedbackEvent=undefined;
}
function routeChanged() {
  clearTimeout(experimentTimer);experimentTimer=undefined;
  playback.running=false;playback.cursor=0;playback.message='';playback.finished=false;
  chainedSource='';
  stopAudio();
  let next=location.hash.slice(1)||'home';
  if(!['home','map',...activities.map(a=>a.id)].includes(next))next='home';
  if(next.startsWith('p')&&!accessible(state,next)){next='map';toast('앞 활동을 마치면 열려. 수업 시연은 설정에서 전체 해금할 수 있어.');history.replaceState(null,'','#map');}
  if(route&&route!==next&&!goingBack){historyRoutes.push(route);if(historyRoutes.length>40)historyRoutes.shift();}
  if(route!==next){hintOpen=false;hintLevel=0;selectedSpecimen='';selectedRole='';strategyReflect=next==='p09'&&state.drafts.p09.ran;}
  goingBack=false;route=next;
  if(route!=='home'){state.last=route;save();}
  if(route==='map')mapChapter=nextChapter();
  if(route==='p10'){
    const d=state.drafts.p10;
    if(!d.initialized){d.strategies=[...state.drafts.p09.selected];d.initialized=true;save();}
    if(['ending','certificate'].includes(d.phase)&&(!state.completed.includes('p10')||!d.shock||!finalCheck(d).success)){d.phase='design';save();}
  }
  if(route==='p04'&&state.drafts.p04.ran&&state.drafts.p04.step<2&&!state.drafts.p04.restored)playback.running=true;
  autoRecord();render();window.scrollTo({top:0,left:0,behavior:'instant'});document.querySelector('h1')?.setAttribute('tabindex','-1');document.querySelector('h1')?.focus({preventScroll:true});
}
function syncStageViewport(){
  const w=window.visualViewport?.width||innerWidth,h=window.visualViewport?.height||innerHeight;
  const activity=activities.some(a=>a.id===route);
  const fitsStage=w>=1000&&h>=562;
  app.classList.toggle('activity-shell',activity&&fitsStage);
  app.classList.toggle('activity-flow',activity&&!fitsStage);
  app.style.setProperty('--stage-width',`${w}px`);app.style.setProperty('--stage-height',`${h}px`);app.style.setProperty('--stage-scale',1);
}
for(const event of ['resize','orientationchange'])window.addEventListener(event,syncStageViewport);
window.visualViewport?.addEventListener('resize',syncStageViewport);
matchMedia('(orientation: portrait)').addEventListener?.('change',syncStageViewport);
function stopPlayback(message='',finished=playback.finished){
  clearTimeout(experimentTimer);experimentTimer=undefined;playback.running=false;playback.message=message;playback.finished=finished;
}
function updatePlaybackControls(){
  app.dataset.playing=String(playback.running);app.style.setProperty('--playback-ms',`${playbackDelay(playback.speed)}ms`);
  const toggle=app.querySelector('[data-action="playback-toggle"]');
  if(toggle){toggle.setAttribute('aria-pressed',String(playback.running));toggle.innerHTML=`${icon(playback.running?'pause':'play')}<span>${playback.running?'직접 해보기':'자동재생'}</span>`;}
  const status=app.querySelector('.playback-status');if(status)status.textContent=playback.message;
}
function scheduleExperiment(){
  clearTimeout(experimentTimer);experimentTimer=undefined;
  if(!playback.running||document.hidden||modal.open||!state.drafts[route])return;
  const next=playbackStep(route,state.drafts[route],playback.cursor);
  if(next.kind==='pause'){stopPlayback(next.message,true);updatePlaybackControls();return;}
  playback.message=next.message;updatePlaybackControls();
  const expectedRoute=route,draft=state.drafts[route];
  experimentTimer=setTimeout(()=>{
    experimentTimer=undefined;
    if(!playback.running||route!==expectedRoute||state.drafts[route]!==draft||document.hidden||modal.open)return;
    playback.cursor++;
    if(next.action==='experiment-advance'){draft.step=Math.min(2,Number(next.value));save();render();return;}
    if(next.action==='time-jump'){
      const input=app.querySelector('#time-range');
      if(input){simulatedPlayback=true;try{input.value=next.value;input.dispatchEvent(new Event('input',{bubbles:true}));}finally{simulatedPlayback=false;}scheduleExperiment();return;}
    }
    const control=[...app.querySelectorAll('[data-action]')].find(el=>el.dataset.action===next.action&&el.dataset.value===next.value&&!el.disabled);
    if(!control){stopPlayback('다음 조작을 직접 골라 줘');updatePlaybackControls();return;}
    simulatedPlayback=true;try{control.click();}finally{simulatedPlayback=false;}
    scheduleExperiment();
  },playbackDelay(playback.speed));
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopPlayback('일시정지');updatePlaybackControls();}else syncStageViewport();});
document.addEventListener('pointerdown',event=>{if(playback.running&&event.target.closest('button,[data-drag],.time-scene,input,summary')&&!event.target.closest('.playback-controls')){stopPlayback();updatePlaybackControls();}});
function markNextTargets(){
  if(!state.drafts[route])return;
  const guidance=currentGuidance();
  app.querySelectorAll('.next-target').forEach(element=>{
    element.classList.remove('next-target');
    element.removeAttribute('aria-describedby');
  });
  const cue=app.querySelector('.next-cue span');
  if(cue)cue.innerHTML=emphasizeConcept(guidance.text,learningNotes[route].terms);
  if(guidance.selector)app.querySelectorAll(guidance.selector).forEach(element=>{
    if(element.disabled)return;
    element.classList.add('next-target');
    element.setAttribute('aria-describedby','next-cue');
  });
}
function showLearningGuide() {
  const note=learningNotes[route],line=voiceLines.find(item=>item.id===`guide-${route}`);
  const text=value=>emphasizeConcept(value,note.terms);
  openModal(`<div class="modal-heading"><h2>모아의 개념·탐험 안내</h2>${btn(icon('close'),'close','','icon-button','aria-label="안내 닫기"')}</div>
    <section class="learning-note"><h3>기억할 개념</h3><p class="learning-core">${text(note.core)}</p>
    ${note.image?`<figure class="learning-picture"><img src="./assets/learning-v2/${note.image}.webp" alt="죽은 나무에서 자라며 양분을 얻는 버섯과 나무 속의 가는 균사" width="1000" height="667"><figcaption>죽은 나무를 분해하는 버섯의 예 · 실 모양의 균사를 크게 나타낸 그림</figcaption></figure>`:''}
    <p>${text(note.clarify)}</p><details><summary>생각 나누기</summary><p>${text(note.question)}</p></details></section>
    <section class="learning-directions"><h3>해 보는 순서</h3><p>${esc(line.text)}</p><small>AI 생성 음성으로 조작 안내 듣기</small></section>`);
  modal.classList.add('learning-guide-modal');
  modalVoiceCleanup=mountNarrationControl(modal.querySelector('.learning-directions'),line.id,narration);
}
function showPractice() {
  if(route!=='p10'||!state.completed.includes('p10'))return;
  const d=state.drafts.p10;
  openModal(`<div class="modal-heading"><h2>생활 속 실천 약속</h2>${btn(icon('close'),'close','','icon-button','aria-label="실천 약속 닫기"')}</div>
    <p class="practice-intro">내일 해 볼 일을 하나 골라. 고른 까닭을 친구나 가족에게 이야기해 보자.</p>
    <div class="choices practice-choices">${practiceActions.map(item=>choice(item.text,'practice-choice',item.id,d.practice===item.id)).join('')}</div>
    <p class="practice-reason" role="status">${practiceActions.find(item=>item.id===d.practice)?.reason||'내가 직접 해 볼 수 있는 약속을 골라 봐.'}</p>
    <p class="practice-caption">이곳에는 실천할 계획이 기록돼. 실제로 해 본 뒤 어떤 도움이 됐는지 이야기해 봐.</p>
    ${btn('엔딩으로 돌아가기','close','','button primary')}`);
  modal.classList.add('practice-modal');
  modal.addEventListener('close',()=>{render();app.querySelector('[data-action="practice-show"]')?.focus({preventScroll:true});},{once:true});
}
function showHint(){
  hintOpen=true;app.querySelector('[data-action="hint"]')?.setAttribute('aria-expanded','true');
  openModal(`<div class="companion-hint" id="companion-hint" role="region" aria-label="도토의 단계별 힌트"><div class="hint-heading"><h2>도토의 힌트 ${hintLevel+1}/3</h2>${btn(icon('close'),'hint-close','','icon-button','aria-label="힌트 닫기"')}</div><p>${emphasizeConcept(hints[route][hintLevel],learningNotes[route].terms)}</p><div class="hint-actions">${hintLevel<2?btn('한 걸음 더','hint-more','','button'):''}${btn('직접 해 볼게!','hint-close','','button primary')}</div></div>`);
  modal.classList.add('hint-modal');
  if (hintLevel === 0) modalVoiceCleanup = mountNarrationControl(modal.querySelector('.companion-hint'), `hint-${route}`, narration);
}
function openModal(html) {
  narration.stop(); modalVoiceCleanup(); modalVoiceCleanup = () => {};
  modalMediaCleanup(); modalMediaCleanup = () => {}; modal._conceptRecallCleanup?.();
  stopPlayback('일시정지');updatePlaybackControls();
  clearTimeout(experimentTimer);experimentTimer=undefined;
  if(!modal.open)focusBeforeModal=document.activeElement;
  modal.querySelector('video')?.pause();modal.classList.remove('concept-modal','hint-modal','learning-guide-modal','practice-modal');mediaPriority(false);
  modal.innerHTML=html;
  const title=modal.querySelector('h2');if(title){title.id='modal-title';modal.setAttribute('aria-labelledby','modal-title');}
  if(!modal.open)modal.showModal();
  modal.querySelector('button:not(:disabled)')?.focus();
}
function closeModal() { narration.stop(); modalVoiceCleanup(); modalVoiceCleanup = () => {}; hintOpen=false;app.querySelector('[data-action="hint"]')?.setAttribute('aria-expanded','false');modal.querySelector('video')?.pause();mediaPriority(false);modal.close();focusBeforeModal?.focus?.();scheduleExperiment(); }
function showConcept(id, next='') {
  const c=concepts[id];if(!c)return;
  const reduceVideo=state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
  mediaPriority(true);
  const nextLabel=next?activities.find(a=>a.id===next)?.title:'탐험 계속하기';
  openModal(`<div class="modal-heading"><div><div class="eyebrow">${state.completed.includes(id)?'발견을 기록했어!':'개념 한눈에'} · ${c.duration}초</div><h2>${c.title}</h2></div>${btn(icon('close'),'close','','icon-button','aria-label="개념 영상 닫기"')}</div><video class="concept-video" controls playsinline preload="metadata" ${reduceVideo?'':'autoplay'} poster="./assets/concepts/${id}.jpg" aria-label="${c.title} 개념 영상"><track kind="captions" srclang="ko" label="한국어" src="./assets/concepts/${id}.vtt">이 브라우저에서는 아래 개념 글을 읽어 줘.</video><div class="media-status" role="status"></div><details class="concept-transcript"><summary>개념 글로 읽기</summary><ol>${c.lines.map(t=>`<li>${t}</li>`).join('')}</ol></details><div class="concept-footer"><span>영상은 다시 볼 수 있어.</span>${btn(`${nextLabel}${icon('next')}`,next?'completion-next':'close',next,'button primary')}</div>`);
  modal.classList.add('concept-modal');mediaPriority(true);
  const video=modal.querySelector('video');video.muted=state.muted;
  mountConceptRecall(modal,video,id,c,reduceVideo);
  const controller = new AbortController();
  let mediaUrl = null, disposed = false;
  const isCurrent=()=>!disposed&&modal.open&&modal.querySelector('video')===video;
  modalMediaCleanup = () => {
    disposed = true;
    controller.abort();
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
  };
  const mediaError=()=>{if(!isCurrent())return;modal.querySelector('.media-status').textContent='영상을 불러오지 못했어. 아래 개념 글로 확인해 봐.';modal.querySelector('details').open=true;};
  video.addEventListener('error',mediaError);
  video.addEventListener('ended',()=>{if(!isCurrent())return;modal.querySelector('.media-status').textContent='개념 확인 완료! 다음 탐험으로 출발해 봐.';});
  modal.querySelector('.media-status').textContent = '영상을 불러오는 중이야. 개념 글도 읽을 수 있어.';
  // These short clips must seek even when a static host ignores byte ranges.
  fetch(`./assets/concepts/${id}.mp4`, {signal:controller.signal})
    .then(response => {
      if (!response.ok) throw new Error('Video unavailable');
      return response.blob();
    })
    .then(blob => {
      if (!isCurrent()) return;
      mediaUrl = URL.createObjectURL(blob);
      video.src = mediaUrl;
      video.load();
      modal.querySelector('.media-status').textContent = '';
      if (!reduceVideo) video.play().catch(() => {
        if (!isCurrent()) return;
        if (video.error || video.networkState===3) mediaError();
        else modal.querySelector('.media-status').textContent = '재생 버튼을 눌러 개념을 확인해 봐.';
      });
    })
    .catch(() => { if (!controller.signal.aborted) mediaError(); });
}
function settings() {
  openModal(`<div class="modal-heading"><h2>탐험 설정</h2>${btn(icon('close'),'close','','icon-button','aria-label="설정 닫기"')}</div><div class="setting-row"><div><h3>효과음</h3><p>소리가 없어도 모든 탐험을 할 수 있어.</p></div>${btn(state.muted?'꺼짐':'켜짐','setting-sound','','button',`aria-pressed="${!state.muted}"`)}</div><div class="setting-row"><div><h3>움직임 줄이기</h3><p>지도·먹이 흐름과 영상 자동 재생을 줄여.</p></div>${btn(state.reduced?'켜짐':'꺼짐','reduced','','button',`aria-pressed="${state.reduced}"`)}</div><div class="setting-block"><h3>교사용 · 관리자 전체 해금</h3><p>모든 장과 10개 활동을 한 번에 열어.<br>시연은 임시 공간에서 진행하며 학생 기록과 분리돼. 새로고침하면 학생 탐험으로 돌아와.</p>${btn(state.unlocked?`${icon('check')} 모든 활동이 열렸어`:`${icon('lock')} 모든 장·활동 한 번에 열기`,'unlock','','button secondary',state.unlocked?'disabled':'')}</div><div class="setting-block"><h3>진행 기록</h3><p>${state.completed.length}/10 활동 완료 · 증거 ${evidenceCount(state)}/5<br>${saveError?esc(recordStore.message):'이 기기와 브라우저에만 저장돼. 다른 주소나 기기에는 이어지지 않아.'}</p>${studentState?'':btn('백업하고 새로 시작','reset-confirm','','button danger')+btn('초기화 전 기록 복구','restore-confirm','','button secondary')}${btn('안내 · 제작 정보','about','','text-button')}</div>`);
}
function about() { openModal(`<div class="modal-heading"><h2>모아의 탐험 안내</h2>${btn(icon('close'),'close','','icon-button','aria-label="안내 닫기"')}</div><div class="about-content"><p>네가 생태 탐험가가 되어 숲의 이상 신호를 조사해. 각 장소의 두 활동을 마치면 다음 장소가 열려.</p><ol><li>지도에서 장소를 골라 조사하기</li><li>관찰·실험·연결의 증거 모으기</li><li>새 생태계를 설계하고 고쳐 보기</li></ol><p>진행은 자동으로 저장돼. 이름이나 학번을 입력하지 않아도 돼. 전체 해금은 수업 시연용이며 완료 기록을 만들지 않아.</p><hr><details><summary>교사용 · 활동 목표와 관찰 근거</summary><p>2022 개정 과학과 고시본과 성취기준 문구를 대조했어. 실제 학습 성취와 자유 설명은 수업에서 교사가 확인해 줘.</p>${activities.map(a=>`<section><h3>${a.id.toUpperCase()} · ${a.title}</h3><p>${curriculum[a.id].objective}</p><p>${curriculum[a.id].standards.map(s=>`${s.code} ${s.text}`).join('<br>')}</p><p>함께 나눌 질문 · ${esc(curriculum[a.id].discussion)}</p>${curriculum[a.id].extension?'<p>생산자·소비자·분해자 역할 실험은 먹이 관계를 이해하기 위한 확장 활동이야.</p>':''}</section>`).join('')}</details><h3>제작 정보</h3><p>기획·자료: 사용자 제공 프로젝트<br>구현: Codex와 함께 제작<br>배경·로고·캐릭터: 프로젝트에 제공된 생성형 AI 이미지<br>지도·도토·개념 모션: 코드로 제작<br>모아·도토 안내: AI 생성 음성<br>효과음: <a href="https://kenney.nl/assets/interface-sounds" target="_blank" rel="noopener noreferrer">Kenney Interface Sounds · CC0</a></p><p>교육 참고: 미국 국립공원관리청 NPS (nps.gov), Craters Ecosystem / Create Your Own Marine Food Web.</p><p>생태계 변화는 학습을 위한 단순 모형이야. 실제 회복 시간과 개체수를 예측하지 않아.</p><p class="muted">에셋 권리는 각 권리자에게 있어. 화면 캡처와 제공 자료의 무단 복제·재배포·상업적 이용은 권리자의 허락이 필요해. 외부 배포용 권리·제작자 표기는 배포 전에 확인해야 해.</p></div>`); }
function markComplete(id) {
  if(state.completed.includes(id))return;
  clearTimeout(toastTimer);notice.classList.remove('show');
  state.evidence[id]=JSON.parse(JSON.stringify(state.drafts[id]));
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
    toast('그 방향의 먹이 관계는 먹이 수첩에서 확인되지 않았어. 먹히는 생물부터 다시 골라 줘.',true);d.selected='';chainedSource='';return;
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
  const record=`${d.shock?'변화 시험':'첫 시험'}: ${result.success?'통과':result.checks.filter(c=>!c.ok).map(c=>c.name).join(', ')}`;
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
  if(e.target.closest('.play-mission-entry')){narration.stop();stopPlayback('일시정지');updatePlaybackControls();return;}
  if(e.target.closest('summary')&&playback.running){stopPlayback('일시정지');updatePlaybackControls();}
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
  if(action==='playback-toggle'){
    if(playback.running)stopPlayback('일시정지');
    else{if(playback.finished)playback.cursor=0;playback.running=true;playback.message='';playback.finished=false;}
    updatePlaybackControls();scheduleExperiment();return;
  }
  if(action==='playback-speed'){
    const speed=Number(value);if(![.5,1,2].includes(speed))return;
    playback.speed=speed;render();return;
  }
  if(!simulatedPlayback&&d&&playback.running){stopPlayback();updatePlaybackControls();}
  if(action==='voice-guide'){showLearningGuide();return;}
  if(action==='practice-show'){showPractice();return;}
  if(action==='practice-choice'){
    const practice=practiceActions.find(item=>item.id===value);
    if(route!=='p10'||!state.completed.includes('p10')||!practice)return;
    d.practice=value;save();
    modal.querySelectorAll('[data-action="practice-choice"]').forEach(button=>{
      const selected=button.dataset.value===value;
      button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));
      button.firstElementChild.outerHTML=selected?icon('check'):'<span class="choice-dot"></span>';
    });
    modal.querySelector('.practice-reason').textContent=practice.reason;
    return;
  }
  if(action==='hint'||action==='hint-more'||action==='hint-close'){
    if(action==='hint-close'){closeModal();return;}
    if(action==='hint-more')hintLevel=Math.min(2,hintLevel+1);
    playSound('hint');showHint();return;
  }
  if(action==='report-details'){showReport();return;}
  if(action==='food-guide'){
    openModal(`<div class="modal-heading"><h2>먹이 수첩</h2>${btn(icon('close'),'close','','icon-button','aria-label="수첩 닫기"')}</div><div class="food-guide-list">${organisms.map(o=>`<p>${specimenArt(o.id,'inline-art')}<b>${o.name}</b> · ${o.hint}</p>`).join('')}</div>`);return;
  }
  if(action==='strategy-edit'){strategyReflect=false;render();return;}
  if(action==='design-tab'){designTab=value;render();return;}
  if(action==='mute'||action==='setting-sound'){state.muted=!state.muted;configureAudio(state.muted);save();render();if(action==='setting-sound')settings();return;}
  if(action==='reduced'){state.reduced=!state.reduced;save();render();settings();return;}
  if(action==='unlock'){studentState=state;state=restoreState(JSON.parse(JSON.stringify(state)));state.unlocked=true;render();settings();toast('교사 시연을 시작했어. 학생 기록은 변경하지 않아.');return;}
  if(action==='preview-exit'){if(!studentState)return;state=studentState;studentState=null;clearTimeout(experimentTimer);closeModal();historyRoutes=[];go('map');return;}
  if(action==='reset-confirm'){openModal(`<div class="modal-heading"><h2>새 탐험을 시작할까?</h2></div><p>현재 원본을 초기화 전 백업 한 개로 남기고 새 탐험을 시작해. 이전 백업은 이번 기록으로 교체돼. 백업에 실패하면 초기화하지 않아.</p><div class="button-row">${btn('기록 유지','settings','','button primary')}${btn('기록 지우고 새로 시작','reset','','button danger')}</div>`);return;}
  if(action==='reset'){if(studentState)return;const fresh=recordStore.reset();if(!fresh){toast(recordStore.message,true);return;}state=fresh;saveError=false;closeModal();historyRoutes=[];goingBack=true;go('home');return;}
  if(action==='restore-confirm'){if(studentState)return;openModal(`<h2>초기화 전 기록을 복구할까?</h2><p>현재 탐험 대신 마지막 초기화 전 백업을 불러와. 현재 작업이 필요하다면 취소해 줘.</p>${btn('취소','settings')}${btn('백업 복구','restore-backup')}`);return;}
  if(action==='restore-backup'){if(studentState)return;const restored=recordStore.restoreBackup();if(!restored){toast(recordStore.message,true);return;}state=restored;saveError=false;closeModal();historyRoutes=[];go('home');return;}
  if(action==='completion-next'){if(modal.open)closeModal();go(value);return;}
  if(action==='chapter'){selectChapter(Number(value));sound();return;}
  if(action==='map-cycle'){selectChapter(mapChapter+Number(value));sound();return;}
  if(action==='map-enter'){const i=Number(value),target=chapterTarget(i);if(!target){toast('앞 장소의 두 활동을 먼저 마쳐 줘.',true);return;}sound();el.disabled=true;if(mapView)mapView.travel(i,()=>go(target.id));else go(target.id);return;}
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
    case'prediction':if(d.ran)return;d.prediction=value;d.ran=true;d.restored=false;d.step=0;d.answer='';playback.running=true;playback.cursor=0;playSound('experiment');break;
    case'experiment-skip':if(!d.ran||d.step>=2)return;d.step=2;break;
    case'experiment-restore':if(d.step===2&&!d.restored){d.restored=true;playback.message='';d.log.push(`${d.removed}:${d.prediction}`);d.log=d.log.slice(-30);}break;
    case'experiment-answer':d.answer=value;if(value!==roles.find(r=>r.id===d.removed).prediction)toast('실험에서 나타난 변화를 다시 읽고 기록해 봐.',true);break;
    case'edge':connect(d,value);break;
    case'undo-edge':d.edges.pop();d.selected='';chainedSource='';break;
    case'compare-remove':if(d.removed===value)return;d.removed=value;if(value&&!d.tested.includes(value))d.tested.push(value);playSound('experiment');break;
    case'compare-answer':d.answer=value;if(value==='always')toast('먹이가 이어져도 물이나 서식처가 달라지면 영향을 받아. 남아 있는 경로에 주목해 봐.',true);break;
    case'time-policy':if(d.policy===value)return;d.policy=value;recordTime(d);break;
    case'time-jump':d.position=Number(value);recordTime(d);break;
    case'time-answer':d.answer=value;if(value==='automatic')toast('대책을 바꿔 두 장면을 다시 비교해 봐. 오염이 계속 들어오면 저절로 똑같이 회복되지 않아.',true);break;
    case'strategy':if(toggleStrategy(d.selected,value)){d.ran=false;d.reason='';playSound('connect');}break;
    case'strategy-run':if(d.selected.length){d.ran=true;strategyReflect=true;const record=JSON.stringify(d.selected);if(d.history.at(-1)!==record)d.history.push(record);d.history=d.history.slice(-3);playSound('experiment');}break;
    case'strategy-reason':d.reason=value;break;
    case'final-start':d.phase='design';break;
    case'final-import':if(!importFoodWeb(state))return;toast('네 먹이그물을 가져왔어! 빛·물·흙과 분해자를 더해 새 환경을 완성해 봐.');playSound('connect');break;
    case'element':if(d.elements.includes(value)){d.elements=d.elements.filter(v=>v!==value);d.edges=d.edges.filter(e=>!e.split('>').includes(value));if(d.selected===value)d.selected='';}else{d.elements.push(value);playSound('connect');}d.tested=false;break;
    case'final-edge':connect(d,value,true);break;
    case'final-undo':d.edges.pop();d.selected='';chainedSource='';d.tested=false;break;
    case'final-strategy':if(toggleStrategy(d.strategies,value)){d.tested=false;playSound('connect');}break;
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
  if(!simulatedPlayback){stopPlayback();updatePlaybackControls();}
  const d=state.drafts.p08;d.position=Number(e.target.value);recordTime(d);save();
  document.querySelector('.changed-scene').style.clipPath=`inset(0 ${100-d.position}% 0 0)`;
  document.querySelector('.comparison-handle').style.setProperty('--handle-position',`${d.position}%`);
  document.querySelector('.time-observation span').textContent=`확인한 장면 ${d.seen.length}/4`;
  document.querySelectorAll('[data-action="time-jump"]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value==='0'?d.position<=5:d.position>=95)));
  const reflection=document.querySelector('.time-reflection');
  if(d.seen.length===4&&reflection&&!reflection.querySelector('.reflection')){
    reflection.innerHTML=timeReflection(d,{btn,choice,icon,tag,completedFooter});
    playSound('discover');
  }else if(d.seen.length<4&&reflection){const count=reflection.querySelector('.time-evidence-count b');if(count)count.textContent=`${d.seen.length}/4`;}
  markNextTargets();
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
modal.addEventListener('close',()=>{narration.stop();modalVoiceCleanup();modalVoiceCleanup=()=>{};modalMediaCleanup();modalMediaCleanup=()=>{};hintOpen=false;app.querySelector('[data-action="hint"]')?.setAttribute('aria-expanded','false');modal.querySelector('video')?.pause();mediaPriority(false);scheduleExperiment();});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
window.addEventListener('hashchange',()=>{if(modal.open)closeModal();routeChanged();});
routeChanged();
if(loadWarning)toast(loadWarning,true);
