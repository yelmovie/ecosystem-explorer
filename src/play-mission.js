import { title, items, missions, note, evaluate, createMissionStore, validMissionLinks } from './play-mission-model.js';
import { specimenArt } from './visuals.js';

const escapeText = text => String(text).replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const linkNames = {'plant>insect':'식물 → 메뚜기', 'insect>frog':'메뚜기 → 개구리'};
const artIds = {plant:'plants', insect:'grasshopper', frog:'frog', fungus:'mushroom', water:'water', shade:'tree'};
const picture = item => specimenArt(artIds[item.id]);
const goals = [
  '풀밭의 생물들은 어떻게 이어질까?',
  '비가 오지 않는 날에도 생물들이 살아갈 수 있을까?',
  '더운 날, 물가의 서식처를 어떻게 돌볼까?'
];
const linkItems = ['frog','plant','insect'].map(id => items.find(item => item.id === id));
const icons = {
  plus: '<path d="M12 5v14M5 12h14"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>', check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  undo: '<path d="M4 8h9a6 6 0 1 1 0 12M9 3 4 8l5 5"/>',
  eye: '<path d="M2 12s4-6.5 10-6.5 10 6.5 10 6.5-4 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>'
};
const icon = name => `<svg class="pm-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;

export function openPlayMission() {
  if (document.querySelector('dialog.play-mission')) return;
  // Access localStorage inside the store's guarded methods, including denied origins.
  const store = createMissionStore({
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value)
  });
  const state = store.state;
  let selected = null, placing = false, result = null, linkFrom = null, undo = [];
  const opener = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.className = 'play-mission play-mode-14';
  dialog.setAttribute('aria-labelledby', 'pm-title');
  document.body.append(dialog);

  function remember() {
    undo.push({plan:[...state.plans[state.level]], links:[...state.links[state.level]], care:state.care[state.level]});
    if (undo.length > 20) undo.shift();
  }
  function changed() {
    result = null;
    store.save(state);
    render();
  }
  function changeLevel(level) {
    state.level = level;
    selected = null;
    placing = false;
    result = null;
    undo = [];
    linkFrom = null;
    store.save(state);
    render();
    dialog.scrollTop = 0;
    dialog.querySelector('[aria-current="step"]').focus({preventScroll:true});
  }
  function render() {
    const focused = dialog.contains(document.activeElement) ? {...document.activeElement.dataset} : null;
    const scrollTop = dialog.scrollTop;
    const plan = state.plans[state.level], links = state.links[state.level];
    const hasPlaced = plan.some(Boolean);
    const canConnect = linkItems.filter(item => plan.includes(item.id)).length >= 2;
    const readyToTest = hasPlaced && links.length === linkItems.length - 1;
    const nextLevel = result?.ok && state.level < missions.length - 1;
    const cue = linkFrom ? '이어 줄 생물을 눌러 봐.' :
      placing ? '설계 판에서 놓을 칸을 눌러 봐.' :
      readyToTest ? '이제 네 설계를 시험해 봐.' :
      canConnect ? '아래에서 두 생물을 눌러 연결해 봐.' :
      hasPlaced ? '설계 판에 도구를 더 놓아 봐.' : '놓을 도구를 골라 봐.';
    dialog.innerHTML = `<div class="pm-shell">
      <header class="pm-head">
        <h2 id="pm-title">${title}</h2>
        <nav class="pm-levels" aria-label="설계 미션">${missions.map((step, level) => {
          const done = state.won.includes(level), locked = level > 0 && !state.won.includes(level - 1);
          return `<button data-level="${level}" aria-current="${level===state.level?'step':'false'}" \
aria-label="${level+1}단계 ${step.name}${done?', 완료':locked?', 잠김':''}" ${locked?'disabled':''}>${done?icon('check'):locked?icon('lock'):`<span aria-hidden="true">${level+1}</span>`}</button>`;
        }).join('')}</nav>
        <button class="pm-icon-button" data-close aria-label="탐구로 돌아가기">${icon('close')}</button>
      </header>
      <div class="pm-intro">
        <p class="pm-objective">${goals[state.level]}</p>
        <div class="pm-cue">
          <p class="pm-feedback ${result?.ok?'good':''}" role="status">${result?escapeText(result.summary):cue}</p>
          ${store.message?`<p class="pm-error" role="alert">${escapeText(store.message)}</p>`:''}
        </div>
      </div>
      <div class="pm-content">
        <aside class="pm-palette" aria-label="설계 도구">${items.map(item => `<button class="pm-tool" data-tool="${item.id}" aria-pressed="${selected===item.id}">${picture(item)}<span>${item.name}</span></button>`).join('')}</aside>
        <section class="pm-scene" aria-label="설계 공간">
          <div class="pm-grid ${placing?'placing':''}">${plan.map((id, cell) => {
            const item = items.find(item => item.id === id);
            return `<button class="pm-cell ${item?'occupied':''} ${result?.ok?'active-life':''}" data-cell="${cell}" aria-label="${cell+1}번 공간 ${item?.name||'빈 공간'}" ${selected?'':'aria-disabled="true" tabindex="-1"'}>${item?`${picture(item)}<span>${item.name}</span>`:icon('plus')}</button>`;
          }).join('')}</div>
          <div class="pm-links" role="group" aria-label="먹이 관계 연결">
            <span class="pm-link-direction">먹이 ${icon('arrow')} 먹는 생물</span>
            ${linkItems.map(item => `<button data-link="${item.id}" aria-pressed="${linkFrom===item.id}">${picture(item)}${item.name}</button>`).join('')}
          </div>
          <div class="pm-connections" role="group" aria-label="연결한 먹이 관계">${links.map(link => `<button data-remove-link="${link}" aria-label="${linkNames[link]} 연결 지우기">${linkNames[link]} ${icon('close')}</button>`).join('')}</div>
        </section>
      </div>
      <footer class="pm-actions">
        <button class="pm-icon-button" data-undo aria-label="한 번 되돌리기" title="한 번 되돌리기" ${undo.length?'':'disabled'}>${icon('undo')}</button>
        <details class="pm-model"><summary>모형 설명</summary><p>${note}</p></details>
        ${state.level===2?`<button data-clean aria-pressed="${state.care[2]}">${state.care[2]?'수거 계획 준비됨':'물가 쓰레기 수거 계획'}</button>`:''}
        <button data-test class="${readyToTest&&!result?.ok?'primary':''}">${icon('eye')} 환경 변화 관찰</button>
        ${nextLevel?`<button class="primary" data-next>다음 미션 ${icon('arrow')}</button>`:''}
      </footer>
    </div>`;

    dialog.querySelector('[data-close]').onclick = () => dialog.close();
    dialog.querySelectorAll('[data-tool]').forEach(button => button.onclick = () => {
      selected = button.dataset.tool;
      placing = true;
      linkFrom = null;
      if (!result?.ok) result = null;
      render();
    });
    dialog.querySelectorAll('[data-cell]').forEach(button => button.onclick = () => {
      if (!selected) return;
      placing = false;
      remember();
      plan[Number(button.dataset.cell)] = selected;
      state.links[state.level] = validMissionLinks(plan, links);
      if (!plan.includes(linkFrom)) linkFrom = null;
      changed();
    });
    dialog.querySelectorAll('[data-level]').forEach(button => button.onclick = () => changeLevel(Number(button.dataset.level)));
    dialog.querySelectorAll('[data-link]').forEach(button => button.onclick = () => {
      const id = button.dataset.link;
      if (!plan.includes(id)) {result={summary:'먼저 그 생물을 설계 공간에 놓아 봐.'}; render(); return;}
      if (!linkFrom || linkFrom===id) {linkFrom=linkFrom===id?null:id; result=null; render(); return;}
      const link = linkFrom+'>'+id;
      linkFrom = null;
      if (!Object.hasOwn(linkNames, link)) {result={summary:'이 방향으로는 연결되지 않았어. 두 생물의 먹이 관계를 다시 살펴봐.'}; render(); return;}
      if (!links.includes(link)) {remember(); links.push(link);}
      changed();
    });
    dialog.querySelectorAll('[data-remove-link]').forEach(button => button.onclick = () => {
      remember();
      state.links[state.level] = links.filter(link => link!==button.dataset.removeLink);
      changed();
    });
    dialog.querySelector('[data-undo]').onclick = () => {
      const old = undo.pop();
      if (!old) return;
      state.plans[state.level] = old.plan;
      state.links[state.level] = old.links;
      state.care[state.level] = old.care;
      linkFrom = null;
      changed();
    };
    const care = dialog.querySelector('[data-clean]');
    if (care) care.onclick = () => {remember(); state.care[2]=!state.care[2]; changed();};
    dialog.querySelector('[data-test]').onclick = () => {
      const assessment = evaluate(plan, links, state.level, state.care[state.level]);
      result = {
        ok: assessment.ok,
        summary: assessment.ok ? assessment.summary :
          '아직 서식처가 변화를 견디기 어려워. 놓은 도구와 먹이 관계를 다시 살펴봐.'
      };
      placing = false;
      linkFrom = null;
      if (result.ok) selected = null;
      if (result.ok && !state.won.includes(state.level)) state.won.push(state.level);
      store.save(state);
      render();
    };
    const next = dialog.querySelector('[data-next]');
    if (next) next.onclick = () => changeLevel(state.level+1);
    if (focused) {
      const same = [...dialog.querySelectorAll('button:not(:disabled)')].find(button =>
        Object.entries(focused).every(([key,value]) => button.dataset[key]===value));
      (same||dialog.querySelector('[data-test]'))?.focus({preventScroll:true});
    }
    dialog.scrollTop = scrollTop;
  }
  dialog.addEventListener('close', () => {dialog.remove(); opener?.focus?.();}, {once:true});
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) dialog.close();
  });
  render();
  dialog.showModal();
  dialog.querySelector('[data-close]').focus();
}
