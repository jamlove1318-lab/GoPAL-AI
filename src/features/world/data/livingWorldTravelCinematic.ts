import { getTransportRoutePoints } from './livingWorldTransport';
import { getWorldVehicleRoutes } from './livingWorldVehicles';
import type { WorldTravelMode } from './livingWorldTravel';

export type TravelCinematicPoint={x:number;y:number};

const FALLBACK:Record<WorldTravelMode,TravelCinematicPoint[]>={
 walk:[{x:18,y:55},{x:35,y:52},{x:55,y:48},{x:76,y:44}],
 car:[{x:8,y:60},{x:30,y:56},{x:54,y:52},{x:78,y:47},{x:94,y:43}],
 bus:[{x:8,y:58},{x:30,y:54},{x:52,y:51},{x:75,y:48},{x:94,y:44}],
 train:[{x:5,y:48},{x:28,y:44},{x:52,y:40},{x:76,y:36},{x:94,y:33}],
 plane:[{x:12,y:82},{x:28,y:68},{x:45,y:52},{x:63,y:36},{x:80,y:20},{x:92,y:12}],
 magic:[{x:18,y:62},{x:32,y:55},{x:50,y:48},{x:68,y:41},{x:82,y:34}],
};

function unique(points:TravelCinematicPoint[]){return points.filter((point,index)=>index===0||point.x!==points[index-1].x||point.y!==points[index-1].y);}
function vehicleKind(mode:WorldTravelMode){return mode==='train'||mode==='bus'||mode==='car'?mode:null;}

export function resolveTravelCinematicPath(sourceLocationId:string,mode:WorldTravelMode):TravelCinematicPoint[]{
 if(mode==='plane'){
  const runway=getTransportRoutePoints(sourceLocationId,'runway');
  if(runway.length>=2)return unique(runway);
 }
 const kind=vehicleKind(mode);
 if(kind){
  const route=getWorldVehicleRoutes(sourceLocationId).find(item=>item.kind===kind&&item.waypoints.length>=2);
  if(route)return unique(route.waypoints.map(point=>({x:point.x,y:point.y})));
  if(mode==='train'){
   const track=getTransportRoutePoints(sourceLocationId,'track');
   if(track.length>=2)return unique(track);
  }
 }
 return FALLBACK[mode].map(point=>({...point}));
}

export function sampleTravelCinematicPath(points:TravelCinematicPoint[],progress:number):TravelCinematicPoint{
 if(points.length===0)return{x:50,y:50};
 if(points.length===1)return points[0];
 const p=Math.max(0,Math.min(1,progress))*(points.length-1);
 const index=Math.min(points.length-2,Math.floor(p));
 const t=p-index;
 return{x:points[index].x+(points[index+1].x-points[index].x)*t,y:points[index].y+(points[index+1].y-points[index].y)*t};
}

export function reverseTravelCinematicPath(points:TravelCinematicPoint[]){return points.slice().reverse();}
