import { observations } from './data.js';
import { finalCheck } from './engine.js';

// Plans contain only observation and experiment controls, never answer actions.
const pause=message=>({kind:'pause',message});
const action=(name,value='',message='관찰 중')=>({kind:'action',action:name,value:String(value),message});
export const playbackDelay=speed=>900/([.5,1,2].includes(speed)?speed:1);

export function playbackStep(id,d,cursor=0){
  if(!d)return pause('활동을 열어 줘');
  switch(id){
    case'p01':{
      if(d.current&&!d.found.includes(d.current))return pause('설명을 고를 차례');
      const next=observations.find(o=>!d.found.includes(o.id));
      return next?action('observe',next.id):pause('관찰 완료');
    }
    case'p02':case'p03':case'p05':case'p07':return pause('직접 선택하는 활동');
    case'p04':
      if(!d.ran)return pause('예상을 먼저 골라 줘');
      if(d.step<2)return action('experiment-advance',d.step+1,'시간 변화 관찰 중');
      if(!d.restored)return action('experiment-restore','','복원해서 비교 중');
      return pause('관찰 기록을 고를 차례');
    case'p06':{
      const conditions=['grasshopper','','frog',''];
      return cursor<conditions.length?action('compare-remove',conditions[cursor],cursor%2?'기준 상태로 복원':'같은 생물 제거 중'):pause('까닭을 고를 차례');
    }
    case'p08':{
      const positions=[0,25,50,75,100];
      if(cursor>=12)return pause('비교 결과를 고를 차례');
      const step=cursor%6,policy=cursor<6?'neglect':'protect';
      return step===0?action('time-policy',policy,'관찰 조건 바꾸는 중'):action('time-jump',positions[step-1],'물가의 전후 관찰 중');
    }
    case'p09':
      if(!d.selected.length)return pause('대책을 먼저 골라 줘');
      return !d.ran?action('strategy-run','','내 작전 실행 중'):pause('선택한 이유를 고를 차례');
    case'p10':
      if(d.phase!=='design')return pause('설계 화면에서 시험해');
      if(!d.elements.length)return pause('생태계를 먼저 설계해');
      if(!d.tested)return action('final-run','','내 생태계 시험 중');
      if(!finalCheck(d).success)return pause('설계를 고칠 차례');
      if(!d.shock)return action('final-shock','','메뚜기 부재 시험 중');
      return pause('시험 완료 · 결과를 확인해');
    default:return pause('직접 탐험해 봐');
  }
}
