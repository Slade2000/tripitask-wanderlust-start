
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getMessages, sendMessage, markMessagesAsRead } from "@/services/message";
import { Message } from "@/services/message/types";
import { getTaskById } from "@/services/task/queries/getTaskById";

interface UseMessageDetailProps {
  taskOwnerId?: string;
  initialTaskTitle?: string;
}

export function useMessageDetail({ taskOwnerId: initialTaskOwnerId, initialTaskTitle }: UseMessageDetailProps = {}) {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [taskTitle, setTaskTitle] = useState(initialTaskTitle || "");
  const [taskOwnerId, setTaskOwnerId] = useState(initialTaskOwnerId || "");
  
  useEffect(() => {
    console.log("useMessageDetail hook initializing with params:", { taskId, initialTaskOwnerId });
    
    if (!taskId || !initialTaskOwnerId) {
      console.error("Missing taskId or taskOwnerId");
      toast({
        title: "Error",
        description: "Missing required information to load messages",
        variant: "destructive",
      });
      navigate('/messages');
      return;
    }
    
    if (initialTaskOwnerId) {
      setTaskOwnerId(initialTaskOwnerId);
    }
    
    if (user) {
      loadMessages();
      if (!initialTaskTitle) {
        loadTaskDetails();
      }
    }
  }, [user, taskId, initialTaskOwnerId]);
  
  const loadMessages = async () => {
    if (!user || !taskId || !taskOwnerId) return;
    
    setLoading(true);
    try {
      console.log("Loading messages for task:", taskId, "between users:", user.id, "and", taskOwnerId);
      const fetchedMessages = await getMessages(taskId, user.id, taskOwnerId);
      console.log("Fetched messages:", fetchedMessages.length);
      setMessages(fetchedMessages);
      
      // Mark messages as read when they are loaded
      await markMessagesAsRead(taskId, user.id, taskOwnerId);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadTaskDetails = async () => {
    if (!taskId) return;
    
    try {
      const task = await getTaskById(taskId);
      if (task) {
        setTaskTitle(task.title);
      }
    } catch (error) {
      console.error("Error loading task details:", error);
    }
  };
  
  const handleSendMessage = async (content: string, files: File[]) => {
    if (!user || !taskId || !taskOwnerId) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }
    
    setSending(true);
    try {
      console.log("Sending message:", {
        task_id: taskId,
        sender_id: user.id,
        receiver_id: taskOwnerId,
        content
      });
      
      const result = await sendMessage(
        {
          task_id: taskId,
          sender_id: user.id,
          receiver_id: taskOwnerId,
          content
        },
        files
      );
      
      if (result.success) {
        await loadMessages();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    taskTitle,
    taskOwnerId,
    handleSendMessage,
    loadMessages
  };
}
