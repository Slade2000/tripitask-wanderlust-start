
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";

interface StepIndicatorProps {
  step: number;
  total: number;
  progress: number;
  onBack: () => void;
}

const StepIndicator = ({ step, total, progress, onBack }: StepIndicatorProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="h-8 w-8 text-teal-dark"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-teal-dark font-medium">
            Step {step} of {total}
          </span>
        </div>
        <span className="text-teal-dark font-medium">
          {progress}%
        </span>
      </div>
      <Progress value={progress} className="h-2 bg-gray-200">
        <div
          className="h-full bg-teal"
          style={{ width: `${progress}%` }}
        />
      </Progress>
    </div>
  );
};

export default StepIndicator;
