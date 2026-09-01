export type InventoryItem={id:string;label:string;tags?:string[]};
export type InventoryRecipe={id:string;inputs:string[];output:InventoryItem};
export type InventoryState={items:InventoryItem[];crafted:string[]};

export const createInventoryState=(items:InventoryItem[]=[]):InventoryState=>({items:[...items],crafted:[]});
export function addItem(state:InventoryState,item:InventoryItem):InventoryState{return state.items.some(existing=>existing.id===item.id)?state:{...state,items:[...state.items,item]};}
export function hasItems(state:InventoryState,ids:string[]){return ids.every(id=>state.items.some(item=>item.id===id));}
export function combineItems(state:InventoryState,recipe:InventoryRecipe):InventoryState{
 if(!hasItems(state,recipe.inputs)||state.crafted.includes(recipe.id))return state;
 const inputs=new Set(recipe.inputs);const remaining=state.items.filter(item=>!inputs.has(item.id));
 return{items:[...remaining,recipe.output],crafted:[...state.crafted,recipe.id]};
}
export function removeItem(state:InventoryState,id:string):InventoryState{return{...state,items:state.items.filter(item=>item.id!==id)}}
