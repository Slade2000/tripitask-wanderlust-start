
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Plus, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Just use a single background image instead of a carousel
const backgroundImage = "/vanlife1.jpg";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    profile
  } = useAuth();

  // For debugging
  useEffect(() => {
    console.log("Current user:", user);
    console.log("Current profile:", profile);
  }, [user, profile]);

  // Get user's first name with multiple fallbacks
  const userFirstName =
  // Try to get from profile first_name field
  profile?.first_name || (
  // Try to split full_name if available
  profile?.full_name ? profile.full_name.split(' ')[0] : null) ||
  // Try user metadata
  user?.user_metadata?.first_name as string || (
  // Try splitting user metadata full_name
  user?.user_metadata?.full_name ? (user.user_metadata.full_name as string).split(' ')[0] : null) ||
  // Final fallback
  "Friend";

  const handlePostTask = () => {
    navigate("/post-task");
  };
  
  const handleFindWork = () => {
    navigate("/find-work");
  };

  return (
    <div className="relative h-full w-full flex flex-col pb-16">
      {/* Top Logo */}
      <Logo />

      {/* Static Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full">
          <div className="w-full h-full bg-cover bg-center" style={{
          backgroundImage: `url(${backgroundImage})`
        }}>
            <div className="absolute inset-0 bg-black/40" />
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col h-full justify-between items-center text-cream py-8 px-6">
        {/* Greeting Header */}
        <div className="text-center mt-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Welcome {userFirstName}!</h1>
          <p className="text-xl md:text-2xl text-gold">Help wherever you roll.</p>
        </div>

        {/* Middle Section - Empty to push content to top and bottom */}
        <div className="flex-1" />

        {/* Action Buttons */}
        <div className="w-full max-w-md mb-4">
          <div className="flex flex-col gap-4">
            <Button onClick={handlePostTask} className="w-full bg-gold hover:bg-orange text-teal-dark py-8 text-xl">
              <Plus className="mr-2 h-6 w-6" /> Post a Task
            </Button>
            <Button onClick={handleFindWork} className="w-full bg-teal hover:bg-teal-dark text-cream py-8 text-xl">
              <Briefcase className="mr-2 h-6 w-6" /> Find Work
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default Home;
