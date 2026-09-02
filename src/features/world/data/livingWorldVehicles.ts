import type { WorldTheme } from '../components/LivingWorldPrimitives';
import { getTransportRoutePoints } from './livingWorldTransport';
export type WorldVehicleKind='train'|'bus'|'car'|'bicycle'|'boat'|'airplane';
export type WorldVehicleWaypoint={x:number;y:number;waitMs?:number};
export type WorldVehicleDefinition={id:string;kind:WorldVehicleKind;x:number;y:number;scale?:number;rotation?:number;theme?:WorldTheme;routeId?:string;speed?:number;moving?:boolean;interactive?:boolean;label?:string;networkId?:string};
export type WorldVehicleRoute={id:string;kind:WorldVehicleKind;waypoints:WorldVehicleWaypoint[];loop?:boolean;speed:number;networkId?:string};
const networkWaypoints=(locationId:string,kind:'track'|'runway')=>getTransportRoutePoints(locationId,kind);
const route=(id:string,kind:WorldVehicleKind,speed:number,waypoints:WorldVehicleWaypoint[],networkId?:string):WorldVehicleRoute=>({id,kind,speed,loop:true,waypoints,networkId});
export const LIVING_WORLD_VEHICLES:Record<string,WorldVehicleDefinition[]>={
 'emerald-village':[{id:'emerald-train-01',kind:'train',x:18,y:45,scale:.9,theme:'emerald',routeId:'emerald-rail-loop',speed:.45,moving:true,interactive:true,label:'Valley Train',networkId:'emerald-railway'},{id:'emerald-bus-01',kind:'bus',x:59,y:53,scale:.8,theme:'emerald',routeId:'emerald-bus-loop',speed:.35,moving:true,interactive:true,label:'Village Bus',networkId:'emerald-road-main'}],
 'learning-campus':[{id:'campus-shuttle-01',kind:'bus',x:53,y:57,scale:.8,theme:'emerald',routeId:'campus-shuttle-loop',speed:.3,moving:true,interactive:true,label:'Campus Shuttle',networkId:'campus-road-loop'},{id:'campus-aircraft-01',kind:'airplane',x:18,y:24,scale:.65,rotation:8,theme:'coastal',label:'Training Aircraft',networkId:'campus-airport'}],
 'coastal-town':[{id:'coast-bus-01',kind:'bus',x:42,y:51,scale:.8,theme:'coastal',routeId:'coast-bus-loop',speed:.32,moving:true,interactive:true,label:'Coast Bus',networkId:'coast-main-road'},{id:'coast-boat-01',kind:'boat',x:82,y:72,scale:.7,theme:'coastal',routeId:'coast-boat-loop',speed:.22,moving:true,interactive:true,label:'Harbor Boat',networkId:'coast-harbor-road'}],
 'mountain-village':[{id:'mountain-bus-01',kind:'bus',x:53,y:69,scale:.78,theme:'mountain',routeId:'mountain-bus-loop',speed:.26,moving:true,interactive:true,label:'Summit Bus',networkId:'mountain-switchback'}],
 'fantasy-kingdom':[{id:'fantasy-carriage-01',kind:'car',x:75,y:58,scale:.72,theme:'festival',routeId:'fantasy-carriage-loop',speed:.24,moving:true,interactive:true,label:'Royal Carriage',networkId:'fantasy-cobble-road'}],
 'scifi-outpost':[{id:'scifi-shuttle-01',kind:'bus',x:50,y:48,scale:.78,theme:'coastal',routeId:'scifi-shuttle-loop',speed:.34,moving:true,interactive:true,label:'Transit Shuttle',networkId:'scifi-transit-loop'},{id:'scifi-aircraft-01',kind:'airplane',x:72,y:34,scale:.62,rotation:-25,theme:'coastal',label:'Starcraft',networkId:'scifi-starport'}],
 'game-arena':[{id:'arena-ride-01',kind:'car',x:18,y:28,scale:.68,theme:'festival',routeId:'arena-ride-loop',speed:.5,moving:true,interactive:true,label:'Arena Ride',networkId:'arena-loop'}],
};
const transportFallback=(locationId:string,kind:'track'|'runway',fallback:WorldVehicleWaypoint[])=>{const points=networkWaypoints(locationId,kind);return points.length>=2?points.map(point=>({x:point.x,y:point.y})):fallback;};
export const LIVING_WORLD_VEHICLE_ROUTES:Record<string,WorldVehicleRoute[]>={
 'emerald-village':[route('emerald-rail-loop','train',.45,transportFallback('emerald-village','track',[{x:5,y:43},{x:28,y:40},{x:55,y:38},{x:82,y:34},{x:105,y:32,waitMs:500}]),'emerald-railway'),route('emerald-bus-loop','bus',.35,[{x:8,y:60},{x:30,y:56},{x:54,y:52},{x:78,y:46},{x:101,y:42,waitMs:700}],'emerald-road-main')],
 'learning-campus':[route('campus-shuttle-loop','bus',.3,[{x:4,y:54},{x:30,y:50},{x:53,y:53},{x:78,y:58},{x:103,y:55,waitMs:600}],'campus-road-loop')],
 'coastal-town':[route('coast-bus-loop','bus',.32,[{x:4,y:58},{x:25,y:52},{x:49,y:49},{x:72,y:55},{x:103,y:61,waitMs:700}],'coast-main-road'),route('coast-boat-loop','boat',.22,[{x:72,y:75},{x:82,y:70},{x:92,y:64},{x:86,y:58},{x:76,y:66,waitMs:900}],'coast-harbor-road')],
 'mountain-village':[route('mountain-bus-loop','bus',.26,[{x:5,y:67},{x:25,y:59},{x:47,y:61},{x:70,y:51},{x:96,y:39,waitMs:900}],'mountain-switchback')],
 'fantasy-kingdom':[route('fantasy-carriage-loop','car',.24,[{x:8,y:56},{x:28,y:54},{x:50,y:56},{x:75,y:54},{x:98,y:56,waitMs:700}],'fantasy-cobble-road')],
 'scifi-outpost':[route('scifi-shuttle-loop','bus',.34,[{x:5,y:51},{x:25,y:48},{x:50,y:48},{x:75,y:48},{x:98,y:51,waitMs:500}],'scifi-transit-loop')],
 'game-arena':[route('arena-ride-loop','car',.5,[{x:10,y:28},{x:30,y:20},{x:50,y:25},{x:70,y:20},{x:90,y:28},{x:82,y:52},{x:90,y:76},{x:70,y:84},{x:50,y:78},{x:30,y:84},{x:10,y:76},{x:18,y:52}],'arena-loop')],
};
export function getWorldVehicles(locationId:string){return LIVING_WORLD_VEHICLES[locationId]??[];}
export function getWorldVehicleRoutes(locationId:string){return LIVING_WORLD_VEHICLE_ROUTES[locationId]??[];}
