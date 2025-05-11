
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getMessages, sendMessage } from "@/services/message";
import { Message } from "@/services/message/types";
import { getTaskById } from "@/services/task/queries/getTaskById";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";

export default function MessageDetail() {
  const { taskId } = useParams<{ taskId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get the data from location state
  const taskOwnerId = location.state?.taskOwnerId;
  const otherUserName = location.state?.otherUserName;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [taskTitle, setTaskTitle] = useState(location.state?.taskTitle || "");
  
  useEffect(() => {
    console.log("MessageDetail mounted with params:", { taskId, taskOwnerId, otherUserName });
    
    if (!taskId || !taskOwnerId) {
      console.error("Missing taskId or taskOwnerId");
      toast({
        title: "Error",
        description: "Missing required information to load messages",
        variant: "destructive",
      });
      navigate('/messages');
      return;
    }
    
    if (user) {
      loadMessages();
      if (!taskTitle) {
        loadTaskDetails();
      }
    }
  }, [user, taskId, taskOwnerId]);
  
  const loadMessages = async () => {
    if (!user || !taskId || !taskOwnerId) return;
    
    setLoading(true);
    try {
      console.log("Loading messages for task:", taskId, "between users:", user.id, "and", taskOwnerId);
      const fetchedMessages = await getMessages(taskId, user.id, taskOwnerId);
      console.log("Fetched messages:", fetchedMessages);
      setMessages(fetchedMessages);
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
