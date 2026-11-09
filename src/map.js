import { chapters } from './data.js';
import { chapterDone } from './engine.js';

// The world is painted once into a 960×540 pixel buffer and scaled up with nearest-neighbour,
// so the map stays crisp pixel art while the camera zooms past the screen edges.
const W = 960, H = 540, PLAZA = { x: 470, y: 292 }, ZOOM = 1.45, SPEED = .12;
const BOUNDS = { x0: 46, x1: W - 46, y0: 58, y1: H - 34 };
const RIVER = [[548,-24],[528,58],[494,120],[482,178],[506,236],[562,276],[640,278],[720,262],[800,270],[880,300],[990,312]];
const POND = [166,372,58,30], POOLS = [[748,394,28,11],[672,392,17,7],[812,350,18,7]];
const LANDMARKS = [{ top: 58 }, { top: 60 }, { top: 60 }, { top: 62 }, { top: 66 }];
const spot = i => ({ x: Math.round(chapters[i].x * W / 100), y: Math.round(chapters[i].y * H / 100) });
const door = i => { const s = spot(i); return { x: s.x, y: s.y + 22 }; };
export const markerPosition = i => { const s = spot(i); return { left: s.x / W * 100, top: (s.y - LANDMARKS[i].top) / H * 100 }; };

let bg, riverPath, bridges = [], memory = { player: { ...PLAZA }, overview: false, pan: false };

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function smoothPath(points) {
  const p = new Path2D(); p.moveTo(...points[0]);
  for (let i = 1; i < points.length - 1; i++) p.quadraticCurveTo(...points[i], (points[i][0] + points[i + 1][0]) / 2, (points[i][1] + points[i + 1][1]) / 2);
  p.lineTo(...points.at(-1)); return p;
}
const inEllipse = ([cx, cy, rx, ry], x, y, pad = 0) => ((x - cx) / (rx + pad)) ** 2 + ((y - cy) / (ry + pad)) ** 2 <= 1;
const segDist = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy))); return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t); };

function onBridge(x, y) {
  return bridges.some(b => { const dx = x - b.x, dy = y - b.y, u = dx * Math.cos(b.a) + dy * Math.sin(b.a), v = -dx * Math.sin(b.a) + dy * Math.cos(b.a); return Math.abs(u) <= b.len / 2 && Math.abs(v) <= 9; });
}
function wet(ctx, x, y, width = 26) { ctx.lineWidth = width; return ctx.isPointInStroke(riverPath, x, y) || inEllipse(POND, x, y) || POOLS.some(p => inEllipse(p, x, y)); }
function walkable(ctx, x, y) {
  if (x < BOUNDS.x0 || x > BOUNDS.x1 || y < BOUNDS.y0 || y > BOUNDS.y1) return false;
  return onBridge(x, y) || !wet(ctx, x, y);
}

function paintWorld() {
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d'), rand = rng(1407);
  riverPath = smoothPath(RIVER);
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  const ellipse = (x, y, rx, ry, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); };
  const poly = (pts, c) => { ctx.fillStyle = c; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); };

  // Ground: chunky grass noise with darker shade toward the forest edge.
  const grass = ['#7db55e', '#84bb63', '#8ac168', '#78af59', '#80b860'];
  for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) {
    const edge = Math.min(x, W - x, y * 1.3, (H - y) * 1.5);
    rect(x, y, 4, 4, edge < 70 && rand() < .55 ? '#6ea653' : grass[Math.floor(rand() * grass.length)]);
  }
  for (let i = 0; i < 900; i++) { const x = rand() * W, y = rand() * H; rect(x, y, 1, 3, '#659c4c'); rect(x + 2, y + 1, 1, 2, '#659c4c'); }

  // Dirt roads from the central plaza to every landmark door.
  const doors = chapters.map((_, i) => door(i));
  ctx.lineCap = ctx.lineJoin = 'round';
  for (const [w, c] of [[22, '#b39863'], [17, '#d7bf88'], [6, '#e3d0a0']]) { ctx.lineWidth = w; ctx.strokeStyle = c; doors.forEach(d => { ctx.beginPath(); ctx.moveTo(PLAZA.x, PLAZA.y); ctx.lineTo(d.x, d.y); ctx.stroke(); }); }
  doors.forEach(d => { for (let t = .08; t < .95; t += .07) { const x = PLAZA.x + (d.x - PLAZA.x) * t + (rand() - .5) * 10, y = PLAZA.y + (d.y - PLAZA.y) * t + (rand() - .5) * 8; rect(x, y, 2, 2, '#b8a273'); } });

  // River with sandy banks, two-tone water and sparkles.
  for (const [w, c] of [[42, '#c9b27b'], [34, '#a99868'], [29, '#3a8db6'], [22, '#4fa6cd'], [9, '#77c3df']]) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.stroke(riverPath); }
  ctx.lineWidth = 22;
  for (let i = 0; i < 260; i++) { const x = 470 + rand() * 520, y = rand() * 340; if (ctx.isPointInStroke(riverPath, x, y)) rect(x, y, 3 + Math.floor(rand() * 4), 1, rand() < .5 ? '#d7f2f7' : '#a5dcec'); }
  // Pond and wetland pools.
  for (const [cx, cy, rx, ry] of [POND, ...POOLS]) { ellipse(cx, cy + 2, rx + 7, ry + 6, '#a99868'); ellipse(cx, cy, rx + 5, ry + 4, '#c9b27b'); ellipse(cx, cy, rx, ry, '#3f93ba'); ellipse(cx - rx * .15, cy - ry * .2, rx * .72, ry * .6, '#55aacf'); rect(cx - rx * .4, cy - 2, 9, 1, '#d7f2f7'); rect(cx + rx * .1, cy + 4, 6, 1, '#a5dcec'); }
  for (const [x, y] of [[140, 366], [182, 380], [158, 384], [200, 362], [740, 392], [760, 398]]) { ellipse(x, y, 5, 3, '#4f9a4e'); rect(x - 1, y - 3, 2, 3, '#3f93ba'); rect(x + 1, y - 1, 2, 2, '#f4a5c4'); }

  // Bridges wherever a road crosses the river.
  bridges = [];
  doors.forEach(d => {
    let first = -1, last = -1;
    for (let t = 0; t <= 1; t += .005) { const x = PLAZA.x + (d.x - PLAZA.x) * t, y = PLAZA.y + (d.y - PLAZA.y) * t; ctx.lineWidth = 32; if (ctx.isPointInStroke(riverPath, x, y)) { if (first < 0) first = t; last = t; } }
    if (first < 0) return;
    const a = Math.atan2(d.y - PLAZA.y, d.x - PLAZA.x), mid = (first + last) / 2, len = Math.hypot(d.x - PLAZA.x, d.y - PLAZA.y) * (last - first) + 22;
    bridges.push({ x: PLAZA.x + (d.x - PLAZA.x) * mid, y: PLAZA.y + (d.y - PLAZA.y) * mid, a, len });
  });
  for (const b of bridges) {
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
    rect(-b.len / 2, -10, b.len, 20, '#6e4a2c'); rect(-b.len / 2, -8, b.len, 16, '#b07c4b');
    for (let u = -b.len / 2 + 2; u < b.len / 2; u += 5) rect(u, -8, 1, 16, '#8a5e38');
    rect(-b.len / 2, -11, b.len, 2, '#5a3b22'); rect(-b.len / 2, 9, b.len, 2, '#5a3b22');
    for (const u of [-b.len / 2, -b.len / 6, b.len / 6, b.len / 2 - 3]) { rect(u, -13, 3, 4, '#4a301c'); rect(u, 9, 3, 4, '#4a301c'); }
    ctx.restore();
  }

  // Plaza with a stone ring and a notice board.
  ellipse(PLAZA.x, PLAZA.y + 2, 36, 22, '#a8987a'); ellipse(PLAZA.x, PLAZA.y, 34, 20, '#d2c4a0'); ellipse(PLAZA.x, PLAZA.y, 22, 12, '#c2b28c'); ellipse(PLAZA.x, PLAZA.y, 10, 5, '#d9ccab');
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; rect(PLAZA.x + Math.cos(a) * 28, PLAZA.y + Math.sin(a) * 16, 3, 2, '#b3a27e'); }

  // Garden beds beside the greenhouse, flowers in the meadow, reeds in the wetland.
  const g = spot(1);
  rect(g.x - 92, g.y - 34, 58, 64, '#5f8f46');
  for (let r = 0; r < 4; r++) { rect(g.x - 88, g.y - 30 + r * 15, 50, 9, '#8a5d3b'); rect(g.x - 88, g.y - 30 + r * 15, 50, 2, '#a5744c'); for (let k = 0; k < 7; k++) { rect(g.x - 85 + k * 7, g.y - 31 + r * 15, 3, 3, ['#5fb257', '#e9c94a', '#e0784f', '#5fb257'][r]); rect(g.x - 84 + k * 7, g.y - 33 + r * 15, 1, 2, '#3f7f3c'); } }
  for (let x = g.x - 94; x < g.x - 32; x += 6) { rect(x, g.y - 37, 2, 6, '#8c6a42'); rect(x, g.y + 31, 2, 6, '#8c6a42'); }
  rect(g.x - 94, g.y - 35, 62, 1, '#a88456'); rect(g.x - 94, g.y + 33, 62, 1, '#a88456');
  const flower = ['#f6e27a', '#f6a7bf', '#ffffff', '#c7a2e8', '#f19a5d'];
  const meadow = spot(2);
  for (let i = 0; i < 520; i++) { const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 105, x = meadow.x + Math.cos(a) * r * 1.35, y = meadow.y + 10 + Math.sin(a) * r * .75; ctx.lineWidth = 30; if (!ctx.isPointInStroke(riverPath, x, y)) { rect(x, y, 2, 2, flower[Math.floor(rand() * flower.length)]); rect(x, y + 2, 1, 2, '#4e8d45'); } }
  for (let i = 0; i < 420; i++) { const x = rand() * W, y = 60 + rand() * (H - 110); ctx.lineWidth = 34; if (!ctx.isPointInStroke(riverPath, x, y) && !inEllipse(POND, x, y, 8)) rect(x, y, 2, 2, flower[Math.floor(rand() * flower.length)]); }
  const reeds = (cx, cy, n, spread) => { for (let i = 0; i < n; i++) { const x = cx + (rand() - .5) * spread * 2, y = cy + (rand() - .5) * spread, h = 6 + rand() * 7; rect(x, y - h, 1, h, '#3f7a3a'); rect(x + 1, y - h + 2, 1, h - 2, '#5c9a4a'); if (rand() < .45) rect(x, y - h - 3, 2, 4, '#7a4f2c'); } };
  reeds(748, 380, 70, 50); reeds(812, 342, 30, 26); reeds(672, 384, 26, 22); reeds(120, 350, 34, 22); reeds(210, 392, 18, 12);

  // Rocks along the banks.
  for (let i = 0; i < 70; i++) { const t = rand() * (RIVER.length - 1), k = Math.floor(t), f = t - k, a = RIVER[k], b = RIVER[k + 1], side = rand() < .5 ? -1 : 1, x = a[0] + (b[0] - a[0]) * f + side * (19 + rand() * 6), y = a[1] + (b[1] - a[1]) * f + side * (8 + rand() * 6); if (y < 20 || y > H - 20 || wet(ctx, x, y, 34)) continue; ellipse(x, y + 1, 4, 2.5, '#6f7468'); ellipse(x, y, 4, 2.5, '#9aa094'); rect(x - 2, y - 2, 2, 1, '#c3c8bb'); }

  // Depth-sorted props: trees and landmark buildings.
  const props = [];
  const roads = doors.map(d => [PLAZA, d]);
  for (let gy = 0; gy < H + 10; gy += 12) for (let gx = 0; gx < W + 10; gx += 14) {
    const x = gx + (rand() - .5) * 9, y = gy + (rand() - .5) * 8, edge = Math.min(x, W - x, y * 1.4, (H - y) * 1.7);
    const p = edge < 52 ? .96 : edge < 92 ? .55 : .1;
    if (rand() > p) continue;
    const pt = { x, y };
    ctx.lineWidth = 50;
    if (roads.some(([a, b]) => segDist(pt, a, b) < 17) || ctx.isPointInStroke(riverPath, x, y) || inEllipse(POND, x, y, 16) || POOLS.some(q => inEllipse(q, x, y, 14))) continue;
    if (Math.hypot(x - PLAZA.x, y - PLAZA.y) < 60 || chapters.some((_, i) => { const s = spot(i); return Math.hypot(x - s.x, (y - s.y) * 1.3) < (i === 2 ? 110 : i === 1 ? 105 : 72); })) continue;
    props.push({ y, draw: () => tree(x, y, .8 + rand() * .55, rand() < .3) });
  }
  props.push({ y: meadow.y - 34, draw: () => tree(meadow.x - 52, meadow.y - 34, 1.7, false) });
  chapters.forEach((_, i) => props.push({ y: spot(i).y, draw: () => building(i) }));
  props.sort((a, b) => a.y - b.y).forEach(p => p.draw());

  function tree(x, y, s, pine) {
    ellipse(x + 2, y + 2, 9 * s, 4 * s, '#2f5a3355');
    rect(x - 2 * s, y - 7 * s, Math.max(2, 4 * s), 8 * s, '#6b4a2f');
    if (pine) {
      for (let k = 0; k < 3; k++) { const r = (11 - k * 2.6) * s, top = y - (8 + k * 7) * s; poly([[x, top - 13 * s], [x - r, top], [x + r, top]], ['#1f5a3e', '#2a6c48', '#3a8352'][k]); }
      rect(x - 3 * s, y - 24 * s, 2, 2, '#5fa465');
      return;
    }
    const cy = y - 15 * s;
    ellipse(x, cy + 1, 12.5 * s, 11.5 * s, '#1f5236'); ellipse(x, cy, 11.5 * s, 10.5 * s, '#2e7546');
    ellipse(x - 2.5 * s, cy - 2.5 * s, 8 * s, 7 * s, '#3e8d52'); ellipse(x - 4 * s, cy - 5 * s, 4 * s, 3.4 * s, '#5aa862');
    rect(x + 4 * s, cy + 2 * s, 2, 2, '#e2564a');
  }
  function house(x, y, w, h, roof, wall, roofH = 18) {
    ellipse(x + 3, y + 3, w * .62, 7, '#2f5a3350');
    rect(x - w / 2, y - h, w, h, '#4a3b2a'); rect(x - w / 2 + 1, y - h, w - 2, h - 1, wall); rect(x - w / 2 + 1, y - 4, w - 2, 3, '#00000018');
    poly([[x - w / 2 - 7, y - h + 3], [x + w / 2 + 7, y - h + 3], [x + w / 2 - 3, y - h - roofH], [x - w / 2 + 3, y - h - roofH]], '#3b3226');
    poly([[x - w / 2 - 5, y - h + 1], [x + w / 2 + 5, y - h + 1], [x + w / 2 - 4, y - h - roofH + 1], [x - w / 2 + 4, y - h - roofH + 1]], roof);
    for (let k = 4; k < roofH; k += 4) rect(x - w / 2 - 4 + k * .5, y - h - k + 1, w + 8 - k, 1, '#00000022');
    rect(x - w / 2 + 3, y - h - roofH + 2, w - 6, 2, '#ffffff33');
  }
  function doorway(x, y, c = '#5b4330') { rect(x - 5, y - 13, 10, 13, '#3b2a1c'); rect(x - 4, y - 12, 8, 12, c); rect(x + 2, y - 7, 1, 2, '#e8c66a'); }
  function win(x, y) { rect(x, y, 9, 8, '#3b2a1c'); rect(x + 1, y + 1, 7, 6, '#8fd0e0'); rect(x + 1, y + 1, 3, 2, '#d9f3f7'); rect(x + 4, y + 1, 1, 6, '#3b2a1c'); }
  function building(i) {
    const { x, y } = spot(i);
    if (i === 0) { // Observation hut with a dock reaching into the pond.
      for (let k = 0; k < 8; k++) rect(x - 38 - k * 4, y + 8 + k * 2, 6, 9, k % 2 ? '#a27548' : '#b78653');
      house(x, y, 50, 24, '#4c8fb1', '#f0e3c2'); doorway(x, y); win(x - 20, y - 18); win(x + 11, y - 18);
      rect(x + 22, y - 52, 2, 26, '#5b4a35'); rect(x + 24, y - 52, 12, 7, '#f5f0d0');
    } else if (i === 1) { // Greenhouse.
      house(x, y, 56, 26, '#d6f0f1', '#bfe3e6', 20);
      for (let k = -24; k <= 24; k += 8) rect(x + k, y - 26, 1, 26, '#ffffff'); rect(x - 28, y - 14, 56, 1, '#ffffff');
      for (let k = -22; k <= 22; k += 8) rect(x + k, y - 45, 1, 19, '#ffffffaa');
      doorway(x, y, '#7fb7a8');
      for (const k of [-34, 34]) { rect(x + k, y - 10, 2, 10, '#4c7d3c'); ellipse(x + k + 1, y - 13, 4, 4, '#f3c63f'); rect(x + k, y - 14, 2, 2, '#7a4f2c'); }
    } else if (i === 2) { // Meadow research tent with a signboard.
      ellipse(x + 3, y + 3, 30, 7, '#2f5a3350');
      poly([[x - 30, y], [x, y - 40], [x + 30, y]], '#9b6b2e'); poly([[x - 27, y - 1], [x, y - 37], [x + 27, y - 1]], '#eab64c');
      poly([[x, y - 37], [x + 27, y - 1], [x + 8, y - 1]], '#d89a35'); poly([[x - 7, y], [x, y - 18], [x + 7, y]], '#5b4330');
      rect(x, y - 47, 2, 10, '#5b4a35'); rect(x + 2, y - 47, 9, 5, '#4b9aab');
      rect(x + 34, y - 18, 2, 18, '#6b4a2f'); rect(x + 28, y - 26, 16, 10, '#8a6640'); rect(x + 30, y - 24, 12, 6, '#f0e3c2');
    } else if (i === 3) { // Bird hide on stilts with a boardwalk.
      for (let k = 0; k < 9; k++) rect(x + 18 + k * 6, y + 6 + k * 3, 7, 6, k % 2 ? '#94683e' : '#a87a4a');
      for (const k of [-20, -6, 8, 20]) rect(x + k, y - 6, 3, 9, '#4a3523');
      house(x, y - 6, 48, 22, '#9277ae', '#9c7a52'); rect(x - 16, y - 21, 32, 5, '#2d2a24'); rect(x - 15, y - 20, 30, 3, '#5d4a35');
      rect(x - 22, y - 4, 44, 3, '#6e5034');
    } else { // Restoration lab.
      house(x, y, 70, 30, '#d38a4b', '#f4ead2', 22); doorway(x, y, '#4b7f6a'); win(x - 30, y - 22); win(x - 16, y - 22); win(x + 8, y - 22); win(x + 22, y - 22);
      rect(x - 20, y - 50, 22, 9, '#2d4f7c'); for (let k = 0; k < 4; k++) rect(x - 19 + k * 5, y - 49, 1, 7, '#6d9ed4');
      rect(x + 40, y - 52, 2, 52, '#5b4a35'); rect(x + 42, y - 52, 14, 9, '#5d9d69');
      rect(x - 10, y - 30, 20, 6, '#ce9851'); rect(x - 8, y - 29, 16, 4, '#fff6dc');
    }
  }
  return canvas;
}

export function mountMap(root, state, { reduced = false, selected = 0, onArrive } = {}) {
  const viewport = root.querySelector('.map-viewport'), world = root.querySelector('.map-world'), canvas = root.querySelector('#map-canvas');
  bg ||= paintWorld();
  const ctx = canvas.getContext('2d'); canvas.width = W; canvas.height = H; ctx.imageSmoothingEnabled = false;
  let player = { ...memory.player }, pet = { x: player.x - 14, y: player.y + 6 }, route = [], hold = { x: 0, y: 0 }, keys = new Set();
  let scale = 1, cam = { x: 0, y: 0 }, follow = true, frame = 0, last = 0, disposed = false, arrived = null, drag = null, moving = false;
  let overview = memory.overview, pan = memory.pan, chosen = selected;
  const clampCam = c => ({ x: W*scale<=viewport.clientWidth?(viewport.clientWidth-W*scale)/2:Math.min(0, Math.max(viewport.clientWidth - W * scale, c.x)), y: H*scale<=viewport.clientHeight?(viewport.clientHeight-H*scale)/2:Math.min(0, Math.max(viewport.clientHeight - H * scale, c.y)) });
  const focusCam = p => clampCam({ x: viewport.clientWidth / 2 - p.x * scale, y: viewport.clientHeight / 2 - p.y * scale });
  function layout(snap = false) {
    const cover = Math.max(viewport.clientWidth / W, viewport.clientHeight / H);
    scale = overview ? Math.min(viewport.clientWidth / W, viewport.clientHeight / H) : cover * (viewport.clientWidth < 700 ? 1.35 : ZOOM);
    world.style.width = `${W * scale}px`; world.style.height = `${H * scale}px`;
    cam = overview ? focusCam({ x: W / 2, y: H / 2 }) : snap ? focusCam(player) : clampCam(cam);
    if (snap || overview) apply();
  }
  const apply = () => { world.style.transform = `translate3d(${Math.round(cam.x)}px,${Math.round(cam.y)}px,0)`; };
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

  function blockedLine(a, b) { const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 3); for (let k = 1; k <= n; k++) if (!walkable(ctx, a.x + (b.x - a.x) * k / n, a.y + (b.y - a.y) * k / n)) return true; return false; }
  function walkTo(p, landmark = null) {
    hold = { x: 0, y: 0 }; follow = true; arrived = landmark;
    const dest = { x: Math.max(BOUNDS.x0, Math.min(BOUNDS.x1, p.x)), y: Math.max(BOUNDS.y0, Math.min(BOUNDS.y1, p.y)) };
    route = !blockedLine(player, dest) || !walkable(ctx, dest.x, dest.y) || blockedLine(player, PLAZA) ? [dest] : [{ ...PLAZA }, dest];
    if (reduced) { player = { ...dest }; route = []; settle(); }
  }
  function settle() {
    memory.player = { ...player };
    if (arrived !== null) { const i = arrived; arrived = null; onArrive?.(i); return; }
    const near = chapters.findIndex((_, i) => Math.hypot(player.x - door(i).x, player.y - door(i).y) < 26);
    if (near >= 0 && near !== chosen) onArrive?.(near);
  }
  function step(dt) {
    let vx = hold.x, vy = hold.y;
    for (const k of keys) { const v = DIRS[k]; if (v) { vx += v[0]; vy += v[1]; } }
    const was = moving; moving = false;
    if (vx || vy) {
      route = []; arrived = null; follow = true;
      const len = Math.hypot(vx, vy), d = SPEED * dt, nx = player.x + vx / len * d, ny = player.y + vy / len * d;
      if (walkable(ctx, nx, ny)) player = { x: nx, y: ny }; else if (walkable(ctx, nx, player.y)) player.x = nx; else if (walkable(ctx, player.x, ny)) player.y = ny;
      moving = true;
    } else if (route.length) {
      const t = route[0], dx = t.x - player.x, dy = t.y - player.y, dist = Math.hypot(dx, dy), d = SPEED * 1.5 * dt;
      if (dist <= d) { player = { ...t }; route.shift(); }
      else { const nx = player.x + dx / dist * d, ny = player.y + dy / dist * d; if (walkable(ctx, nx, ny)) player = { x: nx, y: ny }; else route = []; }
      moving = true;
    }
    if (was && !moving) settle();
  }
  function draw(t) {
    ctx.drawImage(bg, 0, 0);
    // Selected destination glows like a spotlight on the door.
    const sel = door(chosen), pulse = reduced ? 0 : Math.sin(t / 380) * 2;
    ctx.fillStyle = '#fff6b855'; ctx.beginPath(); ctx.ellipse(sel.x, sel.y - 2, 24 + pulse, 11 + pulse / 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffe27a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(sel.x, sel.y - 2, 18 + pulse, 8 + pulse / 2, 0, 0, Math.PI * 2); ctx.stroke();
    chapters.forEach((_, i) => { if (chapterDone(state, i)) { const s = spot(i); rect(s.x - 30, s.y - 6, 5, 5, '#f3cd61'); rect(s.x - 29, s.y - 5, 3, 3, '#fff3b0'); } });
    if (state.completed.includes('p10')) for (const [x, y] of [[380, 250], [560, 330], [300, 300], [640, 230]]) { const on = reduced || Math.floor(t / 300 + x) % 2; if (on) { rect(x, y, 3, 3, '#fff4a1'); rect(x + 4, y - 4, 2, 2, '#f6d55a'); } }
    const petTarget = { x: player.x - 14, y: player.y + 5 };
    pet.x += (petTarget.x - pet.x) * (reduced ? 1 : .09); pet.y += (petTarget.y - pet.y) * (reduced ? 1 : .09);
    const bob = moving && !reduced ? Math.floor(t / 130) % 2 : 0, sb = Math.hypot(petTarget.x - pet.x, petTarget.y - pet.y) > 1 && !reduced ? Math.floor(t / 110) % 2 : 0;
    // Doto the squirrel trails the explorer.
    const sx = Math.round(pet.x), sy = Math.round(pet.y);
    rect(sx - 6, sy + 1, 12, 2, '#2f5a3360'); rect(sx - 10, sy - 11 + sb, 5, 11, '#b76d3e'); rect(sx - 11, sy - 13 + sb, 5, 6, '#c88b50');
    rect(sx - 5, sy - 8 + sb, 10, 9, '#c88b50'); rect(sx - 4, sy - 14 + sb, 9, 8, '#d69a5d'); rect(sx - 4, sy - 16 + sb, 3, 3, '#a86c41'); rect(sx + 2, sy - 16 + sb, 3, 3, '#a86c41');
    rect(sx - 2, sy - 9 + sb, 6, 4, '#ffe2ad'); rect(sx - 2, sy - 12 + sb, 1, 1, '#263f34'); rect(sx + 3, sy - 12 + sb, 1, 1, '#263f34'); rect(sx - 4, sy - 5 + sb, 9, 2, '#347b5f');
    // Human explorer: field hat, green jacket and backpack.
    const px = Math.round(player.x), py = Math.round(player.y);
    rect(px - 7, py + 1, 14, 3, '#2f5a3360'); rect(px - 4, py - 3, 3, 4 - bob, '#5b4636'); rect(px + 1, py - 3, 3, 3 + bob, '#5b4636');
    rect(px - 8, py - 12 + bob, 4, 8, '#a47b4b'); rect(px - 5, py - 12 + bob, 11, 10, '#3c7b69'); rect(px - 5, py - 6 + bob, 11, 1, '#2d5f51');
    rect(px - 5, py - 20 + bob, 11, 9, '#f0c89c'); rect(px - 3, py - 16 + bob, 2, 2, '#2e3c32'); rect(px + 2, py - 16 + bob, 2, 2, '#2e3c32'); rect(px - 1, py - 13 + bob, 3, 1, '#c9876a');
    rect(px - 8, py - 21 + bob, 17, 3, '#c9b76e'); rect(px - 4, py - 26 + bob, 9, 6, '#decc88'); rect(px - 4, py - 22 + bob, 9, 1, '#7a5a3a');
  }
  function tick(t) {
    if (disposed) return;
    const dt = Math.min((t - last) || 16, 50); last = t;
    step(dt);
    if (follow && !overview) { const goal = focusCam(player); cam = reduced ? goal : { x: cam.x + (goal.x - cam.x) * .14, y: cam.y + (goal.y - cam.y) * .14 }; apply(); }
    draw(t);
    frame = requestAnimationFrame(tick);
  }

  const DIRS = { ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0], ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1] };
  const typing = e => /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.querySelector('#modal')?.open;
  function keydown(e) { if (typing(e) || !DIRS[e.key]) return; e.preventDefault(); if(pan){follow=false;const v=DIRS[e.key];cam=clampCam({x:cam.x-v[0]*48,y:cam.y-v[1]*48});apply();return;} if (overview) setOverview(false); keys.add(e.key); }
  function keyup(e) { keys.delete(e.key); }
  function blur() { keys.clear(); hold = { x: 0, y: 0 }; }
  function toWorld(e) { const r = world.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; }
  function down(e) {
    if (e.button > 0 || e.target.closest('button')) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, cam: { ...cam }, moved: false };
    viewport.setPointerCapture(e.pointerId);
  }
  function move(e) {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 7) return;
    if (!drag.moved) { drag.moved = true; viewport.classList.add('dragging'); }
    follow = false; cam = clampCam({ x: drag.cam.x + dx, y: drag.cam.y + dy }); apply();
  }
  function up(e) {
    if (!drag || drag.id !== e.pointerId) return;
    viewport.classList.remove('dragging');
    if (!drag.moved && !pan && e.type === 'pointerup') { const p = toWorld(e); if (overview) setOverview(false); walkTo(p); }
    drag = null;
  }
  function setOverview(on) {
    overview = memory.overview = on; follow = !on;
    root.querySelector('[data-map-toggle="overview"]')?.setAttribute('aria-pressed', String(on));
    viewport.classList.toggle('overview', on); layout(!on);
  }
  function setPan(on) {
    pan = memory.pan = on; if(on){route=[];blur();follow=false;}
    root.querySelector('[data-map-toggle="pan"]')?.setAttribute('aria-pressed', String(on));
    viewport.classList.toggle('pan-mode', on);
  }
  function toggle(e) { const b = e.target.closest('[data-map-toggle]'); if (!b) return; b.dataset.mapToggle === 'overview' ? setOverview(!overview) : setPan(!pan); }
  // D-pad buttons walk while held; a keyboard click nudges one step.
  function padDown(e) { const b = e.target.closest('[data-map-dir]'); if (!b) return; e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch {} if (overview) setOverview(false); const v = DIRS[b.dataset.mapDir]; hold = { x: v[0], y: v[1] }; b.classList.add('active'); }
  function padUp(e) { const b = e.target.closest('[data-map-dir]'); if (!b) return; hold = { x: 0, y: 0 }; b.classList.remove('active'); }
  function padKey(e) { const b = e.target.closest('[data-map-dir]'); if (!b || e.detail) return; const v = DIRS[b.dataset.mapDir]; walkTo({ x: player.x + v[0] * 24, y: player.y + v[1] * 24 }); }
  const pad = root.querySelector('.map-dpad'), toolbar = root.querySelector('.map-tools');
  const resize = () => layout(true);
  viewport.addEventListener('pointerdown', down); viewport.addEventListener('pointermove', move); viewport.addEventListener('pointerup', up); viewport.addEventListener('pointercancel', up); viewport.addEventListener('lostpointercapture', up);
  pad?.addEventListener('pointerdown', padDown); pad?.addEventListener('pointerup', padUp); pad?.addEventListener('pointercancel', padUp); pad?.addEventListener('lostpointercapture', padUp); pad?.addEventListener('click', padKey);
  toolbar?.addEventListener('click', toggle);
  window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', blur); window.addEventListener('resize', resize);
  setPan(pan); setOverview(overview);
  frame = requestAnimationFrame(tick);
  return {
    select(i) { chosen = i; },
    moveTo(i) { chosen = i; if (overview) setOverview(false); walkTo(door(i), i); },
    travel(i, done) {
      chosen = i; if (overview) setOverview(false);
      let finished = false; const finish = () => { if (finished || disposed) return; finished = true; done(); };
      walkTo(door(i)); arrived = null;
      const started = performance.now(), check = () => { if (disposed || finished) return; if (!route.length || performance.now() - started > 1400) finish(); else requestAnimationFrame(check); };
      requestAnimationFrame(check);
    },
    dispose() {
      disposed = true; cancelAnimationFrame(frame); memory.player = { ...player };
      window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', blur); window.removeEventListener('resize', resize);
    },
  };
}
