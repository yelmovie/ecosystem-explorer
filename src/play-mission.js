import { title, intro, items, missions, note, evaluate, createMissionStore, validMissionLinks } from './play-mission-model.js';
import { specimenArt } from './visuals.js';

const escapeText = text => String(text).replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const linkNames = {'plant>insect':'식물 → 메뚜기', 'insect>frog':'메뚜기 → 개구리'};
const artIds = {plant:'plants', insect:'grasshopper', frog:'frog', fungus:'mushroom', water:'water', shade:'tree'};
const picture = item => item ? specimenArt(artIds[item.id]) : '<svg class="pm-empty" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

export function openPlayMission() {
  if (document.querySelector('dialog.play-mission')) return;
  // Access localStorage inside the store's guarded methods, including denied origins.
  const store = createMissionStore({
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value)
  });
  const state = store.state;
  let selected = items[0].id, result = null, linkFrom = null, undo = [];
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
    result = null;
    undo = [];
    linkFrom = null;
    store.save(state);
    render();
  }
  function render() {
    const focused = dialog.contains(document.activeElement) ? {...document.activeElement.dataset} : null;
    const scrollTop = dialog.scrollTop;
    const mission = missions[state.level], plan = state.plans[state.level], links = state.links[state.level];
    const selectedName = items.find(item => item.id === selected).name;
    dialog.innerHTML = `<div class="pm-shell">
      <header class="pm-head"><div><h2 id="pm-title">${title}</h2><p>${intro}</p></div><button data-close aria-label="탐구로 돌아가기">닫기</button></header>
      <nav class="pm-levels" aria-label="설계 미션">${missions.map((mission, level) => `<button data-level="${level}" aria-current="${level===state.level?'step':'false'}" class="${level===state.level?'active':''}" ${level>0&&!state.won.includes(level-1)?'disabled':''}>${state.won.includes(level)?'완료 · ':''}${level+1}. ${mission.name}</button>`).join('')}</nav>
      <p class="pm-goal">${mission.goal}</p>
      <div class="pm-content">
        <section class="pm-scene" aria-label="설계 공간">
          <p class="pm-mission-help">${selectedName} 도구를 골랐어. 놓을 곳을 눌러 봐. 놓인 곳도 바꿀 수 있어.</p>
          <div class="pm-grid ${result?'tested':''}">${plan.map((id, cell) => {
            const item = items.find(item => item.id === id);
            return `<button class="pm-cell ${item?'occupied':''} ${result?.ok?'active-life':''}" data-cell="${cell}" aria-label="${cell+1}번 공간 ${item?.name||'빈 공간'}">${picture(item)}<span>${item?.name||'여기에 놓기'}</span></button>`;
          }).join('')}</div>
          <div class="pm-links" aria-label="먹이 관계 연결"><span>먹이 → 먹는 생물</span>${['plant','insect','frog'].map(id => `<button data-link="${id}" aria-pressed="${linkFrom===id}" class="${linkFrom===id?'on':''}">${items.find(item=>item.id===id).name}</button>`).join('')}</div>
          <div class="pm-links pm-connections" aria-label="연결한 먹이 관계">${links.map(link => `<button data-remove-link="${link}" class="on" aria-label="${linkNames[link]} 연결 지우기">${linkNames[link]} ×</button>`).join('')}</div>
        </section>
        <aside class="pm-palette" aria-label="설계 도구">${items.map(item => `<button class="pm-tool" data-tool="${item.id}" aria-pressed="${selected===item.id}">${picture(item)}<span>${item.name}</span></button>`).join('')}</aside>
      </div>
      <div class="pm-feedback ${result?.ok?'good':''}" role="status" aria-live="polite">${result?escapeText(result.summary):'생물을 놓고 먹이 관계를 연결한 뒤 시험해 봐.'}${store.message?`<p class="pm-error">${escapeText(store.message)}</p>`:''}</div>
      <footer class="pm-actions">
        ${state.level===2?`<button data-clean aria-pressed="${state.care[2]}">${state.care[2]?'수거 계획 준비됨':'물가 쓰레기 수거 계획'}</button>`:''}
        <button class="primary" data-test>환경 변화 관찰</button>
        <button data-undo ${undo.length?'':'disabled'}>한 번 되돌리기</button>
        ${result?.ok&&state.level<2?'<button data-next>다음 미션 →</button>':''}
        ${result?.ok&&state.level===2?'<span class="pm-badge">설계 탐험 완료 · 다른 방법도 시험해 봐!</span>':''}
      </footer>
      <p class="pm-note">${note}</p>
    </div>`;

    dialog.querySelector('[data-close]').onclick = () => dialog.close();
    dialog.querySelectorAll('[data-tool]').forEach(button => button.onclick = () => {selected=button.dataset.tool; render();});
    dialog.querySelectorAll('[data-cell]').forEach(button => button.onclick = () => {
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
      if (!linkFrom || linkFrom===id) {linkFrom=linkFrom===id?null:id; render(); return;}
      const link = linkFrom+'>'+id;
      linkFrom = null;
      if (!Object.hasOwn(linkNames, link)) {result={summary:'먹이가 되는 생물에서 먹는 생물 쪽으로 이어 봐. 식물과 메뚜기, 메뚜기와 개구리의 관계를 관찰해 봐.'}; render(); return;}
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
      result = evaluate(plan, links, state.level, state.care[state.level]);
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
