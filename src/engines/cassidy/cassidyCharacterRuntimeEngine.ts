import { CASSIDY_ANIMATIONS, CASSIDY_EXPRESSIONS, CASSIDY_OUTFITS, createCassidyCharacterState, type CassidyAnimation, type CassidyCharacterState, type CassidyExpression, type CassidyOutfitVariant } from '../../characters/cassidyCharacterDesign';
export interface CassidyCharacterRuntimeSnapshot extends CassidyCharacterState { transitionId:number; }
export class CassidyCharacterRuntimeEngine{
 private state:CassidyCharacterState=createCassidyCharacterState(); private transitionId=0;
 getState():CassidyCharacterState{return{...this.state};}
 setWorldPresence(worldId:string,locationId?:string){this.state={...this.state,worldId,locationId,visible:true,updatedAt:Date.now()};return this.getState();}
 setExpression(expression:CassidyExpression){if(!CASSIDY_EXPRESSIONS.includes(expression))return this.getState();this.state={...this.state,expression,updatedAt:Date.now()};return this.getState();}
 play(animation:CassidyAnimation){if(!CASSIDY_ANIMATIONS.includes(animation))return this.getState();this.state={...this.state,animation,updatedAt:Date.now()};this.transitionId++;return this.getState();}
 setOutfit(outfit:CassidyOutfitVariant){if(!CASSIDY_OUTFITS.includes(outfit))return this.getState();this.state={...this.state,outfit,updatedAt:Date.now()};return this.getState();}
 setVisible(visible:boolean){this.state={...this.state,visible,updatedAt:Date.now()};return this.getState();}
 snapshot():CassidyCharacterRuntimeSnapshot{return{...this.getState(),transitionId:this.transitionId};}
 restore(snapshot:Partial<CassidyCharacterRuntimeSnapshot>){this.state=createCassidyCharacterState(snapshot);this.transitionId=typeof snapshot.transitionId==='number'?Math.max(0,Math.floor(snapshot.transitionId)):this.transitionId;return this.snapshot();}
}
export const cassidyCharacterRuntimeEngine=new CassidyCharacterRuntimeEngine();
