
import { useNavigate, useLocation } from "react-router-dom";
import { useMessageDetail } from "@/hooks/useMessageDetail";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";
import MessageHeader from "@/components/messages/MessageHeader";

export default function MessageDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the data from location state
  const otherUserId = location.state?.taskOwnerId || location.state?.otherUserId;
  const otherUserName = location.state?.otherUserName;
  const initialTaskTitle = location.state?.taskTitle;
  const taskId = location.state?.taskId;
  
  const {
    messages,
    loading,
    sending,
    taskTitle,
    tasksByIds,
    handleSendMessage
  } = useMessageDetail({
    otherUserId,
    initialTaskTitle,
    taskId
  });
  
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
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MessageList messages={messages} loading={loading} tasksByIds={tasksByIds} />
        <MessageInput onSendMessage={handleSendMessage} isSubmitting={sending} />
      </div>
    </div>
  );
}
