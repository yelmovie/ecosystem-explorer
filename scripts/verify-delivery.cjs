// Delivery regression for the added design missions and shared entry screens.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const base = process.env.TEST_URL || 'http://127.0.0.1:4294';
const output = path.join(root, 'artifacts/release-20261111', process.env.AUDIT_LABEL || 'delivery');
const sizes = [[1920,1080],[1280,800],[1024,768],[1024,600],[915,412],[768,1024],[390,844]];
const key = 'science-play-14-v1';

async function main() {
  await fs.mkdir(output,{recursive:true});
  const browser = await chromium.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-crash-reporter','--disable-breakpad','--disk-cache-dir='+output+'/cache']});
  const results=[], errors=[], network=[];
  try {
    const context = await browser.newContext({hasTouch:true,reducedMotion:'reduce'});
    const page = await context.newPage();
    page.on('pageerror', error=>errors.push(error.message));
    page.on('response', response=>{if(response.status()>=400)network.push({status:response.status(),url:response.url()});});
    const click = selector=>page.locator(selector).first().click();
    const ready = ()=>page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));});
    async function audit(label) {
      await ready();
      const issues = await page.evaluate(()=>{
        const scope=document.querySelector('dialog[open]')||document.querySelector('#app');
        const issues=[];
        if(document.documentElement.scrollWidth>innerWidth+2)issues.push('horizontal overflow');
        for(const control of scope.querySelectorAll('button,summary,input[type="range"]')){
          if(!control.checkVisibility()||control.closest('details:not([open])')&&control.tagName!=='SUMMARY')continue;
          if(control.closest('.map-world'))continue;
          const box=control.getBoundingClientRect(), text=(control.getAttribute('aria-label')||control.textContent).trim().slice(0,50);
          if(box.width<43||box.height<43)issues.push('small target '+text+' '+box.width+'x'+box.height);
          if(control.disabled)continue;
          control.scrollIntoView({block:'center',behavior:'instant'});
          const rect=control.getBoundingClientRect();
          const hit=document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2);
          if(!hit||!control.contains(hit))issues.push('covered '+text);
        }
        return issues;
      });
      results.push({size:page.viewportSize(),label,issues});
      await page.evaluate(()=>{scrollTo({top:0,behavior:'instant'});document.querySelector('dialog[open]')?.scrollTo({top:0,behavior:'instant'});});
      await page.screenshot({path:path.join(output,label+'-'+page.viewportSize().width+'.png')});
    }
    for(const [width,height] of sizes){
      await page.setViewportSize({width,height});
      await page.goto(base+'/#home');
      await page.evaluate(()=>localStorage.clear());
      await page.reload();
      await audit('home');
      await click('[data-action="settings"]');await audit('settings');await page.keyboard.press('Escape');
      await click('.play-mission-entry');
      await audit('mission-initial');
      for(let level=0;level<3;level++){
        await click('[data-test]');assert.equal(await page.locator('[data-next]').count(),0,'empty plan must fail');
        const items=['plant','insect','frog','fungus',...(level?['water','shade']:[])];
        for(const [cell,item]of items.entries()){
          await click('[data-tool="'+item+'"]');
          assert.equal(await page.evaluate(()=>document.activeElement.dataset.tool),item,'tool retains keyboard focus');
          await page.locator('[data-cell="'+cell+'"]').tap();
        }
        await click('[data-link="insect"]');await click('[data-link="plant"]');
        assert.equal(await page.locator('[data-remove-link]').count(),0,'reversed food arrow rejected');
        for(const [from,to]of [['plant','insect'],['insect','frog']]){await click('[data-link="'+from+'"]');await click('[data-link="'+to+'"]');}
        if(level===0){
          await click('[data-tool="water"]');await click('[data-cell="1"]');
          assert.equal(await page.locator('[data-remove-link]').count(),0,'removing an organism removes dangling arrows');
          await click('[data-undo]');assert.equal(await page.locator('[data-remove-link]').count(),2,'undo restores organisms and arrows');
        }
        if(level===2){
          await click('[data-test]');assert.match(await page.locator('.pm-feedback').innerText(),/수거/);
          await click('[data-clean]');await click('[data-undo]');assert.equal(await page.locator('[data-clean]').getAttribute('aria-pressed'),'false');
          await click('[data-clean]');
        }
        await click('[data-test]');await page.locator('.pm-feedback.good').waitFor();
        await audit('mission-'+(level+1)+'-success');
        if(level<2)await click('[data-next]');
      }
      const saved=await page.evaluate(key=>localStorage.getItem(key),key);
      assert.deepEqual(JSON.parse(saved).won,[0,1,2]);
      await page.keyboard.press('Escape');await page.locator('dialog.play-mission').waitFor({state:'detached'});
      assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('play-mission-entry')),true);
      await page.reload();await click('.play-mission-entry');
      assert.equal(await page.locator('[data-level="2"]').getAttribute('aria-current'),'step');
      await click('[data-test]');await page.locator('.pm-feedback.good').waitFor();await click('[data-close]');
      await page.goto(base+'/#map');await audit('map');
      console.log(width+'x'+height+' design missions passed');
    }
    await page.goto(base+'/#home');
    await page.evaluate(key=>localStorage.setItem(key,'{broken'),key);await click('.play-mission-entry');
    assert.match(await page.locator('.pm-error').innerText(),/保護|보호/);
    await click('[data-cell="0"]');assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),'{broken');await click('[data-close]');
    await page.evaluate(key=>localStorage.removeItem(key),key);await click('.play-mission-entry');await click('[data-cell="0"]');
    const other='{"version":1,"level":0,"plans":[["frog"]]}';
    await page.evaluate(({key,other})=>localStorage.setItem(key,other),{key,other});await click('[data-cell="1"]');
    assert.match(await page.locator('.pm-error').innerText(),/다른 창/);assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),other);await click('[data-close]');
    const allIssues=results.flatMap(row=>row.issues.map(issue=>({size:row.size,label:row.label,issue})));
    await fs.writeFile(path.join(output,'result.json'),JSON.stringify({base,results,errors,network},null,2));
    console.log(JSON.stringify({screens:results.length,issues:allIssues,errors,network}));
    assert.deepEqual(allIssues,[]);assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  } finally {await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
