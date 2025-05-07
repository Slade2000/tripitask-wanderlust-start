
# Applying SQL Migrations

This document explains how to apply the SQL migrations to your Supabase project.

## Function Search Path Migrations

The migration file `20240507_fix_function_search_paths.sql` addresses security concerns related to mutable search paths in database functions. To apply this migration:

### Option 1: Using Supabase CLI

If you have the Supabase CLI installed:

1. Make sure you're authenticated with Supabase:
   ```bash
   supabase login
   ```

2. Apply the migration:
   ```bash
   supabase db push --db-url "$SUPABASE_DB_URL"
   ```

### Option 2: Using Supabase Dashboard SQL Editor

1. Log in to the Supabase Dashboard.
2. Navigate to your project.
3. Go to the SQL Editor tab.
4. Copy the contents of the migration file.
5. Paste into the SQL Editor and click "Run".

## PostGIS Extension Migration

Moving the PostGIS extension requires careful planning and may impact your application. The steps are documented in `security_recommendations.md`, but should be executed with caution, preferably during a maintenance window and after thorough testing.

## Leaked Password Protection

This is a configuration change in the Supabase Dashboard and doesn't require SQL migrations. Follow the steps outlined in `security_recommendations.md`.
