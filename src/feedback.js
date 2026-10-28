// Feedback only follows committed learning events; it never changes game state.
export function playFeedback(event, reduced = false) {
  if (!event || reduced || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nodes = event.type === 'complete'
    ? [document.querySelector('.activity-complete'), document.querySelector('.evidence-counter')]
    : Array.from(document.querySelectorAll('.web-node')).filter(n => n.dataset.value === event.value);
  for (const node of nodes.filter(Boolean)) {
    const frames=event.type==='complete'
      ? [{boxShadow:'0 0 0 0 #eac55d99'},{boxShadow:'0 0 0 9px #eac55d55'},{boxShadow:'0 0 0 0 #eac55d00'}]
      : [{filter:'brightness(1)'},{filter:'brightness(1.15)',boxShadow:'0 0 0 8px #eac55d88'},{filter:'brightness(1)',boxShadow:'0 4px 0 #72975b25'}];
    node.animate(frames,{duration:event.type==='complete'?650:380,easing:'ease-out'});
  }
}
