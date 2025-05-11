
import { RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ThreadsErrorProps {
  error: string;
  onRetry: () => void;
}

export default function ThreadsError({ error, onRetry }: ThreadsErrorProps) {
  return (
    <Card className="p-6 text-center">
      <p className="text-gray-600 mb-2">Error loading messages</p>
      <p className="text-sm text-gray-500">{error}</p>
      <button 
        onClick={onRetry} 
        className="mt-4 px-4 py-2 bg-teal text-white rounded hover:bg-teal-600 flex items-center justify-center mx-auto"
      >
        <RefreshCcw size={16} className="mr-2" />
        Try Again
      </button>
    </Card>
  );
}
