import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createNarration } from '../src/narration.js';
import { voiceLines } from '../src/voice-lines.js';
function fixture(firstPlay) {
 const doc=new EventTarget(),page=new EventTarget();doc.hidden=false;
 let muted=false;const audios=[],duck=[];
 class FakeAudio extends EventTarget { play(){this.playing=true;return this.pending||Promise.resolve();} pause(){this.playing=false;} removeAttribute(){this.src='';} load(){} }
 const player=createNarration({doc,page,isMuted:()=>muted,duck:value=>duck.push(value),makeAudio:()=>{const a=new FakeAudio();if(!audios.length&&firstPlay)a.pending=firstPlay;audios.push(a);return a;}});
 return {player,doc,page,audios,duck,setMuted:value=>muted=value};
}
test('새 대사는 이전 음성을 멈추고 끝나면 배경음 억제를 해제한다', async()=>{
 const f=fixture();await f.player.play('welcome');assert.equal(f.audios[0].playing,true);assert.equal(f.duck.at(-1),true);
 await f.player.play('guide-p01');assert.equal(f.audios[0].playing,false);assert.equal(f.audios[1].playing,true);
 f.audios[1].dispatchEvent(new Event('ended'));assert.equal(f.player.state.status,'idle');assert.equal(f.duck.at(-1),false);f.player.dispose();
});
test('음소거·숨긴 탭·화면 이동은 재생을 중단하고 새 재생도 막는다',async()=>{
 const f=fixture();f.setMuted(true);assert.equal(await f.player.play('guide-p02'),false);assert.equal(f.audios.length,0);
 f.setMuted(false);await f.player.play('guide-p02');f.doc.hidden=true;f.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(f.audios[0].playing,false);assert.equal(await f.player.play('hint-p02'),false);
 f.doc.hidden=false;await f.player.play('hint-p02');f.setMuted(true);f.doc.dispatchEvent(new Event('change'));assert.equal(f.audios.at(-1).playing,false);
 f.setMuted(false);await f.player.play('summary-1');f.page.dispatchEvent(new Event('pagehide'));assert.equal(f.audios.at(-1).playing,false);f.player.dispose();
});
test('늦은 play 완료와 실패는 새 대사의 상태를 덮어쓰지 않는다',async()=>{
 let resolve;const f=fixture(new Promise(r=>resolve=r));const first=f.player.play('welcome');
 const old=f.audios[0];await f.player.play('guide-p01');resolve();assert.equal(await first,false);
 old.dispatchEvent(new Event('error'));assert.equal(f.player.state.id,'guide-p01');assert.equal(f.player.state.status,'playing');f.player.dispose();
});
test('자동재생 차단은 오류 상태로 돌아오고 글의 진행을 막지 않는다',async()=>{
 const f=fixture(Promise.reject(new Error('NotAllowedError')));assert.equal(await f.player.play('welcome'),false);assert.equal(f.player.state.status,'error');assert.equal(f.duck.at(-1),false);f.player.dispose();
});

test('27개 대사는 기존 안내·힌트·장 요약과 일치하고 고유하다', async()=>{
 const { activities, chapters } = await import('../src/data.js');
 const { hints } = await import('../src/learning.js');
 assert.equal(voiceLines.length,27); assert.equal(new Set(voiceLines.map(line=>line.id)).size,27);
 for(const activity of activities){
   assert.equal(voiceLines.find(line=>line.id===`guide-${activity.id}`).text,activity.desc);
   if(activity.id!=='p10')assert.equal(voiceLines.find(line=>line.id===`hint-${activity.id}`).text,hints[activity.id][0]);
 }
 chapters.forEach((chapter,index)=>assert.equal(voiceLines.find(line=>line.id===`summary-${index+1}`).text,chapter.summary));
});

test('27개 최종 음성 파일의 출처 SHA와 화면 대사가 일치한다',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../docs/VOICE-PROVENANCE-20261110.json',import.meta.url),'utf8'));assert.equal(manifest.lines.length,27);
 for(const line of manifest.lines){const bytes=readFileSync(new URL('../'+line.target,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),line.sha256,line.id);assert.equal(voiceLines.find(item=>item.id===line.id).text,line.text);}
});
