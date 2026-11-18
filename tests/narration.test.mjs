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
test('말하기 표시는 소리가 실제로 날 때만 켜지고 버퍼링·일시정지에서는 쉰다',async()=>{
 const f=fixture();await f.player.play('welcome');const first=f.audios[0];assert.equal(f.player.state.audible,true);
 first.dispatchEvent(new Event('waiting'));assert.equal(f.player.state.status,'playing');assert.equal(f.player.state.audible,false);
 first.dispatchEvent(new Event('playing'));assert.equal(f.player.state.audible,true);
 first.dispatchEvent(new Event('pause'));assert.equal(f.player.state.audible,false);
 await f.player.play('guide-p01');first.dispatchEvent(new Event('waiting'));assert.equal(f.player.state.id,'guide-p01');assert.equal(f.player.state.audible,true);f.player.dispose();
});
test('자동재생 차단은 오류 상태로 돌아오고 글의 진행을 막지 않는다',async()=>{
 const f=fixture(Promise.reject(new Error('NotAllowedError')));assert.equal(await f.player.play('welcome'),false);assert.equal(f.player.state.status,'error');assert.equal(f.duck.at(-1),false);f.player.dispose();
});

test('대사는 기존 안내·힌트·장 요약·개념과 일치하고 고유하다', async()=>{
 const { activities, chapters } = await import('../src/data.js');
 const { hints, concepts } = await import('../src/learning.js');
 const { learningNotes } = await import('../src/teaching-content.js');
 assert.equal(new Set(voiceLines.map(line=>line.id)).size,voiceLines.length);
 for(const activity of activities){
   assert.equal(voiceLines.find(line=>line.id===`guide-${activity.id}`).text,activity.desc);
   if(activity.id!=='p10')assert.equal(voiceLines.find(line=>line.id===`hint-${activity.id}`).text,hints[activity.id][0]);
   for(const level of [1,2]){const line=voiceLines.find(item=>item.id===`hint-${activity.id}-${level+1}`);if(line)assert.equal(line.text,hints[activity.id][level]);}
   concepts[activity.id].lines.forEach((text,i)=>{const line=voiceLines.find(item=>item.id===`concept-${activity.id}-${i+1}`);if(line)assert.equal(line.text,text);});
   const note=learningNotes[activity.id];assert.equal(voiceLines.find(line=>line.id===`note-${activity.id}`).text,`${note.core} ${note.clarify}`);
 }
 chapters.forEach((chapter,index)=>assert.equal(voiceLines.find(line=>line.id===`summary-${index+1}`).text,chapter.summary));
});

test('최종 음성 파일의 출처 SHA와 화면 대사가 일치한다',()=>{
 const read=name=>JSON.parse(readFileSync(new URL('../docs/'+name,import.meta.url),'utf8'));
 const fill=read('VOICE-FILL-20261118.json'),filled=new Set(fill.lines.map(line=>line.key));
 for(const line of fill.lines){const bytes=readFileSync(new URL('../'+line.file,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),line.sha256,line.key);const wired=voiceLines.find(item=>item.id===line.key);assert.equal(wired.text,line.text,line.key);assert.equal(wired.src,'./'+line.file,line.key);}
 const manifest=read('VOICE-PROVENANCE-20261110.json');
 for(const line of manifest.lines.filter(line=>!filled.has(line.id))){const bytes=readFileSync(new URL('../'+line.target,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),line.sha256,line.id);assert.equal(voiceLines.find(item=>item.id===line.id).text,line.text);}
 for(const line of voiceLines)readFileSync(new URL('../'+line.src.replace('./',''),import.meta.url));
});

test('끝까지 재생된 대사만 onEnd로 다음 대사를 이어 준다', async()=>{
 const doc=new EventTarget(),page=new EventTarget();doc.hidden=false;const ended=[],audios=[];
 class FakeAudio extends EventTarget { play(){return Promise.resolve();} pause(){} removeAttribute(){} load(){} }
 const player=createNarration({doc,page,isMuted:()=>false,onEnd:id=>ended.push(id),makeAudio:()=>{const a=new FakeAudio();audios.push(a);return a;}});
 await player.play('welcome');audios[0].dispatchEvent(new Event('ended'));assert.deepEqual(ended,['welcome']);
 await player.play('ending-scene');player.stop();assert.deepEqual(ended,['welcome']);player.dispose();
});

test('지도 악당 음성은 말풍선 글과 정확히 같은 글이다', async()=>{
 const { encounterStage } = await import('../src/map-encounter-theme.js');
 const said=new Set([0,1,2,3,4].flatMap(i=>{const s=encounterStage(i,i+1,'',{x:0,y:0});return [...s.lines,...s.hit,s.finish];}));
 const villain=voiceLines.filter(line=>line.id.startsWith('villain-'));
 assert.ok(villain.length>0);
 for(const line of villain){assert.ok(said.has(line.text),line.id);assert.equal(line.speaker,'매듭 악당');}
});
