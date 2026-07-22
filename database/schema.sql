CREATE TABLE users(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  walking_since DATE
);

CREATE TABLE trees(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- user_id NULL means a preset tag available to everyone; set means a
-- custom tag owned by that user
CREATE TABLE tags (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name    TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- one row per item on the timeline; tag distinguishes the kind:
-- 'root' | 'milestone' | 'leaf' are structural entries with their own
-- heading/body; 'verse' | 'prayer' are standalone items whose real
-- content lives in entries_verses/entries_prayers via entry_id.
-- media has no standalone tag - it only ever attaches to an existing
-- entry via entries_media.entry_id
CREATE TABLE entries(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id UUID REFERENCES trees(id) ON DELETE CASCADE,
  heading TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  body TEXT,
  tag TEXT,
  category TEXT,
  is_praise BOOLEAN NOT NULL DEFAULT false,
  is_encouragement BOOLEAN NOT NULL DEFAULT false,
  is_hearted BOOLEAN NOT NULL DEFAULT false,
  tag_id UUID REFERENCES tags(id)
);

CREATE TABLE entries_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  verse_ref TEXT,
  verse_text TEXT
);

CREATE TABLE entries_prayers(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  prayer_text TEXT,
  answered BOOLEAN NOT NULL DEFAULT false,
  answered_at DATE,
  answer_note TEXT
);

CREATE TABLE entries_media (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id   UUID REFERENCES entries(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  url        TEXT,
  label      TEXT
);

INSERT INTO tags (name, user_id) VALUES
  ('Salvation', NULL),
  ('Baptism', NULL),
  ('Answered Prayer', NULL),
  ('Healing', NULL),
  ('Breakthrough', NULL),
  ('Trial / Struggle', NULL),
  ('Gratitude', NULL),
  ('Family', NULL),
  ('Calling / Purpose', NULL);
