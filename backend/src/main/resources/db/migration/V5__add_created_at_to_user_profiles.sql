-- Migration V5: Add created_at_utc to user_profiles
-- Used to track and display registration date ("member since")

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_at_utc TIMESTAMPTZ NOT NULL DEFAULT NOW();
