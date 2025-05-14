
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNetworkStatus } from "@/components/NetworkStatusMonitor";

export function useFetchUnreadCount() {
  const { isOnline } = useNetworkStatus();
  const [error, setError] = useState<string | null>(null);
  
  const fetchUnreadCount = useCallback(async (userId: string, currentCount: number = 0) => {
    if (!isOnline) {
      console.log("Network is offline, skipping unread count fetch");
      return currentCount; // Return the current count when offline
    }
    
    try {
      console.log("Fetching unread message count for user:", userId);
      
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('read', false);
      
      if (error) {
        console.error("Error fetching unread messages:", error);
        setError(error.message);
        return currentCount; // Keep current count on error
      }

      console.log(`Found ${count} unread messages for user ${userId}`);
      return count || 0;
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      return currentCount; // Keep current count on error
    }
  }, [isOnline]);

  return {
    fetchUnreadCount,
    error
  };
}
