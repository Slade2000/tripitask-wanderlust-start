
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { getTaskOffers } from "@/services/task/offers/queries/getTaskOffers"; 
import { Button } from "@/components/ui/button";
import TaskBasicInfo from "@/components/task-detail/TaskBasicInfo";
import TaskDescription from "@/components/task-detail/TaskDescription";
import TaskImageGallery from "@/components/task-detail/TaskImageGallery";
import TaskPosterInfo from "@/components/task-detail/TaskPosterInfo";
import TaskDetailLoading from "@/components/task-detail/TaskDetailLoading";
import TaskDetailError from "@/components/task-detail/TaskDetailError";
import MessageModal from "@/components/messages/MessageModal";
import TaskDetailHeader from "@/components/task-detail/TaskDetailHeader";
import TaskActionSection from "@/components/task-detail/TaskActionSection";
import TaskOffersSection from "@/components/task-detail/TaskOffersSection";

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [task, setTask] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isTaskPoster, setIsTaskPoster] = useState(false);
  const [hasAcceptedOffer, setHasAcceptedOffer] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      
      setLoading(true);
      try {
        const taskData = await getTaskById(taskId);
        
        if (taskData) {
          setTask(taskData);
          // Check if the current user is the task poster
          setIsTaskPoster(user?.id === taskData.user_id);
          
          // Check if the task status indicates an accepted offer ("assigned" status)
          setHasAcceptedOffer(taskData.status === 'assigned' || taskData.status === 'in_progress');
        } else {
          setError("Task not found");
        }
      } catch (err) {
        console.error("Error fetching task:", err);
        setError("Error loading task. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, user?.id]);

  useEffect(() => {
    const fetchOffers = async () => {
      if (!taskId || !isTaskPoster) return;
      
      setOffersLoading(true);
      try {
        const offersData = await getTaskOffers(taskId);
        setOffers(offersData || []);
        
        // Check if there's any accepted offer
        const acceptedOffer = offersData?.find((offer: any) => offer.status === 'accepted');
        setHasAcceptedOffer(!!acceptedOffer || (task?.status === 'assigned' || task?.status === 'in_progress'));
      } catch (err) {
        console.error("Error fetching offers:", err);
      } finally {
        setOffersLoading(false);
      }
    };

    if (isTaskPoster) {
      fetchOffers();
    }
  }, [taskId, isTaskPoster, task?.status]);

  const handleOpenMessageModal = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
  };

  const refreshOffers = async () => {
    if (!taskId) return;
    
    try {
      const offersData = await getTaskOffers(taskId);
      setOffers(offersData || []);
      
      // Update the hasAcceptedOffer state
      const acceptedOffer = offersData?.find((offer: any) => offer.status === 'accepted');
      setHasAcceptedOffer(!!acceptedOffer || (task?.status === 'assigned' || task?.status === 'in_progress'));
    } catch (err) {
      console.error("Error refreshing offers:", err);
    }
  };

  const handleTaskUpdated = (updatedTask: any) => {
    setTask(updatedTask);
    // Update accepted offer state based on task status
    setHasAcceptedOffer(updatedTask.status === 'assigned' || updatedTask.status === 'in_progress');
  };

  if (loading) {
    return <TaskDetailLoading onBack={() => navigate(-1)} />;
  }

  if (error || !task) {
    return <TaskDetailError error={error || "Task not found"} onBack={() => navigate(-1)} />;
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-4xl mx-auto">
        <TaskDetailHeader title={task.title} status={task.status} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {task.task_photos && task.task_photos.length > 0 && (
              <TaskImageGallery photos={task.task_photos.map((p: any) => p.photo_url)} />
            )}
            
            <TaskBasicInfo
              budget={task.budget}
              location={task.location}
              dueDate={task.due_date}
              categoryName={task.categories?.name}
            />
            
            <TaskDescription description={task.description} />
            
            {task.status === 'open' && !isTaskPoster && !hasAcceptedOffer && (
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
                    onClick={handleOpenMessageModal}
                    variant="outline"
                    className="border-teal text-teal hover:bg-teal/10"
                  >
                    Ask a Question
                  </Button>
                </div>
              </div>
            )}
            
            {hasAcceptedOffer && !isTaskPoster && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <h3 className="font-semibold mb-1">This task has been assigned</h3>
                <p>An offer has been accepted for this task. No new offers can be submitted.</p>
              </div>
            )}
            
            <TaskOffersSection 
              taskId={taskId || ''}
              isTaskPoster={isTaskPoster}
              offers={offers}
              offersLoading={offersLoading}
              onRefreshOffers={refreshOffers}
            />
          </div>
          
          <div className="space-y-6">
            <TaskPosterInfo
              userId={task.user_id}
              taskId={task.id}
            />
            
            <TaskActionSection 
              task={task}
              isTaskPoster={isTaskPoster} 
              onOpenMessageModal={handleOpenMessageModal}
              onTaskUpdated={handleTaskUpdated}
              hasAcceptedOffer={hasAcceptedOffer}
            />
          </div>
        </div>
      </div>
      
      {isMessageModalOpen && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={handleCloseMessageModal}
          taskId={task.id}
          receiverId={task.user_id}
          taskTitle={task.title}
        />
      )}
    </div>
  );
};

export default TaskDetail;
