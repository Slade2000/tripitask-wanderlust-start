
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface TaskInterestSectionProps {
  taskId: string;
  isTaskPoster: boolean;
  hasAcceptedOffer: boolean;
  status: string;
  onOpenMessageModal: () => void;
}

export default function TaskInterestSection({
  taskId,
  isTaskPoster,
  hasAcceptedOffer,
  status,
  onOpenMessageModal
}: TaskInterestSectionProps) {
  const navigate = useNavigate();

  // Only show the interest section to non-task-posters for open tasks
  if (isTaskPoster || status !== 'open' || hasAcceptedOffer) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Interested in this task?</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => navigate(`/tasks/${taskId}/submit-offer`)}
          className="bg-teal hover:bg-teal-dark"
        >
          Submit an Offer
        </Button>
        <Button
          onClick={onOpenMessageModal}
          variant="outline"
          className="border-teal text-teal hover:bg-teal/10"
        >
          Ask a Question
        </Button>
      </div>
    </div>
  );
}
