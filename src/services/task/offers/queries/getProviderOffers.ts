
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/types/offer";

/**
 * Fetches all offers made by a specific provider
 */
export async function getProviderOffers(providerId: string): Promise<Offer[]> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        task:tasks(
          title,
          description,
          budget,
          due_date,
          status
        )
      `)
      .eq('provider_id', providerId);

    if (error) {
      console.error("Error fetching provider offers:", error);
      throw error;
    }

    const offers: Offer[] = data.map(offer => ({
      id: offer.id,
      task_id: offer.task_id,
      provider_id: offer.provider_id,
      amount: offer.amount,
      expected_delivery_date: offer.expected_delivery_date,
      message: offer.message || undefined,
      status: offer.status as 'pending' | 'accepted' | 'rejected',
      created_at: offer.created_at,
      task: offer.task as Offer['task']
    }));

    return offers || [];
  } catch (error) {
    console.error("Error fetching provider offers:", error);
    return [];
  }
}
