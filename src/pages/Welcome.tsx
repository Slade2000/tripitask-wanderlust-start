
import { useState, useEffect } from "react";
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

// Sample carousel images
const carouselImages = [
  {
    src: "/vanlife1.jpg",
    alt: "Van parked at sunset",
    caption: "Freedom on the road",
  },
  {
    src: "/vanlife2.jpg",
    alt: "Person fixing van",
    caption: "Get help when you need it",
  },
  {
    src: "/vanlife3.jpg", 
    alt: "Community gathering",
    caption: "Connect with the community",
  },
  {
    src: "/vanlife4.jpg",
    alt: "Roadside assistance",
    caption: "Never travel alone",
  },
];

const WelcomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
        <Carousel className="w-full h-full" selectedIndex={currentSlide}>
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
