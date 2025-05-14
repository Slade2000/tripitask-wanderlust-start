
-- Create a secure function that allows providers to update task status
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.update_task_status_for_provider(
  task_id UUID,
  provider_id UUID,
  new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Execute with owner privileges to bypass RLS
SET search_path = public
AS $$
DECLARE
  is_accepted BOOLEAN;
  task_exists BOOLEAN;
  result BOOLEAN;
BEGIN
  -- Check if the provider is an accepted provider for this task
  SELECT EXISTS(
    SELECT 1 FROM offers 
    WHERE offers.task_id = $1 
    AND offers.provider_id = $2 
    AND offers.status = 'accepted'
  ) INTO is_accepted;
  
  -- Check if the task exists
  SELECT EXISTS(
    SELECT 1 FROM tasks
    WHERE tasks.id = $1
  ) INTO task_exists;
  
  -- If not accepted or task doesn't exist, return false
  IF NOT is_accepted OR NOT task_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Update the task status (using owner privileges to bypass RLS)
  UPDATE tasks
  SET status = $3
  WHERE id = $1;
  
  -- Check if the update was successful
  GET DIAGNOSTICS result = ROW_COUNT;
  
  RETURN result > 0;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_task_status_for_provider TO authenticated;

-- Add comment explaining the function's purpose
COMMENT ON FUNCTION public.update_task_status_for_provider IS 
'Allows a service provider with an accepted offer to update a task status. Bypasses RLS with SECURITY DEFINER.';
