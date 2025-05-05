
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Filter, MapPin, Calendar, DollarSign } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useCategories } from "@/hooks/useCategories";
import { format, addDays } from "date-fns";
import { getAllAvailableTasks } from "@/services/taskService";
import { useQuery } from "@tanstack/react-query";

interface TaskLocation {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const FindWork = () => {
  const location = useLocation();
  const { categories } = useCategories();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [distanceRadius, setDistanceRadius] = useState([25]); // km
  const [budgetRange, setBudgetRange] = useState([500]); // dollars
  const [filterOpen, setFilterOpen] = useState(false);
  const [futureLocation, setFutureLocation] = useState<TaskLocation>({
    name: "",
    startDate: undefined,
    endDate: undefined,
  });

  // Fetch available tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["availableTasks", searchQuery, selectedCategory, distanceRadius, budgetRange, futureLocation],
    queryFn: () => getAllAvailableTasks({
      searchQuery,
      categoryId: selectedCategory,
      distanceRadius: distanceRadius[0],
      maxBudget: budgetRange[0],
    }),
  });

  // Filter toggle
  const toggleFilters = () => setFilterOpen(!filterOpen);

  return (
    <div className="min-h-screen bg-cream p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-teal mb-6 text-center">
          Find Work
        </h1>

        {/* Search and filter bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search tasks by keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <Button 
            variant={filterOpen ? "default" : "outline"} 
            size="icon" 
            onClick={toggleFilters}
            className="flex-shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Advanced filters panel */}
        {filterOpen && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 animate-in slide-in-from-top">
            <h2 className="font-semibold mb-4">Advanced Filters</h2>
            
            {/* Category selector */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Distance radius slider */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                Distance Radius: {distanceRadius[0]} km
              </label>
              <Slider 
                value={distanceRadius}
                onValueChange={setDistanceRadius}
                max={100}
                step={5}
              />
            </div>
            
            {/* Budget range slider */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                Budget up to: ${budgetRange[0]}
              </label>
              <Slider 
                value={budgetRange}
                onValueChange={setBudgetRange}
                max={2000}
                step={50}
              />
            </div>
            
            {/* Future location */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Plan Future Location</h3>
              
              <div className="mb-4">
                <Input 
                  placeholder="Location Name/Postcode" 
                  value={futureLocation.name}
                  onChange={(e) => setFutureLocation({...futureLocation, name: e.target.value})}
                />
              </div>
              
              {/* Date range picker */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {futureLocation.startDate ? (
                          format(futureLocation.startDate, "PP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={futureLocation.startDate}
                        onSelect={(date) => 
                          setFutureLocation({...futureLocation, startDate: date})
                        }
                        initialFocus
                        fromDate={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {futureLocation.endDate ? (
                          format(futureLocation.endDate, "PP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={futureLocation.endDate}
                        onSelect={(date) => 
                          setFutureLocation({...futureLocation, endDate: date})
                        }
                        initialFocus
                        fromDate={futureLocation.startDate || new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              {futureLocation.name && futureLocation.startDate && futureLocation.endDate && (
                <div className="text-xs text-gray-500 italic mt-2">
                  On {format(futureLocation.startDate, "PPP")}, I'll be in {futureLocation.name} for 
                  {Math.round(
                    (futureLocation.endDate.getTime() - futureLocation.startDate.getTime()) / 
                    (1000 * 60 * 60 * 24)
                  )} days
                </div>
              )}
            </div>
          </div>
        )}

        {/* Task listings */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading tasks...</p>
            </div>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium">{task.title}</h3>
                  
                  <div className="flex flex-wrap gap-y-2 mt-2 text-sm text-gray-600">
                    <div className="flex items-center w-1/2">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>${task.budget}</span>
                    </div>
                    
                    <div className="flex items-center w-1/2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{task.location}</span>
                      
                      {futureLocation.name && 
                       task.location.toLowerCase().includes(futureLocation.name.toLowerCase()) && (
                        <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                          You'll be here soon!
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center w-1/2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Due: {format(new Date(task.due_date), "PP")}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-600 mb-2">
                No tasks found for your filters.
              </p>
              <p className="text-gray-500 text-sm">
                Try adjusting your search or check back later!
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNav currentPath={location.pathname} />
    </div>
  );
};

export default FindWork;
