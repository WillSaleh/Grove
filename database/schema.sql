CREATE TABLE users(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  walking_since DATE
);

CREATE TABLE trees(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id)
);

-- one row per node on the tree; tag distinguishes the three kinds ('root' | 'milestone' | 'leaf')
CREATE TABLE entries(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES trees(id),
  heading TEXT,
  entry_date DATE,
  body TEXT,
  tag TEXT,
  is_praise BOOLEAN NOT NULL DEFAULT false,
  is_encouragement BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE entries_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES entries(id),
  verse_ref TEXT,
  verse_text TEXT
);

CREATE TABLE entries_prayers(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES entries(id),
  prayer_text TEXT,
  answered BOOLEAN NOT NULL DEFAULT false,
  answered_at DATE,
  answer_note TEXT
);

CREATE TABLE entries_media (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id   UUID REFERENCES entries(id),
  media_type TEXT NOT NULL,
  url        TEXT,
  label      TEXT
);
