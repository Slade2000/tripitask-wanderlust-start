
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getMessageThreads } from "@/services/message";
import { MessageThreadSummary } from "@/services/message/types";
import { Loader2, RefreshCcw } from "lucide-react";

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      loadThreads();
    }
  }, [user]);
  
  const loadThreads = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log("Loading message threads for user:", user.id);
      const threadData = await getMessageThreads(user.id);
      console.log("Received thread data:", threadData);
      setThreads(threadData);
    } catch (error) {
      console.error("Error loading message threads:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThreadClick = (thread: MessageThreadSummary) => {
    console.log("Navigating to message detail with:", {
      otherUserId: thread.other_user_id,
      taskId: thread.task_id,
      taskTitle: thread.task_title
    });
    
    // Navigate to MessageDetail page with other user ID first, and task ID as secondary
    navigate(`/messages/${thread.task_id}`, {
      state: {
        taskId: thread.task_id,
        taskOwnerId: thread.other_user_id,
        taskTitle: thread.task_title,
        otherUserName: thread.other_user_name
      }
    });
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal" />
          <p>Loading messages...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-2">Error loading messages</p>
          <p className="text-sm text-gray-500">
            {error}
          </p>
          <button 
            onClick={loadThreads} 
            className="mt-4 px-4 py-2 bg-teal text-white rounded hover:bg-teal-600 flex items-center justify-center mx-auto"
          >
            <RefreshCcw size={16} className="mr-2" />
            Try Again
          </button>
        </Card>
      );
    }
    
    if (threads.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-2">No messages yet</p>
          <p className="text-sm text-gray-500">
            Messages from your tasks will appear here
          </p>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {threads.map((thread) => (
          <MessageThreadCard 
            key={`${thread.other_user_id}`} 
            thread={thread} 
            onClick={() => handleThreadClick(thread)}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Messages
        </h1>
        
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="all">All Messages</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {renderContent()}
          </TabsContent>
          
          <TabsContent value="unread">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal" />
                <p>Loading messages...</p>
              </div>
            ) : error ? (
              <Card className="p-6 text-center">
                <p className="text-gray-600 mb-2">Error loading messages</p>
                <p className="text-sm text-gray-500">
                  {error}
                </p>
                <button 
                  onClick={loadThreads} 
                  className="mt-4 px-4 py-2 bg-teal text-white rounded hover:bg-teal-600 flex items-center justify-center mx-auto"
                >
                  <RefreshCcw size={16} className="mr-2" />
                  Try Again
                </button>
              </Card>
            ) : threads.filter(t => t.unread_count > 0).length > 0 ? (
              <div className="space-y-4">
                {threads
                  .filter(thread => thread.unread_count > 0)
                  .map((thread) => (
                    <MessageThreadCard 
                      key={`${thread.other_user_id}`} 
                      thread={thread}
                      onClick={() => handleThreadClick(thread)}
                    />
                  ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-gray-600">No unread messages</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

interface MessageThreadCardProps {
  thread: MessageThreadSummary;
  onClick: () => void;
}

function MessageThreadCard({ thread, onClick }: MessageThreadCardProps) {
  const timeAgo = formatDistanceToNow(new Date(thread.last_message_date), { addSuffix: true });
  const userInitial = (thread.other_user_name || "U").charAt(0).toUpperCase();
  
  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center">
        <Avatar className="h-12 w-12 mr-4">
          <AvatarImage src={thread.other_user_avatar} alt={thread.other_user_name} />
          <AvatarFallback className="bg-teal text-white">{userInitial}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{thread.other_user_name}</h3>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          
          <p className="text-sm text-gray-600 truncate">
            Re: {thread.task_title}
          </p>
          
          <p className="text-sm text-gray-500 truncate mt-1">
            {thread.last_message_content}
          </p>
        </div>
        
        {thread.unread_count > 0 && (
          <div className="ml-2 bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {thread.unread_count}
          </div>
        )}
      </div>
    </Card>
  );
}

export default Messages;
