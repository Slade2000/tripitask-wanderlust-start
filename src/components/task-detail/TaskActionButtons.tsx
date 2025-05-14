
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TaskActionButtonsProps {
  taskId: string;
  isProviderPage: boolean;
  taskStatus: string;
  isTaskPoster: boolean;
  onMessageClick: () => void;
  onCompleteTask?: () => void;
  onProviderCompleteTask?: () => void;
  onApproveCompletion?: (offerId: string) => void;
  isSubmittingCompletion?: boolean;
  isSubmittingProviderCompletion?: boolean;
  isApprovingCompletion?: boolean;
  hasAcceptedOffer?: boolean;
  isCurrentUserProvider?: boolean;
  pendingCompletionOfferId?: string;
}

export default function TaskActionButtons({ 
  taskId, 
  isProviderPage, 
  taskStatus, 
  isTaskPoster,
  onMessageClick,
  onCompleteTask,
  onProviderCompleteTask,
  onApproveCompletion,
  isSubmittingCompletion = false,
  isSubmittingProviderCompletion = false,
  isApprovingCompletion = false,
  hasAcceptedOffer = false,
  isCurrentUserProvider = false,
  pendingCompletionOfferId = ''
}: TaskActionButtonsProps) {
  const navigate = useNavigate();

  // If task poster and task status is 'pending_complete' and there's a work_completed offer, show the approve button
  if (isTaskPoster && (taskStatus === 'pending_complete') && pendingCompletionOfferId && onApproveCompletion) {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={() => onApproveCompletion(pendingCompletionOfferId)}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={isApprovingCompletion}
        >
          {isApprovingCompletion ? "Processing..." : "Approve Work Completion"}
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

  // If user is task poster and task is in progress, show complete button
  if (isTaskPoster && (taskStatus === "in_progress" || taskStatus === "assigned")) {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={onCompleteTask}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={isSubmittingCompletion}
        >
          {isSubmittingCompletion ? "Processing..." : "Complete Task"}
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

  // If user is the service provider and task is in progress, show mark work complete button
  if (isCurrentUserProvider && (taskStatus === "in_progress" || taskStatus === "assigned")) {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={onProviderCompleteTask}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={isSubmittingProviderCompletion}
        >
          {isSubmittingProviderCompletion ? "Processing..." : "Mark Work Complete"}
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

  // If provider view and task is in progress but not current user's task, show only message button
  if (isProviderPage && (taskStatus === "in_progress" || taskStatus === "assigned" || taskStatus === "pending_complete") && !isCurrentUserProvider) {
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
