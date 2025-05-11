
import { useState, useEffect, useRef } from "react";
import MessageItem from "./MessageItem";
import { Message } from "@/services/message/types";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

export default function MessageList({ messages, loading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length && !hasScrolled) {
      scrollToBottom();
      setHasScrolled(true);
    } else if (messages.length) {
      scrollToBottom();
    }
  }, [messages]);

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

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
