import type { WorldBuildingType, WorldTheme, WorldPropType } from '../components/LivingWorldPrimitives';

export type WorldPalette = {
  ground: string;
  path: string;
  pathEdge: string;
  foliage: string[];
  roof: string;
  wall: string;
  accent: string;
  window: string;
  nightOverlay: string;
};

export type BuildingVariant = {
  roof: string;
  wall: string;
  accent: string;
  window: string;
  trim: string;
};

export const WORLD_PALETTES: Record<WorldTheme, WorldPalette> = {
  emerald: { ground:'#668b5d', path:'#d5c391', pathEdge:'#8f7a55', foliage:['#315a39','#3f6d42','#4d7a47','#6e9658'], roof:'#4f5b45', wall:'#9c8f68', accent:'#6f8d63', window:'#b9d9d0', nightOverlay:'#071521' },
  sakura: { ground:'#829a73', path:'#d8c6a7', pathEdge:'#8d765d', foliage:['#6d7950','#857b4f','#b47c86','#d59aa7'], roof:'#76516a', wall:'#d5bba7', accent:'#a86d80', window:'#c5e1df', nightOverlay:'#17152b' },
  mountain: { ground:'#71836d', path:'#c3b28f', pathEdge:'#6e6654', foliage:['#334e43','#46634c','#657c5b','#82906a'], roof:'#4b4d50', wall:'#a99c82', accent:'#7b6a55', window:'#b9d4d0', nightOverlay:'#0b1620' },
  coastal: { ground:'#739b78', path:'#d9c89f', pathEdge:'#8b765c', foliage:['#356a55','#4b8061','#6f9b67','#9cb36e'], roof:'#4b7382', wall:'#d5c9aa', accent:'#6b9ca2', window:'#bce2df', nightOverlay:'#091923' },
  festival: { ground:'#728d65', path:'#d9c28c', pathEdge:'#8d6a48', foliage:['#3f633d','#5d7b45','#8e8b4f','#b56d62'], roof:'#9a4d50', wall:'#d8b779', accent:'#d08c50', window:'#f2d995', nightOverlay:'#1b1524' },
};

const BUILDING_VARIANTS: Record<WorldTheme, Record<WorldBuildingType, BuildingVariant>> = {
  emerald: { house:{roof:'#6d563c',wall:'#c7b28b',accent:'#78905f',window:'#b9d9d0',trim:'#ead8a7'}, cafe:{roof:'#9b5146',wall:'#b87555',accent:'#e2a071',window:'#c7e0d7',trim:'#f0c58f'}, library:{roof:'#303e56',wall:'#667084',accent:'#a4afc0',window:'#c7d6d2',trim:'#d9d1ae'}, market:{roof:'#4f7658',wall:'#806447',accent:'#d49366',window:'#f1d58b',trim:'#e8bd78'}, school:{roof:'#4f7788',wall:'#c8d1c5',accent:'#d69a60',window:'#c7e0d7',trim:'#eee0b1'},sanctuary:{roof:'#5a536e',wall:'#b7ad9d',accent:'#91a890',window:'#c8ddd4',trim:'#eadbb5'},workshop:{roof:'#4c5554',wall:'#a67c5c',accent:'#d09a64',window:'#c4d5d0',trim:'#d9bd86'} },
  sakura: { house:{roof:'#75556a',wall:'#d7bfae',accent:'#b77b8a',window:'#c9e1df',trim:'#f0d3b2'}, cafe:{roof:'#9c5365',wall:'#d2a486',accent:'#d78a9b',window:'#d0e5df',trim:'#f1d0a7'}, library:{roof:'#4d536f',wall:'#c7bdc3',accent:'#ad8294',window:'#c9e3e0',trim:'#ead6c4'}, market:{roof:'#7c4f62',wall:'#d3a77c',accent:'#d48a68',window:'#f0d8a1',trim:'#efc59a'}, school:{roof:'#5c7284',wall:'#dfc7b7',accent:'#c9828d',window:'#c8e2df',trim:'#f1d6af'},sanctuary:{roof:'#6f536f',wall:'#d4c1bd',accent:'#9e7186',window:'#c7e1df',trim:'#eed9b6'},workshop:{roof:'#565a63',wall:'#b99a82',accent:'#bd786e',window:'#c8d9d5',trim:'#dec29a'} },
  mountain: { house:{roof:'#4f4c47',wall:'#b7a78a',accent:'#7e735e',window:'#b9d2ce',trim:'#d8c69c'}, cafe:{roof:'#6d4f45',wall:'#aa795f',accent:'#c28c65',window:'#bdd6d1',trim:'#dec095'}, library:{roof:'#404952',wall:'#777b78',accent:'#9da69b',window:'#bfd4d0',trim:'#d9cba7'}, market:{roof:'#495c4e',wall:'#85735b',accent:'#bd8d5e',window:'#ead08d',trim:'#d9b57e'}, school:{roof:'#4f6267',wall:'#b4b4a2',accent:'#a87955',window:'#c0d8d2',trim:'#dfcfa8'},sanctuary:{roof:'#4d515a',wall:'#a8a495',accent:'#7f927f',window:'#c1d8d3',trim:'#d9c8a0'},workshop:{roof:'#45494b',wall:'#94765d',accent:'#b8865c',window:'#bfd0cb',trim:'#d2b686'} },
  coastal: { house:{roof:'#557c83',wall:'#d8c99f',accent:'#77a18e',window:'#c3e1df',trim:'#f0d8ad'}, cafe:{roof:'#4f7887',wall:'#d8b98f',accent:'#d58d68',window:'#c7e5e1',trim:'#f1d5a7'}, library:{roof:'#4d657a',wall:'#c4c7b5',accent:'#7ca4a4',window:'#c4e3df',trim:'#e8d9ae'}, market:{roof:'#527a69',wall:'#c7a56f',accent:'#d98d61',window:'#f2d996',trim:'#e7c080'}, school:{roof:'#4f7184',wall:'#d6d2ae',accent:'#6d9a9a',window:'#c4e2df',trim:'#ead9aa'},sanctuary:{roof:'#5d6678',wall:'#c8c3ae',accent:'#71968d',window:'#c2e0dc',trim:'#e8d5a9'},workshop:{roof:'#53666a',wall:'#c29b73',accent:'#6f9a91',window:'#c2ddd9',trim:'#e1c28f'} },
  festival: { house:{roof:'#8c4d4d',wall:'#d8b779',accent:'#d78d54',window:'#f1d38b',trim:'#f3dfad'}, cafe:{roof:'#9d4f4d',wall:'#d8a76d',accent:'#df865f',window:'#f2dc9a',trim:'#f2c47f'}, library:{roof:'#66526f',wall:'#d1c19a',accent:'#c18a5f',window:'#f0d995',trim:'#e9d4a0'}, market:{roof:'#9b4c4c',wall:'#d5a35f',accent:'#e0a052',window:'#f6df9d',trim:'#f0c66f'}, school:{roof:'#5e7180',wall:'#d7c487',accent:'#d77c58',window:'#f2d996',trim:'#f0d7a0'},sanctuary:{roof:'#76506c',wall:'#d1bd92',accent:'#b97d68',window:'#f0d995',trim:'#ead19a'},workshop:{roof:'#5a5f5d',wall:'#c9a26d',accent:'#d48352',window:'#efd796',trim:'#e6c17c'} },
};

export function buildingVariant(theme: WorldTheme, type: WorldBuildingType) {
  return BUILDING_VARIANTS[theme][type];
}

export function propScale(type: WorldPropType) {
  return type === 'tree' ? 1.18 : type === 'flower' ? .72 : type === 'rock' ? .8 : 1;
}
