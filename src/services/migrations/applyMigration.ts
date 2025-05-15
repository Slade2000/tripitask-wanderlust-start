
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
    
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('Error applying migration:', error);
      throw error;
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
