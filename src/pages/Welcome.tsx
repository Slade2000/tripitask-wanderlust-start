
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { LogIn, UserPlus } from "lucide-react";

// Sample carousel images with travel quotes
const carouselImages = [
  {
    src: "/vanlife1.jpg",
    alt: "Van parked at sunset",
    caption: "Freedom on the road",
    quote: "The journey is the destination.",
    font: "font-serif",
    color: "#ed8707" // Orange
  },
  {
    src: "/vanlife2.jpg",
    alt: "Person fixing van",
    caption: "Get help when you need it",
    quote: "Not all who wander are lost.",
    font: "font-mono",
    color: "#f6c254" // Gold
  },
  {
    src: "/vanlife3.jpg", 
    alt: "Community gathering",
    caption: "Connect with the community",
    quote: "A journey is best measured in friends, not miles.",
    font: "font-sans italic",
    color: "#f1f0ec" // Cream
  },
  {
    src: "/vanlife4.jpg",
    alt: "Roadside assistance",
    caption: "Never travel alone",
    quote: "Adventure awaits where the road ends.",
    font: "font-serif font-bold",
    color: "#75b2b7" // Light Teal
  },
];

const WelcomePage = () => {
  const navigate = useNavigate();
  const [api, setApi] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Setup auto carousel rotation
  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  // Handle manual slide changes
  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    
    api.on("select", onSelect);
    
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  // Placeholder functions for login and signup
  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleTermsClick = () => {
    navigate("/terms");
  };

  const handlePrivacyClick = () => {
    navigate("/privacy");
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <Carousel className="w-full h-full" setApi={setApi}>
          <CarouselContent className="h-full">
            {carouselImages.map((image, index) => (
              <CarouselItem key={index} className="h-full">
                <div
                  className="w-full h-screen bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${image.src})`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  
                  {/* Travel Quote */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className={cn("max-w-3xl text-center px-6 py-8 rounded-lg bg-[#073136]/70 transform transition-all duration-700", 
                        index === currentSlide ? "scale-100 opacity-100" : "scale-95 opacity-0"
                      )}
                    >
                      <p 
                        className={cn("text-2xl md:text-4xl mb-4 transition-colors", image.font)}
                        style={{ color: image.color }}
                      >
                        "{image.quote}"
                      </p>
                      <p className="text-cream text-lg md:text-xl">{image.caption}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between items-center text-cream py-16 px-6">
        {/* Top Section */}
        <div className="text-center mt-8">
          <div className="w-36 h-36 rounded-full bg-teal flex items-center justify-center mx-auto mb-6">
            <h1 className="text-5xl font-bold text-cream">TT</h1>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">TripiTask</h1>
          <p className="text-xl md:text-2xl">Keep Moving, Stay Connected.</p>
        </div>

        {/* Middle Section - Intentionally Empty */}
        <div className="flex-1" />

        {/* Bottom Section */}
        <div className="w-full max-w-md">
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleLogin}
              className="flex-1 bg-teal hover:bg-teal-dark text-cream py-6"
              size="lg"
            >
              <LogIn className="mr-2" /> Login
            </Button>
            <Button
              onClick={handleSignup}
              className="flex-1 bg-gold hover:bg-orange text-teal-dark py-6"
              size="lg"
            >
              <UserPlus className="mr-2" /> Sign Up
            </Button>
          </div>
          <p className="text-center text-sm mt-4 text-cream/80">
            By signing up, I agree to TripiTask's{" "}
            <button
              onClick={handleTermsClick}
              className="underline text-gold hover:text-orange"
            >
              Terms and Conditions
            </button>{" "}
            and{" "}
            <button
              onClick={handlePrivacyClick}
              className="underline text-gold hover:text-orange"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
