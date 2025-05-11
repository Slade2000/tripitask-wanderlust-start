
import { ChevronLeft } from "lucide-react";

interface MessageHeaderProps {
  otherUserName?: string;
  taskTitle?: string;
  onBack: () => void;
}

export default function MessageHeader({ otherUserName, taskTitle, onBack }: MessageHeaderProps) {
  return (
    <div className="bg-white p-4 border-b flex items-center shadow-sm">
      <button onClick={onBack} className="mr-2">
        <ChevronLeft size={24} className="text-teal" />
      </button>
      
      <div>
        <h1 className="font-semibold">{otherUserName || "Chat"}</h1>
        <p className="text-xs text-gray-500">
          Re: {taskTitle || "Task"}
        </p>
      </div>
    </div>
  );
}
