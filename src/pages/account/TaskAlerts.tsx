
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCategories } from "@/hooks/useCategories";

// Import the alert components
import HeaderSection from "./components/task-alerts/HeaderSection";
import CategorySection from "./components/task-alerts/CategorySection";
import LocationSection from "./components/task-alerts/LocationSection";
import BudgetSection from "./components/task-alerts/BudgetSection";
import AlertFrequencySection from "./components/task-alerts/AlertFrequencySection";
import FiltersCard from "./components/task-alerts/FiltersCard";
import BottomNav from "@/components/BottomNav";

// Alert frequency options
const frequencyOptions = [
  { value: "realtime", label: "Real-time" },
  { value: "daily", label: "Daily summary" },
  { value: "weekly", label: "Weekly summary" },
];

const TaskAlerts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories, loading } = useCategories();
  
  // State for alert preferences
  const [alertPreferences, setAlertPreferences] = useState({
    isEnabled: true,
    categories: [] as string[],
    location: {
      useCurrentLocation: true,
      radius: 30, // kilometers
      customLocation: ""
    },
    budget: {
      min: 10,
      max: 5000
    },
    frequency: "daily"
  });
  
  const handleSavePreferences = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success("Task alert preferences saved successfully");
    } catch (error) {
      toast.error("Failed to save alert preferences");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update handlers for each section
  const updateCategories = (categories: string[]) => {
    setAlertPreferences(prev => ({...prev, categories}));
  };
  
  const updateLocation = (locationData: any) => {
    setAlertPreferences(prev => ({
      ...prev, 
      location: {...prev.location, ...locationData}
    }));
  };
  
  const updateBudget = (budgetData: {min: number, max: number}) => {
    setAlertPreferences(prev => ({...prev, budget: budgetData}));
  };
  
  const updateFrequency = (frequency: string) => {
    setAlertPreferences(prev => ({...prev, frequency}));
  };
  
  const toggleAlerts = (enabled: boolean) => {
    setAlertPreferences(prev => ({...prev, isEnabled: enabled}));
  };

  return (
    <div className="bg-cream min-h-screen pb-20">
      {/* Header */}
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
      
      <div className="px-4 py-6 space-y-6">
        <HeaderSection 
          isEnabled={alertPreferences.isEnabled}
          onToggle={toggleAlerts}
        />
        
        <FiltersCard title="Alert Preferences">
          <CategorySection 
            selectedCategories={alertPreferences.categories}
            onCategoriesChange={updateCategories}
          />
          
          <LocationSection 
            locationData={alertPreferences.location}
            onLocationChange={updateLocation}
          />
          
          <BudgetSection 
            budgetRange={alertPreferences.budget}
            onBudgetChange={updateBudget}
          />
        </FiltersCard>
        
        <AlertFrequencySection 
          selectedFrequency={alertPreferences.frequency}
          options={frequencyOptions}
          onFrequencyChange={updateFrequency}
        />
        
        <Button 
          className="w-full" 
          onClick={handleSavePreferences}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Alert Preferences"}
        </Button>
      </div>
      
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default TaskAlerts;
