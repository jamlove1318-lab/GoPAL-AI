export type WorldPlaceHotspotKind='landmark'|'resident'|'discovery'|'path'|'locked'|'quest'|'challenge'|'quiz'|'special';
export interface WorldPlaceHotspot{id:string;label:string;kind:WorldPlaceHotspotKind;x:number;y:number;description?:string;locked?:boolean;icon?:string;metadata?:Record<string,unknown>;}
export type WorldPlaceHotspotCatalog=Record<string,WorldPlaceHotspot[]>;
