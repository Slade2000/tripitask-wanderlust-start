
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { useNetworkStatus } from "@/components/NetworkStatusMonitor";
import { toast } from "@/hooks/use-toast";
import { useFetchUnreadCount } from "./useFetchUnreadCount";
import { useMessageSubscription } from "./useMessageSubscription";

export function useUnreadMessages() {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { fetchUnreadCount, error: fetchError } = useFetchUnreadCount();

  const refreshCount = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log("Manually refreshing unread message count");
      const count = await fetchUnreadCount(user.id, unreadCount);
      console.log(`Setting new unread count: ${count}`);
      setUnreadCount(count);
      // Return void instead of count to match expected Promise<void> type
      return;
    } catch (error) {
      console.error("Error refreshing unread count:", error);
      toast({
        title: "Error",
        description: "Failed to refresh unread message count",
        variant: "destructive",
      });
    }
  }, [fetchUnreadCount, user, unreadCount]);

  // Initial load of unread count
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
  }, [user, isOnline, fetchUnreadCount]); // Re-fetch when online status changes

  // Set up real-time subscription for updates
  useMessageSubscription(user?.id, refreshCount);

  return {
    unreadCount,
    loading,
    error: fetchError,
    refreshCount
  };
}
