
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogIn, UserPlus } from "lucide-react";

// Single background image with no quote
const background = {
  src: "/vanlife1.jpg",
  alt: "Van parked at sunset",
  caption: "Freedom on the road"
};
const WelcomePage = () => {
  const navigate = useNavigate();

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
  return <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
      {/* Static Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-screen bg-cover bg-center" style={{
        backgroundImage: `url(${background.src})`
      }}>
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between items-center text-cream py-16 px-6 bg-[#073136]">
        {/* Top Section */}
        <div className="text-center mt-4">
          <div className="w-64 h-64 mx-auto mb-2">
            <img src="/lovable-uploads/cb23f62a-5b45-42ff-b1ff-4771111c4d77.png" alt="TripiTask Logo" className="w-full h-full object-contain" />
          </div>
          
          <p className="text-xl md:text-2xl mx-0 px-[87px] py-[5px] font-semibold">Keep Moving, Stay Connected</p>
        </div>

        {/* Middle Section - Intentionally Empty */}
        <div className="flex-1" />

        {/* Bottom Section */}
        <div className="w-full max-w-md">
          <div className="flex gap-4 justify-center">
            <Button onClick={handleLogin} className="flex-1 bg-teal hover:bg-teal-dark text-cream py-6" size="lg">
              <LogIn className="mr-2" /> Login
            </Button>
            <Button onClick={handleSignup} className="flex-1 bg-gold hover:bg-orange text-teal-dark py-6" size="lg">
              <UserPlus className="mr-2" /> Sign Up
            </Button>
          </div>
          <p className="text-center text-sm mt-4 text-cream/80">
            By signing up, I agree to TripiTask's{" "}
            <button onClick={handleTermsClick} className="underline text-gold hover:text-orange">
              Terms and Conditions
            </button>{" "}
            and{" "}
            <button onClick={handlePrivacyClick} className="underline text-gold hover:text-orange">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>;
};
export default WelcomePage;
