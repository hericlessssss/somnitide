-- Migration V3: Update cycle range defaults and existing records
-- Expand standard range from 4-6 to 1-8 cycles

-- 1. Update defaults for new users
ALTER TABLE user_preferences 
ALTER COLUMN min_cycles SET DEFAULT 1,
ALTER COLUMN max_cycles SET DEFAULT 8;

-- 2. Update existing users to the new standard range
UPDATE user_preferences 
SET min_cycles = 1, 
    max_cycles = 8;
