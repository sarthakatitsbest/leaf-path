-- Add points column to user_profiles if not exists
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;

-- Create upsert_leaderboard RPC function
CREATE OR REPLACE FUNCTION upsert_leaderboard(p_user_id uuid, p_points integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO leaderboard(user_id, weekly_points, total_points, week_start, updated_at)
  VALUES (p_user_id, p_points, p_points, date_trunc('week', CURRENT_DATE), now())
  ON CONFLICT (user_id, week_start) DO UPDATE
    SET weekly_points = leaderboard.weekly_points + p_points,
        total_points = leaderboard.total_points + p_points,
        updated_at = now();

  -- Also update user_profiles points
  UPDATE user_profiles 
  SET total_points = COALESCE(total_points, 0) + p_points,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;