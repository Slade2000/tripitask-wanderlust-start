
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { getTaskOffers } from "@/services/task/offers/queries/getTaskOffers";
import { syncTaskStatusWithOffers } from "@/services/task/offers/queries/updateOfferStatus";
import { User } from "@/types/user";
import { Offer } from "@/types/offer";
import { toast } from "@/hooks/use-toast";

export function useTaskDetail(taskId: string | undefined, user: User | null) {
  const navigate = useNavigate();
  
  const [task, setTask] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
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
          
          // Check if the task status indicates an accepted offer
          // Support both "inprogress" (without underscore) and "in_progress" (with underscore)
          setHasAcceptedOffer(taskData.status === 'inprogress' || taskData.status === 'in_progress' || taskData.status === 'assigned' || taskData.status === 'completed');

          // Check for data consistency between task status and offers
          const checkResult = await syncTaskStatusWithOffers(taskId);
          if (checkResult.updated) {
            // If the task status was fixed, refresh the task data
            console.log("Task status was inconsistent with offers and has been fixed");
            toast({
              title: "Task status corrected",
              description: "The task status has been updated to match its accepted offer",
            });
            const refreshedTask = await getTaskById(taskId);
            if (refreshedTask) {
              setTask(refreshedTask);
              setHasAcceptedOffer(refreshedTask.status === 'inprogress' || refreshedTask.status === 'in_progress' || refreshedTask.status === 'assigned' || refreshedTask.status === 'completed');
            }
          }
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
        setHasAcceptedOffer(!!acceptedOffer || (task?.status === 'inprogress' || task?.status === 'in_progress' || task?.status === 'assigned' || task?.status === 'completed'));
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
      setHasAcceptedOffer(!!acceptedOffer || (task?.status === 'inprogress' || task?.status === 'in_progress' || task?.status === 'assigned' || task?.status === 'completed'));
      
      // Also refresh the task to get the latest status
      const refreshedTask = await getTaskById(taskId);
      if (refreshedTask) {
        setTask(refreshedTask);
      }
    } catch (err) {
      console.error("Error refreshing offers:", err);
    }
  };

  const handleTaskUpdated = (updatedTask: any) => {
    setTask(updatedTask);
    // Update accepted offer state based on task status
    setHasAcceptedOffer(updatedTask.status === 'inprogress' || updatedTask.status === 'in_progress' || updatedTask.status === 'assigned' || updatedTask.status === 'completed');
  };

  return {
    task,
    offers,
    loading,
    offersLoading,
    error,
    isTaskPoster,
    hasAcceptedOffer,
    isMessageModalOpen,
    handleOpenMessageModal,
    handleCloseMessageModal,
    handleTaskUpdated,
    refreshOffers
  };
}
