import { LocalStore } from '../../lib/localStore';
import type { WorldPlaceHotspot } from '../../features/learning/components/WorldPlaceHotspots';
import { getWorldPlaceHotspots } from '../../features/learning/components/worldPlaceHotspotCatalog';
import { resolveWorldHotspotExperience } from './worldHotspotExperienceEngine';
export type HotspotProgress={completed:string[];revealed:string[]};
const KEY='world_hotspot_progress_v1';
const scopedId=(hotspot:Pick<WorldPlaceHotspot,'id'|'placeId'>)=>hotspot.placeId?`${hotspot.placeId}:${hotspot.id}`:hotspot.id;
const has=(items:string[],hotspot:Pick<WorldPlaceHotspot,'id'|'placeId'>)=>items.includes(scopedId(hotspot))||(!hotspot.placeId&&items.includes(hotspot.id));
async function read():Promise<HotspotProgress>{const value=await LocalStore.get<HotspotProgress>(KEY,{completed:[],revealed:[]});return{completed:Array.isArray(value.completed)?value.completed:[],revealed:Array.isArray(value.revealed)?value.revealed:[]};}
async function write(value:HotspotProgress){await LocalStore.set(KEY,value);}
export async function getHotspotProgress():Promise<HotspotProgress>{return read();}
function isKnownHotspot(hotspot:WorldPlaceHotspot){if(!hotspot.placeId)return true;return getWorldPlaceHotspots(hotspot.placeId).some(item=>item.id===hotspot.id);}
export async function resolveHotspot(hotspot:WorldPlaceHotspot){
 const experience=resolveWorldHotspotExperience(hotspot);const progress=await read();const known=has(progress.revealed,hotspot);
 // Resolving is observational; discovery is recorded only by explicit completion/reveal operations.
 return{hotspot,experience,progress,newlyRevealed:false,known};
}
export async function completeHotspot(hotspotId:string,placeId?:string){
 const hotspot=placeId?getWorldPlaceHotspots(placeId).find(item=>item.id===hotspotId):null;
 if(placeId&&!hotspot)throw new Error(`Unknown hotspot '${hotspotId}' for place '${placeId}'`);
 const progress=await read();const key=placeId?`${placeId}:${hotspotId}`:hotspotId;
 if(!progress.completed.includes(key))progress.completed.push(key);if(!progress.revealed.includes(key))progress.revealed.push(key);await write(progress);return progress;
}
/** Atomically records completion and reveals only the explicit next physical hotspot in the same place. */
export async function completeAndRevealHotspot(hotspot:WorldPlaceHotspot,next?:WorldPlaceHotspot){
 if(!isKnownHotspot(hotspot))throw new Error(`Unknown hotspot '${hotspot.id}' for place '${hotspot.placeId??'unknown'}'`);
 if(next&&hotspot.placeId&&next.placeId&&hotspot.placeId!==next.placeId)throw new Error('Cannot reveal a hotspot from a different physical place');
 if(next&&next.id===hotspot.id)throw new Error('A hotspot cannot reveal itself');
 if(next&&hotspot.nextHotspotId&&hotspot.nextHotspotId!==next.id)throw new Error(`Next hotspot '${next.id}' does not match '${hotspot.nextHotspotId}'`);
 const progress=await read();const hotspotKey=scopedId(hotspot);if(!progress.completed.includes(hotspotKey))progress.completed.push(hotspotKey);if(!progress.revealed.includes(hotspotKey))progress.revealed.push(hotspotKey);
 if(next&&next.kind!=='locked'){const nextKey=scopedId(next);if(!progress.revealed.includes(nextKey))progress.revealed.push(nextKey);}
 await write(progress);return{progress,revealed:next&&next.kind!=='locked'?next:null};
}
export const worldHotspotProgressionEngine={get:getHotspotProgress,resolve:resolveHotspot,complete:completeHotspot,completeAndReveal:completeAndRevealHotspot};
