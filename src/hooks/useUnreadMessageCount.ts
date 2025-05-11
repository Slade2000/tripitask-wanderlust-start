
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUnreadMessageCount() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = async (userId: string) => {
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
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
      return 0;
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
  }, [user]);

  return {
    unreadCount,
    loading,
    error,
    refreshCount: user ? () => fetchUnreadCount(user.id).then(setUnreadCount) : () => {}
  };
}
