// "모아의 탐사 노트" — shared scene parts for the ten concept films.
// A film is a list of timed parts; every part becomes a HyperFrames clip (wrapper, never
// transformed) with an inner element that GSAP moves. Text never moves while it is read.
export const W = 1920, H = 1080, FPS = 30;
export const SFX = { pop: ['pluck_001', 0.14], drop: ['drop_003', 0.19], swap: ['switch_002', 0.61], zoom: ['maximize_001', 0.29], found: ['confirmation_002', 0.58] };
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r = n => Math.round(n * 1000) / 1000;

export function createFilm(meta) {
  const f = { ...meta, parts: [], top: [], tweens: [], sounds: [], n: 0 }; // top = parts outside the punch-in
  const id = p => `${p}${++f.n}`;
  const end = meta.duration;
  let stop = null; // optional end time for the part being built (set by `until`)
  const clip = (cid, start, html, style, cls = '') => {
    f.parts.push(`<div id="${cid}" class="clip part ${cls}" data-start="${r(start)}" data-duration="${r((stop ?? end) - start)}" data-track-index="${f.parts.length + 2}" style="${style}">${html}</div>`);
  };
  const tw = s => f.tweens.push(s);
  const enter = (sel, t, how = 'pop') => {
    if (how === 'pop') tw(`tl.fromTo('${sel}',{opacity:0,scale:.82,y:18},{opacity:1,scale:1,y:0,duration:.5,ease:'back.out(1.6)'},${r(t)});`);
    else if (how === 'rise') tw(`tl.fromTo('${sel}',{opacity:0,y:28},{opacity:1,y:0,duration:.5,ease:'expo.out'},${r(t)});`);
    else tw(`tl.fromTo('${sel}',{opacity:0},{opacity:1,duration:.4,ease:'power1.out'},${r(t)});`);
  };
  const api = {
    film: f,
    /** Run builder calls whose parts end at time t (instead of the film end). */
    until(t, fn) { stop = t; try { return fn(); } finally { stop = null; } },
    sfx(name, t, volume = 0.7) { f.sounds.push({ name, t: r(t + 1 / FPS), volume }); },
    /** Illustration centred at (x,y), width w. Returns its inner selector for later moves. */
    art(src, x, y, w, t, { how = 'pop', z = 10, sound = 'drop', alt = '' } = {}) {
      const cid = id('art'), inner = `${cid}-i`;
      clip(cid, t, `<img id="${inner}" class="art" src="assets/img/${src}.webp" alt="${esc(alt)}">`, `left:${x - w / 2}px;top:${y - w / 2}px;width:${w}px;height:${w}px;z-index:${z}`);
      enter(`#${inner}`, t, how);
      if (sound) api.sfx(sound, t, 0.5);
      return `#${inner}`;
    },
    /** A photo plate (river scenes). */
    photo(src, x, y, w, t, { how = 'fade', z = 5, label = '' } = {}) {
      const cid = id('ph'), inner = `${cid}-i`, h = Math.round(w * 9 / 16);
      clip(cid, t, `<div id="${inner}" class="plate"><img src="assets/img/${src}.webp" alt="${esc(label)}"></div>`, `left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;z-index:${z}`);
      enter(`#${inner}`, t, how);
      return `#${inner}`;
    },
    /** Reveal a second photo over the first, left to right, like turning a page in the notebook. */
    wipe(src, x, y, w, t, { z = 6, label = '' } = {}) {
      const cid = id('wp'), inner = `${cid}-i`, h = Math.round(w * 9 / 16);
      clip(cid, t, `<div id="${inner}" class="plate"><img src="assets/img/${src}.webp" alt="${esc(label)}"></div>`, `left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;z-index:${z}`);
      tw(`tl.fromTo('#${inner}',{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:.9,ease:'power2.inOut'},${r(t)});`);
      api.sfx('swap', t, 0.45);
      return `#${inner}`;
    },
    /** Name tag on an object: leader line draws first, then the card. (x,y) = card centre, to = object point. */
    label(text, x, y, t, { to, accent = false, size = 40, z = 40, sound = 'pop' } = {}) {
      const cid = id('lb');
      let svg = '';
      if (to) {
        const [tx, ty] = to, minX = Math.min(x, tx) - 20, minY = Math.min(y, ty) - 20, w = Math.abs(x - tx) + 40, h = Math.abs(y - ty) + 40;
        const lid = id('ld');
        clip(lid, t, `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path id="${lid}-p" d="M${x - minX} ${y - minY}L${tx - minX} ${ty - minY}" stroke="${accent ? 'var(--amber)' : 'var(--ink)'}" stroke-width="4" stroke-linecap="butt" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><circle id="${lid}-c" cx="${tx - minX}" cy="${ty - minY}" r="8" fill="${accent ? 'var(--amber)' : 'var(--ink)'}" opacity="0"/></svg>`, `left:${minX}px;top:${minY}px;width:${w}px;height:${h}px;z-index:${z - 1}`);
        tw(`tl.fromTo('#${lid}-p',{attr:{'stroke-dashoffset':1}},{attr:{'stroke-dashoffset':0},duration:.22,ease:'power1.out'},${r(t)});`);
        tw(`tl.fromTo('#${lid}-c',{opacity:0},{opacity:1,duration:.12},${r(t + 0.18)});`);
      }
      clip(cid, t, `<div class="center"><div id="${cid}-i" class="tag${accent ? ' accent' : ''}" style="font-size:${size}px">${text}</div></div>`, `left:${x}px;top:${y}px;z-index:${z}`, 'anchor');
      tw(`tl.fromTo('#${cid}-i',{opacity:0,scale:.7},{opacity:1,scale:1,duration:.3,ease:'back.out(2)'},${r(t + (to ? 0.2 : 0))});`);
      if (sound) api.sfx(sound, t + (to ? 0.2 : 0), 0.55);
      return `#${cid}-i`;
    },
    /** Plain heading text above a group (no card). */
    heading(text, x, y, t, { size = 44, color = 'var(--ink)' } = {}) {
      const cid = id('hd');
      clip(cid, t, `<div class="center"><div id="${cid}-i" class="heading" style="font-size:${size}px;color:${color}">${text}</div></div>`, `left:${x}px;top:${y}px;z-index:30`, 'anchor');
      enter(`#${cid}-i`, t, 'rise');
      return `#${cid}-i`;
    },
    /** Arrow drawn from a to b (food arrows point from the eaten to the eater). */
    arrow(a, b, t, { color = 'var(--ink)', width = 7, dashed = false, z = 8, gap = 0, dur = .5, sound = 'drop' } = {}) {
      const cid = id('ar');
      const [ax, ay] = a, [bx, by] = b, len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len;
      const sx = ax + ux * gap, sy = ay + uy * gap, ex = bx - ux * gap, ey = by - uy * gap;
      const minX = Math.min(sx, ex) - 40, minY = Math.min(sy, ey) - 40, w = Math.abs(ex - sx) + 80, h = Math.abs(ey - sy) + 80;
      const hx = ex - minX, hy = ey - minY, bx2 = hx - ux * 30, by2 = hy - uy * 30, px = -uy * 16, py = ux * 16;
      clip(cid, t, `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path id="${cid}-p" d="M${sx - minX} ${sy - minY}L${bx2} ${by2}" stroke="${color}" stroke-width="${width}" stroke-linecap="butt" fill="none" pathLength="1" stroke-dasharray="${dashed ? '.04 .03' : '1'}" ${dashed ? '' : 'stroke-dashoffset="1"'}/><path id="${cid}-h" d="M${hx} ${hy}L${bx2 + px} ${by2 + py}L${bx2 - px} ${by2 - py}Z" fill="${color}" opacity="0"/></svg>`, `left:${minX}px;top:${minY}px;width:${w}px;height:${h}px;z-index:${z}`);
      if (dashed) tw(`tl.fromTo('#${cid}-p',{opacity:0},{opacity:1,duration:.3},${r(t)});`);
      else tw(`tl.fromTo('#${cid}-p',{attr:{'stroke-dashoffset':1}},{attr:{'stroke-dashoffset':0},duration:${dur},ease:'power2.inOut'},${r(t)});`);
      tw(`tl.fromTo('#${cid}-h',{opacity:0},{opacity:1,duration:.12},${r(t + (dashed ? 0 : dur - 0.08))});`);
      if (sound) api.sfx(sound, t + dur - 0.1, 0.45);
      return `#${cid}`;
    },
    /** Hand-drawn rounded frame around a region, drawn with one stroke. */
    frame(x, y, w, h, t, { color = 'var(--amber)', z = 4 } = {}) {
      const cid = id('fr');
      clip(cid, t, `<svg width="${w + 20}" height="${h + 20}" viewBox="0 0 ${w + 20} ${h + 20}"><rect id="${cid}-p" x="10" y="10" width="${w}" height="${h}" rx="40" stroke="${color}" stroke-width="7" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></svg>`, `left:${x - 10}px;top:${y - 10}px;width:${w + 20}px;height:${h + 20}px;z-index:${z}`);
      tw(`tl.fromTo('#${cid}-p',{attr:{'stroke-dashoffset':1}},{attr:{'stroke-dashoffset':0},duration:.9,ease:'power2.inOut'},${r(t)});`);
      return `#${cid}`;
    },
    /** "Removed" mark: the object fades to a ghost and a dashed ring with an X appears. */
    remove(sel, x, y, w, t, { word = '제거' } = {}) {
      tw(`tl.to('${sel}',{opacity:.18,scale:.92,duration:.4,ease:'power2.out'},${r(t)});`);
      const cid = id('rm');
      clip(cid, t, `<svg width="${w + 40}" height="${w + 40}" viewBox="0 0 ${w + 40} ${w + 40}"><circle cx="${(w + 40) / 2}" cy="${(w + 40) / 2}" r="${w / 2}" stroke="var(--ink)" stroke-width="5" stroke-dasharray="14 12" fill="none"/><path d="M${w * .35 + 20} ${w * .35 + 20}L${w * .65 + 20} ${w * .65 + 20}M${w * .65 + 20} ${w * .35 + 20}L${w * .35 + 20} ${w * .65 + 20}" stroke="var(--ink)" stroke-width="9" stroke-linecap="round"/></svg><b class="stamp">${esc(word)}</b>`, `left:${x - w / 2 - 20}px;top:${y - w / 2 - 20}px;width:${w + 40}px;height:${w + 40}px;z-index:20`);
      tw(`tl.fromTo('#${cid}',{opacity:0},{opacity:1,duration:.25},${r(t + 0.15)});`);
      api.sfx('swap', t, 0.4);
      return `#${cid}`;
    },
    /** Hide a removal mark again (restore). */
    restore(sel, markSel, t) {
      tw(`tl.to('${markSel}',{opacity:0,duration:.25},${r(t)});`);
      tw(`tl.to('${sel}',{opacity:1,scale:1,duration:.45,ease:'back.out(1.6)'},${r(t + 0.1)});`);
      api.sfx('found', t + 0.1, 0.4);
    },
    move(sel, vars, t, dur = .8) { tw(`tl.to('${sel}',{...${JSON.stringify(vars)},duration:${dur},ease:'power2.inOut'},${r(t)});`); },
    fade(sel, t, to = 0, dur = .35) { tw(`tl.to('${sel}',{opacity:${to},duration:${dur},ease:'power1.inOut'},${r(t)});`); },
    /** One punch-in per film: the notebook leans toward the part that changed. */
    punch(ox, oy, t, scale = 1.1, hold = 3.6) {
      tw(`tl.fromTo('#stage',{scale:1},{scale:${scale},transformOrigin:'${ox}px ${oy}px',duration:.8,ease:'power2.inOut'},${r(t)});`);
      tw(`tl.to('#stage',{scale:1,duration:.7,ease:'power2.inOut'},${r(t + hold)});`);
      api.sfx('zoom', t, 0.35);
    },
    /** Relative-stage chip (처음 / 제거 후 / 복원 후 …): a word, never a number. */
    phase(words, times) {
      words.forEach((w, i) => {
        const cid = id('ph');
        const start = times[i];
        f.top.push(`<div id="${cid}" class="clip part" data-start="${r(start)}" data-duration="${r((times[i + 1] ?? end) - start)}" data-track-index="${80 + i}" style="left:96px;top:222px;z-index:55"><div id="${cid}-i" class="phase">${esc(w)}</div></div>`);
        tw(`tl.fromTo('#${cid}-i',{opacity:0,y:-10},{opacity:1,y:0,duration:.3,ease:'power2.out'},${r(start)});`);
      });
    },
  };
  return api;
}

/** Page shell: notebook paper, header, question, Moa's three beats, the one-line conclusion. */
export function page(f, css) {
  const [c0, c1, c2] = f.cues, end = f.duration;
  const moa = (start, stop, idn) => `<div id="moa-${idn}" class="clip moa" data-start="${start}" data-duration="${r(stop - start)}" data-track-index="${90 + idn}"><img id="moa-${idn}-i" src="assets/img/moa-human.webp" alt="모아"></div>`;
  const moaT = [c0, c1 - 0.06, c2 + 0.34, end];
  const sounds = f.sounds.sort((a, b) => a.t - b.t).map((s, i) => `<audio id="sfx${i}" class="clip" src="assets/sfx/${SFX[s.name][0]}.mp3" data-start="${s.t}" data-duration="${SFX[s.name][1]}" data-track-index="${200 + i}" data-volume="${s.volume}"></audio>`);
  const conclusion = f.conclusion.replace(f.keyword, `<mark>${esc(f.keyword)}</mark>`);
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(f.title)} · 개념영상 ${f.id}</title>
    <script src="assets/gsap.min.js"></script>
    <style>
${css}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${end}" data-width="${W}" data-height="${H}" data-fps="${FPS}">
      <div id="paper" class="clip" data-start="0" data-duration="${end}" data-track-index="0"></div>
      <div id="head" class="clip" data-start="0" data-duration="${end}" data-track-index="1"><span id="head-i">모아의 탐사 노트 · 발견 ${f.id.slice(1)}</span></div>
      <div id="question" class="clip" data-start="0" data-duration="${end}" data-track-index="1"><h1 id="question-i">${esc(f.title)}</h1></div>
      <div id="stage">
      ${f.parts.join('\n      ')}
      </div>
      ${f.top.join('\n      ')}
      ${moa(moaT[0], moaT[1], 1)}
      ${moa(moaT[1], moaT[2], 2)}
      ${moa(moaT[2], moaT[3], 3)}
      <div id="end" class="clip" data-start="${r(c2 + 0.9)}" data-duration="${r(end - c2 - 0.9)}" data-track-index="99" data-layout-allow-caption-zone><p id="end-i">${conclusion}</p></div>
      ${sounds.join('\n      ')}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      tl.fromTo('#head-i',{opacity:0,y:-16},{opacity:1,y:0,duration:.45,ease:'expo.out'},0.05);
      tl.fromTo('#moa-1-i',{opacity:0,x:120},{opacity:1,x:0,duration:.6,ease:'power3.out'},0.15);
      tl.fromTo('#moa-2-i',{scaleY:.92},{scaleY:1,duration:.25,ease:'back.out(1.6)'},${r(moaT[1])});
      tl.fromTo('#moa-3-i',{scaleY:.9,y:10},{scaleY:1,y:0,duration:.3,ease:'back.out(1.8)'},${r(moaT[2])});
      tl.fromTo('#end-i',{opacity:0,y:30},{opacity:1,y:0,duration:.55,ease:'expo.out'},${r(c2 + 0.9)});
      ${f.tweens.join('\n      ')}
      tl.set({}, {}, ${end});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
}
