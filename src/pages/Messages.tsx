
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getMessageThreads } from "@/services/message";
import { MessageThreadSummary } from "@/services/message/types";

const Messages = () => {
  const location = useLocation();
  const [threads, setThreads] = useState<MessageThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
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
    try {
      const threadData = await getMessageThreads(user.id);
      setThreads(threadData);
    } catch (error) {
      console.error("Error loading message threads:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading messages...</p>
              </div>
            ) : threads.length > 0 ? (
              <div className="space-y-4">
                {threads.map((thread) => (
                  <MessageThreadCard key={`${thread.task_id}-${thread.other_user_id}`} thread={thread} />
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-gray-600 mb-2">No messages yet</p>
                <p className="text-sm text-gray-500">
                  Messages from your tasks will appear here
                </p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="unread">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading messages...</p>
              </div>
            ) : threads.filter(t => t.unread_count > 0).length > 0 ? (
              <div className="space-y-4">
                {threads
                  .filter(thread => thread.unread_count > 0)
                  .map((thread) => (
                    <MessageThreadCard key={`${thread.task_id}-${thread.other_user_id}`} thread={thread} />
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
}

function MessageThreadCard({ thread }: MessageThreadCardProps) {
  const timeAgo = formatDistanceToNow(new Date(thread.last_message_date), { addSuffix: true });
  const userInitial = (thread.other_user_name || "U").charAt(0).toUpperCase();
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
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
