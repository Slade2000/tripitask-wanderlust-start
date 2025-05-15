
# Applying Reviews Foreign Key Migrations

This document explains how to apply the SQL migrations to add foreign key constraints to the reviews table, which fixes issues with querying reviews data.

## Using Supabase Dashboard

1. Log in to the Supabase Dashboard.
2. Navigate to your project.
3. Go to the SQL Editor tab.
4. Copy the contents of the `src/services/migrations/add_reviews_foreign_keys.sql` file.
5. Paste into the SQL Editor and click "Run".

## Using Supabase CLI

If you have the Supabase CLI installed:

1. Make sure you're authenticated with Supabase:
   ```bash
   supabase login
   ```

2. Apply the migration:
   ```bash
   supabase db diff -f add_reviews_foreign_keys
   supabase db push
   ```

## Using Custom Script

We've included a Node.js script to apply the migration:

```bash
# Set your database URL
export SUPABASE_DB_URL="postgres://postgres:your-password@your-project-ref.supabase.co:6543/postgres"

# Run the script
node scripts/apply-reviews-migration.js
```

After applying this migration, user reviews should display correctly in the dashboard.
