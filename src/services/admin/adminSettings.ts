
import { supabase } from "@/integrations/supabase/client";

// Interface for the admin settings
export interface AdminSettings {
  id: string;
  name: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get a specific admin setting by name
 */
export async function getAdminSetting(name: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('name', name)
      .single();
    
    if (error) {
      console.error(`Error fetching admin setting ${name}:`, error);
      return null;
    }
    
    return data?.value || null;
  } catch (error) {
    console.error(`Error fetching admin setting ${name}:`, error);
    return null;
  }
}

/**
 * Get the current commission rate as a percentage
 * Default to 5% if no setting is found
 */
export async function getCommissionRate(): Promise<number> {
  const rateStr = await getAdminSetting('commission_rate');
  
  if (!rateStr) {
    console.log("No commission rate found in settings, using default 5%");
    return 5;
  }
  
  // Parse as float and handle any parsing errors
  try {
    const rate = parseFloat(rateStr);
    return isNaN(rate) ? 5 : rate;
  } catch (e) {
    console.error("Error parsing commission rate:", e);
    return 5;
  }
}

/**
 * Calculate the commission amount for a given price
 */
export async function calculateCommission(price: number): Promise<{
  commission: number;
  total: number;
  netAmount: number;
}> {
  const rate = await getCommissionRate();
  const commissionRate = rate / 100;
  
  const commission = price * commissionRate;
  const total = price + commission;
  const netAmount = price - commission;
  
  return {
    commission: parseFloat(commission.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    netAmount: parseFloat(netAmount.toFixed(2))
  };
}

/**
 * Update an admin setting
 */
export async function updateAdminSetting(
  name: string,
  value: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('admin_settings')
      .update({ 
        value,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('name', name);
    
    if (error) {
      console.error(`Error updating admin setting ${name}:`, error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating admin setting ${name}:`, error);
    return { success: false, error: error.message };
  }
}
