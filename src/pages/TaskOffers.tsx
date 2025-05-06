
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getTaskById } from "@/services/taskService";
import { getTaskOffers, updateOfferStatus } from "@/services/task/offerQueries";
import { Offer } from "@/types/offer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import OfferCard from "@/components/offers/OfferCard";
import EmptyOffers from "@/components/offers/EmptyOffers";

export default function TaskOffers() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [task, setTask] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);

  useEffect(() => {
    const loadTaskAndOffers = async () => {
      setLoading(true);
      if (taskId) {
        try {
          // Fetch task details
          const taskData = await getTaskById(taskId);
          if (taskData) {
            setTask(taskData);
            
            // Fetch offers for the task
            const offersData = await getTaskOffers(taskId);
            console.log("Fetched offers:", offersData);
            setOffers(offersData);
          } else {
            toast({
              title: "Error",
              description: "Task not found",
              variant: "destructive",
            });
            navigate("/my-jobs");
          }
        } catch (error) {
          console.error("Error loading task or offers:", error);
          toast({
            title: "Error",
            description: "Failed to load task offers",
            variant: "destructive",
          });
        }
      }
      setLoading(false);
    };

    loadTaskAndOffers();
  }, [taskId, navigate, toast]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewOfferDetails = (offerId: string) => {
    // For now, we'll just show a toast
    toast({
      title: "Coming Soon",
      description: "Offer details will be available soon",
    });
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!taskId) return;
    
    setUpdatingOfferId(offerId);
    try {
      const result = await updateOfferStatus(offerId, 'accepted');
      if (result.success) {
        toast({
          title: "Success",
          description: "Offer accepted successfully",
        });
        
        // Refresh offers list
        const updatedOffers = await getTaskOffers(taskId);
        setOffers(updatedOffers);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to accept offer",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingOfferId(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    if (!taskId) return;
    
    setUpdatingOfferId(offerId);
    try {
      const result = await updateOfferStatus(offerId, 'rejected');
      if (result.success) {
        toast({
          title: "Success",
          description: "Offer rejected successfully",
        });
        
        // Refresh offers list
        const updatedOffers = await getTaskOffers(taskId);
        setOffers(updatedOffers);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject offer",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingOfferId(null);
    }
  };

  // Debugging - check if we actually have offers
  console.log("Current offers state:", offers);

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={handleBack} 
          className="flex items-center text-teal hover:text-teal-dark"
        >
          <ChevronLeft size={24} />
          <span className="ml-1">Back</span>
        </button>
        <Logo />
      </div>
      
      <h1 className="text-2xl font-bold text-teal text-center my-6">
        {loading ? "Loading..." : task ? `Offers for ${task.title}` : "Task Not Found"}
      </h1>
      
      <div className="max-w-4xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center p-6">Loading offers...</div>
        ) : offers && offers.length > 0 ? (
          offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onAccept={handleAcceptOffer}
              onReject={handleRejectOffer}
              onViewDetails={handleViewOfferDetails}
              isUpdating={updatingOfferId === offer.id}
            />
          ))
        ) : (
          <EmptyOffers />
        )}
      </div>
    </div>
  );
}
