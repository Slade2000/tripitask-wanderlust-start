
import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useTaskDetail } from "@/hooks/useTaskDetail";
import TaskDetailView from "@/components/task-detail/TaskDetailView";
import TaskDetailLoading from "@/components/task-detail/TaskDetailLoading";
import TaskDetailError from "@/components/task-detail/TaskDetailError";
import BottomNav from "@/components/BottomNav";

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const { 
    task, 
    offers,
    loading, 
    error, 
    isTaskPoster,
    hasAcceptedOffer,
    isCurrentUserProvider,
    isMessageModalOpen,
    handleOpenMessageModal,
    handleCloseMessageModal,
    handleTaskUpdated,
    refreshOffers,
    posterProfile,
    providerProfile
  } = useTaskDetail(taskId, user);

  useEffect(() => {
    // When component mounts, scroll to top
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Debug logging for task status and poster info
    if (task) {
      console.log("TaskDetail received task with status:", task.status);
      console.log("Task poster info:", {
        name: task.poster_name,
        rating: task.poster_rating,
        memberSince: task.poster_member_since,
        location: task.poster_location,
        avatar: task.poster_avatar
      });
      console.log("Current user is task poster:", isTaskPoster);
      console.log("Current user is service provider:", isCurrentUserProvider);
      console.log("Provider profile:", providerProfile);
    }
  }, [task, isTaskPoster, isCurrentUserProvider, providerProfile]);

  if (loading) {
    return (
      <>
        <TaskDetailLoading onBack={() => navigate(-1)} />
        <BottomNav currentPath={location.pathname} />
      </>
    );
  }

  if (error || !task) {
    return (
      <>
        <TaskDetailError error={error || "Task not found"} onBack={() => navigate(-1)} />
        <BottomNav currentPath={location.pathname} />
      </>
    );
  }

  // Find the accepted offer
  const acceptedOffer = offers?.find(offer => 
    offer.status === 'accepted' || 
    offer.status === 'work_completed' || 
    offer.status === 'completed'
  );
  
  // Enhance provider details
  const enhancedProviderDetails = acceptedOffer?.provider_details || providerProfile;
  
  return (
    <>
      <TaskDetailView
        task={task}
        offers={offers}
        isTaskPoster={isTaskPoster}
        hasAcceptedOffer={hasAcceptedOffer}
        isCurrentUserProvider={isCurrentUserProvider}
        isMessageModalOpen={isMessageModalOpen}
        onOpenMessageModal={handleOpenMessageModal}
        onCloseMessageModal={handleCloseMessageModal}
        onTaskUpdated={handleTaskUpdated}
        onRefreshOffers={refreshOffers}
        providerDetails={enhancedProviderDetails}
      />
      <BottomNav currentPath={location.pathname} />
    </>
  );
};

export default TaskDetail;
