
import { supabase } from "@/integrations/supabase/client";
import { Offer } from "@/types/offer";

export async function getProviderOffers(providerId: string): Promise<Offer[]> {
  try {
    console.log("Fetching offers for provider:", providerId);
    
    if (!providerId) {
      console.error("No provider ID provided to getProviderOffers");
      return []; // Return empty array instead of throwing error
    }

    // Fetch offers with task details
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        task:tasks(id, title, description, budget, due_date, status)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching provider offers:", error);
      return []; // Return empty array instead of throwing error
    }

    console.log(`Found ${data?.length || 0} offers for provider ${providerId}`);
    
    // Map the data to ensure it conforms to our Offer type
    const typedOffers: Offer[] = (data || []).map(offer => ({
      ...offer,
      // Cast the status to the union type expected by our Offer interface
      status: mapOfferStatus(offer.status),
      task: offer.task ? {
        ...offer.task,
        // Ensure description is always defined, even if null/undefined
        description: offer.task.description || undefined
      } : undefined
    }));
    
    return typedOffers;
  } catch (error) {
    console.error("Error in getProviderOffers:", error);
    return []; // Return empty array on any error
  }
}

/**
 * Maps any string status from the database to our defined status types
 */
function mapOfferStatus(status: string): "pending" | "accepted" | "rejected" | "work_completed" | "completed" {
  const validStatuses = ["pending", "accepted", "rejected", "work_completed", "completed"];
  
  if (validStatuses.includes(status)) {
    return status as "pending" | "accepted" | "rejected" | "work_completed" | "completed";
  }
  
  // Default fallback for any unknown statuses
  console.warn(`Unknown offer status encountered: ${status}, falling back to pending`);
  return "pending";
}
