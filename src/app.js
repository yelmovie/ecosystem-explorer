import { createNarration, mountNarrationControl } from './narration.js';
import { voiceLines } from './voice-lines.js';
// D13: low-memory or 4-core tablets drop the frosted blur and keep near-opaque panels (same as 10 earthsea).
if((navigator.deviceMemory&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4))document.documentElement.classList.add('lite-glass');
let voiceControls = [], modalVoiceCleanup = () => {}, modalMediaCleanup = () => {}, hintVoiceCleanup = () => {};
// A concept video keeps media priority while its caption voices start and stop.
const narration = createNarration({ isMuted: () => !state.voice, duck: value => mediaPriority(value || (modal.open && modal.matches('.concept-modal,.story-modal'))), onEnd: id => chainedVoice[id] && narration.play(chainedVoice[id]) });
// Lines that follow another line when it finishes: home welcome → story bubble, ending scene → our strategy's change.
const chainedVoice = { welcome: 'home-story' };
const voiceByText = (text, prefix) => voiceLines.find(line => line.id.startsWith(prefix) && line.text === String(text).replace(/\s+/g, ' ').trim());
let mapVoiceCleanup = () => {};
// Map villain bubbles: the knot villain's voice for the same words. A guide or Doto line already playing is not cut off.
function villainVoice(text) {
  const line = voiceLines.find(item => item.id.startsWith('villain-') && item.text === text);
  const busy = narration.state.status === 'playing' && !String(narration.state.id).startsWith('villain-');
  if (line && !busy) narration.play(line.id);
}
function voiceControl(host, id, caption = false) {
  if (!host) return;
  if (caption) { const text = document.createElement('p'); text.className = 'voice-caption'; text.textContent = voiceLines.find(line => line.id === id)?.text || ''; text.style.cssText = 'font-size:var(--support-size,16px);line-height:1.5;margin:4px 0;'; host.append(text); }
  voiceControls.push(mountNarrationControl(host, id, narration));
}
import { loadScreen, loadStyle, waitForScreen, mapAssetsReady } from './screen-loaders.js';
import { createRecordStore } from './storage.js';
import { configureAudio, playSound, playMapCue, playCardCue, playStep, stopAudio, mediaPriority, startMusic, setMusic } from './audio.js';
import { chapters, activities, observations, specimens, roles, predictions, organisms, foodEdges, strategies, finalElements, causes, practiceActions } from './data.js';
import { SAVE_KEY, restoreState, accessible, evidenceCount, chapterDone, strategyCost, finalCheck } from './engine.js';

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
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>', play: '<path d="m7 3 15 9-15 9Z"/>', hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-1V4a1.5 \
1.5 0 0 1 3 0v7m0-.5V5.5a1.5 1.5 0 0 1 3 0V13m0-4.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.5c-2.2 0-3.6-.8-4.9-2.3L3.3 15.4a1.6 1.6 0 0 1 2.4-2.1L8 15"/>',
  reset: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>', close: '<path d="m5 5 14 14M19 5 5 19"/>', trophy: '<path d="M7 3h10v7a5 5 0 0 1-10 0V3ZM7 5H3v3a4 4 0 0 0 4 4m10-7h4v3a4 4 0 0 1-4 4m-5 3v6m-5 0h10"/>',
   info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v1"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
const esc = str => String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn = (label, action, value = '', cls = 'button', attrs = '') => `<button class="${cls}" data-action="${action}" data-value="${esc(value)}" ${attrs}>${label}</button>`;
const moa = (cls = '') => `<img class="moa ${cls}" src="./assets/web/moa-human-portrait-v4.webp" alt="생태 탐험가 모아" draggable="false">`;
const tag = text => `<span class="tag">${text}</span>`;
const CREDIT = '기획·제작: 옐샘 &amp; ⓒ 아이스크림미디어';
const choice = (label, action, value, on = false, disabled = false) => btn(`${on ? icon('check') : '<span class="choice-dot"></span>'}<span class="choice-label">${label}</span>`, action, value, `choice ${on ? 'selected' : ''}`, `aria-pressed="${on}" ${disabled ? 'disabled' : ''}`);
let browserStorage;
try { browserStorage = localStorage; } catch { browserStorage = null; }
const recordStore = createRecordStore(browserStorage);
let state = recordStore.state, loadWarning = recordStore.message, saveError = !!loadWarning;
let studentState = null;
const pendingRestoration = new Set();
// Map places whose opening has been heard: the markers open when the app starts, then each newly opened one, held only in memory,
// so a redraw, reload or revisit never repeats it. The teacher's open-everything preview never sounds it.
const openPlaces = s => chapters.map((_, i) => accessible(s, activities[i * 2].id));
let heardOpen = openPlaces(state);
// One opening cue (a soft opening, then small bells) once the map has settled and no dialog, card or voice is on; given up after 20 s.
function announceOpening() {
  const from = performance.now();
  const attempt = () => {
    if (route !== 'map' || studentState || performance.now() - from > 20000) return;
    if (document.hidden || document.querySelector('dialog[open],.rc-layer') || narration.state.status === 'playing') { setTimeout(attempt, 200); return; }
    configureAudio(state); playMapCue('unlock');
  };
  setTimeout(attempt, 450);
}
let strategyReflect=false;
let feedbackEvent;
let timeSweep=false,sweepFrame=0;
let selectedSpecimen='', selectedRole='', hintLevel=0, hintOpen=false, designTab='elements', chainedSource='';
let playback={running:false,speed:1,cursor:0,message:'',finished:false}, simulatedPlayback=false;
let route = '', mapView, mapChapter = 0, historyRoutes = [], goingBack = false, toastTimer, focusBeforeModal, experimentTimer;
let mapScreen, mapAssets, activityScreen, activityView, interactions, failure;
let screenRequest, extraRequest;
const missionEntry = () => btn('생태 설계 미션', 'play-mission', '', 'play-mission-entry');
function save() {
  if (studentState) return;
  saveError = !recordStore.save(state);
  if (saveError) toast(recordStore.message);
}
function toast(text, error = false) { if(error){configureAudio(state);playSound('error');} notice.textContent = text; notice.className = `toast show ${error ? 'error' : ''}`; clearTimeout(toastTimer); toastTimer = setTimeout(() => notice.classList.remove('show'), 5200); }
function sound(success=false) { configureAudio(state); playSound(success?'success':'tap'); }

function go(next) { if(route === next) render(); else location.hash = next; }
function header() {
  return `${studentState&&!route.startsWith('p')?`<div class="preview-banner" role="status">교사 시연 · 학생 기록은 저장하지 않아. ${btn('학생 탐험으로 돌아가기','preview-exit','','button secondary')}</div>`:''}<header class="topbar">\
<div class="nav-group">${btn(icon('home'),'go','home','icon-button',`aria-label="홈" ${route==='home'?'disabled':''}`)}${btn(icon('back'),'back','','icon-button',`aria-label="이전" ${route==='home'&&
  !historyRoutes.length?'disabled':''}`)}<a class="brand" href="#home">${icon('leaf')}<span>생명의 그물 지도<small>모아의 생태 탐험</small></span></a></div><nav class="chapter-progress" aria-label="장별 진행">${chapters.map((c,
  i)=>`<span class="${chapterDone(state,i)?'done':activities.find(a=>a.id===route)?.chapter===i?'current':''}" title="${i+1}장 ${c.name}">${chapterDone(state,i)?icon('check'):i+1}</span>`).join('<i></i>')}</nav>\
<div class="nav-group">${route==='map'?rewardSlots():`<span class="evidence-counter">${icon('book')}<span>조사 기록 <b>${evidenceCount(state)}/5</b></span></span>`}${btn(icon(state.muted?'mute':'sound'),'mute','',
  'icon-button',`aria-label="${state.muted?'전체 소리 켜기':'전체 소리 끄기'}" aria-pressed="${state.muted}"`)}${btn(icon('settings'),'settings','','icon-button','aria-label="설정"')}</div></header>`;
}
// Achievement cards (map-reward-cards.js): five slots just before the sound button on the map. A villain's third hit wins its card.
// The teacher preview has no villains, so it shows no slots.
const rewardSlots = () => mapScreen && !studentState ? mapScreen.rewardSlotsHtml(state.mapHits) : '';
// What a won card finds when its turn comes: the map ('open'), a dialog or hidden tab over it ('wait'), or another screen ('gone').
const rewardStage = () => route !== 'map' || studentState ? 'gone' : document.hidden || document.querySelector('dialog[open]') ? 'wait' : 'open';
// Title screen (2026-11-22, same layout as 1번 우당탕 힘 실험실): background, Moa and Doto, the logo in the middle and two
// buttons below it. With a record the first button starts over after a confirm; 「이어 하기」 goes back to the saved place.
const hasRecord = () => Boolean(state.completed.length || state.last !== 'map' || state.drafts.p01.found.length);
function homePage() {
  const started = hasRecord();
  return `<main id="main" class="home-page title-screen"><div class="title-shade" aria-hidden="true"></div>\
<h1 class="title-logo"><img src="./assets/web/logo.webp" alt="생명의 그물 지도" fetchpriority="high"></h1><div class="title-guide" aria-hidden="true">\
<img class="title-moa" src="./assets/web/moa-human-v4.webp" alt=""><img class="title-doto" src="./assets/web/doto-cat-v4.webp" alt=""></div><div class="title-buttons">\
${btn(started?'새로 시작':'시작하기','new-start','','button golden hero-start')}${btn('이어 하기','go',state.last,'button title-continue',started?'':'disabled')}</div>\
<p class="title-credit">${CREDIT}</p></main>`;
}
const ro = word => { const code=word.charCodeAt(word.length-1)-0xAC00, last=code%28; return code<0||last===0||last===8?'로':'으로'; };
const nextChapter = () => { const first=chapters.findIndex((_,i)=>!chapterDone(state,i)); return first<0?4:first; };
const chapterTarget = i => { const acts=activities.slice(i*2,i*2+2); return acts.find(a=>accessible(state,a.id)&&!state.completed.includes(a.id))||acts.find(a=>accessible(state,a.id)); };
const mapTarget = i => chapters.every((_, n) => chapterDone(state, n)) ? activities.at(-1) : chapterTarget(i);
const mapTargetLabel=()=>{const i=nextChapter(),place=chapters[i].place;return chapters.every((_,n)=>chapterDone(state,n))?'최종 보고 보러 가기':`${place}${ro(place)} 가기`;};
function showMapActivities(i) {
  const c=chapters[i], links=activities.slice(i*2,i*2+2);
  openModal(`<div class="modal-heading"><h2>${c.place}</h2>${btn(icon('close'),'close','','icon-button','aria-label="닫기"')}</div><div class="button-row">${links.map(a=>btn(`${a.title} ${icon(accessible(state,
  a.id)?'next':'lock')}`,'go',a.id,'button',accessible(state,a.id)?'':'disabled')).join('')}</div>`);
}
function mapPage() {
  const done=chapters.filter((_,i)=>chapterDone(state,i)).length, next=nextChapter();
  const dirs=[['ArrowUp','위로','↑','up'],['ArrowLeft','왼쪽으로','←','left'],['ArrowDown','아래로','↓','down'],['ArrowRight','오른쪽으로','→','right']];
  return `<main id="main" class="map-page map-screen"><h1 class="sr-only">탐험 지도 · 오늘은 어디를 탐험할까?</h1><div class="map-viewport" role="region" aria-label="탐험 지도. 땅을 누르거나 방향키·W A S D로 걸어. 끌어서 지도를 움직일 수 있어.">\
<div class="map-world"><canvas id="map-canvas" aria-hidden="true"></canvas><canvas class="map-actor map-moa" width="64" height="72" aria-hidden="true"></canvas>\
<canvas class="map-actor map-doto" width="64" height="72" aria-hidden="true"></canvas>${btn('<span aria-hidden="true">…</span>','map-hint','','map-companion',
  'aria-label="도토에게 다음 탐험 묻기" aria-expanded="false" aria-controls="map-doto-bubble"')}${chapters.map((c,i)=>{const p=mapScreen.markerPosition(i),open=accessible(state,activities[i*2].id);
  return btn(`<span class="marker-num"><svg class="map-lock-icon" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">\
<rect x="5" y="11" width="14" height="10" rx="2"/><path d="${open?'M8 11V7a4 4 0 0 1 7.5-2':'M8 11V7a4 4 0 0 1 8 0v4'}"/></svg></span><b>${c.place}</b>`,'chapter',i,
  `map-marker ${mapChapter===i?'selected':''} ${open?'':'locked'} ${chapterDone(state,i)?'done':''}`,`style="left:${p.left}%;top:${p.top}%" aria-label="${i+1}장 ${c.place}${chapterDone(state,
  i)?' (복구 완료)':open?'':' (잠김)'} 선택"`);}).join('')}</div></div><div class="map-controls"><div class="map-dpad" role="group" aria-label="탐험가 이동">${dirs.map(([key,label,arrow,
  cls])=>`<button class="map-dir ${cls}" data-map-dir="${key}" aria-label="${label} 이동">${arrow}</button>`).join('')}</div></div><div class="map-next-control"><div class="map-tools" role="group" aria-label="지도 보기">\
<button class="map-tool" data-map-toggle="overview" aria-label="지도 전체 보기" title="지도 전체 보기" aria-pressed="false">${icon('fit')}</button>\
<button class="map-tool" data-map-toggle="pan" aria-label="손으로 지도 이동" title="손으로 지도 이동" aria-pressed="false">${icon('hand')}</button></div>${btn(`${mapTargetLabel()} ${icon('next')}`,'map-enter',next,
  `button golden map-go${done<5&&!state.reduced?' map-next-cue':''}`)}</div></main>`;
}
function selectChapter(i) {
  mapChapter=(i+chapters.length)%chapters.length;
  mapView?.select(mapChapter);
  document.querySelectorAll('.map-marker').forEach((b,k)=>b.classList.toggle('selected',k===mapChapter));
}
function showReport(){
  const evidence=id=>state.evidence[id]||state.drafts[id];
  openModal(`<div class="modal-heading"><h2>내 조사 기록</h2>${btn(icon('close'),'close','','icon-button','aria-label="기록 닫기"')}</div><div class="report-detail">\
<p>역할 실험 예상: ${esc(predictions.find(([id])=>id===evidence('p04').prediction)?.[1]||'기록 전')}</p><p>역할 실험 관찰: ${esc(evidence('p04').step===2?roles.find(r=>r.id===evidence('p04').removed)?.result:'기록 전')}</p>\
<p>먹이그물 비교에서 없앤 생물: ${evidence('p06').tested.map(id=>esc(organisms.find(o=>o.id===id)?.name)).join(' · ')||'기록 전'}</p><p>복원 작전: ${evidence('p09').selected.map(id=>strategies.find(s=>s.id===id)?.name).join(' · ')||
  '기록 전'}</p><small>완료할 때 남긴 기록이야. 이전 버전 기록은 마지막 저장 상태일 수 있어.</small></div>`);
}
function screenStatus(isMap) {
  const target = isMap && mapTarget(nextChapter());
  const direct = target?.id === 'p01' ? '첫 활동 시작' : target ? `${target.title} 바로 가기` : '';
  return `<main id="main" class="screen-status" data-screen-load="${failure || 'pending'}">
    <h1 tabindex="-1">${isMap ? '탐험 지도' : '생태 탐험 활동'}</h1>
    <p role="${failure ? 'alert' : 'status'}">${failure ? `${isMap ? '지도를' : '활동을'} 불러오지 못했어. 저장한 기록은 그대로야.` : `${isMap ? '지도를' : '활동을'} 준비하고 있어…`}</p>
    ${failure ? `<div class="button-row">${btn('다시 열기', failure === 'assets' ? 'retry-map-assets' : 'retry-screen')}${direct ? btn(direct, 'continue-without-map', '', 'button primary') : ''}</div>` : ''}
  </main>`;
}
function openExtra(button, load, open) {
  extraRequest?.abort();
  const request = extraRequest = new AbortController();
  button.setAttribute('aria-busy', 'true');
  waitForScreen(load(), request.signal).then(value => {
    if (button.isConnected && !document.querySelector('dialog[open]')) open(value);
  }, () => {
    if (!request.signal.aborted && button.isConnected) toast('불러오지 못했어. 새로고침한 뒤 다시 열어 줘.', true);
  }).finally(() => button.removeAttribute('aria-busy'));
}
function loadRoute(isMap) {
  if (screenRequest) return;
  const request = screenRequest = new AbortController();
  const { signal } = request;
  // The card styles load with the map; a failed stylesheet must not keep the map from opening.
  const code = isMap ? (mapScreen || Promise.all([loadScreen.map(), loadStyle('./reward-cards.css').catch(() => {})]).then(([module]) => module)) : Promise.all([
    loadScreen.activity(),
    loadStyle('./concept-focus.css', document.getElementById('experience-style')),
    loadStyle('./stage-layout.css', document.getElementById('glass-style')),
  ]).then(([module]) => module);
  const moduleReady = waitForScreen(Promise.resolve(code), signal).then(module => {
    if (isMap) { mapScreen = module; module.bindRewardSound(name => { configureAudio(state); playCardCue(name); }); }
    else {
      activityScreen = module;
      activityView ||= module.createActivityView({
        btn, choice, icon, tag, moa, esc, missionEntry, playback,
        get state() { return state; }, get route() { return route; },
        get studentState() { return studentState; }, get hintOpen() { return hintOpen; },
        get designTab() { return designTab; }, get strategyReflect() { return strategyReflect; },
        get selectedSpecimen() { return selectedSpecimen; }, set selectedSpecimen(value) { selectedSpecimen = value; },
        get selectedRole() { return selectedRole; }, set selectedRole(value) { selectedRole = value; },
      });
      interactions ||= module.mountInteractions(interactionHandlers);
    }
  });
  // Start the map images together with its code, only after entering the map.
  const assetsReady = isMap ? mapAssetsReady(signal).then(assets => { mapAssets = assets; }) : Promise.resolve();
  Promise.all([
    moduleReady.catch(() => { failureFor('code'); }),
    assetsReady.catch(() => { failureFor('assets'); }),
  ]).then(() => {
    if (screenRequest !== request) return;
    screenRequest = undefined;
    if (!signal.aborted) redrawLoadedScreen();
  });
  function failureFor(kind) {
    if (signal.aborted || screenRequest !== request) return;
    failure = kind;
    screenRequest = undefined;
    request.abort();
    redrawLoadedScreen();
  }
}
function redrawLoadedScreen() {
  const focused = document.activeElement;
  render(!modal.open && (focused === document.body || focused?.closest('.screen-status')));
}
function render(focusHeading = false) {
  narration.stop(); voiceControls.forEach(cleanup => cleanup()); voiceControls = [];
  hintVoiceCleanup(); hintVoiceCleanup = () => {}; mapVoiceCleanup(); mapVoiceCleanup = () => {}; hintOpen = false;
  const active=document.activeElement;const focusAction=active?.dataset?.action,focusValue=active?.dataset?.value;
  mapView?.dispose();mapView=null;
  document.documentElement.classList.toggle('reduced-motion',state.reduced);
  configureAudio(state);
  setMusic(route==='p10'&&['ending','certificate'].includes(state.drafts.p10.phase)?'final':'main');
  document.body.dataset.route=route;
  const a=activities.find(a=>a.id===route), isMap=route==='map';
  const waiting = failure || (isMap && (!mapScreen || !mapAssets)) || (a && !activityView);
  syncStageViewport();
  if (!waiting && a) autoRecord();
  app.innerHTML=header()+(waiting?screenStatus(isMap):isMap?mapPage():a?activityView.activityPage(a):homePage());
  if (waiting && !failure) loadRoute(isMap);
  if (app.querySelector('.ending-scene')) {
    voiceControl(app.querySelector('.ending-content'), 'ending-scene');
    chainedVoice['ending-scene'] = voiceByText(app.querySelector('.ending-report p')?.textContent, 'ending-change-')?.id || null;
  }
  app.querySelectorAll('.report-record').forEach((host, index) => { if (state.completed.includes(['p02','p04','p06','p08','p09'][index])) voiceControl(host.querySelector('div'), `summary-${index+1}`); });
  if (app.querySelector('.certificate')) voiceControl(app.querySelector('.certificate'), 'ending');
  if(isMap && !waiting) {
    const main = document.querySelector('#main'), landscape = mapAssets.landscape;
    landscape.className = 'map-landscape'; landscape.alt = ''; landscape.draggable = false;
    main.querySelector('.map-world').prepend(landscape);
    const restoredSites=studentState?[]:[...pendingRestoration];
    mapView=mapScreen.mountMap(main,state,{assets:mapAssets,save,preview:!!studentState,tone:(kind,hits)=>{configureAudio(state);playMapCue(kind,hits);},say:villainVoice,onEncounterSave:(before,
    patch)=>mapScreen.awardRewardCards(before,patch,{hits:()=>state.mapHits,stage:rewardStage,speaking:()=>narration.state.status==='playing'}),cardTurn:mapScreen.rewardCardTurn,reduced:state.reduced||
    matchMedia('(prefers-reduced-motion: reduce)').matches,selected:mapChapter,restoredSites,onStep:playStep,onArrive:i=>{if(i!==mapChapter)selectChapter(i);},onTravel:busy=>{const b=document.querySelector('.map-go');
    if(!b)return;b.disabled=busy;if(busy)b.setAttribute('aria-busy','true');else b.removeAttribute('aria-busy');b.innerHTML=busy?'길을 따라 이동 중…':`${mapTargetLabel()} ${icon('next')}`;}});
    if(!studentState){pendingRestoration.clear();const now=openPlaces(state),fresh=now.some((open,i)=>open&&!heardOpen[i]);heardOpen=now;if(fresh)announceOpening();}
    if(studentState||chapters.some((_,i)=>chapterDone(state,i)))mapScreen.mountRepair(main,{state,save,sound:kind=>{configureAudio(state);playSound(kind);},kind:'clean',preview:!!studentState,available:chapters.map((c,
    i)=>({id:i,label:c.title||c.name||`${i+1}번 구역`})).filter(c=>studentState||chapterDone(state,c.id))});
  }
  if(focusHeading && !modal.open) {
    const heading = app.querySelector('h1');
    heading?.setAttribute('tabindex', '-1');heading?.focus({preventScroll:true});
  } else if(focusAction&&!modal.open) {
    const same=Array.from(app.querySelectorAll('[data-action]')).find(b=>!b.disabled&&b.dataset.action===focusAction&&b.dataset.value===focusValue);
    const fallback=app.querySelector('.activity-complete [data-action="completion-next"], .hotspot:not(.found), .experiment-controls button:not(:disabled), [data-action="final-shock"], [data-action="final-finish"]');
    (same||fallback)?.focus({preventScroll:true});
  }
  if (!waiting && a) markNextTargets();
  updatePlaybackControls();scheduleExperiment();
  activityScreen?.playFeedback(feedbackEvent,state.reduced);feedbackEvent=undefined;
  if(timeSweep){timeSweep=false;sweepTime();}
}
// Choosing a policy lets time flow by itself: the photo wipes from before to after.
function sweepTime(){
  cancelAnimationFrame(sweepFrame);
  const input=app.querySelector('#time-range');if(!input||route!=='p08')return;
  const set=value=>{simulatedPlayback=true;try{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));}finally{simulatedPlayback=false;}};
  if(state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches){set(100);save();render();return;}
  const start=performance.now(),length=1600;
  const step=now=>{const t=Math.min(1,(now-start)/length);set(Math.round(100*(1-Math.cos(Math.PI*t))/2));if(route!=='p08')return;if(t<1)sweepFrame=requestAnimationFrame(step);else{save();render();}};
  sweepFrame=requestAnimationFrame(step);
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
  if(route!==next){failure=undefined;screenRequest?.abort();screenRequest=undefined;extraRequest?.abort();hintOpen=false;hintLevel=0;selectedSpecimen='';selectedRole='';strategyReflect=next==='p09'&&state.drafts.p09.ran;}
  goingBack=false;route=next;
  if(route!=='home'){state.last=route;save();}
  if(route==='map')mapChapter=nextChapter();
  if(route==='p10'){
    const d=state.drafts.p10;
    if(!d.initialized){d.strategies=[...state.drafts.p09.selected];d.initialized=true;save();}
    if(['ending','certificate'].includes(d.phase)&&(!state.completed.includes('p10')||!d.shock||!finalCheck(d).success)){d.phase='design';save();}
  }
  if(route==='p04'&&state.drafts.p04.ran&&state.drafts.p04.step<2&&!state.drafts.p04.restored)playback.running=true;
  render(true);window.scrollTo({top:0,left:0,behavior:'instant'});
}
function syncStageViewport(){
  const w=window.visualViewport?.width||innerWidth,h=window.visualViewport?.height||innerHeight;
  const activity=!!activityView&&!failure&&activities.some(a=>a.id===route);
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
  app.dataset.playing=String(playback.running);app.style.setProperty('--playback-ms',`${activityScreen?.playbackDelay(playback.speed) ?? 1800}ms`);
  const toggle=app.querySelector('[data-action="playback-toggle"]');
  if(toggle){toggle.setAttribute('aria-pressed',String(playback.running));toggle.innerHTML=`${icon(playback.running?'pause':'play')}<span>${playback.running?'직접 해보기':'자동재생'}</span>`;}
  const status=app.querySelector('.playback-status');if(status)status.textContent=playback.message;
}
function scheduleExperiment(){
  clearTimeout(experimentTimer);experimentTimer=undefined;
  // The role experiment always advances on its own; other activities move only in teacher auto-play.
  const p04=state.drafts.p04,autoExperiment=route==='p04'&&p04?.ran&&p04.step<2&&!p04.restored;
  if(!activityScreen||!(playback.running||autoExperiment)||document.hidden||modal.open||app.querySelector('.hint-bubble')||!app.querySelector('.activity-page'))return;
  const next=activityScreen.playbackStep(route,state.drafts[route],playback.cursor);
  if(next.kind==='pause'){stopPlayback(next.message,true);updatePlaybackControls();return;}
  playback.message=next.message;updatePlaybackControls();
  const expectedRoute=route,draft=state.drafts[route];
  experimentTimer=setTimeout(()=>{
    experimentTimer=undefined;
    if(!(playback.running||autoExperiment)||route!==expectedRoute||state.drafts[route]!==draft||document.hidden||modal.open||app.querySelector('.hint-bubble'))return;
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
  },activityScreen.playbackDelay(playback.speed));
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopPlayback('일시정지');updatePlaybackControls();}else{syncStageViewport();scheduleExperiment();}});
document.addEventListener('pointerdown',event=>{if(event.target.closest('.time-scene,#time-range'))cancelAnimationFrame(sweepFrame);if(playback.running&&
event.target.closest('button,[data-drag],.time-scene,input,summary')&&!event.target.closest('.playback-controls')){stopPlayback();updatePlaybackControls();}});
function markNextTargets(){
  if(!state.drafts[route])return;
  const guidance=activityView.currentGuidance();
  app.querySelectorAll('.next-target').forEach(element=>{
    element.classList.remove('next-target');
    element.removeAttribute('aria-describedby');
  });
  const cue=app.querySelector('.next-cue span');
  if(cue)cue.innerHTML=activityScreen.emphasizeConcept(guidance.text,activityScreen.learningNotes[route].terms);
  if(guidance.selector)app.querySelectorAll(guidance.selector).forEach(element=>{
    if(element.disabled)return;
    element.classList.add('next-target');
    element.setAttribute('aria-describedby','next-cue');
  });
}
function npcDialogueArt(character) {
  const ratio = '4/5';
  return `<span class="npc-art-frame" data-facing="${character}" aria-hidden="true" style="--npc-frame-ratio:${ratio};--npc-sprite:url('${new URL(`../assets/web/${character}-voice-v4.webp`,import.meta.url).href}')"></span>`;
}
function showLearningGuide() {
  const note=activityScreen.learningNotes[route],line=voiceLines.find(item=>item.id===`guide-${route}`);
  const complete=state.completed.includes(route);
  const text=value=>activityScreen.emphasizeConcept(value,note.terms);
  // Before completion the first step is Doto's own hint wording: show Doto as its speaker so the name, portrait and voice agree.
  const direction=complete?line:voiceByText(activityView.currentHint(0),'');
  const guide=direction?.speaker==='도토'?{art:'doto',name:'도토'}:{art:'moa',name:'모아'};
  openModal(`<div class="modal-heading"><h2>모아의 개념·탐험 안내</h2>${btn(icon('close'),'close','','icon-button','aria-label="안내 닫기"')}</div>
    <div class="npc-dialogue-grid">${npcDialogueArt(guide.art)}<section class="learning-directions npc-dialogue-copy"><h3>${guide.name} · 해 보는 순서</h3><p>${esc(complete?line.text:activityView.currentHint(0))}</p></section></div>
    ${complete?`<section class="learning-note"><h3>기억할 개념</h3><p class="learning-core">${text(note.core)}</p>
    ${note.image?`<figure class="learning-picture"><img src="./assets/learning-v2/${note.image}.webp" alt="죽은 나무에서 자라며 양분을 얻는 버섯과 나무 속의 가는 균사" width="1000" height="667"><figcaption>죽은 나무를 분해하는 버섯의 예 · 실 모양의 균사를 크게 나타낸 그림</figcaption></figure>`:''}
    <p>${text(note.clarify)}</p><details><summary>생각 나누기</summary><p>${text(note.question)}</p></details></section>`:`<section class="learning-note"><h3>다시 볼 단서</h3><p>${esc(activityView.currentHint(2))}</p><p>관찰을 기록하면 개념 영상과 설명을 다시 볼 수 있어.</p></section>`}
`);
  modal.classList.add('learning-guide-modal','npc-art-modal');
  // Each text block in this popup gets the voice that reads exactly that text.
  const voiced=[[modal.querySelector('.learning-directions'),direction],[modal.querySelector('.learning-note'),complete?voiceLines.find(item=>item.id===`note-${route}`):voiceByText(activityView.currentHint(2),'')]];
  const cleanups=voiced.filter(([host,item])=>host&&item).map(([host,item])=>mountNarrationControl(host,item.id,narration));
  modalVoiceCleanup=()=>cleanups.forEach(cleanup=>cleanup());
}
function showPractice() {
  if(route!=='p10'||!state.completed.includes('p10'))return;
  const d=state.drafts.p10;
  openModal(`<div class="modal-heading"><h2>생활 속 실천 약속</h2></div>
    <p class="practice-intro">내일 해 볼 일을 하나 골라. 고른 까닭을 친구나 가족에게 이야기해 보자.</p>
    <div class="choices practice-choices">${practiceActions.map(item=>choice(item.text,'practice-choice',item.id,d.practice===item.id)).join('')}</div>
    <p class="practice-reason" role="status">${practiceActions.find(item=>item.id===d.practice)?.reason||'내가 직접 해 볼 수 있는 약속을 골라 봐.'}</p>
    <p class="practice-caption">이곳에는 실천할 계획이 기록돼. 실제로 해 본 뒤 어떤 도움이 됐는지 이야기해 봐.</p>
    ${btn('엔딩으로 돌아가기','close','','button primary')}`);
  modal.classList.add('practice-modal');
  modal.addEventListener('close',()=>{render();app.querySelector('[data-action="practice-show"]')?.focus({preventScroll:true});},{once:true});
}
// Doto's hint is a speech bubble under the guide bar, not a popup: the scene stays in view.
function showHint(){
  const text=activityView.currentHint(hintLevel);
  const voiceId=`hint-${route}`;
  const guide=app.querySelector('.mission-guide');if(!guide)return;
  narration.stop();hintVoiceCleanup();hintVoiceCleanup=()=>{};
  stopPlayback('일시정지');updatePlaybackControls();clearTimeout(experimentTimer);experimentTimer=undefined;
  hintOpen=true;app.querySelector('[data-action="hint"]')?.setAttribute('aria-expanded','true');
  app.querySelector('.hint-bubble')?.remove();
  guide.insertAdjacentHTML('afterend',`<section class="hint-bubble companion-hint" id="companion-hint" role="region" aria-label="도토의 단계별 힌트"><img class="hint-bubble-doto" src="./assets/web/doto-cat-v4.webp" alt="">\
<div class="hint-bubble-copy"><div class="hint-heading"><h2>도토의 힌트 ${hintLevel+1}/3</h2></div><p>${activityScreen.emphasizeConcept(text,activityScreen.learningNotes[route].terms)}</p>\
<div class="hint-actions">${hintLevel<2?btn('한 걸음 더','hint-more','','button'):''}${btn('모아의 개념 안내','voice-guide','','button subtle')}${btn('직접 해 볼게!','hint-close','','button primary')}</div></div></section>`);
  const bubble=app.querySelector('.hint-bubble');
  const hintLine = voiceByText(text, `hint-${route}`);
  if (hintLine) hintVoiceCleanup = mountNarrationControl(bubble.querySelector('.hint-bubble-copy'), hintLine.id, narration);
  bubble.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
}
// Doto's map line is a speech bubble above the next-place button, not a popup: the map stays in view.
function closeMapBubble(focusTrigger=true){
  const bubble=app.querySelector('.map-doto-bubble'),trigger=app.querySelector('.map-companion');
  trigger?.setAttribute('aria-expanded','false');
  mapVoiceCleanup();mapVoiceCleanup=()=>{};
  if(!bubble)return false;
  narration.stop();bubble.remove();if(focusTrigger)trigger?.focus({preventScroll:true});
  return true;
}
function closeHint(focusTrigger=true){
  const bubble=app.querySelector('.hint-bubble');
  hintOpen=false;const trigger=app.querySelector('[data-action="hint"]');trigger?.setAttribute('aria-expanded','false');
  if(!bubble)return false;
  narration.stop();hintVoiceCleanup();hintVoiceCleanup=()=>{};bubble.remove();
  if(focusTrigger)trigger?.focus({preventScroll:true});
  scheduleExperiment();
  return true;
}
function openModal(html) {
  narration.stop(); modalVoiceCleanup(); modalVoiceCleanup = () => {};
  modalMediaCleanup(); modalMediaCleanup = () => {}; modal._conceptRecallCleanup?.();
  stopPlayback('일시정지');updatePlaybackControls();
  clearTimeout(experimentTimer);experimentTimer=undefined;
  closeMapBubble(false);const hadHint=closeHint(false);
  if(!modal.open)focusBeforeModal=hadHint?app.querySelector('[data-action="hint"]'):document.activeElement;
  modal.querySelector('video')?.pause();modal.classList.remove('story-modal','concept-modal','concept-full','concept-playing','concept-awake','concept-film-ok','hint-modal','learning-guide-modal','practice-modal','npc-art-modal');mediaPriority(false);
  modal.innerHTML=html;
  const title=modal.querySelector('h2');if(title){title.id='modal-title';modal.setAttribute('aria-labelledby','modal-title');}
  if(!modal.open)modal.showModal();
  modal.querySelector('button:not(:disabled)')?.focus();
}
function closeModal() { narration.stop(); modalVoiceCleanup(); modalVoiceCleanup = () => {}; hintOpen=false;app.querySelector('[data-action="hint"]')?.setAttribute('aria-expanded','false');
modal.querySelector('video')?.pause();mediaPriority(false);modal.close();focusBeforeModal?.focus?.();scheduleExperiment(); }
// Story films (2026-11-21): the opening story before the first trip to the map, and the closing story when the
// last mission is finished. The pictures carry burned-in captions and the music; Moa's and the villain's lines
// play through the voice player at their cues, so the voice switch still decides whether they speak.
const STORY={
  intro:{src:'./assets/concepts/story-intro.mp4',poster:'./assets/concepts/story-intro.jpg',title:'처음 이야기',cues:[0.8,8.2,15.8]},
  finale:{src:'./assets/concepts/story-finale.mp4',poster:'./assets/concepts/story-finale.jpg',title:'마무리 이야기',cues:[2.4,8.2,15.6,20.9]},
};
const STORY_KEY='life-web-map:story-seen';
const storySeen=kind=>{try{return JSON.parse(localStorage.getItem(STORY_KEY)||'{}')[kind]===true;}catch{return true;}};
function markStory(kind){if(studentState)return;try{const seen=JSON.parse(localStorage.getItem(STORY_KEY)||'{}');seen[kind]=true;localStorage.setItem(STORY_KEY,JSON.stringify(seen));}catch{/* no storage: the story simply shows again next time */}}
function showStory(kind,after=()=>{}){
  const s=STORY[kind];if(!s){after();return;}
  openModal(`<h2 class="sr-only">${s.title}</h2><video class="story-video" playsinline preload="auto" poster="${s.poster}" src="${s.src}" aria-label="${s.title} 영상. 자막이 영상 안에 있어."></video><div class="story-bar">${btn(`건너뛰기${icon('next')}`,'story-skip','','button story-skip')}</div>`);
  modal.classList.add('story-modal');mediaPriority(true);markStory(kind);
  const video=modal.querySelector('video');video.muted=!state.music&&!state.sfx;
  let said=-1;
  const cue=()=>{const i=s.cues.reduce((n,at,j)=>video.currentTime>=at?j:n,-1);if(i<0||i===said||video.paused)return;said=i;narration.play(`story-${kind}-${i+1}`);};
  video.addEventListener('timeupdate',cue);
  video.addEventListener('seeked',()=>{said=s.cues.reduce((n,at,j)=>video.currentTime>=at?j:n,-1)-1;});
  video.addEventListener('pause',()=>{if(!video.ended&&String(narration.state.id).startsWith('story-'))narration.stop();});
  for(const type of ['ended','error'])video.addEventListener(type,()=>{if(modal.open)closeModal();});
  // Reduced motion: the film waits for the play button instead of starting by itself.
  if(state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches)video.controls=true;
  else video.play().catch(()=>{video.controls=true;});
  modal.addEventListener('close',()=>{modal.classList.remove('story-modal');after();},{once:true});
}
function showConcept(id, next='') {
  const c=activityScreen?.concepts[id];if(!c)return;
  const reduceVideo=state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
  mediaPriority(true);
  const nextLabel=next?activities.find(a=>a.id===next)?.title:'탐험 계속하기';
  // Full-screen film (2026-11-18): the captions are burned into the picture, so the controls sit on top
  // and only show while the film is paused, ended or touched; the bottom caption zone stays clear while it plays.
  openModal(`<div class="concept-top"><div class="modal-heading"><div><div class="eyebrow">${state.completed.includes(id)?'발견을 기록했어!':'개념 한눈에'} · ${c.duration}초</div><h2>${c.title}</h2></div>${btn(icon('close'),'close',
  '','icon-button','aria-label="개념 영상 닫기"')}</div></div><video class="concept-video" controls playsinline preload="metadata" ${reduceVideo?'':'autoplay'} poster="./assets/concepts/${id}.jpg" aria-label="${c.title} 개념 영상">\
<track kind="captions" srclang="ko" label="한국어" src="./assets/concepts/${id}.vtt">이 브라우저에서는 아래 개념 글을 읽어 줘.</video><div class="concept-dock"><div class="media-status" role="status"></div>\
<details class="concept-transcript"><summary>개념 글로 읽기</summary><ol>${c.lines.map(t=>`<li>${t}</li>`).join('')}</ol></details><div class="concept-footer"><span>영상은 다시 볼 수 있어.</span>${btn(`${nextLabel}${icon('next')}`,
  next?'completion-next':'close',next,'button primary')}</div></div>`);
  modal.classList.add('concept-modal','concept-full');mediaPriority(true);
  // The film's own sound follows the effects switch; Moa's caption voices follow the voice switch.
  const video=modal.querySelector('video');video.muted=!state.sfx;
  // While a caption voice plays, the film's sound drops to 30 % (0.2 s glide) and comes back after it.
  let filmLevel=1,filmFade=0;
  const glideFilm=to=>{if(to===filmLevel)return;filmLevel=to;cancelAnimationFrame(filmFade);const from=video.volume,t0=performance.now();const step=t=>{const k=Math.min(1,Math.max(0,(t-t0)/200));
  video.volume=from+(to-from)*k;if(k<1)filmFade=requestAnimationFrame(step);};filmFade=requestAnimationFrame(step);};
  const unduckFilm=narration.subscribe(s=>glideFilm(s.status==='playing'&&String(s.id).startsWith('concept-')?.3:1));
  activityScreen.mountConceptRecall(modal,video,id,c,reduceVideo);
  modal.querySelector('.concept-top').append(...modal.querySelectorAll(':scope>.science-focus-rail'));
  modal.querySelector('.concept-dock').prepend(...modal.querySelectorAll(':scope>.concept-caption'));
  // The DOM caption stays for screen readers but is hidden on screen once the film (with its own captions) plays.
  let awakeTimer;const ui=new AbortController();
  const playing=()=>modal.classList.toggle('concept-playing',!video.paused&&!video.ended);
  const wake=()=>{modal.classList.add('concept-awake');clearTimeout(awakeTimer);awakeTimer=setTimeout(()=>modal.classList.remove('concept-awake'),2500);};
  video.addEventListener('playing',()=>{modal.classList.add('concept-film-ok');playing();});
  for(const type of ['play','pause','ended'])video.addEventListener(type,playing);
  for(const type of ['pointermove','pointerdown','keydown'])modal.addEventListener(type,wake,{signal:ui.signal});
  // Moa reads each caption line as its cue starts (voice files are shorter than the 5-second cues).
  let voicedCue=-1;
  const cueVoice=()=>{if(video.paused&&!video.ended)return;const cue=c.cues.reduce((n,at,i)=>video.currentTime>=at?i:n,0);if(cue===voicedCue)return;voicedCue=cue;const item=voiceLines.find(line=>line.id===`concept-${id}-${cue+1}`);if(item)narration.play(item.id);};
  video.addEventListener('timeupdate',cueVoice);
  video.addEventListener('play',()=>{voicedCue=-1;cueVoice();});
  video.addEventListener('pause',()=>{if(!video.ended&&String(narration.state.id).startsWith('concept-'))narration.stop();});
  const controller = new AbortController();
  let mediaUrl = null, disposed = false;
  const isCurrent=()=>!disposed&&modal.open&&modal.querySelector('video')===video;
  modalMediaCleanup = () => {
    disposed = true;
    controller.abort();
    unduckFilm();cancelAnimationFrame(filmFade);
    ui.abort();clearTimeout(awakeTimer);modal.classList.remove('concept-full','concept-playing','concept-awake','concept-film-ok');
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
  };
  const mediaError=()=>{if(!isCurrent())return;modal.classList.remove('concept-film-ok','concept-playing');modal.querySelector('.media-status').textContent='영상을 불러오지 못했어. 아래 개념 글로 확인해 봐.';modal.querySelector('details').open=true;};
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
// Sound settings: background music (switch + size), effects (switch + size) and voices. The header button turns everything on or off.
// `muted` is kept in the record as "all off" for saves and builds from before the split.
function setSound(patch) {
  Object.assign(state, patch); state.muted = !state.music && !state.sfx && !state.voice;
  configureAudio(state); if (!state.voice) narration.stop();
  save();
}
function settings(focus = '') {
  const soundSwitch=(key,name)=>btn(state[key]?'켜짐':'꺼짐',`setting-${key}`,'','button',`role="switch" aria-label="${name}" aria-checked="${state[key]}" aria-pressed="${state[key]}"`);
  openModal(`<div data-science-settings><div class="modal-heading"><h2>설정</h2></div><div class="science-settings-body">
  <div class="science-settings-audio"><div class="setting-row"><div><h3>배경 음악</h3><p>꺼도 탐험은 다 할 수 있어.</p></div>${soundSwitch('music','배경 음악')}</div><div class="setting-row setting-volume"><div><h3>\
<label for="music-volume">배경 음악 크기</label></h3></div><output for="music-volume">${state.musicVolume}%</output>\
<input id="music-volume" type="range" min="0" max="100" step="5" value="${state.musicVolume}" ${state.music?'':'disabled'}></div><div class="setting-row"><div><h3>효과음</h3><p>버튼·전투·발소리.</p></div>${soundSwitch('sfx',
  '효과음')}</div><div class="setting-row setting-volume"><div><h3><label for="sfx-volume">효과음 크기</label></h3></div><output for="sfx-volume">${state.sfxVolume}%</output>\
<input id="sfx-volume" type="range" min="0" max="100" step="5" value="${state.sfxVolume}" ${state.sfx?'':'disabled'}></div><div class="setting-row"><div><h3>목소리</h3><p>꺼도 글과 자막은 보여.</p></div>${soundSwitch('voice',
  '목소리')}</div><div class="setting-row"><div><h3>움직임 줄이기</h3><p>지도·영상 움직임을 줄여.</p></div>${btn(state.reduced?'켜짐':'꺼짐','reduced','','button',
  `role="switch" aria-label="동작 줄이기" aria-checked="${state.reduced}" aria-pressed="${state.reduced}"`)}</div></div>
  <div class="science-settings-actions">${studentState?'':btn('초기화 전 기록 복구','restore-confirm','','button secondary')}${btn('모아의 탐험 안내','about','','button secondary')}${btn('안내 목소리 듣기','welcome-voice','','button secondary')}${btn('처음 이야기 영상','story','intro',
  'button secondary')}${state.completed.includes('p10')?btn('마무리 이야기 영상','story','finale','button secondary'):''}</div>
  <div class="science-settings-actions">${btn('생태 설계 미션','play-mission','','button secondary')}</div>
  <details><summary>앱 정보 · 배움과 보상</summary><p><b>탐험 목적</b> 숲의 이상 신호를 따라 생물과 환경, 먹이 관계를 조사해요.</p><p><b>미션 보상</b> 다섯 장소를 조사하고 모아의 생태 탐험 지도를 완성해요.</p><p><b>남는 배움</b> 한 생물이나 환경 조건이 바뀌면 다른 생물에도 어떤 일이 생기는지 증거로 설명해요.</p>\
<p>${state.completed.length}/10 활동 완료 · 증거 ${evidenceCount(state)}/5. ${saveError?esc(recordStore.message):'같은 기기와 브라우저에서 이어 할 수 있어요.'}</p><p>${CREDIT}</p></details>
  <details><summary>학생용 가이드</summary><p>장소를 골라 두 활동을 마치고, 관찰한 증거를 모아요. 마지막에 생태계를 설계하고 조건을 바꿔 다시 살펴봐요.</p><p>지도에서 먹이 관계를 어지럽히는 악당을 만나면 원형 버튼이나 스페이스바로 공격해요.</p></details>
  <details><summary>교사용 가이드</summary><p>게임에서 기록한 설명은 수업에서 학생과 함께 확인해 주세요. 실제 생태계가 회복되는 시간을 예측하는 실험은 아니에요.</p><div class="setting-block">\
<p>모든 장과 10개 활동을 한 번에 열어.<br>시연은 임시 공간에서 진행하며 학생 기록과 분리돼. 새로고침하면 학생 탐험으로 돌아와.</p>${btn(state.unlocked?`${icon('check')} 모든 활동이 열렸어`:`${icon('lock')} 모든 장·활동 한 번에 열기`,'unlock','','button secondary',
  state.unlocked?'disabled':'')}</div>${btn('활동 목표·성취기준 보기','about','','button secondary')}</details>
  <details><summary>이미지·소리·저작권 고지</summary>\
<p>배경·로고·캐릭터는 제공받은 생성형 AI 이미지이며, 모아와 도토의 안내는 ElevenLabs 유료 요금제로 만든 AI 생성 음성이에요. 화면 효과음은 코드로 만든 소리, 지도 악당과 성취 카드 효과음은 Freesound의 CC0 소리, 성취 카드 그림은 생성형 AI 이미지, 배경 음악은 Suno로 만든 곡이에요. 개념 영상 속 효과음은 Kenney Interface Sounds(CC0)예요.</p>${btn('자료 출처와 제작 정보',
  'about','','button secondary')}</details></div>
  <footer class="science-settings-footer">${studentState?'':btn('탐험 기록 초기화','reset-confirm','','button danger')}${btn('닫기','close','','button primary')}</footer></div>`);
  // A switch that was just pressed keeps the keyboard focus after the window is redrawn.
  if(focus)modal.querySelector(`[data-action="${focus}"]`)?.focus();
}

function about({ curriculum }) { openModal(`<div class="modal-heading"><h2>모아의 탐험 안내</h2>${btn(icon('close'),'close','','icon-button','aria-label="안내 닫기"')}</div><div class="about-content">\
<p>네가 생태 탐험가가 되어 숲의 이상 신호를 조사해. 각 장소의 두 활동을 마치면 다음 장소가 열려.</p><ol><li>지도에서 장소를 골라 조사하기</li><li>관찰·실험·연결의 증거 모으기</li><li>새 생태계를 설계하고 고쳐 보기</li></ol><p class="about-voice"></p>\
<p>진행은 자동으로 저장돼. 이름이나 학번을 입력하지 않아도 돼. 전체 해금은 수업 시연용이며 완료 기록을 만들지 않아.</p><hr><details><summary>교사용 · 활동 목표와 관찰 근거</summary>\
<p>2022 개정 과학과 고시본과 성취기준 문구를 대조했어. 실제 학습 성취와 자유 설명은 수업에서 교사가 확인해 줘.</p>${activities.map(a=>`<section><h3>${a.id.toUpperCase()} · ${a.title}</h3><p>${curriculum[a.id].objective}</p>\
<p>${curriculum[a.id].standards.map(s=>`${s.code} ${s.text}`).join('<br>')}</p>\
<p>함께 나눌 질문 · ${esc(curriculum[a.id].discussion)}</p>${curriculum[a.id].extension?'<p>생산자·소비자·분해자 역할 실험은 먹이 관계를 이해하기 위한 확장 활동이야.</p>':''}</section>`).join('')}</details><h3>제작 정보</h3>\
<p>${CREDIT}<br>배경·로고·캐릭터: 프로젝트에 제공된 생성형 AI 이미지<br>지도·도토·개념 모션: 코드로 제작<br>모아·도토·악당 안내: ElevenLabs 유료 요금제로 만든 AI 생성 음성<br>화면 효과음: 코드로 제작<br>지도 악당 효과음: Freesound CC0 (출처는 assets/CREDITS.md)<br>배경 음악: \
Suno 생성 곡<br>개념 영상 속 효과음: <a href="https://kenney.nl/assets/interface-sounds" target="_blank" rel="noopener noreferrer">Kenney Interface Sounds · CC0</a>\
</p><p>교육 참고: 미국 국립공원관리청 NPS (nps.gov), Craters Ecosystem / Create Your Own Marine Food Web.</p><p>생태계 변화는 학습을 위한 단순 모형이야. 실제 회복 시간과 개체수를 예측하지 않아.</p>\
<p class="muted">에셋 권리는 각 권리자에게 있어. 화면 캡처와 제공 자료의 무단 복제·재배포·상업적 이용은 권리자의 허락이 필요해.</p></div>`); modalVoiceCleanup=mountNarrationControl(modal.querySelector('.about-voice'),'about',narration); }
// 인증서에 쓰는 완료 날짜 형식: 2026. 11. 22.
function dotDate(t=new Date()){return `${t.getFullYear()}. ${t.getMonth()+1}. ${t.getDate()}.`;}
function markComplete(id) {
  if(state.completed.includes(id))return;
  clearTimeout(toastTimer);notice.classList.remove('show');
  state.evidence[id]=JSON.parse(JSON.stringify(state.drafts[id]));
  state.completed.push(id);
  const index=activities.findIndex(a=>a.id===id);
  if(index%2===1&&!studentState)pendingRestoration.add(Math.floor(index/2));
  feedbackEvent={type:'complete',id};
  save();sound(true);
}
function autoRecord() {
  if(activityScreen?.readyToRecord(route,state.drafts[route]))markComplete(route);
}
function validateComplete(id) {
  const d=state.drafts[id];
  switch(id){
    case'p01':return d.found.length===4;
    case'p02':{if(specimens.some(s=>d.groups[s.id]!==s.type)){toast('상자에 놓은 카드를 다시 눌러. 각 카드의 특징을 두 상자의 기준과 비교해 봐.',true);return false;}if(d.transfer!=='nonliving'){toast('바닷물을 앞에서 나눈 카드와 비교해. 같은 기준으로 아래 두 보기에서 다시 골라 봐.',true);return false;}return true;}
    case'p03':{const wrong=roles.find(r=>d.roles[r.id]!==r.id);if(wrong){toast(`${wrong.target}의 흔적을 다시 읽어 봐. ${wrong.clue}`,true);return false;}return true;}
    case'p04':return d.restored&&d.step===2&&d.answer===roles.find(r=>r.id===d.removed)?.prediction;
    case'p05':return foodEdges.every(e=>d.edges.includes(e));
    case'p06':return activityScreen.readyToRecord(id,d);
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
  d.selected=activityScreen.nextConnection(d.edges,from,id,final?d.elements:undefined);
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
  if(e.target.closest('summary')&&playback.running){stopPlayback('일시정지');updatePlaybackControls();}
  if(interactions?.isSuppressed()){e.preventDefault();return;}
  const el=e.target.closest('[data-action]');if(!el||el.disabled)return;
  const action=el.dataset.action,value=el.dataset.value,d=state.drafts[route];
  configureAudio(state);
  if(action==='skip'){const main=document.querySelector('#main');main?.setAttribute('tabindex','-1');main?.focus();return;}
  if(action==='story-skip'){closeModal();return;}
  if(action==='story'){showStory(value);return;}
  // The opening story plays once, on the first trip from the title screen to the map.
  if(action==='go'&&value==='map'&&route==='home'&&!studentState&&!state.completed.length&&!storySeen('intro')){showStory('intro',()=>go('map'));return;}
  // Title 「시작하기」 takes the first trip; 「새로 시작」 (a record exists) asks first. The reset keeps one backup for
  // 「초기화 전 기록 복구」 in the settings, the same as 「탐험 기록 초기화」. The teacher preview never resets.
  if(action==='new-start'||action==='new-start-reset'){
    if(action==='new-start'&&hasRecord()&&!studentState){openModal(`<div class="modal-heading"><h2>기존 탐험 기록을 지우고 새로 시작할까?</h2></div><p>지금 기록은 초기화 전 백업 한 개로 남아서 설정의 「초기화 전 기록 복구」로 되돌릴 수 있어. \
이전 백업은 이번 기록으로 바뀌어.</p><div class="button-row">${btn('기록 유지','close','','button primary')}${btn('기록 지우고 시작','new-start-reset','','button danger')}</div>`);return;}
    if(action==='new-start-reset'){if(studentState)return;const fresh=recordStore.reset();if(!fresh){toast(recordStore.message,true);return;}state=fresh;pendingRestoration.clear();saveError=false;closeModal();historyRoutes=[];}
    if(!studentState&&!state.completed.length&&!storySeen('intro')){showStory('intro',()=>go('map'));return;}
    go('map');return;
  }
  if(action==='go'){go(value);return;}
  if(action==='retry-map-assets'&&route==='map'){failure=undefined;render(true);return;}
  if(action==='retry-screen'){location.reload();return;}
  if(action==='continue-without-map'&&route==='map'){
    const target=mapTarget(nextChapter());if(target&&accessible(state,target.id))go(target.id);return;
  }
  if(action==='play-mission'){
    // From the settings window: close it first, and the mission returns focus to the settings button.
    const opener=modal.contains(el)?(closeModal(),app.querySelector('[data-action="settings"]')||el):el;
    stopPlayback('일시정지');updatePlaybackControls();narration.stop();
    openExtra(opener, () => Promise.all([loadScreen.mission(),loadStyle('./play-mission.css',document.querySelector('link[href$="npc-conversation.css"]'))]), ([module]) => module.openPlayMission());
    return;
  }
  if(action==='back'){
    if(route==='p10'&&state.drafts.p10.phase!=='report'){
      const phases={certificate:'ending',ending:'design',design:'report'};
      state.drafts.p10.phase=phases[state.drafts.p10.phase];save();render();window.scrollTo(0,0);return;
    }
    const previous=historyRoutes.pop();goingBack=true;go(previous||(route.startsWith('p')?'map':'home'));return;
  }
  if(action==='close'){closeModal();return;}
  if(action==='settings'){settings();return;}
  if(action==='about'){openExtra(el, () => import('./teaching-content.js'), about);return;}
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
  // Settings 「안내 목소리 듣기」: Moa's welcome (then the story line), the voice the title screen used to offer.
  if(action==='welcome-voice'){
    if(narration.state.status==='playing'&&['welcome','home-story'].includes(narration.state.id)){narration.stop();return;}
    narration.play('welcome');if(!state.voice)toast('목소리를 켜면 들을 수 있어요.');return;
  }
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
  if(action==='map-hint'){
    if(route!=='map')return;
    const next=chapters[nextChapter()].place;
    const text=chapters.every((_,i)=>chapterDone(state,i))
      ? '모든 조사를 마쳤어! 이제 우리가 찾은 생명의 연결을 보고하러 가자.'
      : `다음은 ${next}${(next.charCodeAt(next.length-1)-0xAC00)%28>0?'이야':'야'}. 오른쪽 아래 버튼을 누르면 길을 따라 함께 갈 수 있어!`;
    const page=app.querySelector('.map-screen'),trigger=app.querySelector('.map-companion'),open=app.querySelector('.map-doto-bubble');
    if(!page)return;
    if(open){closeMapBubble();return;}
    page.insertAdjacentHTML('beforeend',`<section class="hint-bubble map-doto-bubble" id="map-doto-bubble" role="region" aria-label="도토의 말"><img class="hint-bubble-doto" src="./assets/web/doto-cat-v4.webp" alt="">\
<div class="hint-bubble-copy"><div class="hint-heading"><h2>도토</h2>${btn(icon('close'),'map-hint-close','','icon-button','aria-label="도토의 말 닫기"')}</div><p>${text}</p></div></section>`);
    trigger?.setAttribute('aria-expanded','true');
    const mapLine=voiceByText(text,'map-');
    if(mapLine)mapVoiceCleanup=mountNarrationControl(app.querySelector('.map-doto-bubble .hint-bubble-copy'),mapLine.id,narration);
    app.querySelector('.map-doto-bubble button')?.focus({preventScroll:true});
    return;
  }
  if(action==='map-hint-close'){closeMapBubble();return;}
  if(action==='hint'||action==='hint-more'||action==='hint-close'){
    if(action==='hint-close'){closeHint();return;}
    if(action==='hint'&&hintOpen&&app.querySelector('.hint-bubble')){closeHint();return;}
    hintLevel=action==='hint-more'?Math.min(2,hintLevel+1):0;
    playSound('hint');showHint();return;
  }
  if(action==='report-details'){showReport();return;}
  if(action==='food-guide'){
    openModal(`<div class="modal-heading"><h2>먹이 수첩</h2>${btn(icon('close'),'close','','icon-button','aria-label="수첩 닫기"')}</div><div class="food-guide-list">${organisms.map(o=>`<p>${activityScreen.specimenArt(o.id,'inline-art')}<b>${o.name}</b> · ${o.hint}</p>`).join('')}</div>`);return;
  }
  if(action==='strategy-edit'){strategyReflect=false;render();return;}
  if(action==='design-tab'){designTab=value;render();return;}
  if(action==='mute'){const on=state.muted;setSound({music:on,sfx:on,voice:on});render();return;}
  if(action==='setting-music'||action==='setting-sfx'||action==='setting-voice'){const key=action.slice(8);setSound({[key]:!state[key]});render();settings(action);return;}
  if(action==='reduced'){state.reduced=!state.reduced;save();render();settings(action);return;}
  if(action==='unlock'){studentState=state;state=restoreState(JSON.parse(JSON.stringify(state)));state.unlocked=true;render();settings();toast('교사 시연을 시작했어. 학생 기록은 변경하지 않아.');return;}
  if(action==='preview-exit'){if(!studentState)return;state=studentState;studentState=null;clearTimeout(experimentTimer);closeModal();historyRoutes=[];go('map');return;}
  if(action==='reset-confirm'){openModal(`<div class="modal-heading"><h2>새 탐험을 시작할까?</h2></div><p>현재 원본을 초기화 전 백업 한 개로 남기고 새 탐험을 시작해. 이전 백업은 이번 기록으로 교체돼. 백업에 실패하면 초기화하지 않아.</p><div class="button-row">${btn('취소',
  'settings','','button primary')}${btn('기록 지우기','reset','','button danger')}</div>`);return;}
  if(action==='reset'){if(studentState)return;const fresh=recordStore.reset();if(!fresh){toast(recordStore.message,true);return;}state=fresh;pendingRestoration.clear();saveError=false;closeModal();historyRoutes=[];goingBack=true;go('home');return;}
  if(action==='restore-confirm'){if(studentState)return;openModal(`<h2>초기화 전 기록을 복구할까?</h2><p>현재 탐험 대신 마지막 초기화 전 백업을 불러와. 현재 작업이 필요하다면 취소해 줘.</p>${btn('취소','settings')}${btn('백업 복구','restore-backup')}`);return;}
  if(action==='restore-backup'){if(studentState)return;const restored=recordStore.restoreBackup();if(!restored){toast(recordStore.message,true);return;}state=restored;saveError=false;closeModal();historyRoutes=[];go('home');return;}
  if(action==='completion-next'){if(modal.open)closeModal();go(value);return;}
  if(action==='chapter'){
    const i=Number(value);if(!chapterTarget(i)){toast('앞 장소의 두 활동을 먼저 마쳐 줘.',true);return;}
    selectChapter(i);sound();if(mapView&&!mapView.travel(i,()=>showMapActivities(i)))toast('이곳까지 갈 길을 찾지 못했어.',true);return;
  }
  if(action==='map-enter'){
    const i=Number(value),target=mapTarget(i);if(!target||el.disabled)return;
    selectChapter(i);sound();
    if(mapView&&!mapView.travel(i,()=>{if(route==='map'&&accessible(state,target.id))go(target.id);},true))toast('이곳까지 갈 길을 찾지 못했어.',true);
    return;
  }
  if(action==='complete'){if(value===route&&validateComplete(value)){markComplete(value);render();}return;}
  if(action==='print'){window.print();return;}
  if(!d)return;
  switch(action){
    case'cause-pick':if(!placeCause(d,value,value.split(':')[0]))return;checkCause(d);break;
    case'specimen-pick':selectedSpecimen=selectedSpecimen===value?'':value;break;
    case'specimen-place':if(!selectedSpecimen){toast('옮길 카드를 고르면 분류를 바꿀 수 있어.');return;}d.groups[selectedSpecimen]=value;selectedSpecimen=activityScreen.nextUnplaced(specimens,d.groups);playSound('connect');break;
    case'role-pick':selectedRole=selectedRole===value?'':value;break;
    case'role-place':if(!selectedRole){toast('관찰 카드를 고르면 역할을 바꿀 수 있어.');return;}d.roles[selectedRole]=value;selectedRole=activityScreen.nextUnplaced(roles,d.roles);playSound('connect');break;
    case'observe':d.current=value;break;
    case'observe-answer':{const o=observations.find(o=>o.id===d.current);if(!o||d.found.includes(o.id))return;if(Number(value)===o.correct){d.found.push(o.id);toast(`관찰한 특징을 수첩에 담았어. ${d.found.length}/4 발견!`);playSound('discover');}else toast('눈으로 확인한 특징과 이어지는 설명을 다시 골라 봐.',true);break;}
    case'transfer':d.transfer=value;break;
    case'remove-role':if(d.removed===value)return;d.removed=value;d.ran=false;d.restored=false;d.step=0;d.answer='';d.prediction='';break;
    case'prediction':if(d.ran)return;d.prediction=value;d.ran=true;d.restored=false;d.step=0;d.answer='';playback.running=true;playback.cursor=0;playSound('experiment');break;
    case'experiment-skip':if(!d.ran||d.step>=2)return;d.step=2;break;
    case'experiment-restore':if(d.step===2&&!d.restored){d.restored=true;playback.message='';d.log.push(`${d.removed}:${d.prediction}`);d.log=d.log.slice(-30);}break;
    case'experiment-answer':{if(d.step<2)return;d.answer=value;const right=value===roles.find(r=>r.id===d.removed).prediction;
      if(!right){toast('막대가 어떻게 달라졌는지 다시 보고 골라 봐.',true);break;}
      // A correct explanation puts the role back, so the model returns to its first state.
      if(!d.restored){d.restored=true;playback.message='';d.log.push(`${d.removed}:${d.prediction}`);d.log=d.log.slice(-30);}break;}
    case'edge':connect(d,value);break;
    case'undo-edge':d.edges.pop();d.selected='';chainedSource='';break;
    case'compare-remove':if(d.removed===value)return;d.removed=value;if(value&&!d.tested.includes(value))d.tested.push(value);playSound('experiment');break;
    case'compare-answer':d.answer=value;if(value==='always')toast('먹이가 이어져도 물이나 서식처가 달라지면 영향을 받아. 남아 있는 경로에 주목해 봐.',true);break;
    case'time-policy':d.policy=value;d.position=0;recordTime(d);timeSweep=true;playSound('experiment');break;
    case'time-jump':d.position=Number(value);recordTime(d);break;
    case'time-answer':d.answer=value;if(value==='automatic')toast('다른 대책을 눌러 같은 장소의 변화 전과 후를 다시 비교해 봐.',true);break;
    case'strategy':if(toggleStrategy(d.selected,value)){d.ran=false;d.reason='';playSound('connect');}break;
    case'strategy-run':if(d.selected.length){d.ran=true;strategyReflect=true;const record=JSON.stringify(d.selected);if(d.history.at(-1)!==record)d.history.push(record);d.history=d.history.slice(-3);playSound('experiment');}break;
    case'strategy-reason':d.reason=value;break;
    case'final-start':d.phase='design';designTab='elements';
      // The food web was already built in P05; bring it in so the final mission focuses on new ideas.
      if(!d.edges.length&&activityScreen.importFoodWeb(state))toast('5단계에서 이은 먹이그물을 가져왔어! 이제 생물이 살아갈 조건을 더해 봐.');break;
    case'final-import':if(!activityScreen.importFoodWeb(state))return;toast('네 먹이그물을 가져왔어! 요소 카드를 눌러 모형에 필요한 조건을 살펴봐.');playSound('connect');break;
    case'element':if(d.elements.includes(value)){d.elements=d.elements.filter(v=>v!==value);d.edges=d.edges.filter(e=>!e.split('>').includes(value));if(d.selected===value)d.selected='';}else{d.elements.push(value);playSound('connect');}d.tested=false;break;
    case'final-edge':connect(d,value,true);break;
    case'final-undo':d.edges.pop();d.selected='';chainedSource='';d.tested=false;break;
    case'final-strategy':if(toggleStrategy(d.strategies,value)){d.tested=false;playSound('connect');}break;
    case'final-run':runFinal(d);break;
    case'final-shock':if(d.shock||!d.tested||!finalCheck(d).success)return;d.shock=true;d.tested=false;runFinal(d);break;
    case'final-finish':if(!d.tested||!d.shock||!finalCheck(d).success)return;if(!d.doneOn)d.doneOn=dotDate();markComplete('p10');d.phase='ending';autoRecord();save();render();showStory('finale');return;
    case'final-phase':if(['ending','certificate'].includes(value)&&(!d.tested||!d.shock||!finalCheck(d).success))return;d.phase=value;break;
    default:return;
  }
  autoRecord();save();render();
});
function recordTime(d) {
  const end=d.position<=5?'before':d.position>=95?'after':'';
  if(end&&!d.seen.includes(`${d.policy}:${end}`))d.seen.push(`${d.policy}:${end}`);
}
// Settings: the music and the effects follow their size sliders while they move.
modal.addEventListener('input',e=>{
  const key={'music-volume':'musicVolume','sfx-volume':'sfxVolume'}[e.target.id];if(!key)return;
  state[key]=Number(e.target.value);modal.querySelector(`output[for="${e.target.id}"]`).textContent=`${state[key]}%`;
  configureAudio(state);save();
});
document.addEventListener('input',e=>{
  if(e.target.id!=='time-range'||route!=='p08'||!activityScreen)return;
  if(!simulatedPlayback){stopPlayback();updatePlaybackControls();}
  const d=state.drafts.p08;d.position=Number(e.target.value);recordTime(d);save();
  document.querySelector('.changed-scene').style.clipPath=`inset(0 ${100-d.position}% 0 0)`;
  document.querySelector('.comparison-handle').style.setProperty('--handle-position',`${d.position}%`);
  document.querySelector('.time-observation span').textContent=`확인한 장면 ${d.seen.length}/4`;
  document.querySelectorAll('[data-action="time-jump"]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value==='0'?d.position<=5:d.position>=95)));
  const reflection=document.querySelector('.time-reflection');
  if(d.seen.length===4&&reflection&&!reflection.querySelector('.reflection')){
    reflection.innerHTML=activityScreen.timeReflection(d,{btn,choice,icon,tag,completedFooter:activityView.completedFooter});
    playSound('discover');
  }else if(d.seen.length<4&&reflection){const count=reflection.querySelector('.time-evidence-count b');if(count)count.textContent=`${d.seen.length}/4`;}
  markNextTargets();
});
const interactionHandlers = {app,
  applyDrop(kind,item,group){
    const d=state.drafts[route];if(!d)return;
    if(kind==='classify'&&route==='p02'&&specimens.some(s=>s.id===item)&&['living','nonliving'].includes(group)){d.groups[item]=group;selectedSpecimen='';}
    else if(kind==='role'&&route==='p03'&&roles.some(r=>r.id===item)&&roles.some(r=>r.id===group)){d.roles[item]=group;selectedRole='';}
    else if(kind==='element'&&route==='p10'&&finalElements.some(e=>e.id===item)){if(!d.elements.includes(item))d.elements.push(item);d.tested=false;}
    else if(kind==='cause'&&route==='p07'){if(!placeCause(d,item,group))return;checkCause(d);}
    else if(kind==='stamp'&&route==='p03'&&roles.some(r=>r.id===item)&&roles.some(r=>r.id===group)){d.roles[group]=item;selectedRole=activityScreen.nextUnplaced(roles,d.roles);}
    else if(kind==='coin'&&route==='p09'&&strategies.some(s=>s.id===group)&&!d.selected.includes(group)){if(!toggleStrategy(d.selected,group))return;d.ran=false;d.reason='';}
    else if(kind==='lens'&&route==='p01'&&observations.some(o=>o.id===group)){d.current=group;playSound('discover');autoRecord();save();render();return;}
    else if(kind==='pull'&&route==='p04'&&!d.ran&&roles.some(r=>r.id===item)){d.removed=item;d.restored=false;d.step=0;d.answer='';d.prediction='';}
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
};
function placeCause(d,item,group){
  const [key,n]=item.split(':');
  if(key!==group){toast('사람의 행동인지, 환경 변화인지, 생물의 영향인지 살펴봐.',true);return false;}
  d.picks[group]=Number(n);playSound('connect');return true;
}
modal.addEventListener('close',()=>{narration.stop();modalVoiceCleanup();modalVoiceCleanup=()=>{};modalMediaCleanup();modalMediaCleanup=()=>{};hintOpen=false;
app.querySelector('[data-action="hint"]')?.setAttribute('aria-expanded','false');modal.querySelector('video')?.pause();mediaPriority(false);scheduleExperiment();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.open&&app.querySelector('.hint-bubble')){e.preventDefault();if(!closeMapBubble())closeHint();}});
// B1(2026-11-22): 설정 창은 아래 「닫기」와 Esc로만 닫는다. 다른 창은 바깥을 눌러 닫는 방식 그대로.
modal.addEventListener('click',e=>{if(e.target===modal&&!modal.querySelector('[data-science-settings]')){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
window.addEventListener('hashchange',()=>{if(modal.open)closeModal();routeChanged();});
// Browsers allow music only after a gesture, so the main theme starts on the first tap or key.
for(const type of ['pointerdown','keydown'])document.addEventListener(type,startMusic,{once:true});
// Opening a link or reloading on the map or an activity still lets browser Back walk up inside the app
// (activity → map → title) instead of leaving. Seeded once per tab so reloads do not stack entries;
// from the title screen Back leaves as usual. A locked activity is replaced by the map in routeChanged.
function seedBackHistory(){
  let first=false;try{first=!sessionStorage.getItem('life-web-map:history');sessionStorage.setItem('life-web-map:history','1');}catch{/* no session storage: leave history alone */}
  const start=location.hash.slice(1),path=location.pathname+location.search;
  if(!first||!['map',...activities.map(a=>a.id)].includes(start))return;
  history.replaceState(null,'',path+'#home');
  if(start==='map'||accessible(state,start))history.pushState(null,'',path+'#map');
  if(start!=='map')history.pushState(null,'',path+'#'+start);
}
seedBackHistory();
routeChanged();
// Offline cache for classroom Wi-Fi drops; skipped on local dev unless ?sw is added (same as 11 sound).
if('serviceWorker' in navigator&&location.protocol!=='file:'&&(!['localhost','127.0.0.1','[::1]'].includes(location.hostname)||new URLSearchParams(location.search).has('sw'))){
  const register=()=>navigator.serviceWorker.register('/sw.js').catch(()=>{});
  if(document.readyState==='complete')register();else addEventListener('load',register,{once:true});
}
if(loadWarning)toast(loadWarning,true);
