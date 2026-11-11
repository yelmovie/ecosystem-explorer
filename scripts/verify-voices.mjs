const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { voiceLines } from '../src/voice-lines.js';
const base=process.env.TEST_URL||'http://127.0.0.1:5314';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{
 const Native=window.Audio;window.__voices=[];
 window.Audio=class extends Native{constructor(...args){super(...args);window.__voices.push(this);this.__events=[];for(const type of ['playing','ended','pause','error'])this.addEventListener(type,()=>this.__events.push(type));this.defaultPlaybackRate=8;this.playbackRate=8;}};
});
const results=[];
try{
 await page.goto(base);
 const save=JSON.parse(await readFile(new URL('../artifacts/experience-check/completed-save.json',import.meta.url)));
 await page.evaluate(save=>localStorage.setItem('life-web-map:mvp:v1',JSON.stringify(save)),save);await page.reload();
 const go=async route=>{await page.goto(base+'/#'+route);await page.waitForTimeout(120);};
 const click=async(action,value)=>page.locator(`[data-action="${action}"]${value===undefined?'':`[data-value="${value}"]`}`).first().click();
 const play=async id=>{const control=page.locator(`[data-voice-id="${id}"] button`);await control.click();await page.waitForFunction(()=>window.__voices.at(-1)?.__events.includes('playing'));await page.waitForFunction(()=>window.__voices.at(-1)?.__events.includes('ended'),null,{timeout:30000});results.push({id,events:await page.evaluate(()=>window.__voices.at(-1).__events)});};
 await go('home');await play('welcome');
 for(let i=1;i<=10;i++){const id='p'+String(i).padStart(2,'0');await go(id);await click('voice-guide');await play('guide-'+id);await click('close');await click('hint');await play('hint-'+id);await click('hint-close');}
 await go('p10');await click('final-phase','ending');await click('final-phase','design');await click('back');
 // Final report is the first phase and retains every earned chapter summary.
 await page.evaluate(()=>{const key='life-web-map:mvp:v1',s=JSON.parse(localStorage.getItem(key));s.drafts.p10.phase='report';localStorage.setItem(key,JSON.stringify(s));});await page.reload();
 for(let i=1;i<=5;i++)await play('summary-'+i);
 await page.evaluate(()=>{const key='life-web-map:mvp:v1',s=JSON.parse(localStorage.getItem(key));s.drafts.p10.phase='certificate';localStorage.setItem(key,JSON.stringify(s));});await page.reload();await play('ending');
 assert.equal(results.length,27);
 await go('home');const welcome=page.locator('[data-voice-id="welcome"] button');
 await welcome.click();await page.waitForFunction(()=>window.__voices.at(-1)?.__events.includes('playing'));await welcome.click();assert.equal(await page.evaluate(()=>window.__voices.at(-1).paused),true);
 await welcome.click();await page.locator('.play-mission-entry').click();assert.equal(await page.evaluate(()=>window.__voices.at(-1).paused),true);await page.keyboard.press('Escape');await page.locator('dialog.play-mission').waitFor({state:'detached'});
 await welcome.click();await click('mute');assert.equal(await page.evaluate(()=>window.__voices.at(-1).paused),true);await page.locator('[data-voice-id="welcome"] button').click();assert.equal(await page.locator('[data-voice-id="welcome"]').getAttribute('data-state'),'muted');await click('mute');
 await page.locator('[data-voice-id="welcome"] button').click();await go('p01');assert.equal(await page.evaluate(()=>window.__voices.at(-1).paused),true);
 await click('voice-guide');await page.locator('[data-voice-id="guide-p01"] button').click();await click('close');await click('hint');assert.equal(await page.evaluate(()=>window.__voices.at(-1).paused),true);
 await page.locator('[data-voice-id="hint-p01"] button').click();assert.equal(await page.evaluate(()=>window.__voices.filter(a=>!a.paused).length),1);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.evaluate(()=>window.__voices.at(-1).paused),true);
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});});await click('hint-close');
 assert.deepEqual(errors,[]);await writeFile(new URL('../artifacts/voice-check.json',import.meta.url),JSON.stringify({base,results,checks:['27 actual screen controls: playing + ended','replay/stop','mute','route stop','modal stop','single active voice','hidden event stop'],errors,limitations:['Automated playback/event verification; no subjective physical speaker listening','No continuous BGM exists in this app; mediaPriority suppresses procedural effects.']},null,2));console.log('PASS: 27 screen-connected voices and lifecycle checks');
}finally{await browser.close();}
