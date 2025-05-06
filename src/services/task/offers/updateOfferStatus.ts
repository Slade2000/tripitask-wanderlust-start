
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates the status of an offer (accept or reject)
 */
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
