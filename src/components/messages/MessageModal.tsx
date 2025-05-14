
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/services/message/types";
import { sendMessage, getMessages, markMessagesAsRead } from "@/services/message";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/profile/ProfileProvider";
import { useNetworkStatus } from "@/components/NetworkStatusMonitor";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  receiverId: string;
  taskTitle?: string;
}

export default function MessageModal({ 
  isOpen, 
  onClose, 
  taskId, 
  receiverId,
  taskTitle = "this task"
}: MessageModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tasksByIds, setTasksByIds] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { isOnline } = useNetworkStatus();
  const { refreshCount } = useUnreadMessageCount();

  // Load messages when the modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadMessages();
    }
  }, [isOpen, user, taskId, receiverId]);

  const loadMessages = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get all messages between the two users
      const fetchedMessages = await getMessages(user.id, receiverId);
      setMessages(fetchedMessages);
      
      // Set current task title in the tasksByIds map
      setTasksByIds({
        [taskId]: taskTitle
      });
      
      // Create a map of all task IDs from the fetched messages
      const tasksMap: Record<string, string> = {};
      fetchedMessages.forEach(msg => {
        if (msg.task_id && !tasksMap[msg.task_id] && msg.task_id !== taskId) {
          tasksMap[msg.task_id] = `Task ${msg.task_id.slice(0, 8)}`;
        }
      });
      
      // Add the current task to the map
      tasksMap[taskId] = taskTitle;
      setTasksByIds(tasksMap);
      
      // Mark messages as read when they are loaded
      if (receiverId) {
        console.log(`Marking messages as read from user ${receiverId} for task ${taskId}`);
        try {
          const success = await markMessagesAsRead(taskId, user.id, receiverId);
          console.log(`Messages marked as read: ${success}`);
          
          // Refresh unread count after marking messages as read
          await refreshCount();
          console.log("Unread count refreshed in MessageModal");
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages" + (!isOnline ? " - You appear to be offline" : ""),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string, files: File[]) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You need to be logged in to send messages",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const result = await sendMessage(
        {
          task_id: taskId,
          sender_id: user.id,
          receiver_id: receiverId,
          content
        },
        files
      );

      if (result.success) {
        // Refresh messages
        await loadMessages();
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
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

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl h-[80vh] flex flex-col p-0 mb-16">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>
            Questions about: {taskTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
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
      </DialogContent>
    </Dialog>
  );
}
