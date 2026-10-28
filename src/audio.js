// Kenney Interface Sounds, CC0. One voice at a time; media always takes priority.
const files = { tap:'click_003', discover:'pluck_001', connect:'drop_003', success:'confirmation_002', error:'error_001', hint:'maximize_001', experiment:'switch_002' };
let current, muted = false, mediaActive = false, last = 0;
export function configureAudio(value) { muted=value; if(muted) stopAudio(); }
export function stopAudio() { if(current){current.pause();current.currentTime=0;} }
export function mediaPriority(value) { mediaActive=value; if(value)stopAudio(); }
export function playSound(kind='tap') {
  if(muted||mediaActive||Date.now()-last<75) return;
  last=Date.now();stopAudio();
  current=new Audio(`./assets/audio/${files[kind]||files.tap}.mp3`);
  current.volume=kind==='success'?.38:kind==='error'?.18:.25;
  current.play().catch(()=>{});
}
