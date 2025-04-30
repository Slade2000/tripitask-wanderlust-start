
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement actual logout functionality
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-cream p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-teal">TripiTask</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </header>
      
      <div className="text-center my-20">
        <h2 className="text-2xl font-bold text-teal-dark mb-4">
          Welcome to TripiTask Home!
        </h2>
        <p className="text-teal-dark">
          This is a placeholder for the main dashboard. 
          More functionality coming soon.
        </p>
      </div>
    </div>
  );
};

export default Home;
