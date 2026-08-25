create extension if not exists pgcrypto;

create type memory_layer as enum ('profile','learning','conversation','character','world','story','progress','preference','achievement','session');
create type familiarity_stage as enum ('unknown','discovered','familiar','meaningful','personal');
create type mood as enum ('happy','calm','curious','excited','tired','concerned','proud','surprised');
create type quest_category as enum ('learning','story','character','exploration','culture','daily','seasonal','event');
create type experience_mode as enum ('focus','adventure','conversation','relax','challenge','creative','surprise');
create type story_arc as enum ('micro','side','character','world','seasonal','personal');
create type event_scale as enum ('small','medium','large');
create type collection_category as enum ('food','festivals','places','expressions','history','arts','daily');
create type time_of_day as enum ('morning','afternoon','evening','night');
create type season as enum ('spring','summer','autumn','winter');
create type plant_stage as enum ('seed','sprout','young','mature','flowering');
create type learning_intention as enum ('travel','conversation','study','culture','casual','work');

create function public.is_authenticated() returns boolean language sql stable as $$
  select auth.role() = 'authenticated'
$$;

create function public.is_owner(user_id uuid) returns boolean language sql stable as $$
  select auth.uid() = user_id
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  target_language text,
  world_id uuid,
  learning_intention learning_intention,
  created_at timestamptz not null default now()
);

create table public.learner_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  session_length_minutes int not null default 5,
  experience_mode experience_mode not null default 'focus',
  audio_enabled boolean not null default true,
  accessibility_reduced_motion boolean not null default false,
  accessibility_high_contrast boolean not null default false,
  energy_sizing text not null default 'ready',
  updated_at timestamptz not null default now()
);

create table public.worlds (
  id uuid primary key default gen_random_uuid(),
  canonical_key text not null unique,
  display_name text not null,
  curriculum_ref text,
  created_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds (id) on delete cascade,
  key text not null,
  name text not null,
  familiarity_stage familiarity_stage not null default 'unknown',
  unlocked_at timestamptz,
  unique (world_id, key)
);

create table public.world_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  world_id uuid references public.worlds (id) on delete set null,
  location_id uuid references public.locations (id) on delete set null,
  time_of_day time_of_day not null default 'morning',
  season season not null default 'spring',
  weather text not null default 'clear',
  last_active_at timestamptz not null default now(),
  daily_refresh_token text not null default '',
  updated_at timestamptz not null default now()
);

create table public.world_events (
  id uuid primary key default gen_random_uuid(),
  world_id uuid not null references public.worlds (id) on delete cascade,
  scale event_scale not null default 'small',
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null default now(),
  ends_at timestamptz
);

create table public.environment_objects (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references public.locations (id) on delete cascade,
  object_key text not null,
  position jsonb,
  rotation numeric,
  interaction_state jsonb not null default '{}'::jsonb,
  unlock_source text
);

create table public.characters (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  role text not null,
  personality jsonb not null default '{}'::jsonb,
  dialogue_style text,
  memory_access_policy jsonb not null default '{}'::jsonb,
  preferred_locations jsonb not null default '[]'::jsonb
);

create table public.character_state (
  character_id uuid primary key references public.characters (id) on delete cascade,
  mood mood not null default 'calm',
  energy int not null default 80,
  current_activity text,
  routine_schedule jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.character_relationships (
  user_id uuid not null references auth.users (id) on delete cascade,
  character_id uuid not null references public.characters (id) on delete cascade,
  familiarity numeric not null default 0,
  trust numeric not null default 0,
  friendship numeric not null default 0,
  shared_history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, character_id)
);

create table public.character_memory_links (
  character_id uuid not null references public.characters (id) on delete cascade,
  memory_id uuid not null references public.memories (id) on delete cascade,
  primary key (character_id, memory_id)
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  layer memory_layer not null,
  canonical_fact text not null,
  occurred_at timestamptz not null default now(),
  source_event_id uuid
);

create table public.conversation_memories (
  memory_id uuid primary key references public.memories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid not null,
  evaluation jsonb not null default '{}'::jsonb
);

create table public.object_memories (
  memory_id uuid primary key references public.memories (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  object_id uuid references public.environment_objects (id) on delete cascade,
  note text not null
);

create table public.time_capsules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  message text not null,
  reveal_at_milestone text not null,
  revealed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  world_id uuid references public.worlds (id) on delete set null,
  type text not null,
  term text not null,
  meaning text not null,
  examples jsonb not null default '[]'::jsonb,
  cultural_notes text,
  related_items jsonb not null default '[]'::jsonb
);

create table public.knowledge_mastery (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.knowledge_items (id) on delete cascade,
  mastery_score numeric not null default 0,
  last_seen timestamptz,
  next_review timestamptz,
  proficiency jsonb not null default '{}'::jsonb,
  primary key (user_id, item_id)
);

create table public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  activity_type text not null,
  accuracy numeric,
  response_times jsonb not null default '[]'::jsonb,
  mistakes jsonb not null default '[]'::jsonb
);

create table public.mistakes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.learning_sessions (id) on delete cascade,
  item_id uuid references public.knowledge_items (id) on delete set null,
  error_type text not null,
  corrected_at timestamptz
);

create table public.explanation_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  preferred_mode text not null default 'simple'
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  location_id uuid references public.locations (id) on delete set null,
  character_id uuid references public.characters (id) on delete set null,
  started_at timestamptz not null default now(),
  scenario_ref text
);

create table public.conversation_turns (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null,
  content text not null,
  evaluation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.pronunciation_attempts (
  id uuid primary key default gen_random_uuid(),
  turn_id uuid not null references public.conversation_turns (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  score numeric,
  phoneme_feedback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.quests (
  id uuid primary key default gen_random_uuid(),
  category quest_category not null,
  world_id uuid references public.worlds (id) on delete set null,
  title text not null,
  requirements jsonb not null default '{}'::jsonb,
  unlocks jsonb not null default '{}'::jsonb
);

create table public.user_quests (
  user_id uuid not null references auth.users (id) on delete cascade,
  quest_id uuid not null references public.quests (id) on delete cascade,
  status text not null default 'active',
  progress jsonb not null default '{}'::jsonb,
  soft_consequence jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, quest_id)
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  arc_type story_arc not null,
  chapter int not null default 1,
  episode int not null default 1,
  title text not null,
  content_ref text
);

create table public.story_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  story_id uuid not null references public.stories (id) on delete cascade,
  current_node text,
  choices jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

create table public.micro_stories (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  pool_key text not null,
  content_ref text not null,
  unique (location_id, pool_key)
);

create table public.cultural_collections (
  id uuid primary key default gen_random_uuid(),
  category collection_category not null,
  completion_state jsonb not null default '{}'::jsonb
);

create table public.collection_entries (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.cultural_collections (id) on delete cascade,
  item_ref text not null,
  discovered_at timestamptz not null default now()
);

create table public.postcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  location_id uuid references public.locations (id) on delete set null,
  world_id uuid references public.worlds (id) on delete set null,
  image_ref text,
  visit_date date not null default current_date,
  description text not null,
  cultural_learning text
);

create table public.world_album (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_type text not null,
  ref_id uuid,
  captured_at timestamptz not null default now()
);

create table public.progression (
  user_id uuid primary key references auth.users (id) on delete cascade,
  xp numeric not null default 0,
  level int not null default 1,
  skills jsonb not null default '{}'::jsonb,
  streak int not null default 0,
  milestones jsonb not null default '[]'::jsonb
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  criteria jsonb not null default '{}'::jsonb
);

create table public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  context jsonb not null default '{}'::jsonb,
  primary key (user_id, achievement_id)
);

create table public.currency (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance numeric not null default 0
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_key text not null,
  provenance jsonb not null default '{}'::jsonb,
  placed_object_id uuid references public.environment_objects (id) on delete set null
);

create table public.discoveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  ref text not null,
  discovered_at timestamptz not null default now(),
  eligible_since timestamptz not null default now()
);

create table public.rumors (
  id uuid primary key default gen_random_uuid(),
  world_id uuid references public.worlds (id) on delete cascade,
  text text not null,
  points_to_ref text
);

create table public.journey_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  producer text not null,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.feature_discovery (
  user_id uuid not null references auth.users (id) on delete cascade,
  feature_key text not null,
  discovered_at timestamptz not null default now(),
  eligibility jsonb not null default '{}'::jsonb,
  primary key (user_id, feature_key)
);

create table public.plant_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stage plant_stage not null default 'seed',
  variant text not null default 'default',
  last_cared_at timestamptz not null default now()
);

alter table public.profiles add constraint profiles_world_fk
  foreign key (world_id) references public.worlds (id) on delete set null;

alter table public.profiles enable row level security;
alter table public.learner_preferences enable row level security;
alter table public.worlds enable row level security;
alter table public.locations enable row level security;
alter table public.world_state enable row level security;
alter table public.world_events enable row level security;
alter table public.environment_objects enable row level security;
alter table public.characters enable row level security;
alter table public.character_state enable row level security;
alter table public.character_relationships enable row level security;
alter table public.character_memory_links enable row level security;
alter table public.memories enable row level security;
alter table public.conversation_memories enable row level security;
alter table public.object_memories enable row level security;
alter table public.time_capsules enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.knowledge_mastery enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.mistakes enable row level security;
alter table public.explanation_prefs enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_turns enable row level security;
alter table public.pronunciation_attempts enable row level security;
alter table public.quests enable row level security;
alter table public.user_quests enable row level security;
alter table public.stories enable row level security;
alter table public.story_progress enable row level security;
alter table public.micro_stories enable row level security;
alter table public.cultural_collections enable row level security;
alter table public.collection_entries enable row level security;
alter table public.postcards enable row level security;
alter table public.world_album enable row level security;
alter table public.progression enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.currency enable row level security;
alter table public.inventory enable row level security;
alter table public.discoveries enable row level security;
alter table public.rumors enable row level security;
alter table public.journey_events enable row level security;
alter table public.feature_discovery enable row level security;
alter table public.plant_state enable row level security;

create policy profiles_select on public.profiles for select using (public.is_owner(id));
create policy profiles_upsert on public.profiles for insert with check (public.is_owner(id));
create policy profiles_update on public.profiles for update using (public.is_owner(id));

create policy prefs_select on public.learner_preferences for select using (public.is_owner(user_id));
create policy prefs_upsert on public.learner_preferences for insert with check (public.is_owner(user_id));
create policy prefs_update on public.learner_preferences for update using (public.is_owner(user_id));

create policy world_state_select on public.world_state for select using (public.is_owner(user_id));
create policy world_state_upsert on public.world_state for insert with check (public.is_owner(user_id));
create policy world_state_update on public.world_state for update using (public.is_owner(user_id));

create policy char_rel_select on public.character_relationships for select using (public.is_owner(user_id));
create policy char_rel_upsert on public.character_relationships for insert with check (public.is_owner(user_id));
create policy char_rel_update on public.character_relationships for update using (public.is_owner(user_id));

create policy memories_select on public.memories for select using (public.is_owner(user_id));
create policy memories_insert on public.memories for insert with check (public.is_owner(user_id));

create policy conv_mem_select on public.conversation_memories for select using (public.is_owner(user_id));
create policy conv_mem_insert on public.conversation_memories for insert with check (public.is_owner(user_id));

create policy obj_mem_select on public.object_memories for select using (public.is_owner(user_id));
create policy obj_mem_insert on public.object_memories for insert with check (public.is_owner(user_id));

create policy capsules_select on public.time_capsules for select using (public.is_owner(user_id));
create policy capsules_insert on public.time_capsules for insert with check (public.is_owner(user_id));

create policy mastery_select on public.knowledge_mastery for select using (public.is_owner(user_id));
create policy mastery_upsert on public.knowledge_mastery for insert with check (public.is_owner(user_id));
create policy mastery_update on public.knowledge_mastery for update using (public.is_owner(user_id));

create policy sessions_select on public.learning_sessions for select using (public.is_owner(user_id));
create policy sessions_insert on public.learning_sessions for insert with check (public.is_owner(user_id));

create policy mistakes_select on public.mistakes for select using (exists (select 1 from public.learning_sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy mistakes_insert on public.mistakes for insert with check (exists (select 1 from public.learning_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy explanation_prefs_select on public.explanation_prefs for select using (public.is_owner(user_id));
create policy explanation_prefs_upsert on public.explanation_prefs for insert with check (public.is_owner(user_id));
create policy explanation_prefs_update on public.explanation_prefs for update using (public.is_owner(user_id));

create policy conversations_select on public.conversations for select using (public.is_owner(user_id));
create policy conversations_insert on public.conversations for insert with check (public.is_owner(user_id));

create policy conv_turns_select on public.conversation_turns for select using (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy conv_turns_insert on public.conversation_turns for insert with check (exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));

create policy pron_select on public.pronunciation_attempts for select using (public.is_owner(user_id));
create policy pron_insert on public.pronunciation_attempts for insert with check (public.is_owner(user_id));

create policy user_quests_select on public.user_quests for select using (public.is_owner(user_id));
create policy user_quests_upsert on public.user_quests for insert with check (public.is_owner(user_id));
create policy user_quests_update on public.user_quests for update using (public.is_owner(user_id));

create policy story_progress_select on public.story_progress for select using (public.is_owner(user_id));
create policy story_progress_upsert on public.story_progress for insert with check (public.is_owner(user_id));
create policy story_progress_update on public.story_progress for update using (public.is_owner(user_id));

create policy postcards_select on public.postcards for select using (public.is_owner(user_id));
create policy postcards_insert on public.postcards for insert with check (public.is_owner(user_id));

create policy world_album_select on public.world_album for select using (public.is_owner(user_id));
create policy world_album_insert on public.world_album for insert with check (public.is_owner(user_id));

create policy progression_select on public.progression for select using (public.is_owner(user_id));
create policy progression_upsert on public.progression for insert with check (public.is_owner(user_id));
create policy progression_update on public.progression for update using (public.is_owner(user_id));

create policy user_achievements_select on public.user_achievements for select using (public.is_owner(user_id));
create policy user_achievements_insert on public.user_achievements for insert with check (public.is_owner(user_id));

create policy currency_select on public.currency for select using (public.is_owner(user_id));
create policy currency_upsert on public.currency for insert with check (public.is_owner(user_id));
create policy currency_update on public.currency for update using (public.is_owner(user_id));

create policy inventory_select on public.inventory for select using (public.is_owner(user_id));
create policy inventory_insert on public.inventory for insert with check (public.is_owner(user_id));

create policy discoveries_select on public.discoveries for select using (public.is_owner(user_id));
create policy discoveries_insert on public.discoveries for insert with check (public.is_owner(user_id));

create policy journey_events_select on public.journey_events for select using (public.is_owner(user_id));
create policy journey_events_insert on public.journey_events for insert with check (public.is_owner(user_id));

create policy feature_discovery_select on public.feature_discovery for select using (public.is_owner(user_id));
create policy feature_discovery_upsert on public.feature_discovery for insert with check (public.is_owner(user_id));

create policy plant_state_select on public.plant_state for select using (public.is_owner(user_id));
create policy plant_state_upsert on public.plant_state for insert with check (public.is_owner(user_id));
create policy plant_state_update on public.plant_state for update using (public.is_owner(user_id));

create policy worlds_read on public.worlds for select using (public.is_authenticated());
create policy locations_read on public.locations for select using (public.is_authenticated());
create policy world_events_read on public.world_events for select using (public.is_authenticated());
create policy env_objects_read on public.environment_objects for select using (public.is_authenticated());
create policy characters_read on public.characters for select using (public.is_authenticated());
create policy character_state_read on public.character_state for select using (public.is_authenticated());
create policy char_mem_links_read on public.character_memory_links for select using (public.is_authenticated());
create policy knowledge_read on public.knowledge_items for select using (public.is_authenticated());
create policy quests_read on public.quests for select using (public.is_authenticated());
create policy stories_read on public.stories for select using (public.is_authenticated());
create policy micro_stories_read on public.micro_stories for select using (public.is_authenticated());
create policy cultural_collections_read on public.cultural_collections for select using (public.is_authenticated());
create policy collection_entries_read on public.collection_entries for select using (public.is_authenticated());
create policy achievements_read on public.achievements for select using (public.is_authenticated());
create policy rumors_read on public.rumors for select using (public.is_authenticated());
