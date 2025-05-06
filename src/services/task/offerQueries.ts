
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "@/types/offer";

export async function getTaskOffers(taskId: string): Promise<Offer[]> {
  try {
    console.log("Fetching offers for task:", taskId);
    
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        provider:provider_id (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('task_id', taskId);

    if (error) {
      console.error("Error fetching task offers:", error);
      throw error;
    }

    // Transform data to match the Offer type
    const offers = data.map(offer => ({
      ...offer,
      provider: {
        id: offer.provider?.id || '',
        name: offer.provider?.full_name || 'Unknown User',
        avatar_url: offer.provider?.avatar_url || '',
      }
    }));

    return offers || [];
  } catch (error) {
    console.error("Error fetching task offers:", error);
    return [];
  }
}

export async function submitOffer(offer: {
  task_id: string;
  amount: number; 
  expected_delivery_date: string;
  message?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .insert({
        task_id: offer.task_id,
        provider_id: supabase.auth.getUser().then(res => res.data.user?.id),
        amount: offer.amount,
        expected_delivery_date: offer.expected_delivery_date,
        message: offer.message,
        status: 'pending'
      });

    if (error) {
      console.error("Error submitting offer:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting offer:", error);
    return { success: false, error: error.message };
  }
}

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

export async function updateOfferStatus(
  offerId: string, 
  status: 'accepted' | 'rejected'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', offerId);

    if (error) {
      console.error("Error updating offer status:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error updating offer status:", error);
    return { success: false, error: error.message };
  }
}

export async function getProviderOffers(providerId: string): Promise<Offer[]> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        tasks:task_id (
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

    return data || [];
  } catch (error) {
    console.error("Error fetching provider offers:", error);
    return [];
  }
}
