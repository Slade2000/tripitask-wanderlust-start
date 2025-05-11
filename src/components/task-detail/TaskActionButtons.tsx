
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TaskActionButtonsProps {
  taskId: string;
  isProviderPage: boolean;
  taskStatus: string;
  onMessageClick: () => void;
}

export default function TaskActionButtons({ 
  taskId, 
  isProviderPage, 
  taskStatus, 
  onMessageClick 
}: TaskActionButtonsProps) {
  const navigate = useNavigate();

  if (!isProviderPage || taskStatus !== "open") {
    return null;
  }

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
