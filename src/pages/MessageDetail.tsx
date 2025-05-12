
import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useMessageDetail } from "@/hooks/useMessageDetail";
import { useNetworkStatus } from "@/components/NetworkStatusMonitor";
import { useProfile } from "@/contexts/profile/ProfileProvider";
import { useToast } from "@/hooks/use-toast";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";
import MessageHeader from "@/components/messages/MessageHeader";
import BottomNav from "@/components/BottomNav";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function MessageDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isOnline } = useNetworkStatus();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  // Get the data from location state
  const otherUserId = location.state?.otherUserId || id;
  const otherUserName = location.state?.otherUserName;
  const initialTaskTitle = location.state?.taskTitle;
  const taskId = location.state?.taskId;
  
  const {
    messages,
    loading,
    sending,
    taskTitle,
    tasksByIds,
    handleSendMessage,
    loadMessages
  } = useMessageDetail({
    otherUserId,
    initialTaskTitle,
    taskId
  });
  
  // Effect to reload messages when back online
  useEffect(() => {
    if (isOnline && messages.length === 0 && !loading) {
      loadMessages();
    }
  }, [isOnline]);

  // Effect to show toast when offline
  useEffect(() => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Messages may not be up to date until you reconnect",
        // Change from "warning" to "default" since warning is not a valid variant
        variant: "default"
      });
    }
  }, [isOnline]);
  
  const goBack = () => {
    navigate('/messages');
  };
  
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <MessageHeader 
        otherUserName={otherUserName} 
        taskTitle={taskTitle || initialTaskTitle} 
        onBack={goBack} 
      />
      
      {!isOnline && (
        <Alert className="mx-4 mt-2 bg-orange/10 border-orange">
          <InfoIcon className="h-4 w-4 text-orange" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You're currently offline. Messages will sync when you reconnect.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden pb-16">
        <MessageList 
          messages={messages} 
          loading={loading} 
          tasksByIds={tasksByIds} 
          currentUserName={profile?.full_name}
        />
        <MessageInput 
          onSendMessage={handleSendMessage} 
          isSubmitting={sending} 
          disabled={!isOnline}
        />
      </div>
      
      <BottomNav currentPath="/messages" />
    </div>
  );
}
