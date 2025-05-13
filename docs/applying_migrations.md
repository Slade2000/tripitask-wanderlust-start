
# Applying SQL Migrations

This document explains how to apply the SQL migrations to fix user signup issues.

## Fix for "Row Level Security" Error During User Signup

The migration file `enable_trigger_bypass_rls.sql` addresses security concerns related to row level security preventing user profile creation during signup.

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
4. Copy the contents of the `enable_trigger_bypass_rls.sql` file.
5. Paste into the SQL Editor and click "Run".

After applying this migration, user signups should work correctly as the trigger function will have permission to create profile records.
