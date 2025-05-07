
# Security Recommendations

This document outlines security recommendations that should be applied to improve the security posture of the application.

## PostGIS Extension in Public Schema

**Issue:** The PostGIS extension (public.postgis) is currently installed in the public schema, which is a security concern.

**Resolution Steps:**
1. Create a new schema specifically for extensions:
   ```sql
   CREATE SCHEMA IF NOT EXISTS extensions;
   ```

2. Move the PostGIS extension from public schema to the new extensions schema:
   ```sql
   ALTER EXTENSION postgis SET SCHEMA extensions;
   ```

3. Update the search_path to include the extensions schema:
   ```sql
   ALTER DATABASE your_database_name SET search_path TO public, extensions;
   ```

4. Verify the extension has been moved:
   ```sql
   SELECT extname, extnamespace::regnamespace as schema
   FROM pg_extension
   WHERE extname = 'postgis';
   ```

> **Note:** Moving the PostGIS extension requires careful planning and potentially downtime. This operation should be performed during a maintenance window after thorough testing in a non-production environment, as it may impact existing database objects that reference PostGIS functions.

## Leaked Password Protection

**Issue:** Supabase Auth's leaked password protection feature is currently disabled. This feature prevents users from using passwords known to be compromised by checking against HaveIBeenPwned.org.

**Resolution Steps:**
1. Go to the Supabase Dashboard.
2. Navigate to Authentication > Providers.
3. Under "Email Signup", enable the "Enable HIBP" option.
4. Save changes.

> **Note:** Enabling this feature will check passwords against the HaveIBeenPwned database during user registration and password changes, enhancing security by preventing the use of known compromised passwords.
