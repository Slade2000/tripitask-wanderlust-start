
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNetworkStatus } from "@/components/NetworkStatusMonitor";

export function useUnreadMessageCount() {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = async (userId: string) => {
    if (!isOnline) {
      console.log("Network is offline, skipping unread count fetch");
      return unreadCount; // Return the current count when offline
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
        return unreadCount; // Keep current count on error
      }

      console.log(`Found ${count} unread messages for user ${userId}`);
      return count || 0;
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      return unreadCount; // Keep current count on error
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchUnreadCount(user.id).then(count => {
        setUnreadCount(count);
        setLoading(false);
      });
    } else {
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user, isOnline]); // Re-fetch when online status changes

  return {
    unreadCount,
    loading,
    error,
    refreshCount: user ? () => fetchUnreadCount(user.id).then(setUnreadCount) : () => {}
  };
}
