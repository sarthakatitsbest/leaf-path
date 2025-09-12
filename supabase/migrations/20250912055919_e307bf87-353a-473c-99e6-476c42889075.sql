-- Create function to increment user points
CREATE OR REPLACE FUNCTION public.increment_user_points(user_id UUID, points_to_add INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.user_profiles 
  SET total_points = COALESCE(total_points, 0) + points_to_add
  WHERE user_profiles.user_id = increment_user_points.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;