
import { supabase } from '@/integrations/supabase/client';
import fs from 'fs';
import path from 'path';

/**
 * Helper function to apply a migration SQL file
 * @param filePath Path to the SQL file
 */
export const applyMigration = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    console.log(`Reading migration file: ${fullPath}`);
    
    const sql = fs.readFileSync(fullPath, 'utf8');
    console.log('SQL to execute:', sql);
    
    // Execute SQL statements one by one
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        // Execute SQL using fetch instead of RPC
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          method: 'POST',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ query: statement })
        });
        
        if (!res.ok) {
          const error = await res.text();
          console.error('Error applying migration statement:', error);
          throw new Error(error);
        }
      }
    }
    
    console.log('Migration applied successfully');
  } catch (err) {
    console.error('Failed to apply migration:', err);
    throw err;
  }
};

/**
 * Apply the reviews foreign keys migration
 */
export const applyReviewsForeignKeysMigration = async (): Promise<void> => {
  await applyMigration('src/services/migrations/add_reviews_foreign_keys.sql');
  console.log('Reviews foreign keys migration completed');
};
