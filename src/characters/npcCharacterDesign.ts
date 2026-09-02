export type NpcRole='resident'|'teacher'|'guide'|'merchant'|'quest-giver'|'traveler'|'companion'|'student'|'guard'|'farmer'|'sailor'|'pilot'|'engineer'|'scientist'|'royal'|'villager'|'tourist'|'custom';
export type NpcExpression='neutral'|'happy'|'curious'|'surprised'|'thoughtful'|'excited'|'concerned'|'playful';
export type NpcAnimation='idle'|'walk'|'run'|'turn'|'sit'|'talk'|'gesture'|'point'|'celebrate'|'think'|'react';
export type NpcOutfitVariant='base'|'spring'|'summer'|'autumn'|'winter'|'emerald-valley'|'japanese-world'|'french-world'|'festival'|'work'|'school'|'adventure'|'formal';
export type NpcMaterialSlot='skin'|'hair'|'eyes'|'brows'|'outfit'|'shoes'|'accessory';

export interface NpcCharacterIdentity{
  id:string; role:NpcRole; displayName?:string; silhouette:string; signatureDetails:string[];
  face:{shape:string;eyeDesign:string;irisMaterial:string;hairDesign:string;expressionRange:string};
  body:{proportionProfile:string;hands:string;feet:string;rigRequirement:string};
  materials:Record<NpcMaterialSlot,{description:string;consistencyKey:string}>;
}
export interface NpcCharacterAssetSet{
  model3dUri?:string; previewUri?:string; thumbnailUri?:string; rigVersion:string; textureVersion:string; animationVersion:string;
  validatedAngles:string[]; validatedExpressions:NpcExpression[]; validatedAnimations:NpcAnimation[];
}
export interface NpcCharacterState{expression:NpcExpression;animation:NpcAnimation;outfit:NpcOutfitVariant;worldId:string;locationId?:string;visible:boolean;interactionLocked:boolean;updatedAt:number;}

export const NPC_EXPRESSIONS:ReadonlyArray<NpcExpression>=['neutral','happy','curious','surprised','thoughtful','excited','concerned','playful'];
export const NPC_ANIMATIONS:ReadonlyArray<NpcAnimation>=['idle','walk','run','turn','sit','talk','gesture','point','celebrate','think','react'];
export const NPC_OUTFITS:ReadonlyArray<NpcOutfitVariant>=['base','spring','summer','autumn','winter','emerald-valley','japanese-world','french-world','festival','work','school','adventure','formal'];

const MATERIALS:Record<NpcMaterialSlot,{description:string;consistencyKey:string}>={
 skin:{description:'stylized skin with stable tone and controlled roughness',consistencyKey:'npc-skin-v1'},
 hair:{description:'layered hair with readable silhouette and controlled sheen',consistencyKey:'npc-hair-v1'},
 eyes:{description:'readable eye construction with sclera, iris and highlight layers',consistencyKey:'npc-eyes-v1'},
 brows:{description:'authored brow shapes for expression readability',consistencyKey:'npc-brows-v1'},
 outfit:{description:'clothing with seams, folds and reusable world variants',consistencyKey:'npc-outfit-v1'},
 shoes:{description:'stable footwear with clean ground contact',consistencyKey:'npc-shoes-v1'},
 accessory:{description:'role-specific accessory constrained by the character bible',consistencyKey:'npc-accessory-v1'},
};

export function createNpcIdentity(id:string,role:NpcRole,displayName?:string,signatureDetails:string[]=[]):NpcCharacterIdentity{return{id,role,displayName,silhouette:'Distinctive full-body stylized NPC silhouette with stable head-to-foot proportions.',signatureDetails,face:{shape:'role-specific stylized human face with consistent proportions',eyeDesign:'expressive eyes with stable spacing and highlights',irisMaterial:'coherent layered iris material',hairDesign:'role-specific grouped hairstyle silhouette',expressionRange:'eight authored expressions with animation-driven transitions'},body:{proportionProfile:'shared production NPC proportion profile with role variants',hands:'fully modeled articulated hands for gestures and interaction',feet:'fully modeled feet with stable footwear contact',rigRequirement:'full-body articulated rig for locomotion, gestures and seated poses'},materials:MATERIALS};}

export const NPC_ROLE_DESIGNS:Record<NpcRole,{silhouette:string;palette:string[];accessory:string;outfit:NpcOutfitVariant}>= {
 resident:{silhouette:'friendly everyday resident',palette:['#6b7280','#94a3b8','#a78b72'],accessory:'small personal item',outfit:'base'},
 teacher:{silhouette:'confident approachable educator',palette:['#315b78','#d6c49a','#4b5563'],accessory:'book or lesson board',outfit:'school'},
 guide:{silhouette:'welcoming local guide',palette:['#557c5a','#c9ad73','#5b4636'],accessory:'guide satchel',outfit:'adventure'},
 merchant:{silhouette:'warm expressive shopkeeper',palette:['#8b5e48','#c9975b','#5b6470'],accessory:'shop ledger or parcel',outfit:'work'},
 'quest-giver':{silhouette:'memorable story-facing quest character',palette:['#7659a8','#d2b36b','#4b5563'],accessory:'quest token',outfit:'adventure'},
 traveler:{silhouette:'lightly equipped wandering traveler',palette:['#8a633f','#708090','#c9b27c'],accessory:'travel pack',outfit:'adventure'},
 companion:{silhouette:'friendly recurring companion',palette:['#4d8a75','#d6b77b','#46535a'],accessory:'companion keepsake',outfit:'base'},
 student:{silhouette:'curious learner with school-ready silhouette',palette:['#5d769d','#b7a47b','#4b5563'],accessory:'notebook',outfit:'school'},
 guard:{silhouette:'upright protective town guard',palette:['#4b5563','#64748b','#a88b57'],accessory:'crest',outfit:'formal'},
 farmer:{silhouette:'practical rural worker',palette:['#6d7d4e','#a86f4e','#8f7654'],accessory:'farm tool',outfit:'work'},
 sailor:{silhouette:'weathered coastal sailor',palette:['#3f6875','#d0b17a','#59636b'],accessory:'rope coil',outfit:'work'},
 pilot:{silhouette:'clean technical pilot silhouette',palette:['#526b8e','#d1d9dc','#4b5563'],accessory:'pilot badge',outfit:'formal'},
 engineer:{silhouette:'practical technical engineer',palette:['#4f7f86','#b28b5e','#4b5563'],accessory:'tool pouch',outfit:'work'},
 scientist:{silhouette:'curious research specialist',palette:['#66758d','#d7d9d6','#52616b'],accessory:'research tablet',outfit:'work'},
 royal:{silhouette:'distinctive formal court silhouette',palette:['#6d4f8d','#d7b86b','#5a6270'],accessory:'royal insignia',outfit:'formal'},
 villager:{silhouette:'warm regional village resident',palette:['#6d7a58','#9a7056','#b99b6c'],accessory:'regional keepsake',outfit:'base'},
 tourist:{silhouette:'curious visiting explorer',palette:['#52768a','#c28d65','#d0b56d'],accessory:'camera or map',outfit:'adventure'},
 custom:{silhouette:'customized reusable NPC silhouette',palette:['#64748b','#78716c','#a8a29e'],accessory:'custom role item',outfit:'base'},
};

export function createNpcCharacterState(partial:Partial<NpcCharacterState>={}):NpcCharacterState{return{expression:partial.expression??'neutral',animation:partial.animation??'idle',outfit:partial.outfit??'base',worldId:partial.worldId??'emerald-valley',locationId:partial.locationId,visible:partial.visible??true,interactionLocked:partial.interactionLocked??false,updatedAt:Date.now()};}
