create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  display_name text,
  avatar_url text,
  mood_preference text,
  persona_preference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  content text not null,
  summary text,
  mood text not null,
  images jsonb,
  audio_url text,
  created_at timestamptz not null default now()
);

create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  persona text not null default 'rational',
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'model')),
  content text not null,
  mood_detected text,
  images jsonb,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table chat_messages
add column if not exists metadata jsonb;

create table if not exists emotion_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  source text not null,
  source_id uuid,
  primary_emotion text,
  emotion_tags jsonb,
  semantic_summary text,
  risk_level text,
  created_at timestamptz not null default now()
);

create table if not exists user_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  period_start timestamptz,
  period_end timestamptz,
  summary text not null,
  trend_tags jsonb,
  created_at timestamptz not null default now()
);

create index if not exists journals_user_created_idx on journals(user_id, created_at desc);
create index if not exists chat_sessions_user_created_idx on chat_sessions(user_id, created_at desc);
create index if not exists chat_messages_session_created_idx on chat_messages(session_id, created_at asc);
create index if not exists emotion_events_user_created_idx on emotion_events(user_id, created_at desc);
create index if not exists user_reflections_user_created_idx on user_reflections(user_id, created_at desc);
