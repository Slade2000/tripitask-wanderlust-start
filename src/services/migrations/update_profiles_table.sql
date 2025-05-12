
-- Add new columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS about text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS services text[],
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS jobs_completed integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add storage bucket for profile images if it doesn't exist
-- This would need to be executed in the Supabase dashboard or via API
