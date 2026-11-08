const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const fs=require('node:fs/promises');
(async()=>{
const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{
console.log('browser ready');
const c=await b.newContext({viewport:{width:1024,height:768}}),p=await c.newPage();const base=process.env.TEST_URL||'http://127.0.0.1:5344';const key='life-web-map:mvp:v1';const act=a=>p.locator(`[data-action="${a}"]`).first();
await p.goto(base);await act('settings').click();await act('unlock').click();await act('close').click();const original=await p.evaluate(k=>localStorage.getItem(k),key);
await p.goto(base+'/#p04');await p.locator('[data-action="prediction"][data-value="food"]').click();await act('experiment-skip').click();await act('experiment-restore').click();await p.locator('[data-action="experiment-answer"][data-value="leaves"]').click();assert.equal(await p.evaluate(k=>localStorage.getItem(k),key),original,'teacher work must never alter student record');
await fs.mkdir('artifacts/record-safety',{recursive:true});await p.screenshot({path:'artifacts/record-safety/teacher-preview.png',fullPage:true});
await act('preview-exit').click();await p.waitForURL('**/#map');await p.locator('.preview-banner').waitFor({state:'detached'});assert.equal(await p.locator('.preview-banner').count(),0);await p.goto(base+'/#p04');await p.waitForURL('**/#map');
console.log('preview checked');await p.evaluate(k=>localStorage.setItem(k,'{broken'),key);await p.reload();await p.goto(base+'/#p01');await act('mute').click();assert.equal(await p.evaluate(k=>localStorage.getItem(k),key),'{broken');
await act('settings').click();await act('reset-confirm').click();await act('reset').click();assert.equal(await p.evaluate(k=>localStorage.getItem(k+':before-reset'),key),'{broken');
await p.waitForURL('**/#home');await act('settings').click();await act('restore-confirm').click();await act('restore-backup').click();assert.equal(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),key)).completed.length,0);await p.locator('dialog [data-action="settings"]').click();await act('close').click();
console.log('corrupt backup checked');
// Snapshot actual experiment completion then edit it: the submitted record must remain.
await p.evaluate(k=>localStorage.setItem(k,JSON.stringify({version:1,completed:['p01','p02','p03'],muted:true})),key);await p.reload();await p.goto(base+'/#p04');await p.locator('[data-action="prediction"][data-value="food"]').click();await act('experiment-skip').click();await act('experiment-restore').click();await p.locator('[data-action="experiment-answer"][data-value="leaves"]').click();const recorded=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).evidence.p04,key);assert.equal(recorded.prediction,'food');await act('remove-role').click();assert.deepEqual(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).evidence.p04,key),recorded);await p.reload();assert.deepEqual(await p.evaluate(k=>JSON.parse(localStorage.getItem(k)).evidence.p04,key),recorded);
console.log('PASS: teacher isolation/exit/locked routes, corrupt-save preservation/reset backup/recovery rejection, real completion snapshot/replay/reload.');
}finally{await b.close();}
})().catch(e=>{console.error(e);process.exit(1)});
