
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/profile/ProfileProvider";
import { useToast } from "@/hooks/use-toast";
import { useLoadMessages } from "./useLoadMessages";
import { useTaskDetails } from "./useTaskDetails";
import { useSendMessage } from "./useSendMessage";

interface UseMessageDetailProps {
  otherUserId?: string;
  initialTaskTitle?: string;
  taskId?: string;
}

export function useMessageDetail({ 
  otherUserId: initialOtherUserId, 
  initialTaskTitle, 
  taskId: propTaskId 
}: UseMessageDetailProps = {}) {
  const { taskId: paramTaskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  
  // Use taskId from props or from URL params
  const taskId = propTaskId || paramTaskId;
  const [otherUserId, setOtherUserId] = useState(initialOtherUserId || "");

  // Use the refactored hooks
  const { taskTitle, loadTaskDetails } = useTaskDetails(initialTaskTitle);
  const { messages, loading, tasksByIds, loadMessages } = useLoadMessages({
    userId: user?.id,
    otherUserId
  });
  const { sending, handleSendMessage: sendMessageHandler } = useSendMessage({
    userId: user?.id,
    otherUserId,
    taskId,
    onMessageSent: loadMessages,
    messages
  });
  
  useEffect(() => {
    console.log("useMessageDetail hook initializing with params:", { taskId, initialOtherUserId, profile });
    
    if (!initialOtherUserId) {
      console.error("Missing otherUserId");
      toast({
        title: "Error",
        description: "Missing required information to load messages",
        variant: "destructive",
      });
      navigate('/messages');
      return;
    }
    
    if (initialOtherUserId) {
      setOtherUserId(initialOtherUserId);
    }
    
    if (user) {
      loadMessages();
      if (taskId) {
        loadTaskDetails(taskId);
      }
    }
  }, [user, taskId, initialOtherUserId]);

  return {
    messages,
    loading,
    sending,
    taskTitle,
    otherUserId,
    tasksByIds,
    handleSendMessage: sendMessageHandler,
    loadMessages
  };
}
