
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

interface BudgetSectionProps {
  budgetRange?: { min: number, max: number };
  onBudgetChange?: (budgetData: { min: number, max: number }) => void;
}

const BudgetSection = ({ budgetRange, onBudgetChange }: BudgetSectionProps) => {
  const [range, setRange] = useState<number[]>([50, 500]);
  
  // Initialize from props if provided
  useEffect(() => {
    if (budgetRange) {
      setRange([budgetRange.min, budgetRange.max]);
    }
  }, [budgetRange]);

  const handleRangeChange = (values: number[]) => {
    setRange(values);
    
    if (onBudgetChange) {
      onBudgetChange({ min: values[0], max: values[1] });
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <h3 className="text-sm font-medium">Budget Range</h3>
        <span className="text-sm">${range[0]} - ${range[1]}</span>
      </div>
      <Slider
        defaultValue={range}
        min={10}
        max={1000}
        step={10}
        value={range}
        onValueChange={handleRangeChange}
      />
    </div>
  );
};

export default BudgetSection;
