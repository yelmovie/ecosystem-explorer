const base='/assets/map-encounters/';
const story = [
  [
    "이 관찰 표시는 내가 먼저 찾았지!",
    "표지판을 뒤로 숨겨야지!",
    "label"
  ],
  [
    "역할 그림 하나는 빼 두자!",
    "이 끈은 누구 걸까?",
    "flag"
  ],
  [
    "잎과 애벌레를 잇는 줄을 벌려 놨어!",
    "이 줄은 못 이을걸!",
    "wave"
  ],
  [
    "뒤에 있던 표찰을 앞으로!",
    "두 표찰을 또 바꿔 볼까?",
    "flip"
  ],
  [
    "이 매듭은 못 풀걸!",
    "복원 표지 앞에 끈을 더 묶어야지!",
    "plug"
  ]
];
const hit = ["첫 번째 매듭이 풀렸어!", "끈 끝이 풀려 버렸잖아!"], finish = "매듭이 다 풀렸다! 데굴데굴!";
export const encounterLook = {palette:'#c6f496', effect:'thread', art:{left:base+'villain-redraw.png',frames:6}};
export function encounterStage(index,id,name,point){
  const [one,two,prop]=story[index];
  return {id:String(id),name,x:point.x,y:point.y,lines:[one,two],prop,hit,finish};
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
