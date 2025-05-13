
import { ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

interface HeaderSectionProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const HeaderSection = ({ isEnabled, onToggle }: HeaderSectionProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Bell size={20} className="mr-2 text-primary" />
          <h2 className="text-lg font-medium">Task Alerts</h2>
        </div>
        <Switch 
          checked={isEnabled} 
          onCheckedChange={onToggle}
        />
      </div>
      <p className="text-sm text-gray-500">
        Get notified when tasks that match your criteria are posted
      </p>
    </div>
  );
};

export default HeaderSection;
