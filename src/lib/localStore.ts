import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  WorldsRow,
  LocationsRow,
  WorldStateRow,
  CharactersRow,
  CharacterStateRow,
  CharacterRelationshipsRow,
  MemoriesRow,
  JourneyEventsRow,
  EnvironmentObjectsRow,
  KnowledgeItemsRow,
  KnowledgeMasteryRow,
  ProfilesRow,
  Json,
} from '../types/database';
import type { Mood, Season, TimeOfDay } from './types';
import { resolveSeason, resolveTimeOfDay } from './time';

const STORE_KEY_PREFIX = 'gopal:store:';

export interface PostcardItem { id:string; title:string; locationKey:string; locationName:string; unlockedAt:string; cassidyNote:string; imageTheme:string; }
export interface ReviewStory { id:string; title:string; location:string; content:string; targetVocab:string[]; grammarFocus:string; completed:boolean; }
export interface StudyObjectState { plantStage:number; plantWaterCount:number; lastWateredAt:string|null; activeRadioStation:string; isRadioPlaying:boolean; notes:{id:string;term:string;note:string;createdAt:string}[]; }
export interface SessionBookmark { id:string; activityType:'scenario'|'study'|'exploration'|'culture'; locationKey:string; locationName:string; scenarioKey?:string; title:string; promptSnippet:string; savedAt:string; }
export interface CustomCreation { id:string; type:'postcard'|'phrase_card'|'memory_board'|'comic_strip'; title:string; subtitle:string; content:string; visualTheme:string; tags:string[]; createdAt:string; }
export interface TimeCapsule { id:string; message:string; targetUnlockDate:string; unlocked:boolean; theme:string; createdAt:string; }
export interface WonderPromptData { question:string; hint1:string; hint2:string; solution:string; culturalFact:string; }
export interface CulturalArtifact { id:string; key:string; name:string; locationKey:string; locationName:string; japaneseName:string; romaji:string; description:string; wonderPrompt:WonderPromptData; unlocked:boolean; discoveredAt:string|null; }
export interface KnowledgeNode { id:string; key:string; term:string; reading:string; meaning:string; category:'beverage'|'greeting'|'environment'|'reading'|'culture'|'action'; relatedKeys:string[]; masteryLevel:number; locationKey:string; examples:string[]; }
export interface RevisitRecord { count:number; lastVisitedAt:string; }

// ... existing LocalStore implementation remains unchanged ...

  static async getMemories(): Promise<MemoriesRow[]> {
    return this.get<MemoriesRow[]>('memories', SEED_MEMORIES);
  }

  /** Idempotent local memory write: the same fact in the same layer is one memory. */
  static async addMemory(layer: MemoriesRow['layer'], fact: string): Promise<MemoriesRow> {
    const memories = await this.getMemories();
    const existing = memories.find((memory) => memory.layer === layer && memory.canonical_fact.trim() === fact.trim());
    if (existing) return existing;
    const newMem: MemoriesRow = {
      id: 'mem-' + Date.now(), user_id: 'local-explorer-user', layer,
      canonical_fact: fact, occurred_at: new Date().toISOString(), source_event_id: null,
    };
    await this.set('memories', [newMem, ...memories]);
    return newMem;
  }
