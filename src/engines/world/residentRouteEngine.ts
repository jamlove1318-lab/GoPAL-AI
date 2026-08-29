export type WorldPoint={x:number;y:number}; export type ResidentRoute={id:string;points:WorldPoint[];};
const DESTINATIONS:Record<string,WorldPoint>={cozy_cafe:{x:48,y:38},whispering_library:{x:70,y:21},lantern_market:{x:76,y:64},zen_garden:{x:34,y:76},study_room:{x:13,y:59}};
const APPROACHES:Record<string,WorldPoint[]>={ren:[{x:24,y:61},{x:34,y:53},{x:41,y:45}],emi:[{x:93,y:9},{x:84,y:13},{x:77,y:17}],kenji:[{x:93,y:82},{x:86,y:74},{x:80,y:68}]};
export function routeForResident(residentId:string,locationKey:string):ResidentRoute{const destination=DESTINATIONS[locationKey]??{x:50,y:50};const approach=APPROACHES[residentId]??[{x:8,y:82},{x:20,y:70}];return{id:`${residentId}:${locationKey}`,points:[...approach,destination]};}
export function relativeRoute(route:ResidentRoute){const destination=route.points[route.points.length-1];return route.points.map(point=>({x:point.x-destination.x,y:point.y-destination.y}));}
