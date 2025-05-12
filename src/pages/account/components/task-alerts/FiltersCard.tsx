
import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CategorySection from "./CategorySection";
import LocationSection from "./LocationSection";
import BudgetSection from "./BudgetSection";

interface Category {
  id: string;
  name: string;
}

interface FiltersCardProps {
  categories: Category[];
  selectedCategories: string[];
  handleCategoryToggle: (categoryId: string) => void;
  locations: string[];
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  distanceRadius: number[];
  setDistanceRadius: (radius: number[]) => void;
  budgetRange: number[];
  setBudgetRange: (range: number[]) => void;
}

const FiltersCard = ({
  categories,
  selectedCategories,
  handleCategoryToggle,
  locations,
  addLocation,
  removeLocation,
  distanceRadius,
  setDistanceRadius,
  budgetRange,
  setBudgetRange
}: FiltersCardProps) => {
  return (
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
        <CategorySection 
          categories={categories}
          selectedCategories={selectedCategories}
          handleCategoryToggle={handleCategoryToggle}
        />
        
        <Separator />
        
        {/* Locations section */}
        <LocationSection 
          locations={locations}
          addLocation={addLocation}
          removeLocation={removeLocation}
          distanceRadius={distanceRadius}
          setDistanceRadius={setDistanceRadius}
        />
        
        <Separator />
        
        {/* Budget range */}
        <BudgetSection 
          budgetRange={budgetRange}
          setBudgetRange={setBudgetRange}
        />
      </CardContent>
    </Card>
  );
};

export default FiltersCard;
