
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import BasicInfoStep from "@/components/post-task/BasicInfoStep";
import LocationDateStep from "@/components/post-task/LocationDateStep";
import ReviewSubmitStep from "@/components/post-task/ReviewSubmitStep";
import TaskConfirmation from "@/components/post-task/TaskConfirmation";

// Define the TaskData type for our form state
type TaskData = {
  title: string;
  photos: File[];
  budget: string;
  location: string;
  dueDate: Date | undefined;
  description: string;
};

const PostTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [taskData, setTaskData] = useState<TaskData>({
    title: "",
    photos: [],
    budget: "",
    location: "",
    dueDate: undefined,
    description: "",
  });

  // Handle going back to previous step or welcome screen
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate("/welcome-after-login");
    }
  };

  // Handle proceeding to next step
  const handleNext = (data: Partial<TaskData>) => {
    setTaskData(prev => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  };

  // Handle task submission
  const handleSubmit = () => {
    // In a real app, we would send this data to a server
    console.log("Submitting task:", taskData);
    setCurrentStep(4); // Move to confirmation screen
  };

  // Get the current step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep onNext={handleNext} initialData={taskData} />;
      case 2:
        return <LocationDateStep onNext={handleNext} initialData={taskData} />;
      case 3:
        return (
          <ReviewSubmitStep 
            taskData={taskData} 
            onSubmit={handleSubmit} 
            onEdit={(step) => setCurrentStep(step)} 
          />
        );
      case 4:
        return <TaskConfirmation onViewTask={() => navigate("/my-jobs")} />;
      default:
        return <BasicInfoStep onNext={handleNext} initialData={taskData} />;
    }
  };

  // Show step indicator only for steps 1-3
  const showStepIndicator = currentStep >= 1 && currentStep <= 3;

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      {/* Header with Back Button and Logo */}
      <header className="flex justify-between items-center mb-6">
        {currentStep < 4 && (
          <Button variant="ghost" onClick={handleBack} className="p-2">
            <ArrowLeft className="h-5 w-5 text-teal" />
          </Button>
        )}
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-teal">
            {currentStep === 4 ? "" : "Post a Task"}
          </h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center">
          <span className="text-lg font-bold text-cream">TT</span>
        </div>
      </header>

      {/* Step Indicator */}
      {showStepIndicator && (
        <div className="mb-6">
          <p className="text-sm text-teal-dark font-medium">
            Step {currentStep} of 3
          </p>
        </div>
      )}

      {/* Current Step Content */}
      <div className="max-w-md mx-auto">
        {renderCurrentStep()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default PostTask;
