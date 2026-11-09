// Browser-only layout audit; all output and browser temporary data stay on the SSD.
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'artifacts/responsive-check', process.env.AUDIT_LABEL || 'after');
const base = process.env.TEST_URL || 'http://127.0.0.1:4194';
const sizes = process.env.SIZES ? process.env.SIZES.split(',').map(s=>s.split('x').map(Number)) : process.env.QUICK ? [[1024,600],[360,740]] : [[1920,1080],[1366,768],[1280,800],[1024,600],[740,360],[800,270],[360,740]];

async function audit() {
  const issues = [];
  const visible = el => {
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0;
  };
  const overlaps = (a,b) => Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
  const label = el => (el.getAttribute('aria-label') || el.textContent).trim().slice(0,70);
  const scale=Number(getComputedStyle(document.querySelector('#app')).getPropertyValue('--stage-scale'))||1;
  if(document.documentElement.scrollHeight>innerHeight+2)issues.push({kind:'vertical-scroll',height:document.documentElement.scrollHeight});
  if (document.documentElement.scrollWidth > innerWidth + 2) issues.push({kind:'horizontal-overflow',width:document.documentElement.scrollWidth});
  for (const el of document.querySelectorAll('button,summary,input[type="range"]')) {
    if (!visible(el) || el.closest('details:not([open])') && el.tagName !== 'SUMMARY' || el.classList.contains('skip')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 44*scale-1 || r.height < 44*scale-1) issues.push({kind:'small-control',text:label(el),w:r.width,h:r.height});
    if (r.left < -2 || r.right > innerWidth + 2 || r.top < -2 || r.bottom > innerHeight+2) {
      // Map markers intentionally belong to a pannable world, outside the viewport.
      if (!el.closest('.map-world')) issues.push({kind:'control-outside',text:label(el),left:r.left,right:r.right});
    }
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textRects = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent.trim() || node.parentElement.closest('svg,.sr-only') || !visible(node.parentElement)) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      for (const tr of range.getClientRects()) {
        textRects.push(tr);
        if (tr.left < r.left - 2 || tr.right > r.right + 2 || tr.top < r.top - 2 || tr.bottom > r.bottom + 2) issues.push({kind:'text-outside-control',text:label(el)});
      }
    }
    for (const art of el.querySelectorAll('img,svg.icon,.choice-dot')) {
      if (visible(art) && textRects.some(t=>overlaps(t,art.getBoundingClientRect()))) issues.push({kind:'text-icon-overlap',text:label(el)});
    }
  }
  for (const board of document.querySelectorAll('.food-web,.observe-scene')) {
    const r = board.getBoundingClientRect();
    const nodes = [...board.querySelectorAll('.web-node,.hotspot')];
    for (let i=0;i<nodes.length;i++) {
      const a=nodes[i].getBoundingClientRect();
      if(a.left<r.left-2||a.right>r.right+2||a.top<r.top-2||a.bottom>r.bottom+2)issues.push({kind:'scene-label-clipped',text:label(nodes[i])});
      for(let j=i+1;j<nodes.length;j++)if(overlaps(a,nodes[j].getBoundingClientRect()))issues.push({kind:'scene-nodes-overlap',text:label(nodes[i])+' / '+label(nodes[j])});
    }
  }
  for(const img of document.images)if(visible(img)&&(!img.complete||!img.naturalWidth))issues.push({kind:'broken-image',src:img.getAttribute('src')});
  for(const el of document.querySelectorAll('.work-area,.experiment-controls,.element-palette,.observation-note,.work-area .choices')){
    const style=getComputedStyle(el);
    if(visible(el)&&/auto|scroll/.test(style.overflowY)&&el.scrollHeight>el.clientHeight+2)issues.push({kind:'internal-scroll',class:el.className,over:el.scrollHeight-el.clientHeight});
  }
  const walker=document.createTreeWalker(document.querySelector('.activity-page'),NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode,el=node.parentElement;
    if(!node.textContent.trim()||!visible(el)||el.closest('svg,.sr-only,details:not([open])>*:not(summary)'))continue;
    const range=document.createRange();range.selectNodeContents(node);const rect=range.getBoundingClientRect();
    let parent=el;
    while(parent&&parent!==document.body){
      const style=getComputedStyle(parent);
      if(/hidden|clip/.test(style.overflow+style.overflowY)){const box=parent.getBoundingClientRect();if(rect.top<box.top-2||rect.bottom>box.bottom+2||rect.left<box.left-2||rect.right>box.right+2){issues.push({kind:'clipped-text',text:node.textContent.trim().slice(0,60),parent:parent.className});break;}}
      parent=parent.parentElement;
    }
  }
  // Hit testing also catches an apparently valid button hidden behind another panel.
  const originalScroll=scrollY;
  for(const el of document.querySelectorAll('.activity-page button,.activity-page summary,.activity-page input')){
    if(!visible(el)||el.disabled||el.closest('details:not([open])')&&el.tagName!=='SUMMARY')continue;
    if(document.querySelector('dialog[open]')&&!el.closest('dialog'))continue;
    const r=el.getBoundingClientRect(),x=Math.max(1,Math.min(innerWidth-1,r.left+r.width/2)),y=Math.max(1,Math.min(innerHeight-1,r.top+r.height/2));
    const hit=document.elementFromPoint(x,y);
    if(!hit||!el.contains(hit))issues.push({kind:'control-covered',text:label(el),by:hit?.className?.baseVal||hit?.className||null});
  }
  scrollTo({top:originalScroll,behavior:'instant'});
  return [...new Map(issues.map(v=>[JSON.stringify(v),v])).values()];
}

async function main() {
  await fs.mkdir(output,{recursive:true});
  const { initialState }=await import(pathToFileURL(path.join(root,'src/engine.js')));
  const { foodEdges, organisms }=await import(pathToFileURL(path.join(root,'src/data.js')));
  const scenarios=[];
  const add=(id,name,change=()=>{})=>{
    const record=initialState();
    record.completed=Array.from({length:Number(id.slice(1))-1},(_,i)=>'p'+String(i+1).padStart(2,'0'));
    record.muted=true;record.reduced=true;change(record);
    scenarios.push({id,name,record});
  };
  for(let i=1;i<=10;i++)add('p'+String(i).padStart(2,'0'),'initial');
  if(!process.env.QUICK){
    add('p01','note',s=>s.drafts.p01.current='mushroom');
    add('p02','placed',s=>{s.drafts.p02.groups={tree:'living',frog:'living',mushroom:'living',water:'nonliving',sun:'nonliving',soil:'nonliving'};});
    add('p03','placed',s=>s.drafts.p03.roles={producer:'producer',consumer:'consumer',decomposer:'decomposer'});
    add('p03','wrong-two',s=>s.drafts.p03.roles={producer:'consumer',consumer:'consumer'});
    add('p03','wrong-all',s=>s.drafts.p03.roles={producer:'consumer',consumer:'consumer',decomposer:'consumer'});
    add('p02','wrong-all',s=>s.drafts.p02.groups={tree:'living',frog:'living',mushroom:'living',water:'living',sun:'living',soil:'living'});
    add('p04','result',s=>Object.assign(s.drafts.p04,{ran:true,step:2,prediction:'leaves',removed:'decomposer'}));
    add('p04','restored',s=>Object.assign(s.drafts.p04,{ran:true,step:2,prediction:'leaves',restored:true}));
    add('p05','connected',s=>s.drafts.p05.edges=[...foodEdges]);
    add('p06','removed',s=>Object.assign(s.drafts.p06,{removed:'grasshopper',tested:['grasshopper']}));
    add('p08','reflection',s=>s.drafts.p08.seen=['neglect:before','neglect:after','protect:before','protect:after']);
    add('p09','result',s=>Object.assign(s.drafts.p09,{selected:['source','habitat','trees'],ran:true}));
    add('p10','design',s=>Object.assign(s.drafts.p10,{phase:'design',initialized:true,elements:[...organisms.map(o=>o.id),'light','water','soil','fungi'],edges:[...foodEdges],strategies:['source','habitat']}));
    add('p10','diagnosis',s=>Object.assign(s.drafts.p10,{phase:'design',initialized:true,elements:['plants','frog'],edges:[],strategies:[],tested:true}));
    for(const tab of ['connections','policies'])add('p10',tab,s=>Object.assign(s.drafts.p10,{phase:'design',initialized:true,elements:[...organisms.map(o=>o.id),'light','water','soil','fungi'],edges:[...foodEdges],strategies:['source','habitat']}));
    for(const phase of ['ending','certificate'])add('p10',phase,s=>{s.completed.push('p10');Object.assign(s.drafts.p10,{phase,initialized:true,tested:true,shock:true,elements:[...organisms.map(o=>o.id),'light','water','soil','fungi'],edges:[...foodEdges],strategies:['source','habitat']});});
  }
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-gpu','--disable-crash-reporter','--disk-cache-dir='+path.join(root,'artifacts/responsive-check/cache'),'--crash-dumps-dir='+path.join(root,'artifacts/responsive-check/tmp')]});
  const errors=[],results=[];
  try{
    const context=await browser.newContext({reducedMotion:'reduce'});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/#home');
    for(const [width,height]of sizes){
      await page.setViewportSize({width,height});
      for(const scenario of scenarios.filter(s=>!process.env.ONLY||s.id===process.env.ONLY)){
        await page.evaluate(record=>localStorage.setItem('life-web-map:mvp:v1',JSON.stringify(record)),scenario.record);
        await page.goto(base+'/?layout='+scenario.id+'-'+scenario.name+'#'+scenario.id);
        await page.locator('.work-area').waitFor();
        if(scenario.name==='connections'||scenario.name==='policies')await page.locator('[data-action="design-tab"][data-value="'+scenario.name+'"]').click();
        await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));});
        if(scenario.name==='reflection'&&!await page.locator('.time-reflection .reflection').count())throw new Error('P08 reflection state did not render');
        if(scenario.name==='design'&&!await page.locator('.final-layout').count())throw new Error('P10 design state did not render');
        if(scenario.name==='ending'&&!await page.locator('.ending-scene').count())throw new Error('P10 ending state did not render');
        if(scenario.name==='certificate'&&!await page.locator('.certificate').count())throw new Error('P10 certificate state did not render');
        const issues=await page.evaluate(audit);
        results.push({viewport:width+'x'+height,stage:scenario.id,state:scenario.name,issues});
        if(process.env.SHOTS==='all'||height===600||width===360&&['p01','p05','p06','p09','p10'].includes(scenario.id))await page.screenshot({path:path.join(output,scenario.id+'-'+scenario.name+'-'+width+'x'+height+'.png'),fullPage:true});
      }
      console.log(width+'x'+height+': '+results.filter(r=>r.viewport===width+'x'+height).reduce((n,r)=>n+r.issues.length,0)+' issues');
    }
    await page.setViewportSize({width:360,height:740});await page.goto(base+'/#p01');
    await page.locator('[data-action="hint"]').click();
    const hintBox=await page.locator('dialog').boundingBox();
    results.push({viewport:'360x740',stage:'p01',state:'hint-open',issues:hintBox&&hintBox.x>=0&&hintBox.y>=0?[]:[{kind:'hint-modal-outside'}]});
    await page.screenshot({path:path.join(output,'hint-mobile.png'),fullPage:true});
    await fs.writeFile(path.join(output,'result.json'),JSON.stringify({results,errors},null,2));
    const count=results.reduce((n,r)=>n+r.issues.length,0);console.log(JSON.stringify({screens:results.length,issues:count,errors,output}));
    if(count||errors.length)process.exitCode=1;
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
