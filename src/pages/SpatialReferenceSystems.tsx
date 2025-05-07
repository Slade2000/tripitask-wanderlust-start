
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import SpatialRefSystemsViewer from "@/components/SpatialRefSystemsViewer";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function SpatialReferenceSystems() {
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <Lock className="mx-auto h-12 w-12 text-teal mb-4" />
          <h1 className="text-2xl font-bold text-teal-dark mb-4">Authentication Required</h1>
          <p className="mb-6 text-gray-600">
            You need to be logged in to view spatial reference systems data.
          </p>
          <Button 
            className="bg-teal hover:bg-teal-dark text-white"
            onClick={() => navigate("/login", { state: { from: location } })}
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Spatial Reference Systems
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <p className="text-gray-600 mb-4">
            This page displays spatial reference systems with proper security controls.
            The data is fetched through authenticated channels with appropriate access controls.
          </p>
        </div>
        
        <SpatialRefSystemsViewer />
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
}
