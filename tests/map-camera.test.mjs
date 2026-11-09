import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/map.js',import.meta.url),'utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0);let i=source.indexOf('{',start),depth=1;for(let j=i+1;j<source.length;j++){if(source[j]==='{')depth++;if(source[j]==='}'&&!--depth)return source.slice(start,j+1);}}
const setup='let scale=1,cam={x:0,y:0};const W=960,H=540,ZOOM=1.4,world={style:{}},viewport={clientWidth:w,clientHeight:h},player={x:200,y:200};const clampCam=c=>({x:W*scale<=w?(w-W*scale)/2:Math.min(0,Math.max(w-W*scale,c.x)),y:H*scale<=h?(h-H*scale)/2:Math.min(0,Math.max(h-H*scale,c.y))});const focusCam=p=>clampCam({x:w/2-p.x*scale,y:h/2-p.y*scale}),apply=()=>{};FN;layout(true);result={width:W*scale,height:H*scale};';
test('overview fits the complete world and exploration remains zoomed',()=>{
 for(const [w,h] of [[1024,768],[768,1024],[1280,800],[390,844],[1920,1080]]){
  for(const overview of [true,false]){
   const context={w,h,overview};vm.createContext(context);vm.runInContext(setup.replace('FN',fn('layout')),context);
   const r=context.result;assert.ok(Number.isFinite(r.width)&&Number.isFinite(r.height));
   if(overview){assert.ok(r.width<=w+0.001);assert.ok(r.height<=h+0.001);if('x' in r){assert.ok(Math.abs(r.x-(w-r.width)/2)<0.001);assert.ok(Math.abs(r.y-(h-r.height)/2)<0.001);}}
   else assert.ok(r.width>w&&r.height>h);
  }
 }
});
