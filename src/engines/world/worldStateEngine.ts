import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY='gopal:living-world:state:v1';
export type WorldFlag={key:string;value:string|number|boolean;updatedAt:string};
type Stored={flags:Record<string,WorldFlag>;history:string[]};
const empty=():Stored=>({flags:{},history:[]});
/** Persistent consequences shared by residents, opportunities and future callbacks. */
export class WorldStateEngine{
 private async read():Promise<Stored>{try{return JSON.parse((await AsyncStorage.getItem(KEY))??'null')??empty();}catch{return empty();}}
 private async write(state:Stored){await AsyncStorage.setItem(KEY,JSON.stringify(state));}
 async get(key:string){return (await this.read()).flags[key]?.value;}
 async has(key:string){return typeof (await this.get(key))!=='undefined';}
 async set(key:string,value:WorldFlag['value']){const state=await this.read();state.flags[key]={key,value,updatedAt:new Date().toISOString()};if(!state.history.includes(key))state.history.unshift(key);state.history=state.history.slice(0,80);await this.write(state);return state.flags[key];}
 async mark(key:string){return this.set(key,true);}
 async all(){return (await this.read()).flags;}
 async history(){return (await this.read()).history;}
 async reset(){await AsyncStorage.removeItem(KEY);}
}
export const worldStateEngine=new WorldStateEngine();
