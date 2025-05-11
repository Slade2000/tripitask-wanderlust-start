
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskDetailErrorProps {
  error: string | null;
  onBack: () => void;
}

export default function TaskDetailError({ error, onBack }: TaskDetailErrorProps) {
  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-3xl mx-auto">
        <Button onClick={onBack} className="mb-4">
          Back
        </Button>
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500 font-medium mb-2">Error loading task details</p>
          <p className="text-sm text-gray-500 mb-4">
            {error || "Task not found or has been removed"}
          </p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    </div>
  );
}
