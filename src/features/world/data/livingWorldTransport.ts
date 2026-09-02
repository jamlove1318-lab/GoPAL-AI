import type { WorldTheme } from '../components/LivingWorldPrimitives';

export type WorldTransportKind='railway'|'airport';
export type WorldTransportFeatureKind='track'|'platform'|'runway'|'taxiway'|'platform-edge'|'terminal-apron';
export type WorldTransportFeature={id:string;kind:WorldTransportFeatureKind;path:string;width:number;color?:string;edgeColor?:string;edgeWidth?:number;opacity?:number;zIndex?:number;networkId?:string;routePoints?:{x:number;y:number}[]};
export type WorldTransportDefinition={id:string;kind:WorldTransportKind;theme?:WorldTheme;features:WorldTransportFeature[]};
const track=(id:string,path:string,width:number,zIndex:number,color='#b7b1a5',routePoints?:{x:number;y:number}[]):WorldTransportFeature=>({id,kind:'track',path,width,color,zIndex,routePoints});
const runway=(id:string,path:string,width:number,zIndex:number,routePoints?:{x:number;y:number}[]):WorldTransportFeature=>({id,kind:'runway',path,width,color:'#5d6262',edgeColor:'#3e4545',edgeWidth:3,opacity:.92,zIndex,routePoints});

export const LIVING_WORLD_TRANSPORT:Record<string,WorldTransportDefinition[]>={
 'emerald-village':[{id:'emerald-railway',kind:'railway',features:[
  {id:'emerald-rail-bed',kind:'track',path:'M-20 745C75 700 150 665 230 620C300 580 365 560 430 548',width:28,color:'#5b5046',edgeColor:'#3b342f',edgeWidth:3,opacity:.9,zIndex:4,networkId:'emerald-railway'},
  track('emerald-rail-1','M-20 738C75 693 150 658 230 613C300 573 365 553 430 541',3,5,'#b7b1a5',[{x:0,y:93},{x:25,y:87},{x:50,y:82},{x:70,y:75},{x:90,y:68}]),
  track('emerald-rail-2','M-20 752C75 707 150 672 230 627C300 587 365 567 430 555',3,5),
  {id:'emerald-platform',kind:'platform',path:'M275 590C320 568 350 558 382 553',width:32,color:'#c9c0ad',edgeColor:'#817767',edgeWidth:2,zIndex:6,networkId:'emerald-railway'},
  {id:'emerald-platform-edge',kind:'platform-edge',path:'M275 584C320 562 350 552 382 547',width:3,color:'#e8d58f',zIndex:7,networkId:'emerald-railway'},
 ]}],
 'learning-campus':[{id:'campus-airport',kind:'airport',features:[
  runway('campus-runway','M45 120L365 735',92,2,[{x:15,y:12},{x:35,y:30},{x:55,y:50},{x:75,y:70},{x:91,y:91}]),{id:'campus-runway-center',kind:'runway',path:'M70 125L370 705',width:3,color:'#e9dfb5',zIndex:3,networkId:'campus-airport'},
  {id:'campus-taxiway',kind:'taxiway',path:'M190 420C245 405 290 395 345 365',width:34,color:'#777b78',edgeColor:'#4c514f',edgeWidth:2,zIndex:3,networkId:'campus-airport'},
  {id:'campus-apron',kind:'terminal-apron',path:'M105 160C145 180 175 215 195 260',width:58,color:'#666b69',edgeColor:'#454a48',edgeWidth:2,zIndex:3,networkId:'campus-airport'},
 ]}],
 'coastal-town':[{id:'coast-railway',kind:'railway',theme:'coastal',features:[
  {id:'coast-rail-bed',kind:'track',path:'M-20 285C80 270 165 260 250 275C330 290 380 300 430 295',width:25,color:'#5b5046',edgeColor:'#3b342f',edgeWidth:3,opacity:.9,zIndex:4,networkId:'coast-railway'},
  track('coast-rail-1','M-20 279C80 264 165 254 250 269C330 284 380 294 430 289',3,5,'#b7b1a5',[{x:0,y:35},{x:25,y:33},{x:50,y:34},{x:70,y:37},{x:92,y:36}]),track('coast-rail-2','M-20 291C80 276 165 266 250 281C330 296 380 306 430 301',3,5),
  {id:'coast-platform',kind:'platform',path:'M285 275L382 293',width:30,color:'#d0c4ae',edgeColor:'#817767',edgeWidth:2,zIndex:6,networkId:'coast-railway'},
 ]}],
 'scifi-outpost':[{id:'scifi-starport',kind:'airport',theme:'coastal',features:[
  runway('scifi-runway','M35 730L365 155',105,2,[{x:10,y:90},{x:30,y:72},{x:50,y:55},{x:70,y:35},{x:90,y:15}]),{id:'scifi-runway-center',kind:'runway',path:'M48 710L352 175',width:3,color:'#bfe7e7',zIndex:3,networkId:'scifi-starport'},
  {id:'scifi-taxiway',kind:'taxiway',path:'M170 470C225 455 280 440 350 430',width:38,color:'#687270',edgeColor:'#394342',edgeWidth:2,zIndex:3,networkId:'scifi-starport'},
  {id:'scifi-apron',kind:'terminal-apron',path:'M245 360C285 335 330 320 390 325',width:70,color:'#596361',edgeColor:'#343d3c',edgeWidth:3,zIndex:3,networkId:'scifi-starport'},
 ]}],
};

export function getLivingWorldTransport(locationId:string){return LIVING_WORLD_TRANSPORT[locationId]??[];}
export function getTransportFeatures(locationId:string,kind?:WorldTransportFeatureKind){return getLivingWorldTransport(locationId).flatMap(network=>network.features.filter(feature=>!kind||feature.kind===kind));}
export function getTransportRoutePoints(locationId:string,kind?:WorldTransportFeatureKind){return getTransportFeatures(locationId,kind).flatMap(feature=>feature.routePoints??[]);}
