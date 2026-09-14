import type { WorldTheme } from '../components/LivingWorldPrimitives';
import { getLanguageWorldInfrastructure, getLanguageWorldInfrastructureNetworks } from './livingLanguageWorldPhysical';

export type WorldInfrastructureKind =
  | 'road' | 'sidewalk' | 'intersection' | 'bridge' | 'tunnel'
  | 'railway-crossing' | 'traffic-signal' | 'street-light'
  | 'bus-stop' | 'parking' | 'dock' | 'harbor' | 'pier'
  | 'runway' | 'taxiway' | 'helipad' | 'power-line' | 'utility';

export type WorldInfrastructureDefinition = {
  id: string; kind: WorldInfrastructureKind; x: number; y: number;
  width?: number; height?: number; rotation?: number; scale?: number;
  theme?: WorldTheme; label?: string; interactive?: boolean; zIndex?: number; variant?: string;
};
export type WorldInfrastructureNetwork = { id:string; kind:WorldInfrastructureKind; points:{x:number;y:number}[]; width:number; variant?:string; theme?:WorldTheme };

export const infrastructure=(kind:WorldInfrastructureKind,id:string,x:number,y:number,options:Omit<WorldInfrastructureDefinition,'id'|'kind'|'x'|'y'>={}):WorldInfrastructureDefinition=>({id,kind,x,y,...options});
export const infrastructureNetwork=(kind:WorldInfrastructureNetwork['kind'],id:string,points:{x:number;y:number}[],width:number,options:Omit<WorldInfrastructureNetwork,'id'|'kind'|'points'|'width'>={}):WorldInfrastructureNetwork=>({id,kind,points,width,...options});

export const LIVING_WORLD_INFRASTRUCTURE:Record<string,WorldInfrastructureDefinition[]>={
  'emerald-village':[
    infrastructure('bus-stop','emerald-bus-stop',58,53,{label:'Valley Bus Stop',interactive:true,zIndex:18}), infrastructure('railway-crossing','emerald-crossing',45,67,{label:'Rail Crossing',interactive:true,zIndex:18}), infrastructure('bridge','emerald-bridge',42,54,{width:16,height:8,rotation:12,variant:'stone',zIndex:16}), infrastructure('intersection','emerald-intersection',45,51,{width:18,height:18,variant:'village',zIndex:15}), infrastructure('traffic-signal','emerald-signal',48,52,{scale:.8,variant:'village',zIndex:19}), infrastructure('street-light','emerald-lamp-01',64,48,{scale:.8,zIndex:19}), infrastructure('street-light','emerald-lamp-02',52,61,{scale:.8,zIndex:19}), infrastructure('street-light','emerald-lamp-03',32,57,{scale:.7,zIndex:19}), infrastructure('dock','emerald-dock',81,27,{width:13,height:5,rotation:-8,variant:'wood',zIndex:12}), infrastructure('pier','emerald-pier',89,25,{width:7,height:18,rotation:4,variant:'wood',zIndex:11}),
  ],
  'learning-campus':[
    infrastructure('bus-stop','campus-bus-stop',53,57,{label:'Campus Shuttle',interactive:true,zIndex:18}), infrastructure('parking','campus-parking',80,57,{width:18,height:11,variant:'student',zIndex:8}), infrastructure('helipad','campus-helipad',31,19,{scale:.8,variant:'rescue',zIndex:8}), infrastructure('intersection','campus-intersection',52,54,{width:18,height:18,variant:'campus',zIndex:15}), infrastructure('traffic-signal','campus-signal',55,55,{scale:.8,variant:'campus',zIndex:19}), infrastructure('street-light','campus-lamp-01',42,48,{scale:.7,zIndex:19}), infrastructure('street-light','campus-lamp-02',69,56,{scale:.7,zIndex:19}), infrastructure('utility','campus-utility',86,46,{scale:.8,variant:'modern',zIndex:9}),
  ],
  'coastal-town':[
    infrastructure('harbor','coast-harbor',79,74,{scale:1.05,variant:'seaside',zIndex:5}), infrastructure('dock','coast-dock',73,72,{width:20,height:6,rotation:-5,variant:'wood',zIndex:12}), infrastructure('pier','coast-pier',88,63,{width:8,height:22,rotation:2,variant:'wood',zIndex:11}), infrastructure('bridge','coast-bridge',55,57,{width:17,height:8,rotation:-8,variant:'stone',zIndex:16}), infrastructure('bus-stop','coast-bus-stop',43,51,{label:'Coast Bus',interactive:true,zIndex:18}), infrastructure('street-light','coast-lamp-01',32,48,{scale:.75,zIndex:19}), infrastructure('street-light','coast-lamp-02',62,43,{scale:.75,zIndex:19}), infrastructure('railway-crossing','coast-crossing',76,26,{interactive:true,label:'Station Crossing',zIndex:18}),
  ],
  'mountain-village':[
    infrastructure('bridge','mountain-bridge',51,53,{width:16,height:8,rotation:8,variant:'wood',zIndex:16}), infrastructure('tunnel','mountain-tunnel',82,43,{scale:.9,variant:'stone',zIndex:17}), infrastructure('intersection','mountain-intersection',48,58,{width:17,height:17,variant:'mountain',zIndex:15}), infrastructure('bus-stop','mountain-bus-stop',54,69,{label:'Summit Bus',interactive:true,zIndex:18}), infrastructure('street-light','mountain-lamp-01',37,51,{scale:.7,zIndex:19}), infrastructure('street-light','mountain-lamp-02',67,57,{scale:.7,zIndex:19}), infrastructure('power-line','mountain-utility',78,31,{scale:.8,variant:'wooden-poles',zIndex:9}),
  ],
  'fantasy-kingdom':[
    infrastructure('bridge','fantasy-bridge',50,47,{width:19,height:9,rotation:0,variant:'stone-arch',zIndex:16}), infrastructure('intersection','fantasy-crossroads',50,56,{width:20,height:20,variant:'cobblestone',zIndex:15}), infrastructure('street-light','fantasy-lamp-01',38,49,{scale:.8,variant:'lantern',zIndex:19}), infrastructure('street-light','fantasy-lamp-02',63,49,{scale:.8,variant:'lantern',zIndex:19}), infrastructure('bus-stop','fantasy-carriage-stop',76,58,{label:'Carriage Stop',interactive:true,variant:'carriage',zIndex:18}), infrastructure('utility','fantasy-magic-node',84,30,{scale:.8,variant:'crystal',zIndex:9}),
  ],
  'scifi-outpost':[
    infrastructure('intersection','scifi-hub-intersection',50,48,{width:22,height:22,variant:'futuristic',zIndex:15}), infrastructure('bridge','scifi-bridge',50,65,{width:18,height:8,rotation:0,variant:'metal',zIndex:16}), infrastructure('parking','scifi-parking',26,70,{width:20,height:12,variant:'hover',zIndex:8}), infrastructure('helipad','scifi-helipad',78,47,{scale:.8,variant:'landing-pad',zIndex:8}), infrastructure('street-light','scifi-lamp-01',39,44,{scale:.75,variant:'neon',zIndex:19}), infrastructure('street-light','scifi-lamp-02',61,44,{scale:.75,variant:'neon',zIndex:19}), infrastructure('utility','scifi-power-node',87,28,{scale:.9,variant:'reactor',zIndex:9}),
  ],
  'game-arena':[
    infrastructure('intersection','arena-center',50,50,{width:24,height:24,variant:'arena',zIndex:15}), infrastructure('bridge','arena-overpass',50,50,{width:20,height:7,rotation:90,variant:'modular',zIndex:16}), infrastructure('street-light','arena-lamp-01',38,42,{scale:.8,variant:'festival',zIndex:19}), infrastructure('street-light','arena-lamp-02',62,42,{scale:.8,variant:'festival',zIndex:19}), infrastructure('bus-stop','arena-start-gate',50,83,{label:'Game Start',interactive:true,variant:'arena',zIndex:18}), infrastructure('utility','arena-control-node',50,18,{scale:.8,variant:'game',zIndex:9}),
  ],
};

export const LIVING_INFRASTRUCTURE_NETWORKS:Record<string,WorldInfrastructureNetwork[]>={
  'emerald-village':[
    infrastructureNetwork('road','emerald-road-main',[{x:-5,y:62},{x:22,y:56},{x:45,y:51},{x:70,y:43},{x:105,y:40}],24,{variant:'village'}), infrastructureNetwork('road','emerald-road-south',[{x:44,y:51},{x:42,y:72},{x:38,y:96}],18,{variant:'village'}), infrastructureNetwork('sidewalk','emerald-sidewalk',[{x:17,y:57},{x:42,y:51},{x:62,y:46}],7,{variant:'stone'}), infrastructureNetwork('power-line','emerald-power-line',[{x:8,y:28},{x:34,y:35},{x:61,y:29},{x:91,y:34}],2,{variant:'wooden-poles'}),
  ],
  'learning-campus':[
    infrastructureNetwork('road','campus-road-loop',[{x:2,y:54},{x:28,y:50},{x:52,y:53},{x:76,y:58},{x:103,y:55}],22,{variant:'campus'}), infrastructureNetwork('sidewalk','campus-sidewalk',[{x:24,y:50},{x:42,y:40},{x:61,y:47},{x:76,y:58}],7,{variant:'paved'}), infrastructureNetwork('road','campus-access-road',[{x:76,y:58},{x:84,y:72},{x:103,y:79}],15,{variant:'campus'}),
  ],
  'coastal-town':[
    infrastructureNetwork('road','coast-main-road',[{x:-5,y:58},{x:22,y:52},{x:48,y:49},{x:72,y:55},{x:105,y:61}],22,{variant:'coastal'}), infrastructureNetwork('road','coast-harbor-road',[{x:48,y:49},{x:63,y:63},{x:78,y:74}],16,{variant:'coastal'}), infrastructureNetwork('sidewalk','coast-promenade',[{x:12,y:69},{x:37,y:67},{x:59,y:66},{x:79,y:72}],7,{variant:'seaside'}),
  ],
  'mountain-village':[
    infrastructureNetwork('road','mountain-switchback',[{x:-5,y:67},{x:18,y:59},{x:38,y:55},{x:54,y:61},{x:70,y:51},{x:86,y:43},{x:105,y:37}],19,{variant:'mountain'}), infrastructureNetwork('road','mountain-slope-road',[{x:39,y:55},{x:47,y:36},{x:46,y:19}],14,{variant:'mountain'}), infrastructureNetwork('sidewalk','mountain-path',[{x:27,y:70},{x:47,y:62},{x:67,y:58}],6,{variant:'stone'}),
  ],
  'fantasy-kingdom':[
    infrastructureNetwork('road','fantasy-cobble-road',[{x:-5,y:56},{x:24,y:54},{x:50,y:56},{x:76,y:54},{x:105,y:56}],21,{variant:'cobblestone',theme:'festival'}), infrastructureNetwork('road','fantasy-temple-road',[{x:50,y:56},{x:50,y:24}],15,{variant:'cobblestone',theme:'festival'}), infrastructureNetwork('road','fantasy-library-road',[{x:50,y:56},{x:51,y:72}],13,{variant:'cobblestone',theme:'festival'}),
  ],
  'scifi-outpost':[
    infrastructureNetwork('road','scifi-transit-loop',[{x:-5,y:51},{x:25,y:48},{x:50,y:48},{x:75,y:48},{x:105,y:51}],24,{variant:'futuristic',theme:'coastal'}), infrastructureNetwork('road','scifi-spine',[{x:50,y:48},{x:50,y:64},{x:50,y:82}],18,{variant:'futuristic',theme:'coastal'}), infrastructureNetwork('sidewalk','scifi-promenade',[{x:25,y:43},{x:50,y:40},{x:75,y:43}],8,{variant:'metal',theme:'coastal'}),
  ],
  'game-arena':[
    infrastructureNetwork('road','arena-loop',[{x:10,y:28},{x:30,y:20},{x:50,y:25},{x:70,y:20},{x:90,y:28},{x:82,y:52},{x:90,y:76},{x:70,y:84},{x:50,y:78},{x:30,y:84},{x:10,y:76},{x:18,y:52},{x:10,y:28}],16,{variant:'arena',theme:'festival'}), infrastructureNetwork('sidewalk','arena-inner-loop',[{x:25,y:36},{x:50,y:32},{x:75,y:36},{x:68,y:65},{x:50,y:70},{x:32,y:65},{x:25,y:36}],6,{variant:'arena',theme:'festival'}),
  ],
};

export function getWorldInfrastructure(locationId:string){return LIVING_WORLD_INFRASTRUCTURE[locationId]??getLanguageWorldInfrastructure(locationId);}
export function getWorldInfrastructureNetworks(locationId:string){return LIVING_INFRASTRUCTURE_NETWORKS[locationId]??getLanguageWorldInfrastructureNetworks(locationId);}
