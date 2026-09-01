export type ActivityPoint={x:number;y:number};
export type ActivityRect={x:number;y:number;width:number;height:number};
export type ActivityItem={id:string;label:string;position:ActivityPoint;correct?:boolean};

export function distance(a:ActivityPoint,b:ActivityPoint){return Math.hypot(a.x-b.x,a.y-b.y)}
export function isInside(point:ActivityPoint,rect:ActivityRect){return point.x>=rect.x&&point.x<=rect.x+rect.width&&point.y>=rect.y&&point.y<=rect.y+rect.height}
export function nearestItem(point:ActivityPoint,items:ActivityItem[],maxDistance=Infinity){let best:ActivityItem|undefined;let bestDistance=maxDistance;for(const item of items){const d=distance(point,item.position);if(d<bestDistance){best=item;bestDistance=d}}return best}
export function sequenceMatches<T>(selected:T[],expected:T[]){return selected.length===expected.length&&selected.every((value,index)=>value===expected[index])}
export function toggleSelection<T>(items:T[],item:T){return items.includes(item)?items.filter(value=>value!==item):[...items,item]}
export function scoreForAnswer(correct:boolean,base=100){return correct?base:0}
export function advanceIndex(index:number,total:number){return total<=0?0:Math.min(index+1,total-1)}
