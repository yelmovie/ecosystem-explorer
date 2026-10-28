// Pointer events work with fingers, pens and mice. Tap alternatives stay in the UI.
export function mountInteractions({app,applyDrop,connectDrop,onScrub}) {
  let drag=null, suppressedUntil=0;
  const clear=()=>{
    if(!drag)return;
    drag.ghost?.remove();drag.wire?.remove();drag.source.classList.remove('dragging');
    document.querySelectorAll('.drop-ready').forEach(e=>e.classList.remove('drop-ready'));
    try{if(drag.source.hasPointerCapture(drag.id))drag.source.releasePointerCapture(drag.id);}catch{}
    drag=null;
  };
  document.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0||document.querySelector('dialog[open]'))return;
    const source=e.target.closest('[data-drag],button.web-node,.time-scene');
    if(!source||!app.contains(source))return;
    drag={source,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,kind:source.dataset.drag|| (source.classList.contains('time-scene')?'scrub':'edge')};
    source.setPointerCapture(e.pointerId);
    if(drag.kind==='scrub'){e.preventDefault();onScrub(e.clientX,source);}
  });
  document.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    if(drag.kind==='scrub'){onScrub(e.clientX,drag.source);return;}
    if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<9)return;
    e.preventDefault();
    if(!drag.moved){
      drag.moved=true;drag.source.classList.add('dragging');
      if(drag.kind==='edge'){
        const ns='http://www.w3.org/2000/svg';drag.wire=document.createElementNS(ns,'svg');drag.wire.classList.add('drag-wire');
        const line=document.createElementNS(ns,'line');line.setAttribute('x1',drag.x);line.setAttribute('y1',drag.y);drag.wire.append(line);document.body.append(drag.wire);
      }else{
        drag.ghost=drag.source.cloneNode(true);drag.ghost.removeAttribute('id');drag.ghost.className='drag-ghost';drag.ghost.setAttribute('aria-hidden','true');document.body.append(drag.ghost);
      }
    }
    if(drag.ghost){drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';}
    if(drag.wire){drag.wire.firstChild.setAttribute('x2',e.clientX);drag.wire.firstChild.setAttribute('y2',e.clientY);}
    document.querySelectorAll('.drop-ready').forEach(n=>n.classList.remove('drop-ready'));
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop],button.web-node');
    if(target&&target!==drag.source&&(drag.kind==='edge'?target.dataset.action===drag.source.dataset.action:target.dataset.drop===drag.kind))target.classList.add('drop-ready');
  },{passive:false});
  document.addEventListener('pointerup',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    const {source,kind,moved}=drag;
    const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-drop],button.web-node');
    const item=source.dataset.item,action=source.dataset.action,value=source.dataset.value;
    clear();
    if(kind==='scrub'||moved)suppressedUntil=Date.now()+400;
    if(!moved)return;
    if(kind==='edge'&&target&&target!==source&&target.dataset.action===action)connectDrop(value,target.dataset.value,action==='final-edge');
    else if(target?.dataset.drop===kind)applyDrop(kind,item,target.dataset.group);
  });
  document.addEventListener('pointercancel',clear);
  window.addEventListener('hashchange',clear);
  return {isSuppressed:()=>Date.now()<suppressedUntil};
}
