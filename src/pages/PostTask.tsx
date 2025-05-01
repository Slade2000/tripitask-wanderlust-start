
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { PostTaskProvider, usePostTask } from "@/contexts/PostTaskContext";
import PostTaskStep from "@/components/post-task/PostTaskStep";
import StepIndicator from "@/components/post-task/StepIndicator";

// This component manages the step info and navigation
const PostTaskStepManager = () => {
  const { currentStep } = usePostTask();
  const navigate = useNavigate();

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

  const handleStepBack = () => {
    switch (currentStep) {
      case "location-date":
        navigate("/post-task", { state: { step: "basic-info" } });
        break;
      case "review":
        navigate("/post-task", { state: { step: "location-date" } });
        break;
      default:
        // For basic-info, navigate back to home
        navigate("/welcome-after-login");
        break;
    }
  };

  return (
    <>
      {currentStep !== "confirmation" && (
        <StepIndicator 
          step={step}
          total={total}
          progress={progress}
          onBack={handleStepBack}
        />
      )}
      <PostTaskStep onStepBack={handleStepBack} />
    </>
  );
};

// Main PostTask page component
const PostTask = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Post a New Task
        </h1>

        {user && (
          <PostTaskProvider userId={user.id}>
            <PostTaskStepManager />
          </PostTaskProvider>
        )}
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default PostTask;
