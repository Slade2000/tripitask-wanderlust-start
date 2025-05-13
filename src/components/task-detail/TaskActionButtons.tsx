
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TaskActionButtonsProps {
  taskId: string;
  isProviderPage: boolean;
  taskStatus: string;
  isTaskPoster: boolean;
  onMessageClick: () => void;
  onCompleteTask?: () => void;
}

export default function TaskActionButtons({ 
  taskId, 
  isProviderPage, 
  taskStatus, 
  isTaskPoster,
  onMessageClick,
  onCompleteTask
}: TaskActionButtonsProps) {
  const navigate = useNavigate();

  // If user is task poster and task is in progress, show complete button
  if (isTaskPoster && taskStatus === "in_progress" && onCompleteTask) {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={onCompleteTask}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Complete Task
        </Button>
        <Button
          onClick={onMessageClick}
          variant="outline"
          className="border-teal text-teal hover:bg-teal/10"
        >
          Messages
        </Button>
      </div>
    );
  }

  // If provider view and task is open, show submit offer button
  if (isProviderPage && taskStatus === "open") {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={() => navigate(`/tasks/${taskId}/submit-offer`)}
          className="w-full bg-teal hover:bg-teal-dark"
        >
          Submit Offer
        </Button>
        <Button
          onClick={onMessageClick}
          variant="outline"
          className="border-teal text-teal hover:bg-teal/10"
        >
          Ask Questions
        </Button>
      </div>
    );
  }

  // For closed tasks or any other scenarios
  return (
    <div className="flex space-x-2">
      <Button
        onClick={onMessageClick}
        variant="outline"
        className="w-full border-teal text-teal hover:bg-teal/10"
      >
        Contact
      </Button>
    </div>
  );
}
