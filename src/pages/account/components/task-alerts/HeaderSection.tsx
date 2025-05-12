
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeaderSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white px-4 py-4 flex items-center">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/account")}
        className="mr-2"
      >
        <ArrowLeft size={22} />
      </Button>
      <h1 className="text-xl font-semibold">Task Alerts</h1>
    </div>
  );
};

export default HeaderSection;
