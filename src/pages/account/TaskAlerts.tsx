
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Filter, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";

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
  const [newLocation, setNewLocation] = useState("");
  const [distanceRadius, setDistanceRadius] = useState([25]);
  
  // Frequency settings
  const [frequency, setFrequency] = useState("immediate");
  
  const handleAddLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setLocations([...locations, newLocation]);
      setNewLocation("");
    }
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Bell size={18} className="mr-2" />
                Task Alerts
              </CardTitle>
              <Switch 
                checked={alertsEnabled} 
                onCheckedChange={setAlertsEnabled}
              />
            </div>
            <CardDescription>
              Get notified when new tasks match your criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alertsEnabled && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Notification Method</h3>
                  <RadioGroup 
                    value={notificationMethod} 
                    onValueChange={setNotificationMethod}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="app" id="app" />
                      <FormLabel htmlFor="app">App only</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <FormLabel htmlFor="email">Email only</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <FormLabel htmlFor="both">App & Email</FormLabel>
                    </div>
                  </RadioGroup>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Alert Frequency</h3>
                  <RadioGroup 
                    value={frequency} 
                    onValueChange={setFrequency}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <FormLabel htmlFor="immediate">Immediate alerts</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <FormLabel htmlFor="daily">Daily digest</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <FormLabel htmlFor="weekly">Weekly summary</FormLabel>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {alertsEnabled && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter size={18} className="mr-2" />
                  Alert Filters
                </CardTitle>
                <CardDescription>
                  Set criteria for the tasks you want to be notified about
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories section */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category.id}`} 
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategoryToggle(category.id)}
                        />
                        <label 
                          htmlFor={`category-${category.id}`}
                          className="text-sm"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Locations section */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Locations</h3>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {locations.map(location => (
                      <Badge key={location} variant="secondary" className="pl-2 flex items-center gap-1">
                        {location}
                        <button 
                          onClick={() => handleRemoveLocation(location)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add location"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="flex-grow"
                    />
                    <Button 
                      onClick={handleAddLocation} 
                      disabled={!newLocation}
                      size="sm"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  
                  {/* Distance radius */}
                  <div className="mt-4">
                    <div className="flex justify-between mb-2 items-center">
                      <h4 className="text-sm">Distance radius</h4>
                      <span className="text-sm font-medium">{distanceRadius[0]} km</span>
                    </div>
                    <Slider
                      defaultValue={distanceRadius}
                      max={100}
                      step={5}
                      onValueChange={setDistanceRadius}
                    />
                  </div>
                </div>
                
                <Separator />
                
                {/* Budget range */}
                <div>
                  <div className="flex justify-between mb-2">
                    <h3 className="text-sm font-medium">Budget Range</h3>
                    <span className="text-sm">${budgetRange[0]} - ${budgetRange[1]}</span>
                  </div>
                  <Slider
                    defaultValue={budgetRange}
                    min={10}
                    max={1000}
                    step={10}
                    onValueChange={setBudgetRange}
                  />
                </div>
              </CardContent>
            </Card>
            
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
