
import { supabase } from "@/integrations/supabase/client";

/**
 * Counts the total number of offers for a given task
 */
export async function countOffersForTask(taskId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', taskId);

    if (error) {
      console.error("Error counting task offers:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error counting task offers:", error);
    return 0;
  }
}
