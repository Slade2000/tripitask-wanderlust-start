
import { MessageThreadSummary } from "@/services/message/types";
import ThreadsLoading from "./ThreadsLoading";
import ThreadsError from "./ThreadsError";
import EmptyThreads from "./EmptyThreads";
import MessageThreadCard from "./MessageThreadCard";

interface ThreadContentProps {
  threads: MessageThreadSummary[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onThreadClick: (thread: MessageThreadSummary) => void;
  filterUnread?: boolean;
}

export default function ThreadContent({ 
  threads, 
  loading, 
  error, 
  onRetry, 
  onThreadClick,
  filterUnread = false 
}: ThreadContentProps) {
  if (loading) {
    return <ThreadsLoading />;
  }
  
  if (error) {
    return <ThreadsError error={error} onRetry={onRetry} />;
  }
  
  const displayThreads = filterUnread ? threads.filter(t => t.unread_count > 0) : threads;
  
  if (displayThreads.length === 0) {
    const message = filterUnread ? "No unread messages" : "No messages yet";
    return <EmptyThreads message={message} />;
  }
  
  return (
    <div className="space-y-4">
      {displayThreads.map((thread) => (
        <MessageThreadCard 
          key={`${thread.other_user_id}`} 
          thread={thread}
          onClick={() => onThreadClick(thread)}
        />
      ))}
    </div>
  );
}
