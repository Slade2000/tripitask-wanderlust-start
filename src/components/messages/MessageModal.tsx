
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/services/message/types";
import { sendMessage, getMessages } from "@/services/message";
import { useAuth } from "@/contexts/AuthContext";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskOwnerId: string;
  taskTitle: string;
}

export default function MessageModal({ 
  isOpen, 
  onClose, 
  taskId, 
  taskOwnerId,
  taskTitle 
}: MessageModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tasksByIds, setTasksByIds] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  // Load messages when the modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadMessages();
    }
  }, [isOpen, user, taskId, taskOwnerId]);

  const loadMessages = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get all messages between the two users
      const fetchedMessages = await getMessages(user.id, taskOwnerId);
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
          receiver_id: taskOwnerId,
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
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>
            Questions about: {taskTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <MessageList messages={messages} loading={loading} tasksByIds={tasksByIds} />
          <MessageInput onSendMessage={handleSendMessage} isSubmitting={sending} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
