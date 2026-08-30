import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageWorldId, resolveLanguageWorld } from './languageWorldEngine';

const KEY='gopal:selected-language-world:v1';

export class LanguageWorldStateEngine{
 async current():Promise<LanguageWorldId>{try{const value=await AsyncStorage.getItem(KEY);return resolveLanguageWorld(value??'ja').id;}catch{return 'ja';}}
 async select(id:LanguageWorldId){await AsyncStorage.setItem(KEY,id);return resolveLanguageWorld(id);}
}

export const languageWorldStateEngine=new LanguageWorldStateEngine();
