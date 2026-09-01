import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WorldRevisitStats { count: number; lastVisitedAt: string; }
const PREFIX='gopal:world:revisit:v2:';
const keyFor=(userId:string)=>`${PREFIX}${encodeURIComponent(userId.trim())}`;

export class WorldRevisitStore {
  async getStats(userId:string):Promise<Record<string,WorldRevisitStats>> {
    if(!userId.trim()) return {};
    try {
      const raw=await AsyncStorage.getItem(keyFor(userId));
      if(!raw) return {};
      const parsed=JSON.parse(raw) as Record<string,WorldRevisitStats>;
      return parsed && typeof parsed==='object' ? parsed : {};
    } catch { return {}; }
  }

  async recordVisit(userId:string, locationKey:string):Promise<WorldRevisitStats> {
    if(!userId.trim()) throw new Error('Recording a World revisit requires a userId');
    if(!locationKey.trim()) throw new Error('Recording a World revisit requires a locationKey');
    const stats=await this.getStats(userId);
    const prev=stats[locationKey];
    const next={count:(prev?.count ?? 0)+1,lastVisitedAt:new Date().toISOString()};
    stats[locationKey]=next;
    await AsyncStorage.setItem(keyFor(userId),JSON.stringify(stats));
    return next;
  }

  async clear(userId:string){ if(userId.trim()) await AsyncStorage.removeItem(keyFor(userId)); }
}

export const worldRevisitStore=new WorldRevisitStore();
