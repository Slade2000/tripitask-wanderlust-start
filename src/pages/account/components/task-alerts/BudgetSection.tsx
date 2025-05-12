
import { Slider } from "@/components/ui/slider";

interface BudgetSectionProps {
  budgetRange: number[];
  setBudgetRange: (range: number[]) => void;
}

const BudgetSection = ({ budgetRange, setBudgetRange }: BudgetSectionProps) => {
  return (
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
  );
};

export default BudgetSection;
