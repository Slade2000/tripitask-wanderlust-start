
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/profile/ProfileProvider";
import { useToast } from "@/hooks/use-toast";
import { getMessages, sendMessage, markMessagesAsRead } from "@/services/message";
import { Message } from "@/services/message/types";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";

interface UseMessageDetailProps {
  otherUserId?: string;
  initialTaskTitle?: string;
  taskId?: string;
}

export function useMessageDetail({ otherUserId: initialOtherUserId, initialTaskTitle, taskId: propTaskId }: UseMessageDetailProps = {}) {
  const { taskId: paramTaskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { refreshCount } = useUnreadMessageCount();
  
  // Use taskId from props or from URL params
  const taskId = propTaskId || paramTaskId;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [taskTitle, setTaskTitle] = useState(initialTaskTitle || "");
  const [otherUserId, setOtherUserId] = useState(initialOtherUserId || "");
  const [tasksByIds, setTasksByIds] = useState<Record<string, string>>({});
  
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
  
  const loadMessages = useCallback(async () => {
    if (!user || !otherUserId) return;
    
    setLoading(true);
    try {
      console.log("Loading all messages between users:", user.id, "and", otherUserId);
      const fetchedMessages = await getMessages(user.id, otherUserId);
      console.log("Fetched messages:", fetchedMessages.length);
      setMessages(fetchedMessages);
      
      // Extract all unique task IDs from the messages
      const uniqueTaskIds = Array.from(
        new Set(fetchedMessages.map(message => message.task_id))
      );
      
      // Load task titles for all tasks
      const taskTitlesMap: Record<string, string> = {};
      for (const tId of uniqueTaskIds) {
        try {
          const taskDetails = await getTaskById(tId);
          if (taskDetails) {
            taskTitlesMap[tId] = taskDetails.title;
          }
        } catch (err) {
          console.error(`Error loading task ${tId}:`, err);
        }
      }
      setTasksByIds(taskTitlesMap);
      
      // Mark messages as read when they are loaded
      if (otherUserId) {
        await markMessagesAsReadFromUser(otherUserId);
      }
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
  }, [user, otherUserId, toast]);
  
  const loadTaskDetails = async (taskId: string) => {
    try {
      const task = await getTaskById(taskId);
      if (task) {
        setTaskTitle(task.title);
      }
    } catch (error) {
      console.error("Error loading task details:", error);
    }
  };

  const markMessagesAsReadFromUser = async (senderId: string) => {
    if (!user) return;
    
    try {
      console.log(`Marking all messages from ${senderId} as read for ${user.id}`);
      // Mark all messages from sender as read (pass null for taskId to mark all)
      const success = await markMessagesAsRead(null, user.id, senderId);
      console.log(`Marked messages as read, success: ${success}`);
      
      // Refresh the unread count in the UI
      await refreshCount();
      console.log("Unread count refreshed after marking messages as read");
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };
  
  const handleSendMessage = async (content: string, files: File[]) => {
    if (!user || !otherUserId) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }
    
    // Use the passed taskId or the first taskId from existing messages
    const currentTaskId = taskId || messages[0]?.task_id;
    
    if (!currentTaskId) {
      toast({
        title: "Error",
        description: "No task associated with this conversation",
        variant: "destructive",
      });
      return;
    }
    
    setSending(true);
    try {
      console.log("Sending message:", {
        task_id: currentTaskId,
        sender_id: user.id,
        receiver_id: otherUserId,
        content
      });
      
      const result = await sendMessage(
        {
          task_id: currentTaskId,
          sender_id: user.id,
          receiver_id: otherUserId,
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
    otherUserId,
    tasksByIds,
    handleSendMessage,
    loadMessages
  };
}, []);
