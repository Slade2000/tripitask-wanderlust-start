
-- Modify the handle_new_user_signup function to use SECURITY DEFINER
-- This allows it to bypass row level security when creating profiles

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.user_status (user_id, status)
  VALUES (new.id, 'active');
  
  RETURN new;
END;
$function$;

-- Verify the trigger is properly set up
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
  END IF;
END$$;

-- Add appropriate RLS policies to profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to see and update their own profiles
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;
CREATE POLICY "Users can view and update own profile" 
  ON public.profiles 
  FOR ALL 
  TO authenticated 
  USING (id = auth.uid());

-- Allow public profiles to be viewed by any authenticated user
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (true);
