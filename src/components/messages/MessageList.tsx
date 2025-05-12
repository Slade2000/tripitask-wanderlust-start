
import { useState, useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import { Message } from "@/services/message/types";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  tasksByIds?: Record<string, string>;
  currentUserName?: string;
}

export default function MessageList({ messages, loading, tasksByIds = {}, currentUserName }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [messagesWithSeparators, setMessagesWithSeparators] = useState<(Message | { isTaskSeparator: true; taskId: string; taskName: string })[]>([]);

  // Process messages to insert task separators
  useEffect(() => {
    if (!messages.length) {
      setMessagesWithSeparators([]);
      return;
    }

    const result: (Message | { isTaskSeparator: true; taskId: string; taskName: string })[] = [];
    let currentTaskId: string | null = null;

    messages.forEach(message => {
      // If this is a message for a different task than the previous one
      if (message.task_id !== currentTaskId) {
        currentTaskId = message.task_id;
        const taskName = tasksByIds[message.task_id] || `Task ${message.task_id.slice(0, 8)}`;
        
        // Add a separator
        result.push({
          isTaskSeparator: true,
          taskId: message.task_id,
          taskName
        });
      }

      // Add the message
      result.push(message);
    });

    setMessagesWithSeparators(result);
  }, [messages, tasksByIds]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesWithSeparators.length && !hasScrolled) {
      scrollToBottom();
      setHasScrolled(true);
    } else if (messagesWithSeparators.length) {
      scrollToBottom();
    }
  }, [messagesWithSeparators]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin h-6 w-6 border-2 border-teal border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (messagesWithSeparators.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messagesWithSeparators.map((item, index) => (
        'isTaskSeparator' in item ? (
          <div key={`separator-${item.taskId}-${index}`} className="flex justify-center my-4">
            <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
              {item.taskName}
            </div>
          </div>
        ) : (
          <MessageItem 
            key={item.id || index} 
            message={item} 
            currentUserName={currentUserName} 
          />
        )
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
