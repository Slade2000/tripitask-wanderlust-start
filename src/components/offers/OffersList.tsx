
import { Offer } from "@/types/offer";
import { useToast } from "@/hooks/use-toast";
import OfferCard from "./OfferCard";
import EmptyOffers from "./EmptyOffers";
import OfferActions from "./OfferActions";
import { useState } from "react";

interface OffersListProps {
  offers: Offer[];
  taskId: string;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export default function OffersList({ offers, taskId, loading, onRefresh }: OffersListProps) {
  const { toast } = useToast();
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);
  
  const handleViewOfferDetails = (offerId: string) => {
    console.log("View details for offer:", offerId);
    
    // For now, we'll just show a toast
    toast({
      title: "Coming Soon",
      description: "Offer details will be available soon",
    });
  };

  if (loading) {
    return <div className="text-center p-6">Loading offers...</div>;
  }
  
  if (!offers || offers.length === 0) {
    return <EmptyOffers />;
  }
  
  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const { handleAcceptOffer, handleRejectOffer } = OfferActions({
          taskId,
          offerId: offer.id,
          onUpdate: onRefresh,
          setUpdatingOfferId
        });
        
        return (
          <OfferCard
            key={offer.id}
            offer={offer}
            onAccept={handleAcceptOffer}
            onReject={handleRejectOffer}
            onViewDetails={handleViewOfferDetails}
            isUpdating={updatingOfferId === offer.id}
          />
        );
      })}
    </div>
  );
}
