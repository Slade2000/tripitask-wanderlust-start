
import { Offer } from "@/types/offer";
import OfferCard from "@/components/offers/OfferCard";
import EmptyOffers from "@/components/offers/EmptyOffers";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { updateOfferStatus } from "@/services/task/offers/queries/updateOfferStatus";

interface TaskOffersListProps {
  taskId: string;
  offers: Offer[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export default function TaskOffersList({ 
  taskId, 
  offers,
  loading,
  onRefresh
}: TaskOffersListProps) {
  const { toast } = useToast();
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  
  console.log("TaskOffersList received offers:", offers);
  
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
    </div>
  );
}
