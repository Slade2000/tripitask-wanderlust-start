
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import Logo from "@/components/Logo";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // After login, redirect to the post task page
  useEffect(() => {
    navigate("/post-task");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      {/* Add Logo */}
      <Logo />
      
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-teal">TripiTask</h1>
      </header>
      
      <div className="text-center my-20">
        <h2 className="text-2xl font-bold text-teal-dark mb-4">
          Welcome to TripiTask Home!
        </h2>
        <p className="text-teal-dark">
          Redirecting to post task page...
        </p>
      </div>
      
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default Home;
