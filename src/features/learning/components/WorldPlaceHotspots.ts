export type WorldPlaceHotspotKind='landmark'|'resident'|'discovery'|'path'|'locked'|'quest'|'challenge'|'quiz'|'special';

/** Canonical reusable hotspot contract shared by learning, world, and progression systems. */
export interface WorldPlaceHotspot {
  id:string;
  placeId?:string;
  label:string;
  kind:WorldPlaceHotspotKind;
  x:number;
  y:number;
  description?:string;
  locked?:boolean;
  enabled?:boolean;
  optional?:boolean;
  icon?:string;
  miniGameId?:string;
  scenarioIds?:string[];
  nextHotspotId?:string;
  metadata?:Record<string,unknown>;
}

export type WorldPlaceHotspotCatalog=Record<string,WorldPlaceHotspot[]>;
/** Compatibility plural export retained for existing scene consumers. */
export const WorldPlaceHotspots = undefined as unknown as WorldPlaceHotspotCatalog;
