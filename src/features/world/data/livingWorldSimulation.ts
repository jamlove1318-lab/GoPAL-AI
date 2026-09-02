import type { WorldCharacterDefinition } from './livingWorldCharacters';
import { getWorldCharacters, getWorldSpawnPoints } from './livingWorldCharacters';
import { getWorldBehavior, getCharacterBehavior } from './livingWorldBehavior';
import type { WorldVehicleDefinition, WorldVehicleRoute } from './livingWorldVehicles';
import { getWorldVehicles, getWorldVehicleRoutes } from './livingWorldVehicles';
import type { WorldObjectDefinition } from './livingWorldObjects';
import { worldDepth } from '../geometry/livingWorldGeometry';

export type SimulatedActor = { id:string; role:string; x:number; y:number; rotation?:number; scale?:number; behaviorId?:string; targetIndex?:number; waitingUntil?:number; active:boolean };
export type LivingWorldSimulationSnapshot = { time:number; hour:number; actors:SimulatedActor[] };

type RouteState = { index:number; waitingUntil:number };
const distance=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,(a.y-b.y)*.92);
const moveToward=(actor:SimulatedActor,target:{x:number;y:number},amount:number)=>{const dx=target.x-actor.x,dy=target.y-actor.y,d=Math.hypot(dx,dy);if(d<=amount)return{...target};return{x:actor.x+dx/d*amount,y:actor.y+dy/d*amount};};

/** UI-independent simulation for NPCs and vehicles. Rendering consumes snapshots; it never owns simulation state. */
export class LivingWorldSimulation {
  private actors:SimulatedActor[]=[];
  private routes:Record<string,WorldVehicleRoute>={};
  private routeStates:Record<string,RouteState>={};
  private elapsed=0;
  private readonly seed:number;
  constructor(private readonly locationId:string,seed=1){this.seed=seed;this.reset();}
  reset(){
    this.elapsed=0;this.actors=[];this.routeStates={};
    for(const vehicle of getWorldVehicles(this.locationId)) this.addVehicle(vehicle);
    for(const point of getWorldSpawnPoints(this.locationId)) for(let i=0;i<(point.maxCount??1);i++){
      const spread=((i*37+this.seed*13)%100)/100;
      this.actors.push({id:`${point.id}:${i}`,role:point.role,x:point.x+(spread-.5)*10,y:point.y+(((i*17)%100)/100-.5)*7,behaviorId:'resident-wander',targetIndex:0,active:true});
    }
    for(const route of getWorldVehicleRoutes(this.locationId))this.routes[route.id]=route;
  }
  private addVehicle(vehicle:WorldVehicleDefinition){this.actors.push({id:vehicle.id,role:`vehicle:${vehicle.kind}`,x:vehicle.x,y:vehicle.y,rotation:vehicle.rotation,scale:vehicle.scale,behaviorId:vehicle.routeId?'vehicle-route':undefined,targetIndex:0,active:true});}
  step(deltaMs:number,now=Date.now()):LivingWorldSimulationSnapshot{
    const dt=Math.max(0,Math.min(deltaMs,250));this.elapsed+=dt;const hour=new Date(now).getHours()+new Date(now).getMinutes()/60;
    this.actors=this.actors.map(actor=>this.updateActor({...actor},dt,now,hour));
    return this.snapshot(now,hour);
  }
  private updateActor(actor:SimulatedActor,dt:number,now:number,hour:number){
    const vehicle=actor.role.startsWith('vehicle:');
    if(vehicle&&actor.behaviorId==='vehicle-route')return this.updateRouteActor(actor,dt,now);
    const character=getWorldCharacters(this.locationId).find(item=>item.id===actor.id.split(':')[0]);
    const behavior=character?.scheduleId?getCharacterBehavior(character,hour):getWorldBehavior(actor.behaviorId??'resident-wander');
    if(!behavior||behavior.kind==='idle')return actor;
    if(behavior.kind==='follow-route'&&behavior.routeId&&this.routes[behavior.routeId])return this.updateRouteActor(actor,dt,now);
    const radius=behavior.radius??7;const phase=Math.floor(this.elapsed/4000);const angle=((phase+(actor.id.length*11))%32)/32*Math.PI*2;
    const home=character?{x:character.x,y:character.y}:{x:actor.x,y:actor.y};const target={x:home.x+Math.cos(angle)*radius,y:home.y+Math.sin(angle)*radius*.7};
    const next=moveToward(actor,target,(behavior.speed??.5)*dt/16);return{...actor,...next,rotation:Math.atan2(next.y-actor.y,next.x-actor.x)*180/Math.PI};
  }
  private updateRouteActor(actor:SimulatedActor,dt:number,now:number){
    const routeId=actor.id.startsWith('vehicle:')?undefined:undefined;let route:WorldVehicleRoute|undefined;
    for(const candidate of Object.values(this.routes))if(this.actors.some(a=>a.id===actor.id)&&candidate.waypoints.length>1){const vehicle=getWorldVehicles(this.locationId).find(v=>v.id===actor.id);if(vehicle?.routeId===candidate.id){route=candidate;break;}}
    if(!route)return actor;const state=this.routeStates[route.id]??{index:0,waitingUntil:0};const target=route.waypoints[state.index];if(now<state.waitingUntil)return actor;
    const amount=route.speed*dt/16;const next=moveToward(actor,target,amount);const reached=distance(next,target)<.25;
    if(!reached)return{...actor,...next,rotation:Math.atan2(target.y-actor.y,target.x-actor.x)*180/Math.PI};
    const wait=target.waitMs??0;state.waitingUntil=now+wait;state.index+=1;if(state.index>=route.waypoints.length)state.index=route.loop?0:route.waypoints.length-1;this.routeStates[route.id]=state;
    return{...actor,x:target.x,y:target.y,targetIndex:state.index};
  }
  snapshot(now=Date.now(),hour=new Date(now).getHours()):LivingWorldSimulationSnapshot{return{time:now,hour,actors:this.actors.map(actor=>({...actor}))};}
  getActor(id:string){return this.actors.find(actor=>actor.id===id)??null;}
  getDepth(id:string){const actor=this.getActor(id);return actor?worldDepth(actor.y):0;}
}
export function createLivingWorldSimulation(locationId:string,seed?:number){return new LivingWorldSimulation(locationId,seed);}
