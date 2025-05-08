
import { CalendarClock, CheckCircle, DollarSign, Star } from "lucide-react";
import { Offer } from "@/types/offer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OfferCardProps {
  offer: Offer;
  onAccept: () => void;
  onReject: () => void;
  onViewDetails: () => void;
  isUpdating: boolean | string | null;
}

export default function OfferCard({ 
  offer, 
  onAccept, 
  onReject, 
  onViewDetails, 
  isUpdating 
}: OfferCardProps) {
  const [providerName, setProviderName] = useState<string>("Loading...");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch provider data separately
  useEffect(() => {
    async function fetchProviderData() {
      if (!offer.provider_id) {
        console.error("No provider_id in offer:", offer);
        setProviderName("Unknown Provider");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching provider data for ID:", offer.provider_id);
        
        // Get provider profile directly
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', offer.provider_id)
          .single();
        
        if (error) {
          console.error("Error fetching provider:", error);
          setError(`Failed to load provider: ${error.message}`);
          setProviderName("Unknown Provider");
        } else if (data) {
          console.log("Provider data received:", data);
          setProviderName(data.full_name || "Unknown Provider");
          setAvatarUrl(data.avatar_url || "");
          setError(null);
        } else {
          console.log("No provider data found for ID:", offer.provider_id);
          setProviderName("Unknown Provider");
          setError("Provider not found");
        }
      } catch (err) {
        console.error("Exception fetching provider:", err);
        setProviderName("Unknown Provider");
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProviderData();
  }, [offer.provider_id]);
  
  // Ensure provider object always exists with good defaults
  const provider = offer.provider || {
    id: offer.provider_id,
    name: providerName,
    avatar_url: avatarUrl,
    rating: 4.5,
    success_rate: "95%"
  };
  
  // Get first letter of provider name for avatar fallback
  const providerInitial = providerName.charAt(0) || 'P';
  
  // Format date properly
  const formattedDate = new Date(offer.expected_delivery_date).toLocaleDateString(undefined, {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });

  // Format provider rating and success rate
  const rating = provider.rating || 4.5;
  const successRate = provider.success_rate || "95%";
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-600 text-xs rounded">
          {error}
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={avatarUrl || ""} alt={providerName} />
            <AvatarFallback className="bg-teal text-white">{providerInitial}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{isLoading ? "Loading..." : providerName}</h3>
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
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center">
          <Star size={16} className="mr-2 text-amber-400" />
          <span>{rating}</span>
        </div>
        <div className="flex items-center">
          <CheckCircle size={16} className="mr-2 text-green-500" />
          <span>{successRate}</span>
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
              onClick={onReject}
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              disabled={!!isUpdating}
            >
              Reject
            </Button>
            <Button 
              onClick={onAccept}
              className="bg-green-600 hover:bg-green-700"
              disabled={!!isUpdating}
            >
              Accept
            </Button>
          </>
        )}
        <Button 
          onClick={onViewDetails}
          variant="outline"
          className="bg-teal hover:bg-teal-dark text-white hover:text-white"
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
