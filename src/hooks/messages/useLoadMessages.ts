import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { getMessages } from "@/services/message";
import { Message } from "@/services/message/types";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { markMessagesAsRead } from "@/services/message";
import { useUnreadMessageCount } from "@/hooks/unread-messages";

interface UseLoadMessagesProps {
  userId: string | undefined;
  otherUserId: string;
}

export function useLoadMessages({ userId, otherUserId }: UseLoadMessagesProps) {
  const { toast } = useToast();
  const { refreshCount } = useUnreadMessageCount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksByIds, setTasksByIds] = useState<Record<string, string>>({});
  
  const markMessagesAsReadFromUser = async (senderId: string) => {
    if (!userId) return;
    
    try {
      console.log(`Marking all messages from ${senderId} as read for ${userId}`);
      // Mark all messages from sender as read (pass null for taskId to mark all)
      const success = await markMessagesAsRead(null, userId, senderId);
      console.log(`Marked messages as read, success: ${success}`);
      
      // Refresh the unread count in the UI
      await refreshCount();
      console.log("Unread count refreshed after marking messages as read");
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };
  
  const loadMessages = useCallback(async () => {
    if (!userId || !otherUserId) return;
    
    setLoading(true);
    try {
      console.log("Loading all messages between users:", userId, "and", otherUserId);
      const fetchedMessages = await getMessages(userId, otherUserId);
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
  }, [userId, otherUserId, toast, refreshCount]);

  return {
    messages,
    loading,
    tasksByIds,
    loadMessages
  };
}
