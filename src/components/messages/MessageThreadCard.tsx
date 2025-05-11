
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MessageThreadSummary } from "@/services/message/types";

interface MessageThreadCardProps {
  thread: MessageThreadSummary;
  onClick: () => void;
}

export default function MessageThreadCard({ thread, onClick }: MessageThreadCardProps) {
  const timeAgo = formatDistanceToNow(new Date(thread.last_message_date), { addSuffix: true });
  
  // Improved way to get user initial - handle missing names better
  const userName = thread.other_user_name || `User ${thread.other_user_id.slice(0, 8)}`;
  const userInitial = (userName.charAt(0) || "?").toUpperCase();
  
  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center">
        <Avatar className="h-12 w-12 mr-4">
          <AvatarImage src={thread.other_user_avatar} alt={userName} />
          <AvatarFallback className="bg-teal text-white">{userInitial}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{userName}</h3>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          
          <p className="text-sm text-gray-600 truncate">
            Re: {thread.task_title}
          </p>
          
          <p className="text-sm text-gray-500 truncate mt-1">
            {thread.last_message_content}
          </p>
        </div>
        
        {thread.unread_count > 0 && (
          <div className="ml-2 bg-teal text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {thread.unread_count}
          </div>
        )}
      </div>
    </Card>
  );
}
