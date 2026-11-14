import { activities, chapters, observations, specimens, roles, organisms, foodEdges, strategies, practiceActions } from './data.js';
import { evidenceCount, recovery, reachable } from './engine.js';
import { experimentView, finalView, causeView, compareView, timeView, strategyView } from './experiences.js';
import { renderMetrics as metrics } from './metrics.js';
import { activityGuidance, activityHint, learningNotes } from './learning.js';
import { emphasizeConcept } from './concept-focus.js';
import { nextUnplaced, readyToRecord } from './progress.js';
import { specimenArt, riverArt } from './visuals.js';

export { mountConceptRecall } from './concept-recall.js';
export { emphasizeConcept } from './concept-focus.js';
export { timeReflection } from './experiences.js';
export { mountInteractions } from './interactions.js';
export { concepts, learningNotes } from './learning.js';
export { playbackStep, playbackDelay } from './playback.js';
export { readyToRecord, nextUnplaced, nextConnection, importFoodWeb } from './progress.js';
export { playFeedback } from './feedback.js';
export { specimenArt } from './visuals.js';

export function createActivityView(context) {
  const { btn, choice, icon, tag, moa, esc, missionEntry } = context;
  function teacherSkip(a) {
    const { state } = context;
    if(!state.unlocked)return '';
    const next=activities[activities.indexOf(a)+1];
    return btn(`${icon('next')}<span>${next?next.id.toUpperCase():'지도'}</span>`,'go',next?next.id:'map','teacher-skip',`aria-label="${next?`다음 스테이지 ${next.title}로 바로 가기`:'탐험 지도로 가기'}"`);
  }
  function guidanceContext() {
    const { state, route } = context;
    return {
      completed:state.completed.includes(route),selectedSpecimen:context.selectedSpecimen,selectedRole:context.selectedRole,strategyReflect:context.strategyReflect,designTab:context.designTab
    };
  }
  function currentGuidance() {
    const { state, route } = context;
    return activityGuidance(route,state.drafts[route],guidanceContext());
  }
  function currentHint(level) {
    const { state, route } = context;
    return activityHint(route,state.drafts[route],guidanceContext(),level);
  }
  function helper(a) {
    const cue=currentGuidance().text;
    return `<aside class="mission-guide"><div class="guide-avatar" aria-hidden="true">${moa()}</div><div class="next-cue" id="next-cue" aria-live="polite"><span>${emphasizeConcept(cue,learningNotes[a.id].terms)}</span></div><div class="guide-tools" style="display:flex;align-items:center">${btn('개념·안내','voice-guide','','button companion-button')}${btn('<img src="./assets/web/doto-cat-v4.webp" alt=""><span>힌트</span>','hint','','button companion-button',`aria-expanded="${context.hintOpen}" aria-controls="companion-hint" aria-label="도토의 힌트"`)}</div></aside>`;
  }
  function completedFooter(id, eligible, label='기록하기') {
    const { state } = context;
    if(!state.completed.includes(id))return eligible?`<div class="work-footer">${btn(label,'complete',id,'button secondary')}</div>`:'';
    const index=activities.findIndex(a=>a.id===id), next=index%2===1?null:activities[index+1];
    return `<div class="work-footer activity-complete"><div class="completion-copy" role="status"><b>${icon('check')} ${emphasizeConcept(learningNotes[id].success,learningNotes[id].terms)}</b></div><div class="completion-actions">${btn(`${icon('play')} 개념 보기`,'concept',id,'button subtle')}${btn(`${next?'다음 탐험':'지도에서 변화 보기'}${icon('next')}`,'completion-next',next?.id||'map','button primary',`aria-label="다음 탐험: ${next?.title||'탐험 지도'}"`)}${missionEntry()}</div></div>`;
  }
  function stageTransport(a){
    const { state } = context;
    const canPlay=['p01','p04','p06','p08','p09','p10'].includes(a.id)&&!(a.id==='p10'&&state.drafts.p10.phase!=='design');
    const controls=canPlay?`<div class="playback-controls">${btn(`${icon(context.playback.running?'pause':'play')}<span>${context.playback.running?'직접 해보기':'자동재생'}</span>`,'playback-toggle','','button playback-toggle',`aria-pressed="${context.playback.running}"`)}<div class="playback-speeds" role="group" aria-label="재생 속도">${[.5,1,2].map(speed=>btn(`${speed}배`,'playback-speed',speed,`button ${context.playback.speed===speed?'selected':''}`,`aria-pressed="${context.playback.speed===speed}"`)).join('')}</div><span class="playback-status" role="status">${context.playback.message}</span></div>`:'';
    return `<div class="stage-transport">${controls}${context.studentState?`<div class="stage-teacher"><span>교사 시연</span>${btn('학생 탐험으로','preview-exit','','button')}${teacherSkip(a)}</div>`:''}</div>`;
  }

  function renderObservation() {
    const { state } = context;
    const d=state.drafts.p01,o=observations.find(o=>o.id===d.current);
    return `<div class="observation-layout"><div class="scene observe-scene">${observations.map((o,i)=>btn(`<span class="observation-target">${specimenArt(o.id)}</span>${d.found.includes(o.id)?icon('check'):icon('search')}<b>${o.name}</b>`,'observe',o.id,`hotspot ${d.found.includes(o.id)?'found':''}`,`style="left:${o.x}%;top:${o.y}%" aria-label="${o.name} 관찰" aria-pressed="${d.current===o.id}"`)).join('')}</div><aside class="observation-note">${o?`<h3>${o.name}</h3><p>${o.text}</p>${o.choices.map((text,i)=>choice(text,'observe-answer',i,d.found.includes(o.id)&&i===o.correct,d.found.includes(o.id))).join('')}`:`<span class="note-illustration">${icon('search')}</span><h3>관찰 수첩</h3><p>자라고 살아가는 특징을 찾아봐.</p>`}</aside></div>${completedFooter('p01',d.found.length===4,'관찰 마치기')}`;
  }
  function renderClassify() {
    const { state } = context;
    const d=state.drafts.p02;
    if(!context.selectedSpecimen)context.selectedSpecimen=nextUnplaced(specimens,d.groups);
    const card=s=>btn(`<span>${specimenArt(s.id)}</span><b>${s.name}</b>`,'specimen-pick',s.id,`drag-card ${context.selectedSpecimen===s.id?'selected':''}`,`data-drag="classify" data-item="${s.id}" aria-pressed="${context.selectedSpecimen===s.id}" aria-label="${s.name} 카드 선택"`);
    return `<div class="specimen-tray" aria-label="분류할 카드">${specimens.filter(s=>!d.groups[s.id]).map(card).join('')||''}</div><div class="sort-zones">${[['living','생물','스스로 자라고 살아가.'],['nonliving','비생물','생물이 살아갈 환경이야.']].map(([id,name,desc])=>`<section class="sort-zone" data-drop="classify" data-group="${id}" aria-label="${name} 조사 상자">${btn(`<b>${name}</b><span>${desc}</span>`,'specimen-place',id,'zone-label',`aria-label="선택한 카드를 ${name} 상자에 놓기"`)}<div class="placed-cards">${specimens.filter(s=>d.groups[s.id]===id).map(card).join('')}</div></section>`).join('')}</div>${Object.keys(d.groups).length===6?`<div class="transfer"><div><p>바다의 <b>바닷물</b>도 같은 기준으로 나눠 볼까?</p></div>${choice('생물','transfer','living',d.transfer==='living')}${choice('비생물','transfer','nonliving',d.transfer==='nonliving')}</div>`:''}${completedFooter('p02',specimens.every(s=>d.groups[s.id])&&!!d.transfer,'분류 확인하기')}`;
  }
  function renderRoles() {
    const { state } = context;
    const d=state.drafts.p03;
    if(!context.selectedRole)context.selectedRole=nextUnplaced(roles,d.roles);
    const card=r=>btn(`<span>${specimenArt(r.id)}</span><div><b>${r.target}</b><small>${r.clue}</small></div>`,'role-pick',r.id,`role-token ${context.selectedRole===r.id?'selected':''}`,`data-drag="role" data-item="${r.id}" aria-pressed="${context.selectedRole===r.id}"`);
    return `<div class="role-tray">${roles.filter(r=>!d.roles[r.id]).map(card).join('')||''}</div><div class="role-zones">${roles.map(r=>`<section class="role-zone" data-drop="role" data-group="${r.id}">${btn(`<b>${r.name}</b><small>${{producer:'스스로 양분을 만들어.',consumer:'다른 생물을 먹어.',decomposer:'죽은 생물을 분해해.'}[r.id]}</small>`,'role-place',r.id,'zone-label',`aria-label="선택한 카드를 ${r.name}에 놓기"`)}${roles.filter(v=>d.roles[v.id]===r.id).map(card).join('')}</section>`).join('')}</div>${completedFooter('p03',roles.every(r=>d.roles[r.id]),'역할 확인하기')}`;
  }
  function renderExperiment(){return experimentView(context.state.drafts.p04,{btn,choice,icon,tag,metrics,completedFooter});}

  function webGraph(edges, { active = organisms.map(o=>o.id), selected = '', removed = '', action = 'edge', small = false, graphId = 'web' }={}) {
    const { state } = context;
    const pts=Object.fromEntries(organisms.map(o=>[o.id,o]));
    const reached=removed?reachable(edges,active,removed):new Set(active);
    return `<div class="food-web ${small?'small-web':''}"><svg viewBox="0 0 100 100" preserveAspectRatio="none" class="web-lines" aria-hidden="true"><defs><marker id="arrow-${graphId}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0 0 6 3 0 6Z" fill="#438d75"/></marker></defs>${edges.map(e=>{const[a,b]=e.split('>'),p=pts[a],q=pts[b];if(!p||!q||!active.includes(a)||!active.includes(b))return '';const off=a===removed||b===removed||!reached.has(a), dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy);return `<line x1="${p.x+dx/len*7}" y1="${p.y+dy/len*7}" x2="${q.x-dx/len*8}" y2="${q.y-dy/len*8}" class="${off?'broken':'flow-line'}" marker-end="url(#arrow-${graphId})"/>${!off&&!state.reduced&&!matchMedia('(prefers-reduced-motion: reduce)').matches?`<circle r="1" class="energy-dot"><animateMotion dur="2.8s" repeatCount="indefinite" path="M${p.x+dx/len*7},${p.y+dy/len*7} L${q.x-dx/len*8},${q.y-dy/len*8}"/></circle>`:''}`;}).join('')}</svg>${organisms.filter(o=>active.includes(o.id)).map(o=>action?btn(`<span>${specimenArt(o.id)}</span><b>${o.name}</b>`,action,o.id,`web-node ${selected===o.id?'selected':''} ${removed===o.id?'removed':''}`,`style="left:${o.x}%;top:${o.y}%" aria-pressed="${selected===o.id}" aria-label="${o.name} 연결"`):`<div class="web-node static ${removed===o.id?'removed':removed?(reached.has(o.id)?'reachable':'disconnected'):''}" style="left:${o.x}%;top:${o.y}%"><span>${specimenArt(o.id)}</span><b>${o.name}</b></div>`).join('')}</div>`;
  }
  function renderWeb() {
    const { state } = context;
    const d=state.drafts.p05;
    return `<div class="workspace-label"><b>연결 ${d.edges.length}/${foodEdges.length}</b>${btn(`${icon('book')} 먹이 수첩`,'food-guide','','button subtle')}</div><div class="web-layout"><section>${webGraph(d.edges,{selected:d.selected})}<div class="web-toolbar">${btn(`${icon('reset')} 마지막 선 지우기`,'undo-edge','','button',d.edges.length?'':'disabled')}</div></section></div>${completedFooter('p05',foodEdges.every(e=>d.edges.includes(e)),'먹이그물 기록하기')}`;
  }
  function renderCompare(){return compareView(context.state.drafts.p06,{btn,choice,icon,tag,webGraph,completedFooter});}

  function renderCauses(){return causeView(context.state.drafts.p07,{btn,icon,tag,completedFooter});}

  function renderTime(){return timeView(context.state.drafts.p08,{btn,choice,icon,tag,completedFooter});}

  function strategyCards(ids, action='strategy') {
    return `<div class="strategy-grid">${strategies.map(s=>btn(`<span class="strategy-art">${specimenArt(s.id)}</span><span class="strategy-content"><b>${s.name}</b><small>${s.desc}</small></span><span class="cost">${ids.includes(s.id)?icon('check'):'2'}<small>${ids.includes(s.id)?'선택':'포인트'}</small></span>`,action,s.id,`strategy-card ${ids.includes(s.id)?'selected':''}`,`aria-pressed="${ids.includes(s.id)}"`)).join('')}</div>`;
  }
  function renderStrategy(){return strategyView(context.state.drafts.p09,{btn,choice,icon,tag,metrics,strategyCards,completedFooter},context.strategyReflect);}

  function reportPage(){
    const { state } = context;
    const records=['p02','p04','p06','p08','p09'];
    return `<div class="report-grid">${chapters.map((c,i)=>`<article class="report-record ${state.completed.includes(records[i])?'':'missing'}"><span class="stamp">${icon(c.icon)}</span><div><h3>${c.evidence}</h3><p>${state.completed.includes(records[i])?c.summary:'아직 조사하지 않은 기록이야.'}</p></div></article>`).join('')}</div><div class="work-footer">${btn(`${icon('book')} 내 조사 기록`,'report-details','','button')}${btn(`설계 시작${icon('next')}`,'final-start','','button primary')}</div>`;
  }
  function finalDesign(){const { state } = context;return finalView(state.drafts.p10,{btn,choice,icon,tag,webGraph,savedWeb:state.completed.includes('p05')&&readyToRecord('p05',state.drafts.p05)},context.designTab);}

  function endingPage(certificate=false) {
    const { state } = context;
    const d=state.drafts.p10,vals=recovery(d.strategies),collected=evidenceCount(state);
    if(certificate) return `<div class="certificate"><div class="eyebrow">생태 탐험 인증서</div><div class="certificate-seal">${icon('leaf')}</div><h2>생명의 연결을 지킨<br>생태 탐험가</h2><p>생물과 환경의 관계를 관찰하고,<br>직접 설계한 생태계를 시험하고 완성했어.</p><div class="certificate-stats"><span><b>${collected}/5</b>수집한 증거</span><span><b>${d.trials.length}회</b>모형 시험</span><span><b>완료</b>변화 대응 시험</span></div><p class="certificate-strategies">모형의 보전 대책 · ${d.strategies.map(id=>strategies.find(s=>s.id===id)?.name).join(' · ')}</p>${d.practice?`<p class="certificate-practice">내 실천 약속 · ${esc(practiceActions.find(item=>item.id===d.practice)?.text||'')}</p>`:''}<div class="certificate-sign">생태 탐험가 모아 ${icon('check')}</div><small>생명의 그물 지도 · 생물과 환경</small></div><div class="work-footer no-print">${btn(`${icon('back')} 엔딩으로`,'final-phase','ending','button')}${btn('인증서 인쇄 / PDF 저장','print','','button primary')}${btn('탐험 지도로','go','map','button')}</div>`;
    return `<div class="ending-scene scene">${riverArt("protect")}<div class="ending-glow"></div><div class="ending-content"><span class="ending-badge">${icon('trophy')} 복원 미션 완료</span><h2>다시 이어진,<br>생명의 그물.</h2><p>네가 찾은 증거와 고친 설계가<br>생물들의 먹이 길을 이어 줬어.</p>${moa('ending-moa')}</div><span class="ending-animal one">${specimenArt("frog")}</span><span class="ending-animal two">${specimenArt("sparrow")}</span></div><div class="ending-report"><div><h3>우리의 작전이 만든 변화</h3><p>${d.strategies.includes('trees')?'숲을 되살릴 나무를 심었어. 물에 남은 오염은 계속 살펴보자.':d.strategies.includes('clean')?'물가에 쌓인 쓰레기를 줄였어. 훼손된 숲도 앞으로 돌봐 주자.':'오염 원인과 서식처를 돌봤어. 물과 숲의 남은 문제도 지켜보자.'}</p></div>${metrics(vals)}</div><div class="work-footer">${btn('지도에서 변화 보기','go','map','button')}${btn('설계 다시 살펴보기','final-phase','design','button')}${btn(`${icon('play')} 개념 보기`,'concept','p10','button subtle')}${btn(d.practice?'실천 약속 살펴보기':'생활 속 실천 약속','practice-show','','button')}${btn(`${icon('trophy')} 탐험 인증서 받기`,'final-phase','certificate','button primary')}</div>`;
  }
  function activityPage(a) {
    const { state } = context;
    const views=[renderObservation,renderClassify,renderRoles,renderExperiment,renderWeb,renderCompare,renderCauses,renderTime,renderStrategy,()=>{const phase=state.drafts.p10.phase;return phase==='report'?reportPage():phase==='design'?finalDesign():endingPage(phase==='certificate');}];
    return `<main id="main" class="page activity-page stage-page" data-phase="${a.id==='p10'?state.drafts.p10.phase:'activity'}"><div class="page-heading activity-heading"><div><div class="eyebrow">${a.chapter+1}장 · ${a.verb}</div><h1>${a.title}</h1></div></div><div class="mission-layout ${a.id==='p10'&&state.drafts.p10.phase==='design'?'final-workbench':''}">${helper(a)}<section class="work-area" data-stage="${a.id}" aria-label="${a.title}">${views[activities.indexOf(a)]()}</section></div>${stageTransport(a)}</main>`;
  }
  return { activityPage, currentGuidance, currentHint, completedFooter };
}
