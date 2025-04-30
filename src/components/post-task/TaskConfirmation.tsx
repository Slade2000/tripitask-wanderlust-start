
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export interface TaskConfirmationProps {
  taskId: string | null;
  onViewTask: () => void;
}

const TaskConfirmation = ({ taskId, onViewTask }: TaskConfirmationProps) => {
  const handleGoToMyTasks = () => {
    window.location.href = "/my-jobs";
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle className="h-24 w-24 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-teal mb-4">Task Posted Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Your task has been created and is now visible to potential helpers.
        You'll receive notifications when someone expresses interest.
      </p>
      <div className="flex flex-col space-y-4">
        <Button onClick={onViewTask} className="bg-teal hover:bg-teal-dark text-white">
          View Task Details
        </Button>
        <Button 
          onClick={handleGoToMyTasks} 
          variant="outline" 
          className="border-teal text-teal hover:bg-teal/10"
        >
          Go to My Tasks
        </Button>
      </div>
    </div>
  );
};

export default TaskConfirmation;
