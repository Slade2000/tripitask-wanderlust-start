
import { usePostTask } from "@/contexts/PostTaskContext";
import BasicInfoStep from "./BasicInfoStep";
import LocationDateStep from "./LocationDateStep";
import ReviewSubmitStep from "./ReviewSubmitStep";
import TaskConfirmation from "./TaskConfirmation";
import { BasicInfoFormData } from "./BasicInfoStep";
import { LocationDateFormData } from "./LocationDateStep";
import { createTask } from "@/services/taskService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PostTaskStepProps {
  onStepBack: () => void;
}

const PostTaskStep = ({ onStepBack }: PostTaskStepProps) => {
  const { 
    currentStep, 
    setCurrentStep,
    taskData, 
    setTaskData,
    taskId,
    setTaskId,
    submitting,
    setSubmitting
  } = usePostTask();
  const navigate = useNavigate();

  const handleBasicInfoSubmit = (data: BasicInfoFormData) => {
    setTaskData({
      ...taskData,
      title: data.title,
      budget: data.budget,
      photos: data.photos,
    });
    setCurrentStep("location-date");
  };

  const handleLocationDateSubmit = (data: LocationDateFormData) => {
    setTaskData({
      ...taskData,
      location: data.location,
      description: data.description,
      due_date: data.dueDate.toISOString(),
    });
    setCurrentStep("review");
  };

  const handleSubmitTask = async () => {
    setSubmitting(true);
    try {
      const newTaskId = await createTask(taskData);

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

  // Navigate directly to specific step based on field
  const handleEditField = (field: string) => {
    if (["title", "photos", "budget"].includes(field)) {
      setCurrentStep("basic-info");
    } else if (["location", "due_date", "description"].includes(field)) {
      setCurrentStep("location-date");
    }
  };

  const handleBack = (step: "basic-info" | "location-date") => {
    setCurrentStep(step);
  };

  const handleViewTask = () => {
    // Navigate to task details page
    window.location.href = `/tasks/${taskId}`;
  };

  const handleBackToHome = () => {
    navigate("/welcome-after-login");
  };

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
          onBack={onStepBack} // Use the passed onStepBack function
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
          onEditField={handleEditField}
          submitting={submitting}
        />
      );
    case "confirmation":
      return <TaskConfirmation taskId={taskId} onViewTask={handleViewTask} />;
    default:
      return null;
  }
};

export default PostTaskStep;
