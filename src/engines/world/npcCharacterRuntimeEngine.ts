import type{NpcAnimation,NpcCharacterState,NpcExpression,NpcOutfitVariant}from'../../characters/npcCharacterDesign';
import{createNpcCharacterState}from'../../characters/npcCharacterDesign';

export interface NpcCharacterRuntimeSnapshot{characters:Record<string,NpcCharacterState>}
export class NpcCharacterRuntimeEngine{
 private states=new Map<string,NpcCharacterState>();
 ensure(id:string,partial:Partial<NpcCharacterState>={}):NpcCharacterState{const existing=this.states.get(id);if(existing)return existing;const state=createNpcCharacterState(partial);this.states.set(id,state);return state;}
 get(id:string):NpcCharacterState|undefined{return this.states.get(id);}
 setExpression(id:string,expression:NpcExpression){return this.patch(id,{expression,animation:expression==='happy'||expression==='excited'?'gesture':'react'});}
 setAnimation(id:string,animation:NpcAnimation){return this.patch(id,{animation});}
 setOutfit(id:string,outfit:NpcOutfitVariant){return this.patch(id,{outfit});}
 setWorldPresence(id:string,worldId:string,locationId?:string){return this.patch(id,{worldId,locationId,visible:true});}
 setVisible(id:string,visible:boolean){return this.patch(id,{visible});}
 setInteractionLocked(id:string,interactionLocked:boolean){return this.patch(id,{interactionLocked});}
 private patch(id:string,patch:Partial<NpcCharacterState>):NpcCharacterState{const next={...this.ensure(id),...patch,updatedAt:Date.now()};this.states.set(id,next);return next;}
 snapshot():NpcCharacterRuntimeSnapshot{const characters:Record<string,NpcCharacterState>={};for(const[id,state]of this.states)characters[id]={...state};return{characters};}
 restore(snapshot:NpcCharacterRuntimeSnapshot|undefined){this.states.clear();if(!snapshot)return;for(const[id,state]of Object.entries(snapshot.characters))this.states.set(id,{...state});}
 clear(){this.states.clear();}
}
export const npcCharacterRuntimeEngine=new NpcCharacterRuntimeEngine();
