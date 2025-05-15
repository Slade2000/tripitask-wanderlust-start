
import { Offer } from "@/types/offer";
import OfferCard from "@/components/offers/OfferCard";
import EmptyOffers from "@/components/offers/EmptyOffers";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { updateOfferStatus } from "@/services/task/offers/queries/updateOfferStatus";
import { getTaskById } from "@/services/task/queries/getTaskById";

interface TaskOffersListProps {
  taskId: string;
  offers: Offer[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  isTaskPoster: boolean;
  onTaskUpdated?: (task: any) => void; // Added this optional prop
  userId?: string; // Added this optional prop
  taskStatus?: any; // Added this optional prop
}

export default function TaskOffersList({ 
  taskId, 
  offers,
  loading,
  onRefresh,
  isTaskPoster,
  onTaskUpdated, // Added this prop
  userId,
  taskStatus
}: TaskOffersListProps) {
  const { toast } = useToast();
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [hasAcceptedOffer, setHasAcceptedOffer] = useState<boolean>(false);
  
  console.log("TaskOffersList received offers:", offers);

  // Check if any offer has been accepted
  useEffect(() => {
    if (offers && Array.isArray(offers)) {
      const acceptedOffer = offers.find(offer => offer.status === 'accepted');
      setHasAcceptedOffer(!!acceptedOffer);
    }
  }, [offers]);
  
  const handleViewOfferDetails = (offerId: string) => {
    console.log("View details for offer:", offerId);
    
    // For now, we'll just show a toast
    toast({
      title: "Coming Soon",
      description: "Offer details will be available soon",
    });
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!taskId || !isTaskPoster || hasAcceptedOffer) return;
    
    console.log("Accepting offer:", offerId);
    setUpdatingOfferId(offerId);
    
    try {
      const result = await updateOfferStatus(offerId, 'accepted');
      if (result.success) {
        toast({
          title: "Success",
          description: "Offer accepted successfully",
        });
        
        // Get the latest task data to ensure we have the updated status
        const updatedTask = await getTaskById(taskId);
        console.log("Task status after accepting offer:", updatedTask?.status);
        
        // Call onTaskUpdated if it exists
        if (onTaskUpdated && updatedTask) {
          onTaskUpdated(updatedTask);
        }
        
        // Refresh offers list
        await onRefresh();
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
    if (!taskId || !isTaskPoster || hasAcceptedOffer) return;
    
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
        await onRefresh();
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

  // Toggle debug info
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  if (loading) {
    return <div className="text-center p-6">Loading offers...</div>;
  }
  
  // Check if offers is undefined/null or empty
  if (!offers || !Array.isArray(offers) || offers.length === 0) {
    return <EmptyOffers />;
  }
  
  return (
    <div className="space-y-4">
      {hasAcceptedOffer && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          An offer has been accepted for this task. No further actions can be taken.
        </div>
      )}

      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onAccept={() => handleAcceptOffer(offer.id)}
          onReject={() => handleRejectOffer(offer.id)}
          onViewDetails={() => handleViewOfferDetails(offer.id)}
          isUpdating={updatingOfferId === offer.id}
          disableActions={!isTaskPoster || hasAcceptedOffer || offer.status !== 'pending'}
        />
      ))}

      {showDebugInfo && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-60">
          <h4 className="font-semibold mb-2">Debug Information</h4>
          <p><strong>Task ID:</strong> {taskId}</p>
          <p><strong>Offers count:</strong> {offers.length}</p>
          <p><strong>Has accepted offer:</strong> {hasAcceptedOffer ? 'Yes' : 'No'}</p>
          <p><strong>User ID:</strong> {userId || 'Not provided'}</p>
          <p><strong>Task Status:</strong> {taskStatus || 'Not provided'}</p>
          <div>
            <p><strong>Offers:</strong></p>
            <pre>{JSON.stringify(offers, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <button 
          onClick={toggleDebugInfo} 
          className="text-sm text-gray-500 hover:text-teal"
        >
          {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
        </button>
      </div>
    </div>
  );
}
