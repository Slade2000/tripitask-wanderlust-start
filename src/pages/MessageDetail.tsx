
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getMessages, sendMessage } from "@/services/message";
import { Message } from "@/services/message/types";
import { getTaskById } from "@/services/task/queries/getTaskById";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";

export default function MessageDetail() {
  const { taskId, userId } = useParams<{ taskId: string; userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [otherUserName, setOtherUserName] = useState("");
  
  useEffect(() => {
    if (user && taskId && userId) {
      loadMessages();
      loadTaskDetails();
    }
  }, [user, taskId, userId]);
  
  const loadMessages = async () => {
    if (!user || !taskId || !userId) return;
    
    setLoading(true);
    try {
      const fetchedMessages = await getMessages(taskId, user.id, userId);
      setMessages(fetchedMessages);
      
      // Get other user's name from messages
      if (fetchedMessages.length > 0) {
        const otherMessage = fetchedMessages.find(m => m.sender_id === userId);
        if (otherMessage && otherMessage.sender_name) {
          setOtherUserName(otherMessage.sender_name);
        }
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
    if (!user || !taskId || !userId) {
      toast({
        title: "Error",
        description: "Missing required information",
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
          receiver_id: userId,
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
  
  const goBack = () => {
    navigate('/messages');
  };
  
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="bg-white p-4 border-b flex items-center shadow-sm">
        <button onClick={goBack} className="mr-2">
          <ChevronLeft size={24} className="text-teal" />
        </button>
        
        <div>
          <h1 className="font-semibold">{otherUserName || "Chat"}</h1>
          <p className="text-xs text-gray-500">
            Re: {taskTitle || "Task"}
          </p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList messages={messages} loading={loading} />
        <MessageInput onSendMessage={handleSendMessage} isSubmitting={sending} />
      </div>
    </div>
  );
}
