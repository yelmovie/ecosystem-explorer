import test from 'node:test';
import assert from 'node:assert/strict';
import { createThemeEffects } from '../src/theme-effects.js';
test('procedural effects respect mute, volume, priority, hidden and disposal', () => {
 const doc = new EventTarget(); doc.hidden = false; globalThis.document = doc;
 const oscillators = []; let created = 0;
 const param = () => ({ setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} });
 globalThis.AudioContext = class { constructor(){created++;this.state='running';this.currentTime=0;this.destination={};} createGain(){return {gain:param(),connect(){},disconnect(){}};} createOscillator(){const o={frequency:param(),connect(){},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;}};oscillators.push(o);return o;} suspend(){this.state='suspended';return Promise.resolve();} resume(){this.state='running';return Promise.resolve();} close(){return Promise.resolve();} };
 const settings={muted:true,enabled:true,volume:.25};
 const effect=createThemeEffects('gas',()=>settings);effect.play('pump');assert.equal(created,0);
 settings.muted=false;effect.play('pump');assert.equal(oscillators.length,1);assert(oscillators[0].started);
 effect.play('success');assert(oscillators[0].stopped);assert.equal(oscillators.length,4);
 settings.muted=true;effect.sync();assert(oscillators.every(o=>o.stopped));
 settings.muted=false;settings.enabled=false;effect.play('pump');assert.equal(oscillators.length,4);
 settings.enabled=true;doc.hidden=true;effect.play('pump');assert.equal(oscillators.length,4);
 doc.hidden=false;effect.play('pump');doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert(oscillators.every(o=>o.stopped));
 doc.hidden=false;effect.dispose();effect.play('pump');assert.equal(oscillators.length,5);
 delete globalThis.AudioContext; delete globalThis.document;
});
test('sampled map cues share mute, hidden and timing rules; lanes cut only their own sounds', async () => {
 const doc = new EventTarget(); doc.hidden = false; globalThis.document = doc;
 const sources = [], oscs = []; let fetched = 0;
 globalThis.fetch = async () => { fetched++; return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) }; };
 globalThis.AudioContext = class { constructor(){this.state='running';this.currentTime=2;this.destination={};} createGain(){return {gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};} createBufferSource(){const s={playbackRate:{value:1},connect(){},disconnect(){},start(at){this.at=at;},stop(){this.stopped=true;}};sources.push(s);return s;} createOscillator(){const p={setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}};const o={frequency:p,connect(){},disconnect(){},start(){},stop(at){if(at===undefined)this.stopped=true;}};oscs.push(o);return o;} decodeAudioData(){return Promise.resolve({decoded:true});} suspend(){return Promise.resolve();} resume(){return Promise.resolve();} close(){return Promise.resolve();} };
 const settings={muted:false,volume:1};
 const effect=createThemeEffects('ecosystem',()=>settings);
 effect.unlock(); effect.preload(['a.mp3','b.mp3']); effect.preload(['a.mp3']);
 assert.equal(fetched,2);
 await new Promise(r=>setTimeout(r,0)); await new Promise(r=>setTimeout(r,0));
 settings.muted=true; assert.equal(effect.sample([{url:'a.mp3'}]),false); assert.equal(sources.length,0);
 settings.muted=false; assert.equal(effect.sample([{url:'a.mp3'},{url:'b.mp3',at:.075,volume:.6}]),true);
 assert.equal(sources.length,2); assert.equal(sources[0].at,2); assert.equal(sources[1].at,2.075);
 // Reward lane (combat, cards, a place opening): a new cue rings with the earlier ones, up to four cues.
 effect.sample([{url:'a.mp3'}]); assert(!sources[0].stopped&&!sources[1].stopped); assert.equal(sources.length,3);
 // A UI tone and a footstep never cut a reward cue; a footstep replaces only the footstep before it; a UI tone only the UI tone.
 effect.play('tap'); assert.equal(oscs.length,1); assert(sources.every(s=>!s.stopped));
 effect.sample([{url:'b.mp3',rate:.95}],'step'); assert.equal(sources.length,4); assert.equal(sources[3].playbackRate.value,.95);
 effect.sample([{url:'b.mp3'}],'step'); assert(sources[3].stopped); assert(sources.slice(0,3).every(s=>!s.stopped)); assert.equal(sources.length,5);
 effect.play('success'); assert(oscs[0].stopped); assert(sources.slice(0,3).every(s=>!s.stopped)&&!sources[4].stopped);
 assert.equal(effect.sample([{url:'a.mp3'}],'nope'),false);
 // A fifth reward cue ends only the oldest one (its two parts).
 effect.sample([{url:'a.mp3'}]); effect.sample([{url:'b.mp3'}]); effect.sample([{url:'a.mp3'}]);
 assert(sources[0].stopped&&sources[1].stopped); assert(!sources[2].stopped&&!sources[5].stopped&&!sources[6].stopped&&!sources[7].stopped);
 // Mute stops every lane.
 settings.muted=true; effect.sync(); assert(sources.every(s=>s.stopped)); settings.muted=false;
 doc.hidden=true; assert.equal(effect.sample([{url:'a.mp3'}]),false);
 effect.dispose(); delete globalThis.AudioContext; delete globalThis.document; delete globalThis.fetch;
});
