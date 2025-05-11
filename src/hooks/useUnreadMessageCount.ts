
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUnreadMessageCount() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchUnreadCount = async () => {
      setLoading(true);
      try {
        console.log("Fetching unread message count for user:", user.id);
        
        // Query the message_threads view to get total unread count
        const { data, error } = await supabase
          .from('message_threads')
          .select('unread_count')
          .eq('receiver_id', user.id);

        if (error) {
          console.error("Error fetching unread messages:", error);
          return;
        }

        // Sum up all unread counts
        const totalUnread = data?.reduce((sum, thread) => sum + (thread.unread_count || 0), 0) || 0;
        console.log("Total unread messages:", totalUnread);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error("Error in useUnreadMessageCount:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          // Check if the current user is the receiver and message is unread
          if (payload.new && payload.new.receiver_id === user.id && !payload.new.read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload: any) => {
          // If a message was marked as read
          if (payload.old && !payload.old.read && payload.new && payload.new.read && payload.new.receiver_id === user.id) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { unreadCount, loading };
}
