
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTaskById } from "@/services/task/queries/getTaskById";
import { getTaskOffers } from "@/services/task/offers/queries/getTaskOffers";
import { syncTaskStatusWithOffers } from "@/services/task/offers/queries/updateOfferStatus";
import { User } from "@/types/user";
import { Offer } from "@/types/offer";
import { toast } from "@/hooks/use-toast";
import { fetchProfileById } from "@/integrations/supabase/client";
import { TaskData } from "@/services/task/types";

export function useTaskDetail(taskId: string | undefined, user: User | null) {
  const navigate = useNavigate();
  
  const [task, setTask] = useState<TaskData | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isTaskPoster, setIsTaskPoster] = useState(false);
  const [hasAcceptedOffer, setHasAcceptedOffer] = useState(false);
  const [isCurrentUserProvider, setIsCurrentUserProvider] = useState(false);
  const [posterProfile, setPosterProfile] = useState<any>(null);
  const [providerProfile, setProviderProfile] = useState<any>(null);

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
                
                // Create a new taskData object with all existing properties plus the enhanced poster fields
                const enhancedTaskData: TaskData = {
                  ...taskData,
                  poster_name: profile.full_name || "Unknown User",
                  poster_avatar: profile.avatar_url,
                  poster_rating: profile.rating || 0,
                  poster_member_since: profile.created_at 
                    ? new Date(profile.created_at).toLocaleDateString()
                    : undefined,
                  poster_location: profile.location
                };
                
                setTask(enhancedTaskData);
              } else {
                console.warn("Could not fetch poster profile for user ID:", taskData.user_id);
                setTask(taskData);
              }
            } catch (profileError) {
              console.error("Error fetching task poster profile:", profileError);
              setTask(taskData);
            }
          } else {
            setTask(taskData);
          }
          
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
        const acceptedOffer = offersData?.find((offer: any) => 
          offer.status === 'accepted' || 
          offer.status === 'work_completed' || 
          offer.status === 'completed'
        );
        
        setHasAcceptedOffer(!!acceptedOffer || (task?.status === 'inprogress' || task?.status === 'in_progress' || task?.status === 'assigned' || task?.status === 'completed'));
        
        // Check if current user is the provider of an accepted offer
        if (user?.id && acceptedOffer) {
          setIsCurrentUserProvider(acceptedOffer.provider_id === user.id);
          
          // Fetch provider profile for the accepted offer
          if (acceptedOffer.provider_id) {
            try {
              console.log("Fetching provider profile:", acceptedOffer.provider_id);
              const providerProfileData = await fetchProfileById(acceptedOffer.provider_id);
              console.log("Provider profile loaded:", providerProfileData);
              
              if (providerProfileData) {
                setProviderProfile(providerProfileData);
                
                // Enhance the accepted offer with provider details
                const enhancedOffers = offersData.map((offer: any) => {
                  if (offer.id === acceptedOffer.id) {
                    return {
                      ...offer,
                      provider_details: providerProfileData
                    };
                  }
                  return offer;
                });
                
                setOffers(enhancedOffers);
              }
            } catch (error) {
              console.error("Error fetching provider profile:", error);
            }
          }
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
      
      // Check if there's any accepted offer
      const acceptedOffer = offersData?.find((offer: any) => 
        offer.status === 'accepted' || 
        offer.status === 'work_completed' || 
        offer.status === 'completed'
      );
      
      // If we have an accepted offer, fetch the provider profile
      if (acceptedOffer?.provider_id) {
        try {
          const providerProfileData = await fetchProfileById(acceptedOffer.provider_id);
          console.log("Provider profile loaded during refresh:", providerProfileData);
          
          if (providerProfileData) {
            setProviderProfile(providerProfileData);
            
            // Enhance the accepted offer with provider details
            const enhancedOffers = offersData.map((offer: any) => {
              if (offer.id === acceptedOffer.id) {
                return {
                  ...offer,
                  provider_details: providerProfileData
                };
              }
              return offer;
            });
            
            setOffers(enhancedOffers);
            
            // Update states related to the offer
            setHasAcceptedOffer(true);
            if (user?.id) {
              setIsCurrentUserProvider(acceptedOffer.provider_id === user.id);
            }
            
            return;
          }
        } catch (error) {
          console.error("Error fetching provider profile during refresh:", error);
        }
      }
      
      // If we couldn't enhance the offers with provider details, just set them as is
      setOffers(offersData || []);
      
      // Update the hasAcceptedOffer state
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
    posterProfile,
    providerProfile
  };
}
