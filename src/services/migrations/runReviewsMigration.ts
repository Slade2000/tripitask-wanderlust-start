
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

/**
 * Execute migration SQL directly
 */
export const applyReviewsMigration = async (): Promise<boolean> => {
  try {
    toast.info("Applying reviews foreign key migration...");
    
    // SQL statements to execute - we'll run them one at a time
    const statements = [
      `ALTER TABLE public.reviews
       ADD CONSTRAINT fk_reviewer
       FOREIGN KEY (reviewer_id) REFERENCES public.profiles (id)`,
      
      `ALTER TABLE public.reviews
       ADD CONSTRAINT fk_reviewee
       FOREIGN KEY (reviewee_id) REFERENCES public.profiles (id)`,
      
      `ALTER TABLE public.reviews
       ADD CONSTRAINT fk_review_task
       FOREIGN KEY (task_id) REFERENCES public.tasks (id)`
    ];
    
    // Execute each SQL statement
    for (const sql of statements) {
      // Using the execute_sql stored function if available in your Supabase instance
      const { error } = await supabase.rpc('execute_sql', { query: sql });
      
      if (error) {
        // Fallback approach: many Supabase instances allow executing SQL via the REST endpoint
        console.log(`Using fallback approach for: ${sql}`);
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ query: sql })
        });
        
        if (!res.ok) {
          throw new Error(`Failed to execute SQL: ${await res.text()}`);
        }
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
