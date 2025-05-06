
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
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const loadTaskAndOffers = async () => {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      
      if (!taskId) {
        setError("Task ID is missing");
        setLoading(false);
        return;
      }
      
      try {
        console.log("Loading task with ID:", taskId);
        
        // Fetch task details
        const taskData = await getTaskById(taskId);
        console.log("Task data received:", taskData);
        
        if (taskData) {
          setTask(taskData);
          
          try {
            // Fetch offers for the task
            console.log("Fetching offers for task:", taskId);
            const offersData = await getTaskOffers(taskId);
            console.log("Offers data received:", offersData);
            
            setOffers(offersData);
            
            if (offersData.length === 0) {
              console.log("No offers found for this task");
              setDebugInfo({
                message: `No offers found for this task (ID: ${taskId})`,
                taskId: taskId
              });
            } else {
              console.log(`Found ${offersData.length} offers for this task`);
              
              // Check if any offers are missing provider data
              const missingProviderData = offersData.some(
                offer => !offer.provider?.name || offer.provider.name === 'Unknown Provider'
              );
              
              if (missingProviderData) {
                setDebugInfo({
                  message: "Some offers are missing provider data",
                  offers: offersData.map(o => ({
                    id: o.id,
                    provider_id: o.provider_id,
                    provider: o.provider
                  }))
                });
              } else {
                setDebugInfo(null);
              }
            }
          } catch (offerError) {
            console.error("Error fetching offers:", offerError);
            setError(`Failed to load offers: ${offerError instanceof Error ? offerError.message : 'Unknown error'}`);
            setDebugInfo({
              message: "Error occurred while fetching offers",
              error: offerError instanceof Error ? offerError.message : String(offerError)
            });
          }
        } else {
          setError("Task not found");
          toast({
            title: "Error",
            description: "Task not found",
            variant: "destructive",
          });
          navigate("/my-jobs");
        }
      } catch (error) {
        console.error("Error loading task or offers:", error);
        setError("Failed to load task offers");
        setDebugInfo({
          message: "Error occurred while loading task",
          error: error instanceof Error ? error.message : String(error)
        });
        toast({
          title: "Error",
          description: "Failed to load task offers",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTaskAndOffers();
  }, [taskId, navigate, toast]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewOfferDetails = (offerId: string) => {
    console.log("View details for offer:", offerId);
    
    // For now, we'll just show a toast
    toast({
      title: "Coming Soon",
      description: "Offer details will be available soon",
    });
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!taskId) return;
    
    console.log("Accepting offer:", offerId);
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
      console.error("Error accepting offer:", error);
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
    
    console.log("Rejecting offer:", offerId);
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
      console.error("Error rejecting offer:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingOfferId(null);
    }
  };

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
      
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4 text-center">
          {error}
        </div>
      )}
      
      {debugInfo && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4 text-center text-sm">
          <p className="font-semibold">Debug Info</p>
          <pre className="whitespace-pre-wrap text-left mt-2 bg-yellow-50 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
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
