
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";

const MyJobs = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      {/* Add Logo */}
      <Logo />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          My Jobs
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-center text-gray-600">
            Your jobs will appear here.
          </p>
        </div>
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default MyJobs;
