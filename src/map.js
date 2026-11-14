import { createMapCamera, bindMapCameraPointer, mapLabelGuard } from './map-camera.js';
import { buildingReveal, paintRestoredBuildings } from './building-restoration.js';
import { mountMapEncounters } from './map-encounters.js';
import { encounterLook,encounterStage,loadEncounterActor,drawEncounterActor } from './map-encounter-theme.js';
import { chapterDone } from './engine.js';
import {bindDirectionPad,assistMapStep,mapKeyDirection,MAP_VECTORS} from './map-controls.js';
import { chapters } from './data.js';

import { W, H, PLAZA, door, markerPosition, routeOnPaths, walkable } from './map-path.js';
export { markerPosition };
const SPEED = .14;
let memory = { player: { ...PLAZA } };

export function mountMap(root, state, { assets, save, preview=false, tone, reduced = false, selected = 0, restoredSites = [], onArrive, onTravel } = {}) {
  const viewport = root.querySelector('.map-viewport'), world = root.querySelector('.map-world'), canvas = root.querySelector('#map-canvas');
  const moa = root.querySelector('.map-moa'), doto = root.querySelector('.map-doto'), hint = root.querySelector('.map-companion');
  const ctx = canvas.getContext('2d'); canvas.width = W; canvas.height = H;
  const background=world.querySelector('.map-landscape'), reveal=buildingReveal(reduced,restoredSites);
  const restoration=document.createElement('canvas');restoration.width=W;restoration.height=H;
  const art=restoration.getContext('2d'), complete=chapters.map((_,i)=>chapterDone(state,i));let lastRestoration=null;
  let player = { ...memory.player }, pet = { x: player.x - 22, y: player.y + 12 }, route = [], hold = { x: 0, y: 0 }, keys = new Set();
  const actorArt=(image,node)=>({image,ctx:node.getContext('2d'),frame:-1});
  const moaArt=actorArt(assets.moa,moa),dotoArt=actorArt(assets.doto,doto);
  let facing='down',petFacing='down',stride=0,petStride=0;
  const direction=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
  let frame = 0, last = 0, disposed = false, moving = false, chosen = selected, pending = null;
  function clearTravel(){const busy=pending?.guided;route=[];pending=null;if(busy)onTravel?.(false);}
  const camera=createMapCamera({width:W,height:H,baseZoom:1.08,focusY:.5,reduced:()=>reduced||matchMedia('(prefers-reduced-motion: reduce)').matches});
 const guardLabels=mapLabelGuard(viewport,'.map-marker','.topbar button,.map-controls button,.map-repair summary');
  let lastScale=0,lastTransform='';
  function syncTools(){
    const overview=camera.mode==='overview',hand=camera.mode==='hand';
    const fit=root.querySelector('[data-map-toggle="overview"]');
    fit?.setAttribute('aria-pressed',String(overview));fit?.setAttribute('aria-label',overview?'이전 지도 보기':'지도 전체 보기');
    if(fit)fit.title=fit.getAttribute('aria-label');
    root.querySelector('[data-map-toggle="pan"]')?.setAttribute('aria-pressed',String(hand));
    viewport.classList.toggle('overview',overview);viewport.classList.toggle('pan-mode',hand);
  }
  function apply(){
    if(lastScale!==camera.scale){guardLabels();lastScale=camera.scale;world.style.width=W*lastScale+'px';world.style.height=H*lastScale+'px';}
    const transform=`translate3d(${camera.x}px,${camera.y}px,0)`;
    if(transform!==lastTransform){world.style.transform=transform;lastTransform=transform;guardLabels();}
  }
  function follow(){clearPointer();if(camera.mode!=='follow'){camera.follow(player);apply();syncTools();}}
  function layout(){camera.resize(viewport.clientWidth,viewport.clientHeight,player);apply();guardLabels();}

  function walkTo(target, exact=false) {
    hold = { x: 0, y: 0 }; keys.clear(); follow();
    route=routeOnPaths(player,target,{exact});
    if (!route.length) { clearTravel(); return false; }
    if (reduced) { player = { ...route.at(-1) }; route = []; settle(); }
    return true;
  }
  function settle() {
    memory.player = { ...player };
    if(pending){
      const {index,done,guided}=pending, target=door(index);
      if(Math.hypot(player.x-target.x,player.y-target.y)>4){clearTravel();return;}
      pending=null;if(guided)onTravel?.(false);done();return;
    }
    const near = chapters.findIndex((_, i) => Math.hypot(player.x - door(i).x, player.y - door(i).y) < 26);
    if (near >= 0 && near !== chosen) onArrive?.(near);
  }
  function step(dt) {
    let vx = hold.x, vy = hold.y;
    for (const k of keys) { const v = MAP_VECTORS[k]; if (v) { vx += v.x; vy += v.y; } }
    const was = moving,previous=player; moving = false;
    if (vx || vy) {
      clearTravel();
      const len=Math.hypot(vx,vy),d=SPEED*dt,before=player;
      player=assistMapStep(player,{x:vx/len*d,y:vy/len*d},walkable);
      moving=Math.hypot(player.x-before.x,player.y-before.y)>.01;

    } else if (route.length) {
      const t = route[0], dx = t.x - player.x, dy = t.y - player.y, dist = Math.hypot(dx, dy), d = SPEED * 1.5 * dt;

      if (dist <= d) { player = { ...t }; route.shift(); }
      else { const nx = player.x + dx / dist * d, ny = player.y + dy / dist * d; if (walkable({x:nx,y:ny})) player = { x: nx, y: ny }; else clearTravel(); }
      moving = true;
    }
    const dx=player.x-previous.x,dy=player.y-previous.y,dist=Math.hypot(dx,dy);
    if(dist>.05){facing=direction(dx,dy);stride+=dist;}
    if (was && !moving) settle();
  }
  function draw(t) {
    ctx.clearRect(0,0,W,H);
    if(background.naturalWidth){
      const progress=reveal(t),key=restoredSites.map(id=>progress(id)).join('|');
      if(key!==lastRestoration){
        art.clearRect(0,0,W,H);paintRestoredBuildings(art,{width:W,height:H,completed:i=>complete[i],progress,restored:complete.every(Boolean)});
        lastRestoration=key;
      }
      ctx.drawImage(restoration,0,0);
    }
    const sel=door(chosen),pulse=reduced?0:Math.sin(t/380)*1.5;
    ctx.fillStyle='#fff1a544';ctx.beginPath();ctx.ellipse(sel.x,sel.y,15+pulse,7+pulse/2,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#ffdb74';ctx.lineWidth=1.4;ctx.stroke();
    const petTarget={x:player.x-22,y:player.y+12};
    const dx=petTarget.x-pet.x,dy=petTarget.y-pet.y,dist=Math.hypot(dx,dy);
    const speed=reduced?1:.12;
    if(dist>1){petFacing=direction(dx,dy);petStride+=dist*speed;}
    pet.x+=dx*speed;pet.y+=dy*speed;
    const reactions=encounters.update({hero:player,ally:pet,project:p=>({x:p.x*camera.scale+camera.x,y:p.y*camera.scale+camera.y}),scale:camera.scale*1.1,now:t});
    function place(node,art,point,dir,phase,walk,pose,poseArt){
      node.style.left=point.x/W*100+'%';node.style.top=point.y/H*100+'%';
      node.style.setProperty('--sprite-facing',dir==='left'?-1:1);
      node.dataset.facing=dir;
      node.style.zIndex=point.y<player.y?'2':'3';
      if(pose&&poseArt?.complete&&poseArt.naturalWidth){
        art.ctx.clearRect(0,0,64,72);art.ctx.imageSmoothingEnabled=false;
        node.style.setProperty('--sprite-facing',1);
        if(drawEncounterActor(art.ctx,poseArt,{x:32,y:69},60,pose)){art.frame=-1;return;}
      }
      const row=dir==='down'?1:dir==='up'?2:0;
      const col=walk&&!reduced?1+Math.floor(phase/5)%3:0,key=row*4+col;
      if(art.frame!==key&&art.image.complete&&art.image.naturalWidth){
        art.frame=key;node.dataset.frame=String(col);
        art.ctx.clearRect(0,0,64,72);art.ctx.imageSmoothingEnabled=false;
        art.ctx.drawImage(art.image,col*64,row*72,64,72,0,0,64,72);
      }
    }
    place(moa,moaArt,player,facing,stride,moving,reactions.hero,heroPose);
    place(doto,dotoArt,pet,petFacing,petStride,dist>1,reactions.ally,allyPose);
    const hx=pet.x*camera.scale+camera.x,hy=(pet.y-25)*camera.scale+camera.y;
    hint.style.left=pet.x/W*100+'%';hint.style.top=(pet.y-25)/H*100+'%';
    hint.hidden=hx<19||hx>viewport.clientWidth-19||hy<72||hy>viewport.clientHeight-12;
  }

  function tick(t) {
    if (disposed) return;
    const dt = Math.min((t - last) || 16, 50); last = t;
    if(blocked()){blur();moving=false;}else step(dt);
    if(disposed)return;
    if(!blocked()){camera.update(player,dt/1000);apply();}
    draw(t);
    frame = requestAnimationFrame(tick);
  }

  const events=new AbortController(),{signal}=events;
  const blocked=()=>disposed||document.hidden||!!document.querySelector('dialog[open]')||!!root.closest('[inert]')||!!root.querySelector('.map-repair[open]');
  const encounterStages=preview?[]:chapters.flatMap((c,i)=>{
    const p=door(i),dx=PLAZA.x-p.x,dy=PLAZA.y-p.y,d=Math.hypot(dx,dy)||1;
    return complete[i]?[encounterStage(i,i,c.place,{x:p.x+dx/d*27,y:p.y+dy/d*27})]:[];
  });
  const encounters=mountMapEncounters({requiredFoes:5,clearStage:()=>restoredSites.at(-1),host:viewport,stages:encounterStages,progress:state.mapHits,onSave:patch=>{state.mapHits={...state.mapHits,...patch};save?.();},blocked,reduced:()=>reduced,tone,reach:53,contact:13,...encounterLook});
  const heroPose=encounterStages.length?loadEncounterActor('hero'):null,allyPose=encounterStages.length?loadEncounterActor('ally'):null;
  const typing = e => !!e.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])');
  function keydown(e){const d=mapKeyDirection(e);if(blocked()||typing(e)||!d||e.ctrlKey||e.altKey||e.metaKey)return;e.preventDefault();clearTravel();follow();keys.add(d);}
  function keyup(e) {const d=mapKeyDirection(e);if(d)keys.delete(d);}
  function blur() {clearTravel();keys.clear();hold={x:0,y:0};}
  const afterGesture=()=>{apply();syncTools();};
  const clearPointer=bindMapCameraPointer(viewport,{camera,player:()=>player,blocked,control:el=>!!el.closest('.map-companion'),onStart:blur,onMove:afterGesture,signal,
    onTap(e){if(e.target.closest('button')||camera.mode==='hand')return;const r=viewport.getBoundingClientRect();const target=camera.world({x:e.clientX-r.left,y:e.clientY-r.top});clearTravel();walkTo(target);}
  });
  root.querySelector('.map-tools')?.addEventListener('click',e=>{
   const b=e.target.closest('[data-map-toggle]');if(!b||blocked())return;
   clearPointer();blur();if(b.dataset.mapToggle==='overview')camera.overview(player);else camera.hand(player);afterGesture();
  },{signal});
  const directionPad=bindDirectionPad(root,'[data-map-dir]',b=>mapKeyDirection({key:b.dataset.mapDir}),{signal,blocked,
   press:d=>{clearTravel();follow();hold={...MAP_VECTORS[d]};},release:()=>{hold={x:0,y:0};},
   tap:d=>{clearTravel();follow();const v=MAP_VECTORS[d];player=assistMapStep(player,{x:v.x*10,y:v.y*10},walkable);settle();}
  });
  const observer=new ResizeObserver(layout);observer.observe(viewport);
  window.addEventListener('keydown',keydown,{signal});window.addEventListener('keyup',keyup,{signal});window.addEventListener('blur',blur,{signal});
  layout();syncTools();
  frame = requestAnimationFrame(tick);
  return {
    select(i) { chosen = i; },
    travel(i, done, guided=false) {
      clearTravel();chosen=i;
      follow();
      pending={index:i,done,guided};if(guided)onTravel?.(true);
      return walkTo(door(i),true);
    },
    dispose() {
      disposed=true;encounters.destroy();events.abort();observer.disconnect();directionPad.destroy();cancelAnimationFrame(frame);memory.player={...player};
    },
  };
}
