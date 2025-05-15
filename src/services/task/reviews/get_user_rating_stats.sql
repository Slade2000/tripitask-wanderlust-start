
-- Function to get a user's average rating and review count
CREATE OR REPLACE FUNCTION public.get_user_rating_stats(user_id UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  review_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(rating)::NUMERIC, 0) AS average_rating,
    COUNT(*)::BIGINT AS review_count
  FROM reviews
  WHERE reviewee_id = user_id;
END;
$$;
