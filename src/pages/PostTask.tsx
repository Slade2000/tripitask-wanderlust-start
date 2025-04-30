
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import BasicInfoStep, { BasicInfoFormData } from "../components/post-task/BasicInfoStep";
import LocationDateStep, { LocationDateFormData } from "../components/post-task/LocationDateStep";
import ReviewSubmitStep from "../components/post-task/ReviewSubmitStep";
import TaskConfirmation from "../components/post-task/TaskConfirmation";
import { TaskData, createTask } from "../services/taskService";
import { toast } from "sonner";

type StepType = "basic-info" | "location-date" | "review" | "confirmation";

const PostTask = () => {
  const { user } = useAuth();
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

  const handleViewTask = () => {
    // Navigate to task details page
    window.location.href = `/tasks/${taskId}`;
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
            onBack={() => setCurrentStep("basic-info")}
          />
        );
      case "review":
        return (
          <ReviewSubmitStep
            taskData={taskData}
            onSubmit={handleSubmitTask}
            onBack={() => setCurrentStep("location-date")}
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
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Post a New Task
        </h1>
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default PostTask;
