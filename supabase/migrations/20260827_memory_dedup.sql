-- Prevent duplicate semantic memories for the same user/layer.
-- Existing duplicate rows are intentionally preserved; this migration only
-- blocks new duplicates. The engine also performs an application-level check.
create unique index if not exists memories_user_layer_fact_unique
  on public.memories (user_id, layer, canonical_fact);
