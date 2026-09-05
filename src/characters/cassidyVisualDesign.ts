export type CassidyVisualWorld='emerald-valley'|'japanese-world'|'french-world'|'neutral';
export type CassidyVisualMood='calm'|'warm'|'curious'|'focused'|'joyful'|'surprised';

export interface CassidyVisualPalette {
  skin:string; skinShade:string; hair:string; hairHighlight:string; outfit:string; outfitShade:string; shoes:string;
  aura:string; auraSoft:string; eyeGlow:string; accent:string;
}

export interface CassidyVisualDesign {
  silhouette:'soft-adventurer';
  camera:'full-body-three-quarter';
  proportions:'stable-production-proportions';
  visualLanguage:'stylized-living-companion';
  palette:CassidyVisualPalette;
  details:string[];
  motion:string[];
  worldAccents:string[];
}

const PALETTES:Record<CassidyVisualWorld,CassidyVisualPalette>={
  'emerald-valley':{skin:'#F4C9A3',skinShade:'#E7B489',hair:'#5B3A29',hairHighlight:'#8A5B3D',outfit:'#10B981',outfitShade:'#087F5B',shoes:'#1E293B',aura:'#6EE7B7',auraSoft:'#34D399',eyeGlow:'#A7F3D0',accent:'#FDE68A'},
  'japanese-world':{skin:'#F4C9A3',skinShade:'#E7B489',hair:'#3D302B',hairHighlight:'#806A60',outfit:'#B4537A',outfitShade:'#7F3655',shoes:'#2D2A3A',aura:'#F9A8D4',auraSoft:'#F472B6',eyeGlow:'#FBCFE8',accent:'#FDE68A'},
  'french-world':{skin:'#F4C9A3',skinShade:'#E7B489',hair:'#49352B',hairHighlight:'#89644C',outfit:'#6366F1',outfitShade:'#4338CA',shoes:'#27272A',aura:'#C4B5FD',auraSoft:'#818CF8',eyeGlow:'#DDD6FE',accent:'#FDE68A'},
  neutral:{skin:'#F4C9A3',skinShade:'#E7B489',hair:'#5B3A29',hairHighlight:'#7A4F37',outfit:'#10B981',outfitShade:'#0C9268',shoes:'#1E293B',aura:'#6EE7B7',auraSoft:'#34D399',eyeGlow:'#A7F3D0',accent:'#FDE68A'},
};

export const CASSIDY_VISUAL_DESIGN:CassidyVisualDesign={
  silhouette:'soft-adventurer',camera:'full-body-three-quarter',proportions:'stable-production-proportions',visualLanguage:'stylized-living-companion',
  palette:PALETTES['emerald-valley'],
  details:['recognizable layered hairstyle','large expressive eyes with controlled highlights','friendly face with readable micro-expressions','signature emerald companion accent','clean full-body silhouette','world-sensitive outfit accents','subtle ambient aura instead of a flat static sprite'],
  motion:['breathing','blink timing','hair sway','weight shift','idle micro-gestures','talking mouth motion','world-aware gesture emphasis'],
  worldAccents:['Emerald Valley uses living green light','Japanese World uses soft sakura/lantern accents','French World uses violet/café-light accents'],
};

export function getCassidyVisualPalette(worldId:string='emerald-valley'):CassidyVisualPalette {
  const key=(worldId==='japanese'||worldId==='ja'?'japanese-world':worldId==='french'||worldId==='fr'?'french-world':worldId==='emerald-valley'?'emerald-valley':'neutral') as CassidyVisualWorld;
  return {...PALETTES[key]};
}
