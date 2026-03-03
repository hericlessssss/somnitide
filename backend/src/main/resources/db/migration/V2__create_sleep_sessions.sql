-- Migration V2: sleep_sessions table
-- UUID primary key; indexed by user_id and ended_at_utc for history queries

CREATE TABLE sleep_sessions (
    id                           UUID        PRIMARY KEY,
    user_id                      TEXT        NOT NULL,
    started_at_utc               TIMESTAMPTZ NOT NULL,
    sleep_start_estimated_at_utc TIMESTAMPTZ NOT NULL,
    ended_at_utc                 TIMESTAMPTZ,
    quality_rating               INTEGER     CHECK (quality_rating BETWEEN 1 AND 5),
    note                         TEXT
);

CREATE INDEX idx_sleep_sessions_user_id  ON sleep_sessions(user_id);
CREATE INDEX idx_sleep_sessions_ended_at ON sleep_sessions(ended_at_utc);
