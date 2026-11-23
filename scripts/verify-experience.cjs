// Run against the local source or dist server. Browser tooling stays outside the app.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base = process.env.TEST_URL || 'http://127.0.0.1:4186';
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'artifacts', 'experience-check');
const key = 'life-web-map:mvp:v1';
// This mode ends before any synthetic-save checks; it follows the earned student path only.
const studentPathOnly = process.env.STUDENT_PATH_ONLY === '1';

async function main() {
  await fs.mkdir(output, { recursive: true });
  await fs.mkdir(path.join(root, 'artifacts', 'tmp'), { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--disable-gpu', '--renderer-process-limit=2', '--disable-crash-reporter', '--disk-cache-dir=' + path.join(root, 'artifacts/tmp/browser-cache')],
    env: { ...process.env, TEMP: path.join(root, 'artifacts/tmp'), TMP: path.join(root, 'artifacts/tmp') },
  });
  const errors = [], badRequests = [], checks = [], feedbackLayouts = [];
  const watch = page => {
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) badRequests.push([r.status(), r.url()]); });
  };
  const selector = (action, value) => '[data-action="' + action + '"]' + (value === undefined ? '' : '[data-value="' + value + '"]');
  const savedOn = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  const seed = async (page, record, route) => {
    await page.goto(base + '/#home');
    await page.evaluate(({ key, record }) => localStorage.setItem(key, JSON.stringify(record)), { key, record });
    await page.reload();
    await page.goto(base + '/#' + route);
  };
  let touchBrowser;
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: studentPathOnly });
    await context.addInitScript(() => {
      window.__sounds = [];
      const NativeAudio = window.Audio;
      window.Audio = class extends NativeAudio {
        play() { window.__sounds.push(this.src); return super.play(); }
      };
    });
    const page = await context.newPage();
    watch(page);
    const pick = (action, value) => page.locator(selector(action, value)).first();
    const click = async (action, value) => { const target = pick(action, value); await (studentPathOnly ? target.tap() : target.click()); };
    // 운영은 화면 코드를 필요할 때 받아 오므로, 새로고침 뒤 작업 화면이 다시 그려질 때까지 기다린 다음 센다.
    const reloadReady = async () => { await page.reload(); await page.locator('.work-area, .ending-scene, .cert-paper').first().waitFor(); await page.waitForTimeout(300); };
    const saved = () => savedOn(page);
    const auditFeedback = async name => {
      if (!studentPathOnly) return;
      await page.waitForFunction(() => !document.querySelector('#notice')?.classList.contains('show'));
      for (const [width, height] of [[1280,800],[1920,1080],[1024,768],[915,412]]) {
        await page.setViewportSize({ width, height }); await page.evaluate(()=>document.fonts.ready); await page.waitForTimeout(220);
        const layout = await page.evaluate(() => {
          const flow = document.querySelector('#app').classList.contains('activity-flow');
          const selectors = '.transfer .choice,.experiment-controls button,.work-footer button';
          const controls = [...document.querySelectorAll(selectors)].filter(e => e.getClientRects().length).map(e => {
            if (flow) e.scrollIntoView({ block: 'center', behavior: 'instant' });
            const b = e.getBoundingClientRect(), hit = document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);
            return { text:e.innerText, width:b.width, height:b.height, top:b.top, bottom:b.bottom, left:b.left, right:b.right, reachable:e.disabled || e.contains(hit) };
          });
          const text = [...document.querySelectorAll('.transfer-feedback,.experiment-explanation,.experiment-observed')].map(e => {
            const b=e.getBoundingClientRect(); return {text:e.innerText,top:b.top,bottom:b.bottom,font:getComputedStyle(e).fontSize,clipped:e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1};
          });
          return {flow,width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,controls,text};
        });
        assert.ok(layout.scrollWidth <= width+2, name+': horizontal overflow');
        for (const control of layout.controls) {
          assert.ok(control.left >= -2 && control.right <= width+2 && control.top >= -2 && control.bottom <= height+2, name+': unreachable control '+control.text);
          assert.ok(control.reachable, name+': covered control '+control.text);
          assert.ok(control.width >= 43.99 && control.height >= 43.99, name+': target below 44px '+control.text);
        }
        for(const text of layout.text)assert.ok(!text.clipped,name+': text clipped inside its own box');
        if (!layout.flow) for (const text of layout.text) assert.ok(text.top>=-2 && text.bottom<=height+2, name+': explanation leaves viewport');
        feedbackLayouts.push({name,...layout});
        await page.screenshot({path:path.join(output,name+'-'+width+'x'+height+'.png'),fullPage:true});
      }
      await page.setViewportSize({width:1280,height:800});
    };
    const select = async (action, value) => {
      if (await pick(action, value).getAttribute('aria-pressed') !== 'true') await click(action, value);
    };
    const connect = async (edge, final = false) => {
      const [from, to] = edge.split('>');
      const action = final ? 'final-edge' : 'edge';
      await select(action, from);
      await click(action, to);
    };
    const drag = async (from, to) => {
      const a = await from.boundingBox(), b = await to.boundingBox();
      assert.ok(a && b, 'drag targets visible');
      if (studentPathOnly) {
        const session=await context.newCDPSession(page), x=a.x+a.width/2, y=a.y+a.height/2, tx=b.x+b.width/2, ty=b.y+b.height/2;
        await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
        for(let i=1;i<=12;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+(tx-x)*i/12,y:y+(ty-y)*i/12,id:1}]});await page.waitForTimeout(16);}
        await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();await page.waitForTimeout(410);return;
      }
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
      await page.mouse.down();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(410); // Browser click suppression after a real drag.
    };
    const next = async (id, nextId) => {
      await page.waitForFunction(({ key, id }) => JSON.parse(localStorage.getItem(key)).completed.includes(id), { key, id });
      assert.equal(await page.locator('dialog[open]').count(), 0, id + ': completion does not interrupt with a modal');
      assert.equal((await saved()).completed.filter(value => value === id).length, 1, id + ': recorded once');
      await page.screenshot({ path: path.join(output, id + '-completed.png') });
      // Since 2026-11-13 the last activity of each chapter (p02·p04·p06·p08) continues to the map to show the change.
      const chapterEnd = ['p02', 'p04', 'p06', 'p08'].includes(id);
      await click('completion-next', chapterEnd ? 'map' : nextId);
      if (chapterEnd) {
        await page.waitForURL('**/#map');
        if(studentPathOnly)await click('map-enter',String(Math.floor((Number(nextId.slice(1))-1)/2)));
        else await page.goto(base + '/#' + nextId);
      }
      await page.waitForURL('**/#' + nextId);
      checks.push(id + ': last learning action records once, one click continues');
    };

    if(studentPathOnly){
      await page.goto(base + '/#home');
      assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),null,'new student starts without a save');
      await click('new-start');await page.locator('#modal.story-modal [data-action="story-skip"]').tap();
      await page.waitForURL('**/#map');await click('map-enter','0');await page.waitForURL('**/#p01');
    }else await page.goto(base + '/#p01');
    await click('hint');
    assert.match(await page.locator('.companion-hint').innerText(), /1\/3/);
    await click('hint-more'); await click('hint-more');
    assert.match(await page.locator('.companion-hint').innerText(), /3\/3/);
    await click('hint-close');
    await click('observe', 'plant'); await click('observe-answer', '1');
    assert.equal((await saved()).drafts.p01.found.length, 0, 'incorrect observation does not record a clue');
    for (const [id, answer] of [['plant', 0], ['water', 1], ['sun', 0], ['mushroom', 1]]) {
      await click('observe', id); await click('observe-answer', String(answer));
      if(id!=='mushroom')assert.equal(await page.evaluate(()=>document.activeElement?.dataset.action),'observe','focus moves to an undiscovered clue');
    }
    await click('observe', 'mushroom');
    if (await pick('observe-answer', '1').isEnabled()) await click('observe-answer', '1');
    assert.equal((await saved()).drafts.p01.found.length, 4, 'revisiting a clue does not duplicate it');
    await next('p01', 'p02');

    await drag(page.locator('[data-item="tree"]'), page.locator('[data-drop="classify"][data-group="living"]'));
    assert.equal(await pick('specimen-pick', 'frog').getAttribute('aria-pressed'), 'true', 'next unclassified card is selected');
    await pick('specimen-place', 'living').focus();
    await page.keyboard.press('Enter');
    assert.equal((await saved()).drafts.p02.groups.frog, 'living');
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.action), 'specimen-place', 'keyboard focus survives placement');
    for (const [id, group] of [['mushroom', 'living'], ['water', 'living'], ['sun', 'nonliving'], ['soil', 'nonliving']]) {
      await select('specimen-pick', id); await click('specimen-place', group);
    }
    await click('transfer', 'living');
    assert.ok(!(await saved()).completed.includes('p02'), 'wrong classification cannot auto-complete');
    await click('complete', 'p02');
    assert.ok(!(await saved()).completed.includes('p02'), 'manual validation also rejects the wrong classification');
    await select('specimen-pick', 'water'); await click('specimen-place', 'nonliving');
    await click('complete','p02');
    assert.ok(!(await saved()).completed.includes('p02'),'seawater itself is still incorrectly classified');
    assert.match(await page.locator('.transfer-feedback').innerText(),/바닷물 자체[\s\S]*생물과 구분/);
    assert.match(await page.locator('#notice').innerText(),/바닷물 자체/);
    await click('hint');await click('hint-more');await click('hint-more');
    const waterHint=await page.locator('.companion-hint').innerText();
    assert.match(waterHint,/물 카드.*바닷물 자체/);assert.doesNotMatch(waterHint,/그림/);
    await click('hint-close');await auditFeedback('p02-retry');
    await pick('transfer','nonliving').focus();await page.keyboard.press('Enter');
    assert.match(await page.locator('.transfer-feedback').innerText(),/비생물 요소[\s\S]*생물 요소/);
    await auditFeedback('p02-correct');
    await next('p02', 'p03');

    await drag(page.locator('.role-token[data-item="producer"]'), page.locator('[data-drop="role"][data-group="producer"]'));
    assert.equal(await pick('role-pick', 'consumer').getAttribute('aria-pressed'), 'true', 'next role card is selected');
    await click('role-place', 'decomposer');
    await select('role-pick', 'decomposer'); await click('role-place', 'decomposer');
    assert.ok(!(await saved()).completed.includes('p03'), 'incorrect role keeps activity open for correction');
    await select('role-pick', 'consumer'); await click('role-place', 'consumer');
    await next('p03', 'p04');

    await click('prediction', 'food');
    assert.equal((await saved()).drafts.p04.ran, true, 'prediction starts the experiment');
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).drafts.p04.step === 2, key);
    assert.ok(!(await saved()).completed.includes('p04'), 'elapsed time alone does not complete the experiment');
    // Since 2026-11-17 a correct explanation restores the model by itself (no separate restore button).
    if(studentPathOnly){
      assert.match(await page.locator('.experiment-explanation').innerText(),/무기 양분.*생산자는 햇빛.*스스로 양분/);
      await page.getByText('모형 안내',{exact:true}).click();assert.match(await page.locator('.stage-note').innerText(),/모형값.*실제 양분의 양/);await page.getByText('모형 안내',{exact:true}).click();
      await click('hint');await click('hint-more');await click('hint-more');
      const hint=await page.locator('.companion-hint').innerText();assert.match(hint,/양분 공급 처음보다 감소.*소비자 처음과 같음.*분해 활동 처음보다 감소/);assert.doesNotMatch(hint,/늘어난|올라야|증가/);
      await page.screenshot({path:path.join(output,'p04-decomposer-hint.png'),fullPage:true});await click('hint-close');await auditFeedback('p04-decomposer');
    }
    await click('experiment-answer', 'food');
    assert.ok(!(await saved()).completed.includes('p04'), 'incorrect reflection does not complete the experiment');
    await click('experiment-answer', 'leaves');
    if(studentPathOnly)for(const [role,answer,up] of [['producer','food',false],['consumer','plants',true]]){
      await click('remove-role',role);await click('prediction',answer);
      await page.waitForFunction(key=>JSON.parse(localStorage.getItem(key)).drafts.p04.step===2,key);
      const result=await page.locator('.experiment-observed').innerText();assert.equal(result.includes('처음보다 증가'),up);
      await click('hint');await click('hint-more');await click('hint-more');const hint=await page.locator('.companion-hint').innerText();
      assert.equal(hint.includes('처음보다 증가'),up);if(!up)assert.doesNotMatch(hint,/늘어난|올라야|증가/);
      await page.screenshot({path:path.join(output,'p04-'+role+'-hint.png'),fullPage:true});await click('hint-close');await auditFeedback('p04-'+role);
      await click('experiment-answer',answer);assert.equal((await saved()).completed.filter(id=>id==='p04').length,1);
      assert.match(await page.locator('.experiment-observed').innerText(),/되돌리기 전 관찰 기록/);
    }
    await next('p04', 'p05');

    await connect('plants>snake');
    assert.equal((await saved()).drafts.p05.edges.length, 0, 'unobserved food edge rejected');
    await drag(pick('edge', 'plants'), pick('edge', 'grasshopper'));
    assert.equal(await pick('edge', 'plants').getAttribute('aria-pressed'), 'true', 'source stays selected while it has another connection');
    for (const edge of ['plants>caterpillar', 'grasshopper>frog', 'caterpillar>frog', 'grasshopper>sparrow', 'caterpillar>sparrow', 'frog>snake', 'sparrow>snake']) await connect(edge);
    await connect('plants>grasshopper');
    assert.equal((await saved()).drafts.p05.edges.length, 8, 'duplicate relation cannot inflate progress');
    await next('p05', 'p06');

    await click('compare-remove', 'grasshopper');
    assert.equal(await pick('compare-answer', 'paths').count(), 0, 'question waits for both trials');
    await click('compare-remove', 'frog');
    await reloadReady();
    assert.ok(await pick('compare-answer', 'paths').count(), 'both trials and inline reflection survive reload');
    await click('compare-remove', '');
    await click('compare-answer', 'always');
    assert.ok(!(await saved()).completed.includes('p06'), 'incorrect comparison is rejected');
    await click('compare-answer', 'paths');
    assert.equal((await saved()).drafts.p06.removed, '', 'restored models can record their two previous trials');
    await next('p06', 'p07');

    await drag(pick('cause-pick', 'action:0'), page.locator('[data-drop="cause"][data-group="impact"]'));
    assert.deepEqual((await saved()).drafts.p07.picks, {}, 'wrong-category drop does not corrupt slots');
    await click('cause-pick', 'action:1'); await click('cause-pick', 'change:0'); await click('cause-pick', 'impact:0');
    assert.equal((await saved()).drafts.p07.solved.length, 0, 'wrong causal chain stays editable');
    await click('cause-pick', 'action:0');
    assert.equal((await saved()).drafts.p07.row, 1, 'correct chain immediately opens the second scene');
    for (const slot of ['action', 'change', 'impact']) await click('cause-pick', slot + ':0');
    await next('p07', 'p08');

    const scene = await page.locator('.time-scene').boundingBox();
    await page.mouse.move(scene.x + 2, scene.y + scene.height / 2); await page.mouse.down();
    await page.mouse.move(scene.x + scene.width - 2, scene.y + scene.height / 2, { steps: 12 });
    await page.mouse.up(); await page.waitForTimeout(410);
    assert.equal((await saved()).drafts.p08.seen.length, 2, 'one swipe observes both endpoints');
    await click('time-policy', 'protect');
    // Since 2026-11-17 the jump buttons are gone; students swipe the scene (the same gesture as above).
    { const box = await page.locator('.time-scene').boundingBox();
      await page.mouse.move(box.x + 2, box.y + box.height / 2); await page.mouse.down();
      await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2, { steps: 12 });
      await page.mouse.up(); await page.waitForTimeout(410); }
    assert.equal((await saved()).drafts.p08.seen.length, 4);
    await reloadReady();
    assert.ok(await pick('time-answer', 'evidence').count(), 'four observations restore the inline question');
    await click('time-answer', 'automatic');
    assert.ok(!(await saved()).completed.includes('p08'), 'incorrect time comparison is rejected');
    await click('time-answer', 'evidence');
    await next('p08', 'p09');

    await click('strategy', 'clean'); await click('strategy', 'trees'); await click('strategy-run'); await click('strategy-edit');
    await click('strategy', 'clean'); await click('strategy', 'source'); await click('strategy', 'habitat'); await click('strategy-run');
    assert.equal((await saved()).drafts.p09.history.length, 2, 'different plans keep distinct comparison records');
    await reloadReady();
    assert.ok(await pick('strategy-reason', 'habitat').count(), 'executed plan restores its result screen');
    await click('strategy-edit'); await click('strategy-run');
    assert.equal((await saved()).drafts.p09.history.length, 2, 'rerunning the same plan does not duplicate history');
    await click('strategy-reason', 'habitat');
    await next('p09', 'p10');

    await click('final-start');
    // Since 2026-11-17 「설계 시작」 brings in the p05 food web (6 organisms, 8 edges). Remove the caterpillar to build the
    // first design that fails when the grasshopper is lost, then add the conditions (one by drag, the rest by tap).
    assert.equal((await saved()).drafts.p10.edges.length, 8, 'design starts from the student\'s own food web');
    await click('element', 'caterpillar');
    assert.equal((await saved()).drafts.p10.edges.length, 5, 'removing a living thing also removes its food lines');
    await drag(pick('element', 'light'), page.locator('.final-habitat'));
    for (const id of ['water', 'soil', 'fungi']) await click('element', id);
    { const els = (await saved()).drafts.p10.elements; assert.ok(['light', 'water', 'soil', 'fungi'].every(id => els.includes(id)) && !els.includes('caterpillar'), 'conditions added, caterpillar left out'); }
    await click('design-tab', 'connections');
    await click('final-run');
    assert.ok(await pick('final-shock').count());
    const trialsBeforeShock = (await saved()).drafts.p10.trials.length;
    await click('final-shock');
    assert.equal((await saved()).drafts.p10.shock, true);
    assert.equal((await saved()).drafts.p10.tested, true, 'shock button performs the trial immediately');
    assert.equal((await saved()).drafts.p10.trials.length, trialsBeforeShock + 1);
    assert.equal(await pick('final-finish').count(), 0, 'first design fails grasshopper loss');
    await click('design-tab', 'elements'); await click('element', 'caterpillar'); await click('design-tab', 'connections');
    for (const edge of ['plants>caterpillar', 'caterpillar>frog', 'caterpillar>sparrow']) await connect(edge, true);
    await click('final-run');
    assert.ok(await pick('final-finish').count());
    await page.screenshot({ path: path.join(output, 'p10-revised-success.png') });
    await click('final-finish');
    // Since 2026-11-21 the closing story film opens here; it is never mandatory: one tap on 건너뛰기 reaches the ending.
    await page.locator('#modal.story-modal [data-action="story-skip"]').click();
    assert.equal(await page.locator('dialog[open]').count(), 0, 'ending opens without a mandatory video');
    await click('concept', 'p10');
    await page.locator('[data-science-step="2"]:enabled').waitFor();
    await page.locator('[data-science-step="2"]').click();
    await page.waitForFunction(() => {const video=document.querySelector('video');return !video.seeking&&video.readyState>=2&&Math.abs(video.currentTime-10)<.2;});
    await click('close');
    assert.ok(await page.locator('.ending-scene').count());
    if(studentPathOnly){await click('practice-show');await click('practice-choice','waste');await click('close');}
    await click('final-phase', 'certificate'); await reloadReady();
    assert.ok(await page.locator('.cert-paper').count(), 'certificate survives reload');
    const finalSave = await saved();
    await fs.writeFile(path.join(output, 'completed-save.json'), JSON.stringify(finalSave, null, 2));
    assert.equal(finalSave.completed.length, 10);
    assert.equal(finalSave.unlocked, false, 'normal progression without admin unlock');
    if(studentPathOnly){
      await click('go','home');await page.waitForURL('**/#home');
      await page.getByRole('button',{name:/이어\s*하기/}).tap();await page.waitForURL('**/#p10');
      await page.locator('.cert-paper').waitFor();
      assert.equal((await saved()).drafts.p10.practice,'waste','home continue preserves the earned certificate and practice');
      checks.push('home continue restores the earned certificate without teacher unlock');
    }
    checks.push('p10: initial success, one-click shock failure, revised success, ending and certificate reload');
    await page.screenshot({ path: path.join(output, 'certificate.png') });

    if(studentPathOnly){
      await auditFeedback('certificate');
      const pending=page.waitForEvent('download');await click('cert-png');const download=await pending;await download.saveAs(path.join(output,'certificate-export.png'));
      await page.evaluate(()=>document.fonts.ready);
      const pdf=await page.pdf({path:path.join(output,'certificate.pdf'),format:'A4',landscape:true,preferCSSPageSize:true,printBackground:true});
      assert.equal((pdf.toString('latin1').match(/\/Type \/Page\b/g)||[]).length,1,'certificate PDF is one page');
      assert.ok((await fs.stat(path.join(output,'certificate-export.png'))).size>100000,'PNG export is nonempty');
      assert.equal(finalSave.drafts.p10.practice,'waste');assert.equal(finalSave.unlocked,false);
      assert.deepEqual(errors,[]);assert.deepEqual(badRequests,[]);
      const result={mode:'fresh student path; no seed or teacher unlock',checks,completed:finalSave.completed,feedbackLayouts,errors,badRequests,pdfBytes:pdf.length,pngBytes:(await fs.stat(path.join(output,'certificate-export.png'))).size};
      await fs.writeFile(path.join(output,'student-path-result.json'),JSON.stringify(result,null,2));
      console.log(JSON.stringify({mode:result.mode,checks:checks.length,completed:result.completed,layouts:feedbackLayouts.length,errors,badRequests,pdfBytes:result.pdfBytes,pngBytes:result.pngBytes},null,2));return;
    }

    // Concept videos are optional, still playable, and recover to text if media fails.
    for (let i = 1; i <= 10; i++) {
      const id = 'p' + String(i).padStart(2, '0');
      const response = await page.request.get(base + '/assets/concepts/' + id + '.mp4', { headers: { Range: 'bytes=0-127' }, timeout: 90000 });
      // HTTP allows a server to return the full resource for a Range request.
      // Verify exact bytes for either response before testing playback and seeking.
      assert.ok([200,206].includes(response.status()), id + ': readable video response');
      assert.equal(response.headers()['content-type'], 'video/mp4');
      const original = await fs.readFile(path.join(root, 'assets/concepts', id + '.mp4'));
      assert.deepEqual(await response.body(), response.status() === 206 ? original.subarray(0,128) : original);
    }
    await page.goto(base + '/#p03'); await click('concept', 'p03');
    await page.waitForFunction(() => {
      const video = document.querySelector('dialog[open] video');
      return video && video.readyState >= 1 && Math.abs(video.duration - 15) < 0.2;
    });
    await page.waitForFunction(() => document.querySelector('video').currentTime > .15);
    for (const step of [1,2]) {
      await page.locator('[data-science-step="'+step+'"]').click();
      await page.waitForFunction(time => {const video=document.querySelector('video');return !video.seeking&&video.readyState>=2&&Math.abs(video.currentTime-time)<.2;},step*5);
    }
    await click('close');
    await page.route('**/assets/concepts/p03.mp4', request => request.abort()); await click('concept', 'p03');
    await page.waitForFunction(() => document.querySelector('.concept-transcript')?.open === true);
    assert.match(await page.locator('.media-status').innerText(), /불러오지/);
    await click('close'); await page.unroute('**/assets/concepts/p03.mp4');
    await click('mute');
    const soundsBefore = await page.evaluate(() => window.__sounds.length);
    await click('hint'); await click('hint-close');
    assert.equal(await page.evaluate(() => window.__sounds.length), soundsBefore, 'muted effects stay silent');
    await click('concept', 'p03');
    assert.equal(await page.locator('video').evaluate(video => video.muted), true); await click('close');
    await click('settings'); await click('reduced'); await click('close'); await click('concept', 'p03');
    assert.equal(await page.locator('video').evaluate(video => video.autoplay), false); await click('close');
    checks.push('optional 15-second video, ten exact media responses, failure transcript, mute and reduced motion');

    // A timer may advance only while its experiment is the current activity.
    const timerPage = await context.newPage(); watch(timerPage);
    await seed(timerPage, { version: 1, completed: ['p01','p02','p03'], muted: true }, 'p04');
    await timerPage.locator(selector('prediction', 'food')).click();
    await timerPage.locator(selector('go', 'home')).click();
    await timerPage.waitForURL('**/#home');
    const pausedStep = (await savedOn(timerPage)).drafts.p04.step;
    await timerPage.waitForTimeout(2300);
    assert.equal((await savedOn(timerPage)).drafts.p04.step, pausedStep, 'leaving cancels experiment timer');
    await timerPage.goto(base + '/#p04');
    await timerPage.waitForFunction(key => JSON.parse(localStorage.getItem(key)).drafts.p04.step === 2, key);
    await timerPage.locator(selector('experiment-answer', 'leaves')).click();
    assert.ok((await savedOn(timerPage)).completed.includes('p04'));
    await timerPage.locator(selector('remove-role')).click();
    await timerPage.locator(selector('prediction', 'food')).click();
    // Since 2026-11-17 there is no skip button: the second trial runs to the same final observation by itself.
    await timerPage.waitForFunction(key => JSON.parse(localStorage.getItem(key)).drafts.p04.step === 2, key);
    await timerPage.reload();
    assert.equal((await savedOn(timerPage)).drafts.p04.step, 2, 'completed time progression survives reload');
    assert.equal((await savedOn(timerPage)).drafts.p04.log.length, 1, 'replay did not duplicate the previous restore record');
    await timerPage.close();
    checks.push('experiment timer cleanup on exit, resume, skip and reload');

    // Importing an earlier investigated web is optional and still requires a real final trial.
    const importPage = await context.newPage(); watch(importPage);
    const importSave = structuredClone(finalSave);
    importSave.completed = importSave.completed.filter(id => id !== 'p10');
    // A save that has not finished p10 has no p10 record either (markComplete writes both); since F15 a record alone counts as done.
    delete importSave.evidence.p10;
    importSave.drafts.p10 = { phase: 'design', elements: [], edges: [], selected: '', strategies: ['source', 'habitat'], initialized: true, shock: false, tested: false, trials: [] };
    await seed(importPage, importSave, 'p10');
    await importPage.locator(selector('final-import')).click();
    let imported = (await savedOn(importPage)).drafts.p10;
    assert.equal(imported.edges.length, 8);
    assert.ok(['plants', 'grasshopper', 'caterpillar', 'frog', 'sparrow', 'snake'].every(id => imported.elements.includes(id)));
    assert.equal(imported.tested, false);
    assert.ok(!(await savedOn(importPage)).completed.includes('p10'), 'import cannot mark final activity complete');
    const importButton = importPage.locator(selector('final-import'));
    if (await importButton.count() && await importButton.isEnabled()) await importButton.click();
    imported = (await savedOn(importPage)).drafts.p10;
    assert.equal(new Set(imported.edges).size, imported.edges.length, 'repeated import cannot duplicate edges');
    assert.equal(new Set(imported.elements).size, imported.elements.length, 'repeated import cannot duplicate elements');
    await importPage.locator(selector('final-run')).click();
    assert.equal(await importPage.locator(selector('final-shock')).count(), 0, 'import alone lacks environmental and decomposer conditions');
    await importPage.close();
    checks.push('prior web import is idempotent and preserves final trial requirements');

    // Keep mobile emulation isolated from the desktop media/abort fixtures.
    touchBrowser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--disable-gpu', '--disable-crash-reporter', '--disk-cache-dir=' + path.join(root, 'artifacts/tmp/touch-cache')] });
    const touch = await touchBrowser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: true });
    const touchPage = await touch.newPage(); watch(touchPage);
    await seed(touchPage, { version: 1, completed: ['p01'], muted: true }, 'p02');
    const firstCard = touchPage.locator(selector('specimen-pick', 'tree'));
    if (await firstCard.getAttribute('aria-pressed') !== 'true') await firstCard.tap();
    await touchPage.locator(selector('specimen-place', 'living')).tap();
    assert.equal((await savedOn(touchPage)).drafts.p02.groups.tree, 'living');
    assert.equal(await touchPage.locator(selector('specimen-pick', 'frog')).getAttribute('aria-pressed'), 'true');
    await touchPage.locator(selector('specimen-place', 'living')).tap();
    assert.equal((await savedOn(touchPage)).drafts.p02.groups.frog, 'living', 'touch can place the auto-selected next card directly');
    await touch.close(); await touchBrowser.close(); touchBrowser = null;
    checks.push('touchscreen placement and next-card selection at 1024x768');

    // Full stages fit tablets; narrow reflow keeps full-size controls reachable by scrolling.
    await seed(page, finalSave, 'p01');
    const layoutChecks = [];
    for (const viewport of [{ width: 1366, height: 768 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      for (let i = 1; i <= 10; i++) {
        const id = 'p' + String(i).padStart(2, '0');
        await page.goto(base + '/#' + id);
        await page.locator('.activity-page').waitFor(); // screens load on demand since 2026-11-14
        if (id === 'p10') {
          if (await page.locator('.cert-paper').count()) await click('final-phase', 'ending');
          // The ending no longer has a back-to-design button (2026-11-17); open the design phase from the saved record.
          if (await page.locator('.ending-scene').count()) { await page.evaluate(key => { const s = JSON.parse(localStorage.getItem(key)); s.drafts.p10.phase = 'design'; localStorage.setItem(key, JSON.stringify(s)); }, key); await page.reload(); await page.locator('.activity-page').waitFor(); }
        }
        const layout = await page.evaluate(() => ({
          width: innerWidth,
          flow: document.querySelector('#app').classList.contains('activity-flow'),
          height: innerHeight,
          scrollHeight: document.documentElement.scrollHeight,
          scrollWidth: document.documentElement.scrollWidth,
          below: [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().bottom > innerHeight + 2 && getComputedStyle(e).position !== 'fixed').slice(-3).map(e => e.tagName + '.' + [...e.classList].join('.') + ':' + Math.round(e.getBoundingClientRect().bottom)),
          controls: [...document.querySelectorAll('.work-footer button, .experiment-controls button, .design-tabs button, .time-tools button')]
            .filter(button => button.getClientRects().length)
            .map(button => {
              if(document.querySelector('#app').classList.contains('activity-flow'))button.scrollIntoView({block:'center',behavior:'instant'});
              const rect = button.getBoundingClientRect();
              const hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
              return { text: button.textContent.trim(), reachable:button.disabled||button.contains(hit), left: rect.left, right: rect.right, width: rect.width, height: rect.height, top: rect.top, bottom: rect.bottom };
            }),
        }));
        assert.ok(layout.flow || layout.scrollHeight <= layout.height + 2, id + ' vertical overflow at ' + viewport.width + 'x' + viewport.height + ' ' + layout.scrollHeight + ' ' + layout.below.join(' | '));
        assert.ok(layout.scrollWidth <= layout.width + 2, id + ' horizontal overflow at ' + viewport.width + 'x' + viewport.height);
        for (const control of layout.controls) {
          assert.ok(control.left >= -2 && control.right <= layout.width + 2, id + ': control leaves viewport: ' + control.text);
          assert.ok(control.top >= -2 && control.bottom <= layout.height + 2, id + ': control leaves vertical viewport: ' + control.text);
          assert.ok(control.reachable, id + ': covered control: ' + control.text);
          assert.ok(control.width >= 43 && control.height >= 43, id + ': control below touch size: ' + control.text);
        }
        layoutChecks.push(id + '@' + viewport.width + 'x' + viewport.height);
      }
      await page.screenshot({ path: path.join(output, 'final-' + viewport.width + 'x' + viewport.height + '.png') });
    }
    checks.push('all 10 stages at 1366x768, 1280x720, 1024x768, 768x1024 and 390x844: horizontal fit and main touch targets');
    assert.deepEqual(errors, [], 'no uncaught browser errors');
    assert.deepEqual(badRequests, [], 'no HTTP asset errors');
    const result = { checks, completed: finalSave.completed, layoutChecks, errors, badRequests };
    await fs.writeFile(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally {
    if (touchBrowser) await touchBrowser.close();
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exit(1); });
