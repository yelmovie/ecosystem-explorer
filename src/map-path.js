// Coordinates are traced against the visible walkways of ecology-map-v3.webp.
export const W = 960, H = 540;
const artPoint = ([x,y]) => ({ x:x/1672*W, y:y/941*H });
export const PLAZA = artPoint([814,469]);
const artRoutes = [
  [[814,469],[729,487],[627,511],[544,542],[471,589],[405,621],[323,632]],
  [[814,469],[762,421],[704,360],[649,302],[619,260],[623,233]],
  [[814,469],[880,432],[927,408],[973,374],[1034,346],[1095,329],[1166,311],[1190,299]],
  [[814,469],[903,492],[997,529],[1099,574],[1182,615],[1261,638],[1340,641]],
  [[814,469],[812,535],[813,573],[814,602]],
];
const routes = artRoutes.map(path=>path.map(artPoint));
const markers = [[322,449],[623,112],[1191,170],[1340,472],[815,705]].map(artPoint);
export const door = i => routes[i]?.at(-1);
export const markerPosition = i => ({ left:markers[i].x/W*100, top:markers[i].y/H*100 });
const segments = routes.flatMap((path,branch)=>path.slice(1).map((b,i)=>({a:path[i],b,branch,i})));
const radius = s => s.branch===2&&s.i>=2&&s.i<=4 ? 12 : 15;
const pointOnSegment = (p,{a,b}) => {
  const dx=b.x-a.x,dy=b.y-a.y;
  const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));
  const x=a.x+dx*t,y=a.y+dy*t;
  return {x,y,dist:Math.hypot(x-p.x,y-p.y)};
};
function nearest(p) {
  return segments.reduce((best,segment)=>{
    const hit=pointOnSegment(p,segment);
    return hit.dist<best.dist?{...hit,segment}:best;
  },{dist:Infinity});
}
export function walkable(p) {
  return Math.hypot(p.x-PLAZA.x,p.y-PLAZA.y)<26 ||
    segments.some(segment=>pointOnSegment(p,segment).dist<=radius(segment));
}
const within = ({x,y})=>({x,y});
export function routeOnPaths(from,target,{exact=false}={}) {
  const a=nearest(from),b=nearest(target);
  if(!exact&&b.dist>38&&!walkable(target))return [];
  const end=exact?target:within(b);
  if(a.segment.branch===b.segment.branch){
    const path=routes[a.segment.branch],i=a.segment.i,j=b.segment.i;
    const between=i<j?path.slice(i+1,j+1):i>j?path.slice(j+1,i+1).reverse():[];
    return [within(a),...between,end];
  }
  const up=routes[a.segment.branch].slice(0,a.segment.i+1).reverse();
  const down=routes[b.segment.branch].slice(1,b.segment.i+1);
  return [within(a),...up,...down,end];
}
