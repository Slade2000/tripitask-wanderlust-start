
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BasicInfoStep, { BasicInfoFormData } from "../components/post-task/BasicInfoStep";
import LocationDateStep, { LocationDateFormData } from "../components/post-task/LocationDateStep";
import ReviewSubmitStep from "../components/post-task/ReviewSubmitStep";
import TaskConfirmation from "../components/post-task/TaskConfirmation";
import { TaskData, createTask } from "../services/taskService";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type StepType = "basic-info" | "location-date" | "review" | "confirmation";

const PostTask = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<StepType>("basic-info");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [taskData, setTaskData] = useState<TaskData>({
    title: "",
    description: "",
    budget: "",
    location: "",
    user_id: user?.id || "",
    due_date: new Date().toISOString(),
    photos: []
  });

  // Determine current step number for progress indicator
  const getCurrentStepInfo = () => {
    switch (currentStep) {
      case "basic-info":
        return { step: 1, total: 3, progress: 33 };
      case "location-date":
        return { step: 2, total: 3, progress: 66 };
      case "review":
        return { step: 3, total: 3, progress: 100 };
      default:
        return { step: 0, total: 3, progress: 100 };
    }
  };

  const { step, total, progress } = getCurrentStepInfo();

  const handleBasicInfoSubmit = (data: BasicInfoFormData) => {
    setTaskData((prev) => ({
      ...prev,
      title: data.title,
      budget: data.budget,
      photos: data.photos,
    }));
    setCurrentStep("location-date");
  };

  const handleLocationDateSubmit = (data: LocationDateFormData) => {
    const updatedTaskData = {
      ...taskData,
      location: data.location,
      description: data.description,
      due_date: data.dueDate.toISOString(),
    };
    setTaskData(updatedTaskData);
    setCurrentStep("review");
  };

  const handleSubmitTask = async () => {
    if (!user) {
      toast.error("You must be logged in to create a task");
      return;
    }

    setSubmitting(true);
    try {
      const newTaskId = await createTask({
        ...taskData,
        user_id: user.id,
      });

      if (newTaskId) {
        setTaskId(newTaskId);
        setCurrentStep("confirmation");
        toast.success("Task created successfully!");
      } else {
        toast.error("Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("An error occurred while creating the task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = (step: StepType) => {
    setCurrentStep(step);
  };

  const handleStepBack = () => {
    switch (currentStep) {
      case "location-date":
        setCurrentStep("basic-info");
        break;
      case "review":
        setCurrentStep("location-date");
        break;
      default:
        // For basic-info, navigate back to home
        navigate("/welcome-after-login");
        break;
    }
  };

  const handleViewTask = () => {
    // Navigate to task details page
    window.location.href = `/tasks/${taskId}`;
  };

  const handleBackToHome = () => {
    navigate("/welcome-after-login");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "basic-info":
        return (
          <BasicInfoStep
            initialData={{
              title: taskData.title,
              photos: taskData.photos || [],
              budget: taskData.budget,
            }}
            onSubmit={handleBasicInfoSubmit}
            onBack={handleBackToHome} // Back to home from the first step
          />
        );
      case "location-date":
        return (
          <LocationDateStep
            initialData={{
              location: taskData.location,
              dueDate: new Date(taskData.due_date),
              description: taskData.description,
            }}
            onSubmit={handleLocationDateSubmit}
            onBack={() => handleBack("basic-info")}
          />
        );
      case "review":
        return (
          <ReviewSubmitStep
            taskData={taskData}
            onSubmit={handleSubmitTask}
            onBack={() => handleBack("location-date")}
            submitting={submitting}
          />
        );
      case "confirmation":
        return <TaskConfirmation taskId={taskId} onViewTask={handleViewTask} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Post a New Task
        </h1>

        {/* Step indicator with back button - only show for steps 1-3, not confirmation */}
        {currentStep !== "confirmation" && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleStepBack} 
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
        )}
        
        {renderCurrentStep()}
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default PostTask;
