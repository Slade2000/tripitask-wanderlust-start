
import { CalendarClock, CheckCircle, Star } from "lucide-react";
import { Offer } from "@/types/offer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OfferCardProps {
  offer: Offer;
  onAccept: (offerId: string) => void;
  onReject: (offerId: string) => void;
  onViewDetails: (offerId: string) => void;
  isUpdating: boolean;
}

export default function OfferCard({ 
  offer, 
  onAccept, 
  onReject, 
  onViewDetails, 
  isUpdating 
}: OfferCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={offer.provider?.avatar_url || ""} alt={offer.provider?.name || "Provider"} />
            <AvatarFallback>{offer.provider?.name?.charAt(0) || "P"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{offer.provider?.name || "Unknown Provider"}</h3>
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
          <span>{offer.provider?.rating || "New"}</span>
        </div>
        <div className="flex items-center">
          <CheckCircle size={16} className="mr-2 text-green-500" />
          <span>{offer.provider?.success_rate || "New provider"}</span>
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

function DollarSign(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
}
