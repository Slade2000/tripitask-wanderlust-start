
-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure existing policy for users to see their own profile
DROP POLICY IF EXISTS "Select own profile" ON public.profiles;
CREATE POLICY "Select own profile"
  ON public.profiles
  FOR ALL -- This allows all operations (select, update, delete) on their own profile
  USING (id = auth.uid());

-- Add policy to allow authenticated users to read public profile information
DROP POLICY IF EXISTS "Read public profile fields" ON public.profiles;
CREATE POLICY "Read public profile fields"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Alternative approach with column-level privileges if needed:
-- GRANT SELECT(full_name, avatar_url, business_name, location) ON public.profiles TO authenticated;

-- Make sure RLS is enabled
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
