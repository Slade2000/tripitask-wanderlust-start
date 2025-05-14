
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNetworkStatus } from "@/components/NetworkStatusMonitor";
import { toast } from "@/hooks/use-toast";

export function useUnreadMessageCount() {
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async (userId: string) => {
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
  }, [isOnline, unreadCount]);

  const refreshCount = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log("Manually refreshing unread message count");
      const count = await fetchUnreadCount(user.id);
      console.log(`Setting new unread count: ${count}`);
      setUnreadCount(count);
      return count;
    } catch (error) {
      console.error("Error refreshing unread count:", error);
      toast({
        title: "Error",
        description: "Failed to refresh unread message count",
        variant: "destructive",
      });
      return unreadCount;
    }
  }, [fetchUnreadCount, user, unreadCount]);

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

  // Set up real-time subscription for message updates
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up real-time subscription for message updates");
    
    const subscription = supabase
      .channel('message-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Message update detected:", payload);
          if (payload.new.read !== payload.old.read) {
            console.log("Read status changed, refreshing count");
            refreshCount();
          }
        }
      )
      .subscribe();
      
    return () => {
      console.log("Removing message update subscription");
      supabase.removeChannel(subscription);
    };
  }, [user, refreshCount]);

  return {
    unreadCount,
    loading,
    error,
    refreshCount
  };
}
