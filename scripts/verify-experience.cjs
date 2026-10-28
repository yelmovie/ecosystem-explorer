// Run against the local source or dist server. Browser tooling stays outside the app.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const base = process.env.TEST_URL || 'http://127.0.0.1:4186';
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'artifacts', 'experience-check');
const key = 'life-web-map:mvp:v1';

async function main() {
  await fs.mkdir(output, { recursive: true });
  await fs.mkdir(path.join(root, 'artifacts', 'tmp'), { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--disable-gpu', '--renderer-process-limit=2'],
    env: { ...process.env, TEMP: path.join(root, 'artifacts/tmp'), TMP: path.join(root, 'artifacts/tmp') },
  });
  const errors = [], badRequests = [], checks = [];
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
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
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
    const click = async (action, value) => { await pick(action, value).click(); };
    const saved = () => savedOn(page);
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
      await click('completion-next', nextId);
      await page.waitForURL('**/#' + nextId);
      checks.push(id + ': last learning action records once, one click continues');
    };

    await page.goto(base + '/#p01');
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
    await click('transfer', 'nonliving');
    assert.ok(!(await saved()).completed.includes('p02'), 'wrong classification cannot auto-complete');
    await click('complete', 'p02');
    assert.ok(!(await saved()).completed.includes('p02'), 'manual validation also rejects the wrong classification');
    await select('specimen-pick', 'water'); await click('specimen-place', 'nonliving');
    await next('p02', 'p03');

    await drag(page.locator('[data-item="producer"]'), page.locator('[data-drop="role"][data-group="producer"]'));
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
    await click('experiment-restore');
    await click('experiment-answer', 'food');
    assert.ok(!(await saved()).completed.includes('p04'), 'incorrect reflection does not complete the experiment');
    await click('experiment-answer', 'leaves');
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
    await page.reload();
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
    await click('time-jump', '0'); await click('time-jump', '100');
    assert.equal((await saved()).drafts.p08.seen.length, 4);
    await page.reload();
    assert.ok(await pick('time-answer', 'evidence').count(), 'four observations restore the inline question');
    await click('time-answer', 'automatic');
    assert.ok(!(await saved()).completed.includes('p08'), 'incorrect time comparison is rejected');
    await click('time-answer', 'evidence');
    await next('p08', 'p09');

    await click('strategy', 'clean'); await click('strategy', 'trees'); await click('strategy-run'); await click('strategy-edit');
    await click('strategy', 'clean'); await click('strategy', 'source'); await click('strategy', 'habitat'); await click('strategy-run');
    assert.equal((await saved()).drafts.p09.history.length, 2, 'different plans keep distinct comparison records');
    await page.reload();
    assert.ok(await pick('strategy-reason', 'habitat').count(), 'executed plan restores its result screen');
    await click('strategy-edit'); await click('strategy-run');
    assert.equal((await saved()).drafts.p09.history.length, 2, 'rerunning the same plan does not duplicate history');
    await click('strategy-reason', 'habitat');
    await next('p09', 'p10');

    await click('final-start');
    await drag(pick('element', 'plants'), page.locator('.final-habitat'));
    for (const id of ['grasshopper', 'frog', 'sparrow', 'snake', 'light', 'water', 'soil', 'fungi']) await click('element', id);
    await click('design-tab', 'connections');
    for (const edge of ['plants>grasshopper', 'grasshopper>frog', 'grasshopper>sparrow', 'frog>snake', 'sparrow>snake']) await connect(edge, true);
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
    assert.equal(await page.locator('dialog[open]').count(), 0, 'ending opens without a mandatory video');
    assert.ok(await page.locator('.ending-scene').count());
    await click('final-phase', 'certificate'); await page.reload();
    assert.ok(await page.locator('.certificate').count(), 'certificate survives reload');
    const finalSave = await saved();
    assert.equal(finalSave.completed.length, 10);
    assert.equal(finalSave.unlocked, false, 'normal progression without admin unlock');
    checks.push('p10: initial success, one-click shock failure, revised success, ending and certificate reload');
    await page.screenshot({ path: path.join(output, 'certificate.png') });

    // Concept videos are optional, still playable, and recover to text if media fails.
    for (let i = 1; i <= 10; i++) {
      const id = 'p' + String(i).padStart(2, '0');
      const response = await page.request.get(base + '/assets/concepts/' + id + '.mp4', { headers: { Range: 'bytes=0-127' } });
      assert.equal(response.status(), 206);
      assert.equal(response.headers()['content-type'], 'video/mp4');
      assert.equal((await response.body()).length, 128);
    }
    await page.goto(base + '/#p03'); await click('concept', 'p03');
    await page.waitForFunction(() => {
      const video = document.querySelector('dialog[open] video');
      return video && video.readyState >= 1 && video.duration > 11.9 && video.duration < 12.2;
    });
    await page.waitForFunction(() => document.querySelector('video').currentTime > .15);
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
    checks.push('optional 12-second video, all byte ranges, failure transcript, mute and reduced motion');

    // A timer may advance only while its experiment is the current activity.
    const timerPage = await context.newPage(); watch(timerPage);
    await seed(timerPage, { version: 1, unlocked: true, muted: true }, 'p04');
    await timerPage.locator(selector('prediction', 'food')).click();
    await timerPage.locator(selector('go', 'home')).click();
    await timerPage.waitForURL('**/#home');
    const pausedStep = (await savedOn(timerPage)).drafts.p04.step;
    await timerPage.waitForTimeout(2300);
    assert.equal((await savedOn(timerPage)).drafts.p04.step, pausedStep, 'leaving cancels experiment timer');
    await timerPage.goto(base + '/#p04');
    await timerPage.waitForFunction(key => JSON.parse(localStorage.getItem(key)).drafts.p04.step === 2, key);
    await timerPage.locator(selector('experiment-restore')).click();
    await timerPage.locator(selector('experiment-answer', 'leaves')).click();
    assert.ok((await savedOn(timerPage)).completed.includes('p04'));
    await timerPage.locator(selector('remove-role')).click();
    await timerPage.locator(selector('prediction', 'food')).click();
    await timerPage.locator(selector('experiment-skip')).click();
    assert.equal((await savedOn(timerPage)).drafts.p04.step, 2, 'skip reaches the same final observation');
    await timerPage.reload();
    assert.equal((await savedOn(timerPage)).drafts.p04.step, 2, 'completed time progression survives reload');
    assert.equal((await savedOn(timerPage)).drafts.p04.log.length, 1, 'replay did not duplicate the previous restore record');
    await timerPage.close();
    checks.push('experiment timer cleanup on exit, resume, skip and reload');

    // Importing an earlier investigated web is optional and still requires a real final trial.
    const importPage = await context.newPage(); watch(importPage);
    const importSave = structuredClone(finalSave);
    importSave.completed = importSave.completed.filter(id => id !== 'p10');
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

    const touch = await browser.newContext({ viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: true });
    const touchPage = await touch.newPage(); watch(touchPage);
    await seed(touchPage, { version: 1, unlocked: true, muted: true }, 'p02');
    const firstCard = touchPage.locator(selector('specimen-pick', 'tree'));
    if (await firstCard.getAttribute('aria-pressed') !== 'true') await firstCard.tap();
    await touchPage.locator(selector('specimen-place', 'living')).tap();
    assert.equal((await savedOn(touchPage)).drafts.p02.groups.tree, 'living');
    assert.equal(await touchPage.locator(selector('specimen-pick', 'frog')).getAttribute('aria-pressed'), 'true');
    await touchPage.locator(selector('specimen-place', 'living')).tap();
    assert.equal((await savedOn(touchPage)).drafts.p02.groups.frog, 'living', 'touch can place the auto-selected next card directly');
    await touch.close();
    checks.push('touchscreen placement and next-card selection at 1024x768');

    // Check every stage at classroom desktop/tablet widths; vertical document scrolling is allowed.
    await seed(page, finalSave, 'p01');
    const layoutChecks = [];
    for (const viewport of [{ width: 1366, height: 768 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
      await page.setViewportSize(viewport);
      for (let i = 1; i <= 10; i++) {
        const id = 'p' + String(i).padStart(2, '0');
        await page.goto(base + '/#' + id);
        if (id === 'p10') {
          if (await page.locator('.certificate').count()) await click('final-phase', 'ending');
          if (await page.locator('.ending-scene').count()) await click('final-phase', 'design');
        }
        const layout = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          controls: [...document.querySelectorAll('.work-footer button, .experiment-controls button, .design-tabs button, .time-tools button')]
            .filter(button => button.getClientRects().length)
            .map(button => {
              const rect = button.getBoundingClientRect();
              return { text: button.textContent.trim(), left: rect.left, right: rect.right, width: rect.width, height: rect.height };
            }),
        }));
        assert.ok(layout.scrollWidth <= layout.width + 2, id + ' horizontal overflow at ' + viewport.width + 'x' + viewport.height);
        for (const control of layout.controls) {
          assert.ok(control.left >= -2 && control.right <= layout.width + 2, id + ': control leaves viewport: ' + control.text);
          assert.ok(control.width >= 44 && control.height >= 44, id + ': control below touch size: ' + control.text);
        }
        layoutChecks.push(id + '@' + viewport.width + 'x' + viewport.height);
      }
      await page.screenshot({ path: path.join(output, 'final-' + viewport.width + 'x' + viewport.height + '.png') });
    }
    checks.push('all 10 stages at 1366x768, 1280x720 and 1024x768: horizontal fit and main touch targets');
    assert.deepEqual(errors, [], 'no uncaught browser errors');
    assert.deepEqual(badRequests, [], 'no HTTP asset errors');
    const result = { checks, completed: finalSave.completed, layoutChecks, errors, badRequests };
    await fs.writeFile(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exit(1); });
