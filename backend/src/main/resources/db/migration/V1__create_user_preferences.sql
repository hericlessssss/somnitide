-- Migration V1: user_preferences table
-- Primary key is the Supabase user ID (text/UUID string)

CREATE TABLE user_preferences (
    user_id            TEXT        PRIMARY KEY,
    sleep_latency_min  INTEGER     NOT NULL DEFAULT 14,
    cycle_length_min   INTEGER     NOT NULL DEFAULT 90,
    min_cycles         INTEGER     NOT NULL DEFAULT 4,
    max_cycles         INTEGER     NOT NULL DEFAULT 6,
    buffer_min         INTEGER     NOT NULL DEFAULT 5,
    updated_at_utc     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
