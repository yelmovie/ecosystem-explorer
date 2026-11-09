import {bindConceptFocus,emphasizeConcept} from './concept-focus.js';
const vocabulary={p01:['자라','번식','생물','특징'],p02:['생물','비생물 요소','생태계'],p03:['생산자','소비자','분해자','양분'],p04:['분해자','분해','비교'],p05:['먹히는 생물','먹는 생물','화살표'],p06:['먹이 길','물','서식처'],p07:['오염','환경 변화','영향'],p08:['오염원','서식처','같은 조건','전후'],p09:['오염 원인','서식처','비교'],p10:['빛','물','흙','먹이 길','시험','고치는']};
const titles={p01:['살아가는 특징','자라는 생물','여러 특징 관찰'],p02:['생물','비생물 요소','함께 이루는 생태계'],p03:['생산자','소비자','분해자'],p04:['한 역할 변화','분해자의 역할','복원하고 비교'],p05:['풀 → 메뚜기','메뚜기 → 개구리','먹히는 쪽 → 먹는 쪽'],p06:['먹이 길','연결의 변화','서식 환경'],p07:['오염 원인','환경 변화','생물의 영향'],p08:['변화 전','대책 실행','같은 조건 비교'],p09:['한정된 자원','원인과 서식처','대책 비교'],p10:['요소와 먹이 길','변화 시험','고치고 확인']};
export function mountConceptRecall(modal,video,id,clip,reduced){
 modal._conceptRecallCleanup?.();
 const caption=document.createElement('p');caption.className='concept-caption';caption.setAttribute('role','status');caption.setAttribute('aria-live','polite');video.after(caption);
 const controller=new AbortController();let last=-1;
 const update=()=>{const i=Math.min(2,Math.floor(video.currentTime/4));if(i!==last){last=i;caption.innerHTML=emphasizeConcept(clip.lines[i],vocabulary[id]);}};
 video.addEventListener('timeupdate',update,{signal:controller.signal});video.addEventListener('seeked',update,{signal:controller.signal});update();
 const cleanupFocus=bindConceptFocus(modal,video,{steps:titles[id].map((term,i)=>({at:i*4,term})),terms:vocabulary[id],caption,anchor:video,controls:false,reduced});
 if(video.textTracks[0])video.textTracks[0].mode='hidden';
 const cleanup=()=>{controller.abort();cleanupFocus();caption.remove();if(modal._conceptRecallCleanup===cleanup)modal._conceptRecallCleanup=null;};
 modal._conceptRecallCleanup=cleanup;modal.addEventListener('close',cleanup,{once:true,signal:controller.signal});
 return cleanup;
}
