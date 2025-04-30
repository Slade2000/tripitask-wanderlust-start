
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type TaskConfirmationProps = {
  onViewTask: () => void;
};

const TaskConfirmation = ({ onViewTask }: TaskConfirmationProps) => {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="bg-teal/10 rounded-full p-6">
        <Check className="h-16 w-16 text-teal" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-teal-dark">Success!</h1>
        <p className="text-lg text-teal-dark">Your task has been posted!</p>
      </div>

      <div className="border border-teal-light/30 rounded-lg p-5 w-full bg-cream shadow-sm">
        <h3 className="font-semibold text-teal-dark mb-4">What happens next</h3>
        <ol className="space-y-3 text-left">
          <li className="flex gap-3">
            <span className="bg-teal text-cream font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
            <span>Nearby service providers will now send you offers.</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-teal text-cream font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
            <span>You choose the offer that suits you.</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-teal text-cream font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
            <span>Chat with your service provider.</span>
          </li>
          <li className="flex gap-3">
            <span className="bg-teal text-cream font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</span>
            <span>Get your task done.</span>
          </li>
        </ol>
      </div>

      <Button
        onClick={onViewTask}
        className="w-full bg-teal hover:bg-teal-dark text-cream py-6 text-lg"
      >
        View My Posted Task
      </Button>
    </div>
  );
};

export default TaskConfirmation;
