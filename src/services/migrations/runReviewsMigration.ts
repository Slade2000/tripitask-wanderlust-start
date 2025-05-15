
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

/**
 * Execute a SQL command directly through the Supabase client
 * @param sql SQL command to execute
 */
export const executeSQL = async (sql: string): Promise<boolean> => {
  try {
    // This approach requires administrative privileges
    // Only use for migrations with proper authentication
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'apikey': `${process.env.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      console.error('Failed to execute SQL:', await response.text());
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error executing SQL:', err);
    return false;
  }
};

/**
 * Apply the reviews foreign keys migration using the Supabase Dashboard
 * as recommended in the documentation
 */
export const applyReviewsMigration = async (): Promise<void> => {
  try {
    toast.info(
      "Please apply the reviews migration using the Supabase Dashboard. Check the docs/applying_foreign_key_migrations.md file for instructions.",
      {
        duration: 10000,
      }
    );
    
    console.log("Please follow the instructions in docs/applying_foreign_key_migrations.md to apply the migration");
  } catch (err) {
    console.error("Failed to notify about reviews migration:", err);
    toast.error("Error processing reviews migration request");
  }
};
