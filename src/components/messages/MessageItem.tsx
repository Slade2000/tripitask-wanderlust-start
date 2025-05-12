
import { Message } from "@/services/message/types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileImage, FileVideo } from "lucide-react";

interface MessageItemProps {
  message: Message;
  currentUserName?: string;
}

export default function MessageItem({ message, currentUserName }: MessageItemProps) {
  const { user } = useAuth();
  const isOutgoing = message.sender_id === user?.id;
  const timeAgo = formatDistanceToNow(new Date(message.created_at || Date.now()), { addSuffix: true });
  
  // Use centralized profile data or message data
  const senderName = isOutgoing 
    ? (currentUserName || user?.user_metadata?.name || "You") 
    : (message.sender_name || "Unknown");
  
  const senderInitial = (senderName || "U").charAt(0).toUpperCase();
  
  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOutgoing && (
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={message.sender_avatar} alt={senderName} />
          <AvatarFallback className="bg-teal text-white">{senderInitial}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[75%] ${isOutgoing ? 'bg-teal text-white' : 'bg-gray-100'} rounded-lg px-4 py-2`}>
        <div className="text-sm font-medium mb-1">
          {isOutgoing ? 'You' : senderName}
        </div>
        
        <p className="text-sm mb-2">{message.content}</p>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.attachments.map((attachment, index) => (
              <div key={index} className="relative">
                {attachment.file_type === 'image' ? (
                  <a href={attachment.file_url} target="_blank" rel="noopener noreferrer" className="block">
                    <img 
                      src={attachment.file_url} 
                      alt="Attachment" 
                      className="max-h-40 rounded-md object-cover"
                    />
                  </a>
                ) : attachment.file_type === 'video' ? (
                  <a href={attachment.file_url} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="h-40 w-40 bg-gray-200 rounded-md flex items-center justify-center">
                      <FileVideo size={24} className="text-gray-500" />
                      <span className="ml-2 text-sm text-gray-600">Video</span>
                    </div>
                  </a>
                ) : (
                  <div className="h-40 w-40 bg-gray-200 rounded-md flex items-center justify-center">
                    <FileImage size={24} className="text-gray-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className={`text-xs mt-1 ${isOutgoing ? 'text-teal-100' : 'text-gray-500'}`}>
          {timeAgo}
        </div>
      </div>
      
      {isOutgoing && (
        <Avatar className="h-8 w-8 ml-2">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt="You" />
          <AvatarFallback className="bg-teal text-white">{senderInitial}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
