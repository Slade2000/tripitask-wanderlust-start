
import { createContext, useContext, useState, ReactNode } from "react";
import { TaskData } from "@/services/taskService";

export type StepType = "basic-info" | "location-date" | "review" | "confirmation";

interface PostTaskContextType {
  currentStep: StepType;
  setCurrentStep: (step: StepType) => void;
  taskId: string | null;
  setTaskId: (id: string | null) => void;
  taskData: TaskData;
  setTaskData: (data: TaskData) => void;
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
}

const PostTaskContext = createContext<PostTaskContextType | undefined>(undefined);

export const usePostTask = () => {
  const context = useContext(PostTaskContext);
  if (!context) {
    throw new Error("usePostTask must be used within a PostTaskProvider");
  }
  return context;
};

interface PostTaskProviderProps {
  children: ReactNode;
  initialData?: TaskData;
  userId: string;
}

export const PostTaskProvider = ({ 
  children, 
  initialData,
  userId
}: PostTaskProviderProps) => {
  const [currentStep, setCurrentStep] = useState<StepType>("basic-info");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [taskData, setTaskData] = useState<TaskData>(
    initialData || {
      title: "",
      description: "",
      budget: "",
      location: "",
      user_id: userId,
      due_date: new Date().toISOString(),
      photos: []
    }
  );

  const value = {
    currentStep,
    setCurrentStep,
    taskId,
    setTaskId,
    taskData,
    setTaskData,
    submitting,
    setSubmitting,
  };

  return (
    <PostTaskContext.Provider value={value}>
      {children}
    </PostTaskContext.Provider>
  );
};
