
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TaskActionButtonsProps {
  taskId: string;
  isProviderPage: boolean;
  taskStatus: string;
  isTaskPoster: boolean;
  onMessageClick: () => void;
  onCompleteTask?: () => void;
  hasAcceptedOffer?: boolean;
}

export default function TaskActionButtons({ 
  taskId, 
  isProviderPage, 
  taskStatus, 
  isTaskPoster,
  onMessageClick,
  onCompleteTask,
  hasAcceptedOffer = false
}: TaskActionButtonsProps) {
  const navigate = useNavigate();

  // If user is task poster and task is in progress, show complete button
  if (isTaskPoster && taskStatus === "in_progress" || isTaskPoster && taskStatus === "assigned") {
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
  if (isProviderPage && taskStatus === "open" && !hasAcceptedOffer) {
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

  // If provider view and task is in progress, show only message button
  if (isProviderPage && (taskStatus === "in_progress" || taskStatus === "assigned")) {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={onMessageClick}
          className="w-full border-teal text-teal hover:bg-teal/10"
          variant="outline"
        >
          Messages
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
