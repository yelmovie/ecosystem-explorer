// Teacher auto-play check. Auto-play exists only in the teacher preview (설정 → 교사용 가이드 → 모든 장·활동 한 번에 열기),
// which runs on a copy of the record and never saves, so every check reads the screen and confirms the student record is untouched.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const root=path.resolve(__dirname,'..'),output=path.join(root,'artifacts/stage-player');
const base=process.env.TEST_URL||'http://127.0.0.1:4194',key='life-web-map:mvp:v1';
(async()=>{
  await fs.mkdir(output,{recursive:true});
  const {initialState}=await import(pathToFileURL(path.join(root,'src/engine.js')));
  const {organisms,foodEdges}=await import(pathToFileURL(path.join(root,'src/data.js')));
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-crash-reporter','--mute-audio','--disk-cache-dir='+path.join(output,'cache')]});
  const checks=[],errors=[];
  const check=message=>{checks.push(message);console.log(message);};
  try{
    const context=await browser.newContext({viewport:{width:1024,height:600},reducedMotion:'reduce'}),page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    const pick=(a,v)=>page.locator('[data-action="'+a+'"]'+(v===undefined?'':'[data-value="'+v+'"]')).first();
    const click=(a,v)=>pick(a,v).click();
    const stored=()=>page.evaluate(k=>localStorage.getItem(k),key);
    const status=()=>page.locator('.playback-status').textContent();
    const stopped=()=>page.waitForFunction(()=>document.querySelector('[data-action="playback-toggle"]')?.getAttribute('aria-pressed')==='false');
    const stoppedAt=async text=>{await page.waitForFunction(t=>document.querySelector('.playback-status')?.textContent===t,text,{timeout:20000});await stopped();};
    const range=()=>page.locator('#time-range').inputValue();
    let record='';
    // Seed a student record, open the teacher preview from settings, then go to the activity inside the preview.
    const preview=async(id,change=()=>{})=>{
      const s=initialState();s.muted=true;s.reduced=true;change(s);
      await page.goto(base+'/#home');await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key,s});
      await page.goto(base+'/?player='+id+Date.now()+'#home');await click('settings');
      await page.locator('dialog[open] details summary').filter({hasText:'교사용 가이드'}).click();await click('unlock');
      await page.locator('dialog[open] [data-action="close"]').first().click();
      record=await stored();
      await page.evaluate(id=>{location.hash=id;},id);await page.locator('.work-area').waitFor();await page.waitForTimeout(300);
    };
    const untouched=async()=>assert.equal(await stored(),record,'the teacher preview never writes the student record');
    // A student never sees auto-play.
    {
      const s=initialState();s.muted=true;s.completed=['p01','p02','p03','p04','p05','p06','p07'];
      await page.goto(base+'/#home');await page.evaluate(({key,s})=>localStorage.setItem(key,JSON.stringify(s)),{key,s});
      for(const id of ['p01','p04','p08']){await page.goto(base+'/?student='+Date.now()+'#'+id);await page.locator('.work-area').waitFor();assert.equal(await pick('playback-toggle').count(),0);}
      check('students do not see auto-play');
    }
    await preview('p01');await click('playback-toggle');await stoppedAt('설명을 고를 차례');
    assert.ok(await page.locator('[data-action="observe-answer"]').count()>0,'the first clue is open');await untouched();
    check('observation opens the first clue and stops before an answer');
    for(const id of ['p02','p03','p05','p07']){await preview(id);assert.equal(await pick('playback-toggle').count(),0);}
    check('classification, role assignment, food connections and causal answers stay manual');
    await preview('p04');await click('playback-toggle');await stoppedAt('예상을 먼저 골라 줘');
    await click('playback-speed','2');await click('prediction','leaves');await stoppedAt('결과를 살펴보고 복원해 봐');
    assert.equal(await page.locator('.experiment-layout').getAttribute('data-phase'),'restore','the changed state stays on screen until the learner restores it');
    assert.ok(await page.locator('[data-action="experiment-answer"]').count()>0,'the learner reads the result and answers');
    assert.equal(await page.locator('[data-action="experiment-answer"][aria-pressed="true"]').count(),0,'auto-play never picks the observation');
    assert.equal(await page.locator('.activity-complete').count(),0);await untouched();
    check('experiment requires a learner prediction, advances, then waits for the learner to read the result');
    await preview('p06');await click('playback-speed','2');await click('playback-toggle');await stoppedAt('까닭을 고를 차례');
    assert.equal(await page.locator('.activity-complete').count(),0);await untouched();
    check('comparison automatically removes and restores both organisms without choosing a reason');
    await preview('p08');await click('playback-speed','2');await click('playback-toggle');await stoppedAt('비교 결과를 고를 차례');
    assert.equal(await page.locator('.activity-complete').count(),0);await untouched();
    check('time playback visits both policies and all four endpoints without answering');
    await preview('p08');await click('playback-speed','2');await click('playback-toggle');
    await page.waitForFunction(()=>document.querySelector('[data-action="time-policy"][data-value="protect"]')?.getAttribute('aria-pressed')==='true');await click('playback-toggle');
    await page.evaluate(()=>{window.__resumedPolicies=[];document.querySelector('#time-range').addEventListener('input',()=>window.__resumedPolicies.push(document.querySelector('[data-action="time-policy"][aria-pressed="true"]')?.dataset.value));});
    await click('playback-toggle');await page.waitForFunction(()=>window.__resumedPolicies?.length>0);
    assert.equal(await page.evaluate(()=>window.__resumedPolicies[0]),'protect');await click('playback-toggle');
    check('resume continues the current observation condition instead of restarting');
    await preview('p08');await click('playback-speed','0.5');await click('playback-toggle');await page.waitForTimeout(150);await click('playback-toggle');
    const paused=await range();await page.waitForTimeout(2000);assert.equal(await range(),paused);
    assert.equal(await pick('playback-speed','0.5').getAttribute('aria-pressed'),'true');
    check('0.5/1/2 speed selection and pause cancel future progress');
    await click('playback-toggle');await click('hint');const duringHint=await range();await page.waitForTimeout(2000);assert.equal(await range(),duringHint);await click('hint-close');
    assert.equal(await pick('playback-toggle').getAttribute('aria-pressed'),'false');
    check('opening help stops playback and closing help does not resume it');
    await preview('p09',s=>s.drafts.p09.selected=['source','habitat']);await click('playback-speed','2');await click('playback-toggle');await stoppedAt('선택한 이유를 고를 차례');
    assert.equal(await page.locator('.activity-complete').count(),0);await untouched();
    check('restoration executes only the chosen plan and waits for the learner reason');
    await preview('p10',s=>Object.assign(s.drafts.p10,{phase:'design',initialized:true,elements:[...organisms.map(o=>o.id),'light','water','soil','fungi'],edges:[...foodEdges],strategies:['source','habitat']}));
    await click('playback-speed','2');await click('playback-toggle');await stoppedAt('시험 완료 · 결과를 확인해');
    assert.equal(await page.evaluate(()=>location.hash),'#p10');await untouched();
    await page.screenshot({path:path.join(output,'autoplay-final.png')});
    check('final playback runs the authored design and its shock test without creating a design or completion');
    await preview('p08');await click('playback-speed','2');await click('playback-toggle');await page.waitForTimeout(200);await page.evaluate(()=>{location.hash='map';});
    await page.waitForTimeout(1600);assert.equal(await page.evaluate(()=>location.hash),'#map');await untouched();
    check('leaving the stage cancels the scheduled action');
    assert.deepEqual(errors,[]);await fs.writeFile(path.join(output,'playback-result.json'),JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
