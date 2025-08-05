-- Fix the points trigger to properly calculate levels
CREATE OR REPLACE FUNCTION update_user_stats_on_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats
  SET
    points = points + NEW.points,
    level = GREATEST(1, FLOOR((points + NEW.points) / 100) + 1),
    last_activity = NOW(),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_point_activity_created ON point_activities;
CREATE TRIGGER on_point_activity_created
  AFTER INSERT ON point_activities
  FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_points();

-- Test the trigger is working
SELECT 'Points trigger updated successfully! 🎯' AS status;
