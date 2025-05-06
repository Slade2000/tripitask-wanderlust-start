
import { CalendarClock, CheckCircle, DollarSign, Star } from "lucide-react";
import { Offer } from "@/types/offer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OfferCardProps {
  offer: Offer;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
  onViewDetails: (offerId: string) => void;
  isUpdating: boolean | string | null;
}

export default function OfferCard({ 
  offer, 
  onAccept, 
  onReject, 
  onViewDetails, 
  isUpdating 
}: OfferCardProps) {
  console.log("Rendering offer card with data:", offer);
  
  // Ensure provider object always exists
  const provider = offer.provider || {
    id: offer.provider_id,
    name: 'Unknown Provider',
    avatar_url: '',
  };
  
  // Get provider name with fallback
  const providerName = provider.name || 'Unknown Provider';
  
  // Get first letter of provider name for avatar fallback
  const providerInitial = providerName && providerName.charAt(0) || 'P';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={provider.avatar_url || ""} alt={providerName} />
            <AvatarFallback>{providerInitial}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{providerName}</h3>
            <Badge className={
              offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              offer.status === 'accepted' ? 'bg-green-100 text-green-800' : 
              'bg-red-100 text-red-800'
            }>
              {offer.status}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <DollarSign size={16} className="mr-2 text-teal" />
          <span className="font-bold">${offer.amount}</span>
        </div>
        <div className="flex items-center">
          <CalendarClock size={16} className="mr-2 text-teal" />
          <span>{new Date(offer.expected_delivery_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center">
          <Star size={16} className="mr-2 text-amber-400" />
          <span>{provider.rating || "New"}</span>
        </div>
        <div className="flex items-center">
          <CheckCircle size={16} className="mr-2 text-green-500" />
          <span>{provider.success_rate || "New provider"}</span>
        </div>
      </div>
      
      {offer.message && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">{offer.message}</p>
        </div>
      )}
      
      <div className="mt-4 flex justify-end gap-2">
        {offer.status === 'pending' && (
          <>
            <Button 
              onClick={() => onReject(offer.id)}
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              disabled={isUpdating === offer.id}
            >
              Reject
            </Button>
            <Button 
              onClick={() => onAccept(offer.id)}
              className="bg-green-600 hover:bg-green-700"
              disabled={isUpdating === offer.id}
            >
              Accept
            </Button>
          </>
        )}
        <Button 
          onClick={() => onViewDetails(offer.id)}
          variant="outline"
          className="bg-teal hover:bg-teal-dark text-white hover:text-white"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
