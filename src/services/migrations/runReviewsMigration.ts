
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import path from 'path';
import fs from 'fs';

/**
 * Execute migration SQL directly
 */
export const applyReviewsMigration = async (): Promise<boolean> => {
  try {
    toast.info("Applying reviews foreign key migration...");
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'src/services/migrations/add_reviews_foreign_keys.sql');
    const sql = fs.existsSync(migrationPath) 
      ? fs.readFileSync(migrationPath, 'utf8')
      : `
        -- Add foreign key constraints to reviews table
        ALTER TABLE public.reviews
        ADD CONSTRAINT fk_reviewer
        FOREIGN KEY (reviewer_id) REFERENCES public.profiles (id);
        
        ALTER TABLE public.reviews
        ADD CONSTRAINT fk_reviewee
        FOREIGN KEY (reviewee_id) REFERENCES public.profiles (id);
        
        -- Add additional constraint to link reviews to tasks
        ALTER TABLE public.reviews
        ADD CONSTRAINT fk_review_task
        FOREIGN KEY (task_id) REFERENCES public.tasks (id);
      `;
      
    // Execute statements one by one for better error handling
    const statements = sql.split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
      
    for (const statement of statements) {
      // Use REST API directly since RPC is limited
      const { error } = await supabase.postgrest.rpc('execute_sql', { 
        query: statement 
      });
      
      if (error) {
        console.error('Error applying migration statement:', error);
        toast.error(`Migration error: ${error.message}`);
        return false;
      }
    }
    
    toast.success("Reviews foreign key migration applied successfully!");
    return true;
  } catch (err: any) {
    console.error("Failed to apply reviews migration:", err);
    toast.error(`Migration failed: ${err.message || 'Unknown error'}`);
    return false;
  }
};
