// Same map-space compositing contract across the science maps; each facade is traced on its own terrain art.
const facade=(i,x,y,w,h,roof,windows,detail)=>[i,[[x-w/2,y],[x-w/2,y-h],[x-w/2-6,y-h+2],[x-w/2+2,y-h-roof],[x+w/2-2,y-h-roof],[x+w/2+6,y-h+2],[x+w/2,y-h],[x+w/2,y]],windows,detail];
const facades=[
  facade(0,250,329,50,24,18,[[231,312,7,6],[262,312,7,6]],[250,285,'water']),
  facade(1,374,173,56,26,20,[[351,149,10,15],[363,149,10,15],[376,149,10,15],[389,149,10,15]],[374,121,'sprout']),
  [2,[[622,194],[652,153],[682,194]],[[646,179,5,10],[654,179,5,10]],[652,149,'web']],
  facade(3,701,340,48,22,18,[[686,320,15,7],[705,320,12,7]],[701,298,'water']),
  facade(4,470,410,70,30,22,[[441,389,7,6],[455,389,7,6],[479,389,7,6],[493,389,7,6]],[470,355,'solar'])
];
const meeting=[470,292];
const night = false;
const clamp01 = value => Math.min(1, Math.max(0, value));

function line(ctx, points, color, width) {
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
}
function lamp(ctx,x,y,r,color) {
  ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
}
function halo(ctx,x,y,r,color,opacity) {
  const g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,`rgba(${color},${opacity})`);g.addColorStop(1,`rgba(${color},0)`);
  ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);
}

function detail(ctx,x,y,name) {
  ctx.save();ctx.translate(x,y);ctx.shadowBlur=6;ctx.shadowColor='#ffdf9f';
  const white='#fff7ce', gold='#fddb8b', teal='#a2ebe0', dark='#37594f';
  switch(name){
    case 'beam':
      ctx.fillStyle='#cfeeff58';ctx.beginPath();ctx.moveTo(-4,-1);ctx.lineTo(10,-8);ctx.lineTo(32,-34);ctx.lineTo(19,-37);ctx.closePath();ctx.fill();line(ctx,[[-9,3],[8,-8]],teal,4);lamp(ctx,8,-8,3,white);break;
    case 'clock':
      lamp(ctx,0,0,10,'#ce944a');lamp(ctx,0,0,8,'#fff19f');line(ctx,[[0,-5],[0,0],[5,2]],'#77513d',1.5);break;
    case 'orbit':
      ctx.strokeStyle=gold;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,19,6,-.24,0,Math.PI*2);ctx.stroke();lamp(ctx,-14,4,3,white);break;
    case 'stars':
      line(ctx,[[-18,4],[-10,-5],[2,1],[13,-8],[22,-2]],teal,1);for(const p of [[-18,4],[-10,-5],[2,1],[13,-8],[22,-2]])lamp(ctx,...p,2.5,white);break;
    case 'water':
      for(let i=0;i<3;i++)line(ctx,[[-9,i*4],[ -3,i*4-2],[3,i*4],[8,i*4-2]],i%2?white:teal,1.75);break;
    case 'sprout':
      line(ctx,[[0,10],[0,-7]],dark,2);ctx.fillStyle='#82bc58';ctx.beginPath();ctx.ellipse(-4,-4,6,3,.6,0,Math.PI*2);ctx.ellipse(4,-8,6,3,-.6,0,Math.PI*2);ctx.fill();lamp(ctx,6,-9,1.7,white);break;
    case 'web':
      line(ctx,[[-9,4],[0,-8],[10,4],[-9,4]],teal,1.7);for(const p of [[-9,4],[0,-8],[10,4]])lamp(ctx,...p,2.7,white);break;
    case 'solar':
      ctx.fillStyle='#357779';ctx.fillRect(-15,-7,30,14);ctx.strokeStyle=teal;ctx.lineWidth=1.3;ctx.strokeRect(-15,-7,30,14);
      for(const i of [-7,0,7])line(ctx,[[i,-7],[i,7]],teal,.75);line(ctx,[[-15,0],[15,0]],teal,.75);break;
    case 'fan':
      for(let n=0;n<4;n++){ctx.save();ctx.rotate(n*Math.PI/2);ctx.fillStyle=teal;ctx.beginPath();ctx.ellipse(0,-7,3,7,.24,0,Math.PI*2);ctx.fill();ctx.restore();}lamp(ctx,0,0,3,white);break;
    case 'scale':
      line(ctx,[[0,10],[0,-9]],gold,2.7);line(ctx,[[-14,-6],[14,-6]],gold,2.5);
      for(const i of [-11,11]){line(ctx,[[i,-6],[i-4,3],[i+4,3],[i,-6]],white,1);ctx.fillStyle=gold;ctx.fillRect(i-5,3,10,2);}break;
    case 'thermometer':
      line(ctx,[[0,-11],[0,6]],white,5);line(ctx,[[0,-5],[0,6]],'#f19052',2);lamp(ctx,0,7,4,'#f6a95d');break;
    case 'bubbles':
      for(const [bx,by,r] of [[-7,7,5],[3,1,4],[-1,-8,3],[9,-10,2.5]]){ctx.strokeStyle=teal;ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(bx,by,r,0,Math.PI*2);ctx.stroke();lamp(ctx,bx-1,by-1,1,white);}break;
    case 'core':
      halo(ctx,0,0,32,'255,228,151',.63);ctx.strokeStyle=gold;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,0,15,13,0,0,Math.PI*2);ctx.stroke();lamp(ctx,0,0,7,white);break;
  }
  ctx.restore();
}

// Only a newly recorded clear passed from the activity flow animates. Restored art itself is derived from the save.
export function buildingReveal(reduced, ids=[]) {
  let start;
  return now => {
    start ??= now;
    const eased=clamp01((now-start-120)/1150);
    return id=>!reduced&&ids.includes(id)?1-(1-eased)**3:1;
  };
}
export function paintRestoredBuildings(ctx,{width,height,completed,progress=()=>1,restored=null}) {
  const count=facades.reduce((n,[id])=>n+(completed(id)?progress(id):0),0);
  ctx.save();ctx.scale(width/960,height/540);
  if(count<facades.length){ctx.fillStyle=`rgba(14,36,49,${(night ? .19 : .105)*(1-count/facades.length)})`;ctx.fillRect(0,0,960,540);}
  let active=0;
  for(const [id,shape,lights,[x,y,kind]] of facades){
    const on=completed(id),amount=on?progress(id):0;
    ctx.save();ctx.beginPath();shape.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.closePath();ctx.clip();
    const shade=ctx.createLinearGradient(x,y-64,x,y+70);
    shade.addColorStop(0,`rgba(21,44,56,${(night ? .55 : .49)*(1-amount)})`);
    shade.addColorStop(1,`rgba(27,43,48,${(night ? .73 : .62)*(1-amount)})`);
    ctx.fillStyle=shade;ctx.fillRect(0,0,960,540);
    if(amount>0){
      ctx.globalAlpha=amount;
      halo(ctx,x,y+14,80,'255,211,114',.32);halo(ctx,x,y+18,36,'255,202,100',.20);
      for(const [lx,ly,w,h] of lights){
        halo(ctx,lx+w/2,ly+h/2,Math.max(w,h)*.99,'255,196,86',.55);
        const glass=ctx.createLinearGradient(lx,ly,lx,ly+h);glass.addColorStop(0,'#fff3bd');glass.addColorStop(1,'#eab061');
        ctx.fillStyle=glass;ctx.fillRect(lx,ly,w,h);ctx.fillStyle='#a66e488c';ctx.fillRect(lx+w*.47,ly,Math.max(.9,w*.09),h);ctx.fillRect(lx,ly+h*.55,w,Math.max(.9,h*.08));
      }
    }
    ctx.restore();
    if(amount>0){ctx.save();ctx.globalAlpha=amount;detail(ctx,x,y,kind);ctx.restore();}
    if(on&&amount<1){ctx.save();const glow=Math.sin(amount*Math.PI);halo(ctx,x,y,64,'255,220,137',.52*glow);ctx.restore();}
    if(on&&amount<1)active=Math.max(active,Math.sin(amount*Math.PI));
  }
  // Light gathers in the common square as records accumulate, even when animation is disabled.
  if(count>0)halo(ctx,meeting[0],meeting[1],count===facades.length?130:Math.max(1,16*count),'255,222,141',.024*count+active*.14);
  if(restored===true&&count>facades.length-.5){
    // The rebuilt habitat has five leaf beds around its shared plaza.
    ctx.save();ctx.globalAlpha=Math.min(1,(count-facades.length+.5)*2);
    for(let i=0;i<5;i++){
      const angle=(i+.5)*Math.PI*2/5,x=meeting[0]+Math.cos(angle)*36,y=meeting[1]+Math.sin(angle)*23;
      ctx.save();ctx.translate(x,y);ctx.rotate(angle+.32);ctx.fillStyle='#46794e';ctx.beginPath();ctx.ellipse(0,0,9,3.5,0,0,Math.PI*2);ctx.fill();
      line(ctx,[[-5,0],[5,0]],'#badfa0',.9);lamp(ctx,3,0,1.4,'#fbda82');ctx.restore();
    }
    ctx.restore();
  }
  ctx.restore();
}
