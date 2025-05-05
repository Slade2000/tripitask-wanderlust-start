
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getTaskById, getTaskOffers } from "@/services/taskService";
import { Offer } from "@/types/offer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

export default function TaskOffers() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [task, setTask] = useState<any>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

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
            // Convert the raw offers data to match the Offer type
            const typedOffers = offersData.map((offer: any): Offer => ({
              ...offer,
              status: offer.status as "pending" | "accepted" | "rejected"
            }));
            setOffers(typedOffers);
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
    navigate(`/offers/${offerId}`);
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
                    <AvatarImage src={offer.provider.avatar_url || ""} alt={offer.provider.name} />
                    <AvatarFallback>{offer.provider.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{offer.provider.name}</h3>
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
                  <span>{offer.provider.rating || "New"}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle size={16} className="mr-2 text-green-500" />
                  <span>{offer.provider.success_rate || "New provider"}</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => handleViewOfferDetails(offer.id)}
                  className="bg-teal hover:bg-teal-dark"
                >
                  View Offer Details
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="flex justify-end mb-4">
              <div className="bg-gray-100 p-4 rounded-3xl rounded-tr-none max-w-xs">
                <p className="text-gray-600">
                  Hang tight! Service providers are checking your task.
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

function CalendarClock(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M3 10h5"></path><path d="M17.5 17.5 16 16.25V14"></path><path d="M22 16a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"></path></svg>
}

function Star(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
}

function CheckCircle(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
}
