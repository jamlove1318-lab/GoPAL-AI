import{LivingWorldRuntime as CanonicalLivingWorldRuntime,type WorldRuntimeSnapshot}from'../../features/world/data/livingWorldRuntime';
export * from '../../features/world/data/livingWorldRuntime';
export type WorldSnapshot=WorldRuntimeSnapshot;
export class LivingWorldRuntime extends CanonicalLivingWorldRuntime{
 load(locationId:string){this.loadLocation(locationId);return this;}
 changeLocation(locationId:string){return this.loadLocation(locationId);}
 getRevisitDifference(){return null;}
}
export function createLivingWorldRuntime(locationId?:string){return new LivingWorldRuntime(locationId);}
