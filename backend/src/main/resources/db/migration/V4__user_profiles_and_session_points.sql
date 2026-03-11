-- Migration V4: User Profiles and Session Points
-- Adds support for unique @handles, avatars and global scores

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id          TEXT        PRIMARY KEY,
    handle           TEXT        UNIQUE,
    avatar_seed      TEXT,
    total_score      INTEGER     NOT NULL DEFAULT 0,
    updated_at_utc   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sleep_sessions' AND column_name='earned_points') THEN
        ALTER TABLE sleep_sessions ADD COLUMN earned_points INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Optional: Index total_score for ranking queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_score ON user_profiles(total_score DESC);
