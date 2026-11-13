const base='/assets/map-encounters/';
const story = [
  ["label", "물은 움직여도 생물이 아닌 걸 알아냈어? 내 움직이는 돌 위장은 실패야!", "그래도 내 돌멩이는 굴러갈 땐 꽤 열심이라고!", "앗, 생물 관찰표가 펼쳐졌어!", "내가 숨긴 햇빛과 물 표시까지 보이잖아!", "흥, 관찰 표지는 제자리에 둘게!"],
  ["flag", "만드는 생물, 먹는 생물, 분해하는 생물을 다 찾았어? 역할표를 훔쳤는데!", "내 역할은 ‘매듭 묶기 담당’이면 되지!", "앗, 뺀 역할 카드가 돌아왔어!", "분해자 표시까지 다시 붙었잖아!", "쳇, 생태계 역할표는 돌려줄게!"],
  ["wave", "풀에서 메뚜기, 개구리로 잇다니! 내가 먹이 화살표를 반대로 돌렸는데!", "메뚜기 길을 막으면 다른 길까지 찾을 셈이야?", "앗, 뒤집은 화살표가 돌아갔어!", "내가 끊어 둔 먹이 길이 다시 이어져!", "흥, 먹이 길은 막지 않을게!"],
  ["flip", "물가가 달라진 원인을 찾아냈어? 내가 전후 표찰을 바꿔 놨는데!", "내 작전의 원인은 비밀이야. 아니, 내 장난이지!", "앗, 물가 비교표가 펼쳐졌어!", "내가 가린 오염 원인이 다 보이잖아!", "쳇, 물가 복원 표지는 똑바로 세울게!"],
  ["plug", "먹이 길이 끊겨도 버티는 생태계를 설계했어? 내 마지막 매듭인데!", "다음엔 너희 작전에 내 매듭도 하나 끼워 줘!", "앗, 복원 표지 앞의 끈이 풀렸어!", "다른 먹이 길까지 다시 이어졌어!", "흥, 매듭은 풀고 갈게. 데굴데굴 퇴장!"],
];
export const encounterLook = {palette:'#c6f496', effect:'thread', art:{left:base+'villain-redraw.png',frames:6}};
export function encounterStage(index,id,name,point){
  const [prop,one,two,hitOne,hitTwo,finish]=story[index];
  return {id:String(id),name,speaker:"매듭 악당",x:point.x,y:point.y,lines:[one,two],prop,hit:[hitOne,hitTwo],finish};
}
export function loadEncounterActor(name){const image=new Image();image.src=base+name+'-redraw.png';return image;}
export function drawEncounterActor(context,image,point,size,pose,{native=-1}={}){
  if(!pose||!image.complete||!image.naturalWidth)return false;
  const cell=image.naturalHeight;
  const index=pose.kind==='attack'?4+Number(pose.frame>0):Math.min(3,pose.frame);
  context.save();
  context.translate(point.x+pose.dx,point.y);
  context.scale(pose.direction*native,1);
  const side=size/.84;
  context.drawImage(image,index*cell,0,cell,cell,-side/2,-side*.935,side,side);
  context.restore();
  return true;
}
