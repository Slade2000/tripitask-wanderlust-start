
import { Card } from "@/components/ui/card";

interface EmptyThreadsProps {
  message?: string;
}

export default function EmptyThreads({ message = "No messages yet" }: EmptyThreadsProps) {
  return (
    <Card className="p-6 text-center">
      <p className="text-gray-600 mb-2">{message}</p>
      <p className="text-sm text-gray-500">
        Messages from your tasks will appear here
      </p>
    </Card>
  );
}
