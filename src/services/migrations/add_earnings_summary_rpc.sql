
-- Create a SQL function that groups and sums earnings by status
CREATE OR REPLACE FUNCTION public.sum_earnings_by_status(provider_id_param UUID)
RETURNS TABLE (status TEXT, sum DECIMAL) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.status, 
    SUM(pe.net_amount)::DECIMAL
  FROM 
    provider_earnings pe
  WHERE 
    pe.provider_id = provider_id_param
  GROUP BY 
    pe.status;
END;
$$;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.sum_earnings_by_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sum_earnings_by_status(UUID) TO service_role;
