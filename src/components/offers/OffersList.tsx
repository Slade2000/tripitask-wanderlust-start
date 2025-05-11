
import { Offer } from "@/types/offer";
import { useToast } from "@/hooks/use-toast";
import OfferCard from "./OfferCard";
import EmptyOffers from "./EmptyOffers";
import { useState } from "react";
import { updateOfferStatus } from "@/services/task/offers/queries/updateOfferStatus";

interface OffersListProps {
  offers: Offer[];
  taskId: string;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export default function OffersList({ offers, taskId, loading, onRefresh }: OffersListProps) {
  const { toast } = useToast();
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  
  // Enhanced debug logs
  console.log("OffersList received offers:", offers);
  console.log("Offers data type:", typeof offers);
  console.log("Is Array:", Array.isArray(offers));
  console.log("Length:", offers?.length);
  console.log("TaskId:", taskId);
  
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

  if (loading) {
    return <div className="text-center p-6">Loading offers...</div>;
  }
  
  // Toggle debug info
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };
  
  // Check if offers is undefined/null or empty
  if (!offers || !Array.isArray(offers) || offers.length === 0) {
    return (
      <div>
        <EmptyOffers />
        <div className="mt-4 text-center">
          <button 
            onClick={toggleDebugInfo} 
            className="text-sm text-gray-500 hover:text-teal"
          >
            {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
          </button>
          
          {showDebugInfo && (
            <div className="mt-2 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-60">
              <p>Task ID: {taskId}</p>
              <p>Offers data type: {typeof offers}</p>
              <p>Is array: {String(Array.isArray(offers))}</p>
              <p>Offers: {JSON.stringify(offers, null, 2)}</p>
            </div>
          )}
          
          <button 
            onClick={onRefresh} 
            className="block mx-auto mt-4 text-sm bg-teal text-white px-4 py-2 rounded hover:bg-teal-dark"
          >
            Retry Loading Offers
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onAccept={() => handleAcceptOffer(offer.id)}
          onReject={() => handleRejectOffer(offer.id)}
          onViewDetails={() => handleViewOfferDetails(offer.id)}
          isUpdating={updatingOfferId === offer.id}
        />
      ))}
      
      <div className="mt-4 text-center">
        <button 
          onClick={toggleDebugInfo} 
          className="text-sm text-gray-500 hover:text-teal"
        >
          {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
        </button>
        
        {showDebugInfo && (
          <div className="mt-2 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-60">
            <p>Task ID: {taskId}</p>
            <p>Offers count: {offers.length}</p>
            <p>Offers: {JSON.stringify(offers, null, 2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
