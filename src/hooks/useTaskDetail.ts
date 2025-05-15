
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { getTaskOffers } from "@/services/task/offers/queries/getTaskOffers";
import { syncTaskStatusWithOffers } from "@/services/task/offers/queries/updateOfferStatus";
import { User } from "@/types/user";
import { Offer } from "@/types/offer";
import { toast } from "@/hooks/use-toast";
import { fetchProfileById } from "@/integrations/supabase/client";

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
  const [isCurrentUserProvider, setIsCurrentUserProvider] = useState(false);
  const [posterProfile, setPosterProfile] = useState<any>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      
      setLoading(true);
      try {
        const taskData = await getTaskById(taskId);
        
        if (taskData) {
          console.log("Task data retrieved:", taskData);
          
          // Fetch task poster profile information
          if (taskData.user_id) {
            console.log("Fetching profile for task poster:", taskData.user_id);
            try {
              const profile = await fetchProfileById(taskData.user_id);
              console.log("Task poster profile retrieved:", profile);
              
              if (profile) {
                setPosterProfile(profile);
                
                // Enhance task data with poster profile information
                taskData.poster_name = profile.full_name || "Unknown User";
                taskData.poster_avatar = profile.avatar_url;
                taskData.poster_rating = profile.rating || 0;
                taskData.poster_member_since = profile.created_at 
                  ? new Date(profile.created_at).toLocaleDateString()
                  : undefined;
                taskData.poster_location = profile.location;
              } else {
                console.warn("Could not fetch poster profile for user ID:", taskData.user_id);
              }
            } catch (profileError) {
              console.error("Error fetching task poster profile:", profileError);
            }
          }
          
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
      if (!taskId) return;
      
      setOffersLoading(true);
      try {
        const offersData = await getTaskOffers(taskId);
        setOffers(offersData || []);
        
        // Check if there's any accepted offer
        const acceptedOffer = offersData?.find((offer: any) => offer.status === 'accepted');
        setHasAcceptedOffer(!!acceptedOffer || (task?.status === 'inprogress' || task?.status === 'in_progress' || task?.status === 'assigned' || task?.status === 'completed'));
        
        // Check if current user is the provider of an accepted offer
        if (user?.id && acceptedOffer) {
          setIsCurrentUserProvider(acceptedOffer.provider_id === user.id);
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
      } finally {
        setOffersLoading(false);
      }
    };

    fetchOffers();
  }, [taskId, user?.id, task?.status]);

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
      
      // Check if current user is the provider of an accepted offer
      if (user?.id && acceptedOffer) {
        setIsCurrentUserProvider(acceptedOffer.provider_id === user.id);
      }
      
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
    // Refresh offers to get the latest status
    refreshOffers();
  };

  return {
    task,
    offers,
    loading,
    offersLoading,
    error,
    isTaskPoster,
    hasAcceptedOffer,
    isCurrentUserProvider,
    isMessageModalOpen,
    handleOpenMessageModal,
    handleCloseMessageModal,
    handleTaskUpdated,
    refreshOffers,
    posterProfile
  };
}
