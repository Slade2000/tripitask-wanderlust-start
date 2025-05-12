
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Import refactored components
import HeaderSection from "./components/task-alerts/HeaderSection";
import AlertFrequencySection from "./components/task-alerts/AlertFrequencySection";
import FiltersCard from "./components/task-alerts/FiltersCard";

interface Category {
  id: string;
  name: string;
}

const TaskAlerts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock categories
  const categories: Category[] = [
    { id: "1", name: "Electrical" },
    { id: "2", name: "Plumbing" },
    { id: "3", name: "Carpentry" },
    { id: "4", name: "Cleaning" },
    { id: "5", name: "Gardening" },
    { id: "6", name: "Moving" },
    { id: "7", name: "Painting" },
    { id: "8", name: "General Maintenance" },
  ];
  
  // State for alert configurations
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [notificationMethod, setNotificationMethod] = useState("app");
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["1", "3"]);
  const [locations, setLocations] = useState<string[]>(["Sydney CBD", "Parramatta"]);
  const [budgetRange, setBudgetRange] = useState([50, 500]); // Minimum and maximum budget
  const [distanceRadius, setDistanceRadius] = useState([25]);
  
  // Frequency settings
  const [frequency, setFrequency] = useState("immediate");
  
  const handleAddLocation = (location: string) => {
    setLocations([...locations, location]);
  };
  
  const handleRemoveLocation = (location: string) => {
    setLocations(locations.filter(loc => loc !== location));
  };
  
  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };
  
  const handleSave = () => {
    // Would save to database in a real app
    toast({
      title: "Task alerts updated",
      description: "Your task alert preferences have been saved."
    });
    navigate("/account");
  };

  return (
    <div className="bg-cream min-h-screen pb-20">
      <HeaderSection />
      
      <div className="px-4 py-6 space-y-6">
        <Card>
          <AlertFrequencySection 
            alertsEnabled={alertsEnabled}
            setAlertsEnabled={setAlertsEnabled}
            notificationMethod={notificationMethod}
            setNotificationMethod={setNotificationMethod}
            frequency={frequency}
            setFrequency={setFrequency}
          />
        </Card>
        
        {alertsEnabled && (
          <>
            <FiltersCard 
              categories={categories}
              selectedCategories={selectedCategories}
              handleCategoryToggle={handleCategoryToggle}
              locations={locations}
              addLocation={handleAddLocation}
              removeLocation={handleRemoveLocation}
              distanceRadius={distanceRadius}
              setDistanceRadius={setDistanceRadius}
              budgetRange={budgetRange}
              setBudgetRange={setBudgetRange}
            />
            
            <Button 
              className="w-full" 
              onClick={handleSave}
            >
              Save Alert Settings
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskAlerts;
