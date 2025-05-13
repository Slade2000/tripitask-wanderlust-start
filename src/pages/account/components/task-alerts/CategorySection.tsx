
import { Checkbox } from "@/components/ui/checkbox";

interface Category {
  id: string;
  name: string;
}

interface CategorySectionProps {
  selectedCategories: string[];
  handleCategoryToggle?: (categoryId: string) => void;
  onCategoriesChange?: (categories: string[]) => void;
}

const CategorySection = ({ selectedCategories, handleCategoryToggle, onCategoriesChange }: CategorySectionProps) => {
  // These categories would typically come from an API or parent component
  const dummyCategories = [
    { id: "1", name: "Cleaning" },
    { id: "2", name: "Handyman" },
    { id: "3", name: "Electrical" },
    { id: "4", name: "Plumbing" },
    { id: "5", name: "Moving" },
    { id: "6", name: "Gardening" }
  ];
  
  const toggleCategory = (categoryId: string) => {
    if (handleCategoryToggle) {
      handleCategoryToggle(categoryId);
    } else if (onCategoriesChange) {
      const updatedCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId];
      onCategoriesChange(updatedCategories);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Categories</h3>
      <div className="grid grid-cols-2 gap-2">
        {dummyCategories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`category-${category.id}`} 
              checked={selectedCategories.includes(category.id)}
              onCheckedChange={() => toggleCategory(category.id)}
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
  );
};

export default CategorySection;
