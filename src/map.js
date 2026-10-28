import { chapters } from './data.js';
import { chapterDone } from './engine.js';
export function mountMap(canvas, state, reduced = false) {
  const ctx = canvas.getContext('2d');
  const W = 640, H = 360;
  canvas.width = W; canvas.height = H;
  ctx.imageSmoothingEnabled = false;
  let player = { x: 287, y: 273 }, target = { ...player }, pet={x:266,y:283}, frame = 0, last = 0, disposed = false;
  const poly = (points, color) => { ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath(); ctx.fill(); };
  const rect = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),w,h); };
  const iso = (x,y) => [320+(x-y)*29, 48+(x+y)*14];
  function tree(x,y,size=1) {
    rect(x-3,y-12,6,18,'#735641');
    for(let i=0;i<3;i++) { const r=(18-i*4)*size; poly([[x,y-57+i*15],[x-r,y-22+i*10],[x+r,y-22+i*10]], ['#276d51','#36815b','#4a9c64'][i]); }
    rect(x-8,y-42,5,5,'#6db57b');
  }
  function hut(x,y,color) {
    poly([[x-16,y-22],[x,y-13],[x,y+10],[x-16,y+1]],'#d1b980');
    poly([[x,y-13],[x+22,y-26],[x+22,y-3],[x,y+10]],'#f3dfae');
    poly([[x-23,y-24],[x-2,y-49],[x+30,y-29],[x+5,y-7]],color);
    rect(x+8,y-10,7,13,'#5a6550'); rect(x-11,y-12,5,6,'#568c8e');
  }
  function paint(t) {
    if(disposed) return;
    const dt = Math.min((t-last)||16,50); last=t;
    const dx=target.x-player.x,dy=target.y-player.y,dist=Math.hypot(dx,dy),moving=dist>1;
    if(moving) { const f = Math.min(1,dt*.13/dist); player.x+=dx*f;player.y+=dy*f; }
    const petTarget={x:player.x-20,y:player.y+10};
    if(reduced)pet={...petTarget};else {pet.x+=(petTarget.x-pet.x)*Math.min(1,dt*.008);pet.y+=(petTarget.y-pet.y)*Math.min(1,dt*.008);}
    const following=Math.hypot(petTarget.x-pet.x,petTarget.y-pet.y)>1;
    ctx.clearRect(0,0,W,H);
    // Stacked diamond tiles make the world a shallow isometric island.
    for(let sum=0;sum<19;sum++) for(let x=0;x<10;x++) {
      const y=sum-x;if(y<0||y>9)continue;
      const [px,py]=iso(x,y); const water=(x===5||x===6)&&y>1&&y<8;
      if(x===9||y===9){poly([[px-29,py],[px,py+14],[px,py+34],[px-29,py+20]],'#a98d68');poly([[px,py+14],[px+29,py],[px+29,py+20],[px,py+34]],'#c4a676');}
      const path=(y===5&&x<8)||(x===3&&y<6)||(y===2&&x>2)||(x===7&&y>2);
      poly([[px,py-14],[px+29,py],[px,py+14],[px-29,py]],water?'#73bcc0':path?'#d9c68b':(x+y)%3?'#8abb73':'#97c67e');
      if(water) {rect(px-10,py,12,2,'#b6e1dc');rect(px+8,py+5,8,2,'#91d5d0');}
      else if(!path&&(x*13+y*7)%4===0) {rect(px-8,py,2,4,'#e9e8aa');rect(px-10,py+2,6,2,'#f7e7ac');}
    }
    for(let j=0;j<7;j++) {poly([[293+j*5,174+j*2],[322+j*5,160+j*2],[327+j*5,163+j*2],[298+j*5,177+j*2]],'#b78c60');}
    for(const [x,y,s] of [[99,174,1],[138,143,1.1],[174,115,.9],[216,93,1],[276,69,.9],[353,99,1],[417,130,1.1],[493,167,1],[529,202,.9],[479,236,1],[418,271,.8],[365,297,.8],[245,283,1],[189,247,.9],[139,216,1]]) tree(x,y,s);
    chapters.forEach((c,i)=>{ const x=c.x*6.4,y=c.y*3.6; hut(x,y-5,i===4?'#d8995a':['#68988b','#c79d5c','#648fac','#a286b1'][i]);rect(x+26,y-36,2,32,'#6d6849');rect(x+28,y-36,14,9,chapterDone(state,i)?'#f3cd61':'#f5f0d0'); });
    if(state.completed.includes('p10')) for(const [x,y] of [[250,210],[405,235],[220,151],[347,263]]){rect(x,y,3,3,'#fff4a1');rect(x+4,y-4,2,2,'#f6d55a');}
    const px=Math.round(player.x),py=Math.round(player.y),bob=moving&&!reduced?Math.floor(t/140)%2:0;
    // Human explorer: field hat, skin, green jacket and a small backpack.
    rect(px-8,py+2,17,4,'#547551');rect(px-6,py-9+bob,13,13,'#3c7b69');rect(px-10,py-9+bob,5,11,'#a47b4b');rect(px-8,py-20+bob,17,14,'#f0c89c');rect(px-9,py-22+bob,18,6,'#654b35');rect(px-11,py-22+bob,23,5,'#c9b76e');rect(px-7,py-28+bob,15,7,'#decc88');rect(px-4,py-15+bob,2,2,'#2e3c32');rect(px+4,py-15+bob,2,2,'#2e3c32');rect(px-5,py+1+bob,4,4,'#624b39');rect(px+3,py+1-bob,4,4,'#624b39');
    // Doto follows with a little lag; same warm coat and green scarf as the UI.
    const sx=Math.round(pet.x),sy=Math.round(pet.y),sb=following&&!reduced?Math.floor(t/120)%2:0;
    rect(sx-8,sy+3,18,3,'#6b8558');rect(sx-12,sy-12+sb,7,15,'#b76d3e');rect(sx-14,sy-15+sb,7,9,'#c88b50');rect(sx-6,sy-10+sb,13,14,'#c88b50');rect(sx-5,sy-18+sb,13,12,'#d69a5d');rect(sx-6,sy-21+sb,4,6,'#a86c41');rect(sx+5,sy-21+sb,4,6,'#a86c41');rect(sx-3,sy-12+sb,9,6,'#ffe2ad');rect(sx-4,sy-14+sb,2,2,'#263f34');rect(sx+5,sy-14+sb,2,2,'#263f34');rect(sx-5,sy-6+sb,13,3,'#347b5f');
    if(moving||following) frame=requestAnimationFrame(paint); else frame=0;
  }
  function move(x,y) { const distance=Math.abs(x-320)/280+Math.abs(y-174)/126;const scale=Math.max(1,distance);target={x:320+(x-320)/scale,y:174+(y-174)/scale};if(reduced)player={...target}; if(!frame)frame=requestAnimationFrame(paint); }
  function click(e){const r=canvas.getBoundingClientRect();move((e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height);}
  function key(e){if(/INPUT|TEXTAREA|BUTTON/.test(e.target.tagName))return;const v={ArrowLeft:[-16,0],a:[-16,0],ArrowRight:[16,0],d:[16,0],ArrowUp:[0,-16],w:[0,-16],ArrowDown:[0,16],s:[0,16]}[e.key];if(v){e.preventDefault();move(target.x+v[0],target.y+v[1]);}}
  canvas.addEventListener('pointerdown',click);canvas.addEventListener('keydown',key);frame=requestAnimationFrame(paint);
  return { moveTo(i){move(chapters[i].x*6.4,chapters[i].y*3.6+15);}, dispose(){disposed=true;cancelAnimationFrame(frame);canvas.removeEventListener('pointerdown',click);canvas.removeEventListener('keydown',key);} };
}
