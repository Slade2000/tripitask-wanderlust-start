
import { supabase } from "@/integrations/supabase/client";

/**
 * Submits a new offer for a task
 */
export async function submitOffer(offer: {
  task_id: string;
  amount: number; 
  expected_delivery_date: string;
  message?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from('offers')
      .insert({
        task_id: offer.task_id,
        provider_id: userData.user.id,
        amount: offer.amount,
        expected_delivery_date: offer.expected_delivery_date,
        message: offer.message || null,
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
