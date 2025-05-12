
import { Checkbox } from "@/components/ui/checkbox";

interface Category {
  id: string;
  name: string;
}

interface CategorySectionProps {
  categories: Category[];
  selectedCategories: string[];
  handleCategoryToggle: (categoryId: string) => void;
}

const CategorySection = ({ categories, selectedCategories, handleCategoryToggle }: CategorySectionProps) => {
  return (
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
  );
};

export default CategorySection;
