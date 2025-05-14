
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendMessage } from "@/services/message";

interface UseSendMessageProps {
  userId: string | undefined;
  otherUserId: string;
  taskId: string | undefined;
  onMessageSent: () => Promise<void>;
  messages: any[];
}

export function useSendMessage({ userId, otherUserId, taskId, onMessageSent, messages }: UseSendMessageProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  
  const handleSendMessage = async (content: string, files: File[]) => {
    if (!userId || !otherUserId) {
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
        sender_id: userId,
        receiver_id: otherUserId,
        content
      });
      
      const result = await sendMessage(
        {
          task_id: currentTaskId,
          sender_id: userId,
          receiver_id: otherUserId,
          content
        },
        files
      );
      
      if (result.success) {
        await onMessageSent();
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
    sending,
    handleSendMessage
  };
}
