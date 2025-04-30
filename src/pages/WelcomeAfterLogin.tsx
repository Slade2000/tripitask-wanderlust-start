
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Plus, Briefcase } from "lucide-react";

const images = [
  {
    src: "/vanlife1.jpg",
    alt: "Van parked at sunset"
  },
  {
    src: "/vanlife2.jpg",
    alt: "Camping by a lake"
  },
  {
    src: "/vanlife3.jpg",
    alt: "Road trip through mountains"
  },
  {
    src: "/vanlife4.jpg",
    alt: "Vanlife community meetup"
  }
];

const WelcomeAfterLogin = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState("Friend");
  
  // In a real app, this would come from your auth system
  useEffect(() => {
    // Placeholder for getting user data from authentication
    // Replace with actual user data retrieval
    const mockUser = {
      firstName: "Martin"
    };
    setCurrentUser(mockUser.firstName);
  }, []);

  const handlePostTask = () => {
    navigate("/post-task");
  };

  const handleFindWork = () => {
    navigate("/find-work");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
      {/* Top Small Logo */}
      <div className="absolute top-4 right-4 z-20">
        <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center">
          <span className="text-lg font-bold text-cream">TT</span>
        </div>
      </div>

      {/* Image Carousel Background */}
      <div className="absolute inset-0 z-0">
        <Carousel className="w-full h-screen" opts={{ loop: true }} autoPlay={true}>
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index} className="w-full h-screen">
                <div 
                  className="w-full h-full bg-cover bg-center" 
                  style={{ backgroundImage: `url(${image.src})` }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between items-center text-cream py-16 px-6">
        {/* Greeting Header */}
        <div className="text-center mt-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Welcome {currentUser}!</h1>
          <p className="text-xl md:text-2xl text-gold">Help wherever you roll.</p>
        </div>

        {/* Middle Section - Empty to push content to top and bottom */}
        <div className="flex-1" />

        {/* Action Buttons */}
        <div className="w-full max-w-md mb-8">
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handlePostTask} 
              className="w-full bg-gold hover:bg-orange text-teal-dark py-8 text-xl"
            >
              <Plus className="mr-2 h-6 w-6" /> Post a Task
            </Button>
            <Button 
              onClick={handleFindWork} 
              className="w-full bg-teal hover:bg-teal-dark text-cream py-8 text-xl"
            >
              <Briefcase className="mr-2 h-6 w-6" /> Find Work
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAfterLogin;
