
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
  
  // Debug log to see what offers we're getting
  console.log("OffersList received offers:", offers, "isArray:", Array.isArray(offers), "length:", offers?.length);
  
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
  
  // Check if offers is undefined/null before checking length
  if (!offers || offers.length === 0) {
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
