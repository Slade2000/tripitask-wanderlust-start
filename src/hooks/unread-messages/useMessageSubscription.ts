
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useMessageSubscription(
  userId: string | undefined, 
  refreshAction: () => Promise<void>
) {
  // Set up real-time subscription for message updates
  useEffect(() => {
    if (!userId) return;
    
    console.log("Setting up real-time subscription for message updates");
    
    const subscription = supabase
      .channel('message-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Message update detected:", payload);
          if (payload.new.read !== payload.old.read) {
            console.log("Read status changed, refreshing count");
            refreshAction();
          }
        }
      )
      .subscribe();
      
    return () => {
      console.log("Removing message update subscription");
      supabase.removeChannel(subscription);
    };
  }, [userId, refreshAction]);
}
