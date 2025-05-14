
import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/profile/ProfileProvider"; 
import { useNetworkStatus } from "@/components/NetworkStatusMonitor"; 
import { useToast } from "@/hooks/use-toast";
import { getMessageThreads } from "@/services/message";
import { MessageThreadSummary } from "@/services/message/types";
import ThreadContent from "@/components/messages/ThreadContent";
import { supabase } from "@/integrations/supabase/client"; 
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  const { profile } = useProfile(); 
  const { isOnline } = useNetworkStatus(); 
  const { toast } = useToast();
  const { refreshCount, unreadCount } = useUnreadMessageCount();
  
  const loadThreads = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log("Loading message threads for user:", user.id);
      
      // Get session status and debug info
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Current session status:", sessionData?.session ? "Active" : "None");
      
      const threadData = await getMessageThreads(user.id);
      console.log("Received thread data:", threadData);
      setThreads(threadData);
      
      if (threadData.length === 0) {
        console.log("No message threads found");
      } else {
        threadData.forEach(thread => {
          console.log(`Thread with user ${thread.other_user_id}: ${thread.other_user_name}`);
        });
      }
      
      // Refresh the unread message count
      await refreshCount();
      console.log("Unread count refreshed after loading threads");
    } catch (error) {
      console.error("Error loading message threads:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Error",
        description: "Failed to load messages" + (isOnline ? "" : " - You appear to be offline"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, isOnline, toast, refreshCount]);

  useEffect(() => {
    if (user) {
      loadThreads();
    }
  }, [user, loadThreads]);

  // Add effect to handle online status changes
  useEffect(() => {
    if (isOnline && error && user) {
      console.log("Back online, retrying message thread load");
      loadThreads();
    }
  }, [isOnline, error, user, loadThreads]);

  // Set up real-time subscription for thread updates
  useEffect(() => {
    if (!user) return;
    
    console.log("Setting up real-time subscription for thread updates");
    
    const threadSubscription = supabase
      .channel('thread-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Message update detected in Messages component:", payload);
          if (payload.new.read !== payload.old.read) {
            console.log("Read status changed, refreshing threads and count");
            loadThreads();
          }
        }
      )
      .subscribe();
      
    return () => {
      console.log("Removing thread update subscription");
      supabase.removeChannel(threadSubscription);
    };
  }, [user, loadThreads]);

  const handleThreadClick = (thread: MessageThreadSummary) => {
    console.log("Navigating to message detail with:", {
      otherUserId: thread.other_user_id,
      taskId: thread.task_id,
      taskTitle: thread.task_title,
      otherUserName: thread.other_user_name
    });
    
    // Navigate to MessageDetail page with other user ID as the primary identifier
    navigate(`/messages/${thread.other_user_id}`, {
      state: {
        otherUserId: thread.other_user_id,
        taskId: thread.task_id, // We still pass taskId for context
        taskTitle: thread.task_title,
        otherUserName: thread.other_user_name
      }
    });
  };
  
  // For debugging in development mode
  const isDevMode = process.env.NODE_ENV === 'development';
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    console.log(`Tab changed to ${tab}, refreshing data`);
    // Refresh threads when switching tabs
    loadThreads();
  };
  
  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Messages {profile && ` for ${profile.full_name || 'You'}`}
        </h1>
        
        {isDevMode && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded">
            <h3 className="font-bold">Debug Info:</h3>
            <div>User ID: {user?.id || 'Not logged in'}</div>
            <div>Auth Status: {user ? 'Logged In' : 'Not logged in'}</div>
            <div>Network Status: {isOnline ? 'Online' : 'Offline'}</div>
            <div>Unread Count: {unreadCount}</div>
            {error && <div className="text-red-600">Error: {error}</div>}
          </div>
        )}
        
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ThreadContent
              threads={threads}
              loading={loading}
              error={error}
              onRetry={loadThreads}
              onThreadClick={handleThreadClick}
            />
          </TabsContent>
          
          <TabsContent value="unread">
            <ThreadContent
              threads={threads}
              loading={loading}
              error={error}
              onRetry={loadThreads}
              onThreadClick={handleThreadClick}
              filterUnread={true}
            />
          </TabsContent>
        </Tabs>
        
        {isDevMode && threads.length > 0 && !loading && !error && (
          <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <div className="text-sm font-mono overflow-auto">
              {threads.map((thread, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded">
                  <div>User ID: {thread.other_user_id}</div>
                  <div>Name: {thread.other_user_name || '(missing)'}</div>
                  <div>Avatar: {thread.other_user_avatar ? 'Yes' : 'No'}</div>
                  <div>Unread: {thread.unread_count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default Messages;
