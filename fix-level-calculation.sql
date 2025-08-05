-- Fix level calculation to start from level 1
-- Run this in your Supabase SQL Editor

-- Function to update user stats when points are added (FIXED)
CREATE OR REPLACE FUNCTION update_user_stats_on_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats
  SET
    points = points + NEW.points,
    level = GREATEST(1, ((points + NEW.points) / 100) + 1),
    last_activity = NOW(),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate and update streaks
CREATE OR REPLACE FUNCTION update_streak_on_activity()
RETURNS TRIGGER AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
  today_entries_count INTEGER;
  current_streak_val INTEGER;
  longest_streak_val INTEGER;
BEGIN
  -- Count activities for today (mood entries or journal entries)
  SELECT COUNT(*) INTO today_entries_count
  FROM (
    SELECT user_id, date FROM mood_entries WHERE user_id = NEW.user_id AND date = today_date
    UNION
    SELECT user_id, date FROM journal_entries WHERE user_id = NEW.user_id AND date = today_date
  ) combined_entries;

  -- Get current stats
  SELECT current_streak, longest_streak INTO current_streak_val, longest_streak_val
  FROM user_stats WHERE user_id = NEW.user_id;

  -- If no existing stats, default to 0
  current_streak_val := COALESCE(current_streak_val, 0);
  longest_streak_val := COALESCE(longest_streak_val, 0);

  -- If this is the first entry today, increment streak
  IF today_entries_count = 1 THEN
    -- Check if user had activity yesterday
    IF EXISTS (
      SELECT 1 FROM (
        SELECT user_id, date FROM mood_entries WHERE user_id = NEW.user_id AND date = yesterday_date
        UNION
        SELECT user_id, date FROM journal_entries WHERE user_id = NEW.user_id AND date = yesterday_date
      ) yesterday_entries
    ) THEN
      -- Continue streak
      current_streak_val := current_streak_val + 1;
    ELSE
      -- Start new streak
      current_streak_val := 1;
    END IF;

    -- Update longest streak if current is higher
    longest_streak_val := GREATEST(longest_streak_val, current_streak_val);

    -- Update user stats
    UPDATE user_stats
    SET
      current_streak = current_streak_val,
      longest_streak = longest_streak_val,
      total_entries = total_entries + 1,
      last_activity = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for streak calculation on mood and journal entries
DROP TRIGGER IF EXISTS on_mood_entry_streak_update ON mood_entries;
CREATE TRIGGER on_mood_entry_streak_update
  AFTER INSERT ON mood_entries
  FOR EACH ROW EXECUTE FUNCTION update_streak_on_activity();

DROP TRIGGER IF EXISTS on_journal_entry_streak_update ON journal_entries;
CREATE TRIGGER on_journal_entry_streak_update
  AFTER INSERT ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_streak_on_activity();

-- Function to update word count in journal entries
CREATE OR REPLACE FUNCTION update_word_count_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats
  SET
    total_words = total_words + NEW.word_count,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update word count stats
DROP TRIGGER IF EXISTS on_journal_word_count_update ON journal_entries;
CREATE TRIGGER on_journal_word_count_update
  AFTER INSERT ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_word_count_stats();

SELECT 'Level calculation and streak tracking fixed! 🎯' AS status;
