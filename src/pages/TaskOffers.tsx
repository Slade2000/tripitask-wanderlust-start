
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, CalendarClock, CheckCircle, Star } from "lucide-react";
import { getTaskById } from "@/services/taskService";
import { getTaskOffers, updateOfferStatus } from "@/services/task/offerQueries";
import { Offer } from "@/types/offer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";
import { Badge } from "@/components/ui/badge";

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
    // Navigate to offer details page (to be implemented)
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
        ) : offers.length > 0 ? (
          offers.map((offer) => (
            <div 
              key={offer.id} 
              className="bg-white rounded-lg shadow-md p-4 border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={offer.provider?.avatar_url || ""} alt={offer.provider?.name} />
                    <AvatarFallback>{offer.provider?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{offer.provider?.name}</h3>
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
                      onClick={() => handleRejectOffer(offer.id)}
                      variant="outline" 
                      className="text-red-600 border-red-600 hover:bg-red-50"
                      disabled={updatingOfferId === offer.id}
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={updatingOfferId === offer.id}
                    >
                      Accept
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => handleViewOfferDetails(offer.id)}
                  variant="outline"
                  className="bg-teal hover:bg-teal-dark text-white hover:text-white"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="flex justify-end mb-4">
              <div className="bg-gray-100 p-4 rounded-3xl rounded-tr-none max-w-xs">
                <p className="text-gray-600">
                  No offers yet. Hang tight! Service providers are checking your task.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DollarSign(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
}
