import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LearnerWorldConsequence {
  id: string;
  userId: string;
  worldId: string;
  placeId: string;
  scenarioId: string;
  success: boolean;
  worldChange: string;
  recordedAt: string;
}

const PREFIX='gopal:world:learning-consequences:v1:';
const keyFor=(userId:string)=>`${PREFIX}${encodeURIComponent(userId)}`;

export class LearnerWorldConsequenceStore {
  async list(userId:string):Promise<LearnerWorldConsequence[]> {
    if(!userId.trim()) return [];
    try {
      const raw=await AsyncStorage.getItem(keyFor(userId));
      if(!raw) return [];
      const parsed=JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async record(userId:string, consequence:Omit<LearnerWorldConsequence,'id'|'userId'|'recordedAt'>) {
    if(!userId.trim()) throw new Error('World consequence persistence requires a userId');
    const current=await this.list(userId);
    const duplicate=current.find(item => item.scenarioId===consequence.scenarioId && item.success===consequence.success);
    if(duplicate) return duplicate;
    const item:LearnerWorldConsequence={
      ...consequence,
      id:`world-consequence-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      userId,
      recordedAt:new Date().toISOString(),
    };
    current.unshift(item);
    await AsyncStorage.setItem(keyFor(userId),JSON.stringify(current.slice(0,200)));
    return item;
  }

  async clear(userId:string) {
    if(userId.trim()) await AsyncStorage.removeItem(keyFor(userId));
  }
}

export const learnerWorldConsequenceStore=new LearnerWorldConsequenceStore();
