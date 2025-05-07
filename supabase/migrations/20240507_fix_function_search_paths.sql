
-- Add explicit search_path to handle_new_user_signup function
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

-- Add explicit search_path to set_job_location_geom function
CREATE OR REPLACE FUNCTION public.set_job_location_geom()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$function$;
