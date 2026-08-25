export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Optional<T> = { [K in keyof T]?: T[K] };

export interface ProfilesRow {
  id: string;
  display_name: string | null;
  target_language: string | null;
  world_id: string | null;
  learning_intention: 'travel' | 'conversation' | 'study' | 'culture' | 'casual' | 'work' | null;
  created_at: string;
}

export interface LearnerPreferencesRow {
  user_id: string;
  session_length_minutes: number;
  experience_mode: 'focus' | 'adventure' | 'conversation' | 'relax' | 'challenge' | 'creative' | 'surprise';
  audio_enabled: boolean;
  accessibility_reduced_motion: boolean;
  accessibility_high_contrast: boolean;
  energy_sizing: string;
  updated_at: string;
}

export interface WorldsRow {
  id: string;
  canonical_key: string;
  display_name: string;
  curriculum_ref: string | null;
  created_at: string;
}

export interface LocationsRow {
  id: string;
  world_id: string;
  key: string;
  name: string;
  familiarity_stage: 'unknown' | 'discovered' | 'familiar' | 'meaningful' | 'personal';
  unlocked_at: string | null;
}

export interface WorldStateRow {
  user_id: string;
  world_id: string | null;
  location_id: string | null;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  weather: string;
  last_active_at: string;
  daily_refresh_token: string;
  updated_at: string;
}

export interface WorldEventsRow {
  id: string;
  world_id: string;
  scale: 'small' | 'medium' | 'large';
  name: string;
  payload: Json;
  starts_at: string;
  ends_at: string | null;
}

export interface EnvironmentObjectsRow {
  id: string;
  location_id: string | null;
  object_key: string;
  position: Json | null;
  rotation: number | null;
  interaction_state: Json;
  unlock_source: string | null;
}

export interface CharactersRow {
  id: string;
  key: string;
  role: string;
  personality: Json;
  dialogue_style: string | null;
  memory_access_policy: Json;
  preferred_locations: Json;
}

export interface CharacterStateRow {
  character_id: string;
  mood: 'happy' | 'calm' | 'curious' | 'excited' | 'tired' | 'concerned' | 'proud' | 'surprised';
  energy: number;
  current_activity: string | null;
  routine_schedule: Json;
  updated_at: string;
}

export interface CharacterRelationshipsRow {
  user_id: string;
  character_id: string;
  familiarity: number;
  trust: number;
  friendship: number;
  shared_history: Json;
  updated_at: string;
}

export interface CharacterMemoryLinksRow {
  character_id: string;
  memory_id: string;
}

export interface MemoriesRow {
  id: string;
  user_id: string;
  layer: 'profile' | 'learning' | 'conversation' | 'character' | 'world' | 'story' | 'progress' | 'preference' | 'achievement' | 'session';
  canonical_fact: string;
  occurred_at: string;
  source_event_id: string | null;
}

export interface ConversationMemoriesRow {
  memory_id: string;
  user_id: string;
  conversation_id: string;
  evaluation: Json;
}

export interface ObjectMemoriesRow {
  memory_id: string;
  user_id: string;
  object_id: string | null;
  note: string;
}

export interface TimeCapsulesRow {
  id: string;
  user_id: string;
  message: string;
  reveal_at_milestone: string;
  revealed: boolean;
  created_at: string;
}

export interface KnowledgeItemsRow {
  id: string;
  world_id: string | null;
  type: string;
  term: string;
  meaning: string;
  examples: Json;
  cultural_notes: string | null;
  related_items: Json;
}

export interface KnowledgeMasteryRow {
  user_id: string;
  item_id: string;
  mastery_score: number;
  last_seen: string | null;
  next_review: string | null;
  proficiency: Json;
}

export interface LearningSessionsRow {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  activity_type: string;
  accuracy: number | null;
  response_times: Json;
  mistakes: Json;
}

export interface MistakesRow {
  id: string;
  session_id: string;
  item_id: string | null;
  error_type: string;
  corrected_at: string | null;
}

export interface ExplanationPrefsRow {
  user_id: string;
  preferred_mode: string;
}

export interface ConversationsRow {
  id: string;
  user_id: string;
  location_id: string | null;
  character_id: string | null;
  started_at: string;
  scenario_ref: string | null;
}

export interface ConversationTurnsRow {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  evaluation: Json;
  created_at: string;
}

export interface PronunciationAttemptsRow {
  id: string;
  turn_id: string;
  user_id: string;
  score: number | null;
  phoneme_feedback: Json;
  created_at: string;
}

export interface QuestsRow {
  id: string;
  category: 'learning' | 'story' | 'character' | 'exploration' | 'culture' | 'daily' | 'seasonal' | 'event';
  world_id: string | null;
  title: string;
  requirements: Json;
  unlocks: Json;
}

export interface UserQuestsRow {
  user_id: string;
  quest_id: string;
  status: string;
  progress: Json;
  soft_consequence: Json;
  updated_at: string;
}

export interface StoriesRow {
  id: string;
  arc_type: 'micro' | 'side' | 'character' | 'world' | 'seasonal' | 'personal';
  chapter: number;
  episode: number;
  title: string;
  content_ref: string | null;
}

export interface StoryProgressRow {
  user_id: string;
  story_id: string;
  current_node: string | null;
  choices: Json;
  updated_at: string;
}

export interface MicroStoriesRow {
  id: string;
  location_id: string;
  pool_key: string;
  content_ref: string;
}

export interface CulturalCollectionsRow {
  id: string;
  category: 'food' | 'festivals' | 'places' | 'expressions' | 'history' | 'arts' | 'daily';
  completion_state: Json;
}

export interface CollectionEntriesRow {
  id: string;
  collection_id: string;
  item_ref: string;
  discovered_at: string;
}

export interface PostcardsRow {
  id: string;
  user_id: string;
  location_id: string | null;
  world_id: string | null;
  image_ref: string | null;
  visit_date: string;
  description: string;
  cultural_learning: string | null;
}

export interface WorldAlbumRow {
  id: string;
  user_id: string;
  source_type: string;
  ref_id: string | null;
  captured_at: string;
}

export interface ProgressionRow {
  user_id: string;
  xp: number;
  level: number;
  skills: Json;
  streak: number;
  milestones: Json;
}

export interface AchievementsRow {
  id: string;
  type: string;
  criteria: Json;
}

export interface UserAchievementsRow {
  user_id: string;
  achievement_id: string;
  earned_at: string;
  context: Json;
}

export interface CurrencyRow {
  user_id: string;
  balance: number;
}

export interface InventoryRow {
  id: string;
  user_id: string;
  item_key: string;
  provenance: Json;
  placed_object_id: string | null;
}

export interface DiscoveriesRow {
  id: string;
  user_id: string;
  type: string;
  ref: string;
  discovered_at: string;
  eligible_since: string;
}

export interface RumorsRow {
  id: string;
  world_id: string | null;
  text: string;
  points_to_ref: string | null;
}

export interface JourneyEventsRow {
  id: string;
  user_id: string;
  producer: string;
  type: string;
  payload: Json;
  created_at: string;
}

export interface FeatureDiscoveryRow {
  user_id: string;
  feature_key: string;
  discovered_at: string;
  eligibility: Json;
}

export interface PlantStateRow {
  user_id: string;
  stage: 'seed' | 'sprout' | 'young' | 'mature' | 'flowering';
  variant: string;
  last_cared_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfilesRow; Insert: Optional<ProfilesRow>; Update: Optional<ProfilesRow> };
      learner_preferences: { Row: LearnerPreferencesRow; Insert: Optional<LearnerPreferencesRow>; Update: Optional<LearnerPreferencesRow> };
      worlds: { Row: WorldsRow; Insert: Optional<WorldsRow>; Update: Optional<WorldsRow> };
      locations: { Row: LocationsRow; Insert: Optional<LocationsRow>; Update: Optional<LocationsRow> };
      world_state: { Row: WorldStateRow; Insert: Optional<WorldStateRow>; Update: Optional<WorldStateRow> };
      world_events: { Row: WorldEventsRow; Insert: Optional<WorldEventsRow>; Update: Optional<WorldEventsRow> };
      environment_objects: { Row: EnvironmentObjectsRow; Insert: Optional<EnvironmentObjectsRow>; Update: Optional<EnvironmentObjectsRow> };
      characters: { Row: CharactersRow; Insert: Optional<CharactersRow>; Update: Optional<CharactersRow> };
      character_state: { Row: CharacterStateRow; Insert: Optional<CharacterStateRow>; Update: Optional<CharacterStateRow> };
      character_relationships: { Row: CharacterRelationshipsRow; Insert: Optional<CharacterRelationshipsRow>; Update: Optional<CharacterRelationshipsRow> };
      character_memory_links: { Row: CharacterMemoryLinksRow; Insert: Optional<CharacterMemoryLinksRow>; Update: Optional<CharacterMemoryLinksRow> };
      memories: { Row: MemoriesRow; Insert: Optional<MemoriesRow>; Update: Optional<MemoriesRow> };
      conversation_memories: { Row: ConversationMemoriesRow; Insert: Optional<ConversationMemoriesRow>; Update: Optional<ConversationMemoriesRow> };
      object_memories: { Row: ObjectMemoriesRow; Insert: Optional<ObjectMemoriesRow>; Update: Optional<ObjectMemoriesRow> };
      time_capsules: { Row: TimeCapsulesRow; Insert: Optional<TimeCapsulesRow>; Update: Optional<TimeCapsulesRow> };
      knowledge_items: { Row: KnowledgeItemsRow; Insert: Optional<KnowledgeItemsRow>; Update: Optional<KnowledgeItemsRow> };
      knowledge_mastery: { Row: KnowledgeMasteryRow; Insert: Optional<KnowledgeMasteryRow>; Update: Optional<KnowledgeMasteryRow> };
      learning_sessions: { Row: LearningSessionsRow; Insert: Optional<LearningSessionsRow>; Update: Optional<LearningSessionsRow> };
      mistakes: { Row: MistakesRow; Insert: Optional<MistakesRow>; Update: Optional<MistakesRow> };
      explanation_prefs: { Row: ExplanationPrefsRow; Insert: Optional<ExplanationPrefsRow>; Update: Optional<ExplanationPrefsRow> };
      conversations: { Row: ConversationsRow; Insert: Optional<ConversationsRow>; Update: Optional<ConversationsRow> };
      conversation_turns: { Row: ConversationTurnsRow; Insert: Optional<ConversationTurnsRow>; Update: Optional<ConversationTurnsRow> };
      pronunciation_attempts: { Row: PronunciationAttemptsRow; Insert: Optional<PronunciationAttemptsRow>; Update: Optional<PronunciationAttemptsRow> };
      quests: { Row: QuestsRow; Insert: Optional<QuestsRow>; Update: Optional<QuestsRow> };
      user_quests: { Row: UserQuestsRow; Insert: Optional<UserQuestsRow>; Update: Optional<UserQuestsRow> };
      stories: { Row: StoriesRow; Insert: Optional<StoriesRow>; Update: Optional<StoriesRow> };
      story_progress: { Row: StoryProgressRow; Insert: Optional<StoryProgressRow>; Update: Optional<StoryProgressRow> };
      micro_stories: { Row: MicroStoriesRow; Insert: Optional<MicroStoriesRow>; Update: Optional<MicroStoriesRow> };
      cultural_collections: { Row: CulturalCollectionsRow; Insert: Optional<CulturalCollectionsRow>; Update: Optional<CulturalCollectionsRow> };
      collection_entries: { Row: CollectionEntriesRow; Insert: Optional<CollectionEntriesRow>; Update: Optional<CollectionEntriesRow> };
      postcards: { Row: PostcardsRow; Insert: Optional<PostcardsRow>; Update: Optional<PostcardsRow> };
      world_album: { Row: WorldAlbumRow; Insert: Optional<WorldAlbumRow>; Update: Optional<WorldAlbumRow> };
      progression: { Row: ProgressionRow; Insert: Optional<ProgressionRow>; Update: Optional<ProgressionRow> };
      achievements: { Row: AchievementsRow; Insert: Optional<AchievementsRow>; Update: Optional<AchievementsRow> };
      user_achievements: { Row: UserAchievementsRow; Insert: Optional<UserAchievementsRow>; Update: Optional<UserAchievementsRow> };
      currency: { Row: CurrencyRow; Insert: Optional<CurrencyRow>; Update: Optional<CurrencyRow> };
      inventory: { Row: InventoryRow; Insert: Optional<InventoryRow>; Update: Optional<InventoryRow> };
      discoveries: { Row: DiscoveriesRow; Insert: Optional<DiscoveriesRow>; Update: Optional<DiscoveriesRow> };
      rumors: { Row: RumorsRow; Insert: Optional<RumorsRow>; Update: Optional<RumorsRow> };
      journey_events: { Row: JourneyEventsRow; Insert: Optional<JourneyEventsRow>; Update: Optional<JourneyEventsRow> };
      feature_discovery: { Row: FeatureDiscoveryRow; Insert: Optional<FeatureDiscoveryRow>; Update: Optional<FeatureDiscoveryRow> };
      plant_state: { Row: PlantStateRow; Insert: Optional<PlantStateRow>; Update: Optional<PlantStateRow> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      memory_layer: ['profile', 'learning', 'conversation', 'character', 'world', 'story', 'progress', 'preference', 'achievement', 'session'];
      familiarity_stage: ['unknown', 'discovered', 'familiar', 'meaningful', 'personal'];
      mood: ['happy', 'calm', 'curious', 'excited', 'tired', 'concerned', 'proud', 'surprised'];
      quest_category: ['learning', 'story', 'character', 'exploration', 'culture', 'daily', 'seasonal', 'event'];
      experience_mode: ['focus', 'adventure', 'conversation', 'relax', 'challenge', 'creative', 'surprise'];
      story_arc: ['micro', 'side', 'character', 'world', 'seasonal', 'personal'];
      event_scale: ['small', 'medium', 'large'];
      collection_category: ['food', 'festivals', 'places', 'expressions', 'history', 'arts', 'daily'];
      time_of_day: ['morning', 'afternoon', 'evening', 'night'];
      season: ['spring', 'summer', 'autumn', 'winter'];
      plant_stage: ['seed', 'sprout', 'young', 'mature', 'flowering'];
      learning_intention: ['travel', 'conversation', 'study', 'culture', 'casual', 'work'];
    };
    CompositeTypes: Record<string, never>;
  };
}
