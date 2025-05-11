
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a Supabase function to safely get user details from auth.users
 * This should be run once by an administrator with appropriate permissions
 */
export async function createGetUserDetailsFunction() {
  // This function requires SUPABASE_SERVICE_ROLE_KEY to create
  const { error } = await supabase.rpc('create_get_user_details_function');
  
  if (error) {
    console.error("Failed to create get_user_details function:", error);
    return false;
  }
  
  console.log("Successfully created get_user_details function");
  return true;
}
