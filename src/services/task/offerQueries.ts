
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/types/offer";

export async function getTaskOffers(taskId: string): Promise<Offer[]> {
  try {
    console.log("Fetching offers for task:", taskId);
    
    // This is a mock implementation until we create the offers table
    // In a real implementation, you would query the offers table for real data
    return [
      {
        id: "offer-1",
        task_id: taskId,
        provider_id: "provider-1",
        amount: 180,
        expected_delivery_date: new Date().toISOString(),
        status: 'pending' as 'pending' | 'accepted' | 'rejected',
        created_at: new Date().toISOString(),
        provider: {
          id: "provider-1",
          name: "John Doe",
          avatar_url: "",
          rating: 4.8,
          success_rate: "92% jobs completed successfully"
        }
      },
      {
        id: "offer-2",
        task_id: taskId,
        provider_id: "provider-2",
        amount: 220,
        expected_delivery_date: new Date(Date.now() + 86400000).toISOString(),
        status: 'pending' as 'pending' | 'accepted' | 'rejected',
        created_at: new Date().toISOString(),
        provider: {
          id: "provider-2",
          name: "Jane Smith",
          avatar_url: "",
          rating: 4.9,
          success_rate: "95% jobs completed successfully"
        }
      }
    ];
    
    // Later, replace with actual query:
    /*
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        profiles:provider_id(id, full_name, avatar_url)
      `)
      .eq('task_id', taskId);

    if (error) {
      throw error;
    }

    return data;
    */
  } catch (error) {
    console.error("Error fetching task offers:", error);
    return [];
  }
}

export async function countOffersForTask(taskId: string): Promise<number> {
  try {
    // This is a mock implementation until we create the offers table
    // Return a random number between 0 and 5 for demonstration purposes
    return Math.floor(Math.random() * 6);
    
    // Later, replace with actual query:
    /*
    const { count, error } = await supabase
      .from('offers')
      .select('id', { count: 'exact' })
      .eq('task_id', taskId);

    if (error) {
      throw error;
    }

    return count || 0;
    */
  } catch (error) {
    console.error("Error counting task offers:", error);
    return 0;
  }
}
